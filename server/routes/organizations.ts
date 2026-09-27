import { Router } from 'express';
import { db, Organization, UserRole } from '../db.ts';
import { checkTenantAccess } from '../middleware/auth.ts';

export const orgsRouter = Router();

// GET /api/organizations
orgsRouter.get('/', (req, res) => {
  const user = req.currentUser!;

  if (user.role === 'ut_admin') {
    res.json(db.organizations);
    return;
  }

  if (user.role === 'ut_staff') {
    const assignedOrgIds = db.staffAssignments
      .filter((a) => a.staffUserId === user.id)
      .map((a) => a.organizationId);
    const assignedOrgs = db.organizations.filter((o) => assignedOrgIds.includes(o.id));
    res.json(assignedOrgs);
    return;
  }

  // Client user can ONLY see their own organization
  const ownOrg = db.organizations.filter((o) => o.id === user.organizationId);
  res.json(ownOrg);
});

// GET /api/organizations/:id
orgsRouter.get('/:id', (req, res) => {
  const user = req.currentUser!;
  const orgId = req.params.id;

  if (!checkTenantAccess(orgId, user)) {
    res.status(403).json({ error: 'Access denied: You do not have permission to access this organization' });
    return;
  }

  const org = db.organizations.find((o) => o.id === orgId);
  if (!org) {
    res.status(404).json({ error: 'Organization not found' });
    return;
  }

  const assignedStaff = db.staffAssignments
    .filter((a) => a.organizationId === orgId)
    .map((a) => {
      const staffUser = db.users.find((u) => u.id === a.staffUserId);
      return {
        id: a.id,
        staffUserId: a.staffUserId,
        name: staffUser?.fullName || 'Universal Tech Specialist',
        email: staffUser?.email || '',
        title: staffUser?.title || '',
        roleInOrg: a.roleInOrg,
      };
    });

  res.json({
    ...org,
    assignedStaff,
  });
});

// POST /api/organizations
orgsRouter.post('/', (req, res) => {
  const user = req.currentUser!;
  if (user.role !== 'ut_admin') {
    res.status(403).json({ error: 'Only Universal Tech administrators can provision new client organizations' });
    return;
  }

  const { name, industry, contactEmail, contactPhone, tier } = req.body;
  if (!name || !contactEmail) {
    res.status(400).json({ error: 'Name and contact email are required' });
    return;
  }

  const newOrg: Organization = {
    id: `org_${Date.now()}`,
    name,
    slug: name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
    industry: industry || 'Technology & Professional Services',
    contactEmail,
    contactPhone: contactPhone || '',
    tier: tier || 'Standard',
    status: 'onboarding',
    createdAt: new Date().toISOString(),
    activeServiceIds: [],
  };

  db.organizations.push(newOrg);

  db.logAudit({
    organizationId: newOrg.id,
    userId: user.id,
    userEmail: user.email,
    action: 'ORGANIZATION_PROVISIONED',
    resourceType: 'organization',
    resourceId: newOrg.id,
    details: `Provisioned new client organization: ${newOrg.name} (${newOrg.tier})`,
    ipAddress: req.ip || '127.0.0.1',
  });

  res.status(201).json(newOrg);
});

// PATCH /api/organizations/:id
orgsRouter.patch('/:id', (req, res) => {
  const user = req.currentUser!;
  const orgId = req.params.id;

  if (!checkTenantAccess(orgId, user)) {
    res.status(403).json({ error: 'Access denied' });
    return;
  }

  // Client member cannot modify organization settings
  if (user.role === 'client_member') {
    res.status(403).json({ error: 'Client members cannot edit organization settings' });
    return;
  }

  const org = db.organizations.find((o) => o.id === orgId);
  if (!org) {
    res.status(404).json({ error: 'Organization not found' });
    return;
  }

  const { name, industry, contactEmail, contactPhone, tier, status } = req.body;
  if (name) org.name = name;
  if (industry) org.industry = industry;
  if (contactEmail) org.contactEmail = contactEmail;
  if (contactPhone) org.contactPhone = contactPhone;

  // Tier and status can only be modified by Universal Tech Admin
  if (user.role === 'ut_admin') {
    if (tier) org.tier = tier;
    if (status) org.status = status;
  }

  db.logAudit({
    organizationId: org.id,
    userId: user.id,
    userEmail: user.email,
    action: 'ORGANIZATION_UPDATED',
    resourceType: 'organization',
    resourceId: org.id,
    details: `Updated organization profile for ${org.name}`,
    ipAddress: req.ip || '127.0.0.1',
  });

  res.json(org);
});

// GET /api/organizations/:id/team
orgsRouter.get('/:id/team', (req, res) => {
  const user = req.currentUser!;
  const orgId = req.params.id;

  if (!checkTenantAccess(orgId, user)) {
    res.status(403).json({ error: 'Access denied' });
    return;
  }

  const members = db.users
    .filter((u) => u.organizationId === orgId)
    .map((u) => ({
      id: u.id,
      fullName: u.fullName,
      email: u.email,
      role: u.role,
      title: u.title,
      canViewBilling: u.canViewBilling,
      status: u.status,
      lastLoginAt: u.lastLoginAt,
    }));

  const pendingInvites = db.invitations
    .filter((i) => i.organizationId === orgId && i.status === 'pending')
    .map((i) => ({
      id: i.id,
      email: i.email,
      role: i.role,
      expiresAt: i.expiresAt,
      createdAt: i.createdAt,
    }));

  res.json({ members, pendingInvites });
});

// POST /api/organizations/:id/invite
orgsRouter.post('/:id/invite', (req, res) => {
  const user = req.currentUser!;
  const orgId = req.params.id;

  if (!checkTenantAccess(orgId, user)) {
    res.status(403).json({ error: 'Access denied' });
    return;
  }

  if (user.role === 'client_member') {
    res.status(403).json({ error: 'Client members cannot issue team invitations' });
    return;
  }

  const { email, role } = req.body;
  if (!email || !email.includes('@')) {
    res.status(400).json({ error: 'Valid email address required' });
    return;
  }

  // Prevent role self-elevation: client_admin can ONLY invite client_admin or client_member
  if (user.role === 'client_admin' && (role === 'ut_admin' || role === 'ut_staff')) {
    res.status(403).json({ error: 'Cannot issue an invitation for internal Universal Tech staff roles' });
    return;
  }

  const targetRole: UserRole = role === 'client_admin' ? 'client_admin' : 'client_member';

  // 7-day expiration
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
  const token = `inv_${Math.random().toString(36).substring(2, 10)}_${Date.now()}`;

  const invitation = {
    id: `inv_${Date.now()}`,
    organizationId: orgId,
    email: email.toLowerCase().trim(),
    role: targetRole,
    token,
    invitedByUserId: user.id,
    expiresAt,
    status: 'pending' as const,
    createdAt: new Date().toISOString(),
  };

  db.invitations.push(invitation);

  db.logAudit({
    organizationId: orgId,
    userId: user.id,
    userEmail: user.email,
    action: 'INVITATION_ISSUED',
    resourceType: 'invitation',
    resourceId: invitation.id,
    details: `Issued ${targetRole} invitation to ${invitation.email} (expires ${expiresAt})`,
    ipAddress: req.ip || '127.0.0.1',
  });

  res.status(201).json({
    message: 'Invitation issued successfully',
    invitation: {
      id: invitation.id,
      email: invitation.email,
      role: invitation.role,
      expiresAt: invitation.expiresAt,
      inviteUrl: `${req.protocol}://${req.get('host')}/?invite=${token}`,
    },
  });
});
