import { Router } from 'express';
import { db, INITIAL_SERVICES, ServiceRequest, RequestStatus } from '../db.ts';
import { checkTenantAccess } from '../middleware/auth.ts';

export const servicesRouter = Router();

// GET /api/services - Full catalog
servicesRouter.get('/', (_req, res) => {
  res.json(INITIAL_SERVICES);
});

// GET /api/services/requests - List requests filtered by permissions
servicesRouter.get('/requests', (req, res) => {
  const user = req.currentUser!;

  if (user.role === 'ut_admin') {
    res.json(db.serviceRequests);
    return;
  }

  if (user.role === 'ut_staff') {
    const assignedOrgIds = db.staffAssignments
      .filter((a) => a.staffUserId === user.id)
      .map((a) => a.organizationId);
    const requests = db.serviceRequests.filter((r) => assignedOrgIds.includes(r.organizationId));
    res.json(requests);
    return;
  }

  // Client user can only see their organization's requests
  const ownRequests = db.serviceRequests.filter((r) => r.organizationId === user.organizationId);
  res.json(ownRequests);
});

// POST /api/services/requests - Submit a new request
servicesRouter.post('/requests', (req, res) => {
  const user = req.currentUser!;
  const {
    organizationId,
    serviceId,
    businessNeed,
    desiredOutcome,
    preferredTimeframe,
    budgetRange,
    hiringDetails,
    attachments,
  } = req.body;

  const targetOrgId = user.organizationId || organizationId;
  if (!targetOrgId) {
    res.status(400).json({ error: 'Organization ID is required' });
    return;
  }

  if (!checkTenantAccess(targetOrgId, user)) {
    res.status(403).json({ error: 'Access denied: You cannot submit requests on behalf of other organizations' });
    return;
  }

  const catalogService = INITIAL_SERVICES.find((s) => s.id === serviceId);
  if (!catalogService) {
    res.status(400).json({ error: 'Invalid service selected' });
    return;
  }

  if (!businessNeed || !desiredOutcome || !preferredTimeframe) {
    res.status(400).json({ error: 'Business need, desired outcome, and preferred timeframe are required' });
    return;
  }

  const newRequest: ServiceRequest = {
    id: `req_${Date.now()}`,
    organizationId: targetOrgId,
    requesterId: user.id,
    requesterName: user.fullName,
    requesterEmail: user.email,
    serviceId: catalogService.id,
    serviceTitle: catalogService.title,
    serviceCategory: catalogService.pillar,
    businessNeed,
    desiredOutcome,
    preferredTimeframe,
    budgetRange: budgetRange || 'To be scoped during discovery',
    status: 'submitted',
    hiringDetails: catalogService.requiresHiringSpec ? hiringDetails : undefined,
    attachments: attachments || [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  db.serviceRequests.unshift(newRequest);

  db.logAudit({
    organizationId: targetOrgId,
    userId: user.id,
    userEmail: user.email,
    action: 'SERVICE_REQUEST_SUBMITTED',
    resourceType: 'service_request',
    resourceId: newRequest.id,
    details: `Submitted service request for "${catalogService.title}" (${catalogService.pillar})`,
    ipAddress: req.ip || '127.0.0.1',
  });

  res.status(201).json(newRequest);
});

// PATCH /api/services/requests/:id/status - Status transitions
servicesRouter.patch('/requests/:id/status', (req, res) => {
  const user = req.currentUser!;
  const reqId = req.params.id;

  const request = db.serviceRequests.find((r) => r.id === reqId);
  if (!request) {
    res.status(404).json({ error: 'Service request not found' });
    return;
  }

  if (!checkTenantAccess(request.organizationId, user)) {
    res.status(403).json({ error: 'Access denied' });
    return;
  }

  const { status, statusReason, scopedEstimate } = req.body as {
    status: RequestStatus;
    statusReason?: string;
    scopedEstimate?: { estimatedDays: number; proposedScope: string; proposedBudget?: string };
  };

  // Permission rules on status:
  // Client can only cancel their own request
  if (user.role === 'client_admin' || user.role === 'client_member') {
    if (status !== 'cancelled') {
      res.status(403).json({ error: 'Client users can only cancel their own service requests' });
      return;
    }
  }

  const oldStatus = request.status;
  request.status = status;
  request.updatedAt = new Date().toISOString();
  if (statusReason) request.statusReason = statusReason;
  if (scopedEstimate && (user.role === 'ut_admin' || user.role === 'ut_staff')) {
    request.scopedEstimate = scopedEstimate;
  }

  db.logAudit({
    organizationId: request.organizationId,
    userId: user.id,
    userEmail: user.email,
    action: 'SERVICE_REQUEST_STATUS_UPDATED',
    resourceType: 'service_request',
    resourceId: request.id,
    details: `Transitioned request ${request.id} from ${oldStatus} to ${status}${statusReason ? ` (${statusReason})` : ''}`,
    ipAddress: req.ip || '127.0.0.1',
  });

  res.json(request);
});
