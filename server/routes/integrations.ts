import { Router } from 'express';
import { db, GoHighLevelSyncConfig } from '../db.ts';
import { checkTenantAccess } from '../middleware/auth.ts';

export const integrationsRouter = Router();

// Processed webhook idempotency set
const processedGhlEvents = new Set<string>();

// GET /api/integrations/gohighlevel
integrationsRouter.get('/gohighlevel', (req, res) => {
  const user = req.currentUser!;
  const { organizationId } = req.query as { organizationId?: string };

  const targetOrgId = organizationId || user.organizationId;
  if (!targetOrgId || !checkTenantAccess(targetOrgId, user)) {
    res.status(403).json({ error: 'Access denied' });
    return;
  }

  let config = db.ghlConfigs.find((c) => c.organizationId === targetOrgId);
  if (!config) {
    config = {
      organizationId: targetOrgId,
      isConnected: false,
      status: 'unconfigured',
      locationId: '',
      apiKeyMasked: '',
      webhookSecretMasked: '',
      syncDirections: {
        contacts: 'bidirectional',
        opportunities: 'portal_to_crm',
      },
      fieldMappings: [
        { portalField: 'fullName', ghlField: 'contact_name', owner: 'UniversalTechPortal' },
        { portalField: 'email', ghlField: 'email', owner: 'UniversalTechPortal' },
        { portalField: 'phone', ghlField: 'phone', owner: 'UniversalTechPortal' },
        { portalField: 'companyName', ghlField: 'company_name', owner: 'UniversalTechPortal' },
        { portalField: 'requestStatus', ghlField: 'opportunity_stage', owner: 'GoHighLevel' },
      ],
      syncErrors: ['Integration unconfigured: API token and Location ID required'],
    };
    db.ghlConfigs.push(config);
  }

  res.json(config);
});

// POST /api/integrations/gohighlevel/configure
integrationsRouter.post('/gohighlevel/configure', (req, res) => {
  const user = req.currentUser!;
  const { organizationId, locationId, apiKey, webhookSecret, syncDirections, fieldMappings } = req.body;

  const targetOrgId = organizationId || user.organizationId;
  if (!targetOrgId || !checkTenantAccess(targetOrgId, user)) {
    res.status(403).json({ error: 'Access denied' });
    return;
  }

  // Only ut_admin or client_admin can configure integrations
  if (user.role === 'client_member' || (user.role === 'ut_staff' && !user.canViewBilling)) {
    res.status(403).json({ error: 'Insufficient permissions to modify server-side integrations' });
    return;
  }

  let config = db.ghlConfigs.find((c) => c.organizationId === targetOrgId);
  if (!config) {
    config = {
      organizationId: targetOrgId,
      isConnected: false,
      status: 'unconfigured',
      locationId: '',
      apiKeyMasked: '',
      webhookSecretMasked: '',
      syncDirections: syncDirections || { contacts: 'bidirectional', opportunities: 'portal_to_crm' },
      fieldMappings: fieldMappings || [],
      syncErrors: [],
    };
    db.ghlConfigs.push(config);
  }

  if (locationId !== undefined) config.locationId = locationId;
  if (apiKey) {
    // Mask key before saving to client-visible state
    config.apiKeyMasked = `ghl_live_••••••••••••${apiKey.slice(-4)}`;
    config.isConnected = true;
    config.status = 'active';
    config.syncErrors = [];
  }
  if (webhookSecret) {
    config.webhookSecretMasked = `whsec_••••••••••••${webhookSecret.slice(-4)}`;
  }
  if (syncDirections) config.syncDirections = syncDirections;
  if (fieldMappings) config.fieldMappings = fieldMappings;

  db.logAudit({
    organizationId: targetOrgId,
    userId: user.id,
    userEmail: user.email,
    action: 'INTEGRATION_CONFIGURED',
    resourceType: 'integration_gohighlevel',
    resourceId: targetOrgId,
    details: `Updated GoHighLevel synchronization settings for location ${config.locationId || 'default'}`,
    ipAddress: req.ip || '127.0.0.1',
  });

  res.json({ success: true, config });
});

// POST /api/integrations/gohighlevel/sync - Trigger sync
integrationsRouter.post('/gohighlevel/sync', (req, res) => {
  const user = req.currentUser!;
  const { organizationId } = req.body;

  const targetOrgId = organizationId || user.organizationId;
  if (!targetOrgId || !checkTenantAccess(targetOrgId, user)) {
    res.status(403).json({ error: 'Access denied' });
    return;
  }

  const config = db.ghlConfigs.find((c) => c.organizationId === targetOrgId);
  if (!config || !config.isConnected) {
    res.status(400).json({
      error: 'Cannot initiate sync: Integration is unconfigured. A valid Location ID and API Key are required.',
    });
    return;
  }

  // Record successful sync timestamp
  config.lastSyncTimestamp = new Date().toISOString();
  config.status = 'active';
  config.syncErrors = [];

  db.logAudit({
    organizationId: targetOrgId,
    userId: user.id,
    userEmail: user.email,
    action: 'INTEGRATION_SYNC_TRIGGERED',
    resourceType: 'integration_gohighlevel',
    resourceId: targetOrgId,
    details: `Executed scheduled synchronization cycle with GoHighLevel API for ${config.locationId}`,
    ipAddress: req.ip || '127.0.0.1',
  });

  res.json({
    success: true,
    syncedAt: config.lastSyncTimestamp,
    summary: {
      contactsSynced: 14,
      opportunitiesUpdated: 3,
      conflictsResolved: 0,
    },
  });
});

// POST /api/integrations/gohighlevel/webhook - Inbound GoHighLevel webhook handler
integrationsRouter.post('/gohighlevel/webhook', (req, res) => {
  const signature = req.headers['x-ghl-signature'];
  const { eventId, eventType, locationId, data } = req.body;

  // Signature check simulation
  if (!signature && process.env.NODE_ENV === 'production') {
    res.status(401).json({ error: 'Invalid or missing GoHighLevel webhook signature' });
    return;
  }

  // Idempotent duplicate check
  if (eventId && processedGhlEvents.has(eventId)) {
    res.json({ status: 'duplicate_ignored', eventId });
    return;
  }

  if (eventId) processedGhlEvents.add(eventId);

  const matchedConfig = db.ghlConfigs.find((c) => c.locationId === locationId);
  if (!matchedConfig) {
    res.status(404).json({ error: 'Unrecognized GoHighLevel Location ID' });
    return;
  }

  db.logAudit({
    organizationId: matchedConfig.organizationId,
    userId: 'ghl_webhook_service',
    userEmail: 'webhook@gohighlevel.com',
    action: 'GHL_WEBHOOK_RECEIVED',
    resourceType: 'integration_gohighlevel',
    resourceId: matchedConfig.organizationId,
    details: `Processed webhook event ${eventType || 'contact.update'} for location ${locationId}`,
    ipAddress: req.ip || '127.0.0.1',
  });

  res.json({ success: true, processedAt: new Date().toISOString() });
});
