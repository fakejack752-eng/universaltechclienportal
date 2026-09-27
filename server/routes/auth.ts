import { Router } from 'express';
import { db } from '../db.ts';

export const authRouter = Router();

// GET /api/auth/me
authRouter.get('/me', (req, res) => {
  const user = req.currentUser;
  if (!user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const organization = user.organizationId
    ? db.organizations.find((o) => o.id === user.organizationId)
    : null;

  res.json({
    user,
    organization,
    permissions: {
      canViewBilling: user.canViewBilling,
      canApproveDeliverables: user.role === 'client_admin' || user.role === 'ut_admin',
      canManageTeam: user.role === 'client_admin' || user.role === 'ut_admin',
      canAccessInternalNotes: user.role === 'ut_admin' || user.role === 'ut_staff',
      isAdmin: user.role === 'ut_admin',
      isStaff: user.role === 'ut_staff' || user.role === 'ut_admin',
    },
  });
});

// POST /api/auth/switch-demo
authRouter.post('/switch-demo', (req, res) => {
  const { userId } = req.body;
  const user = db.users.find((u) => u.id === userId);
  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  db.logAudit({
    organizationId: user.organizationId || undefined,
    userId: user.id,
    userEmail: user.email,
    action: 'DEMO_PERSONA_SWITCHED',
    resourceType: 'user',
    resourceId: user.id,
    details: `Switched demo context to ${user.fullName} (${user.role})`,
    ipAddress: req.ip || '127.0.0.1',
  });

  const organization = user.organizationId
    ? db.organizations.find((o) => o.id === user.organizationId)
    : null;

  res.json({
    user,
    organization,
    permissions: {
      canViewBilling: user.canViewBilling,
      canApproveDeliverables: user.role === 'client_admin' || user.role === 'ut_admin',
      canManageTeam: user.role === 'client_admin' || user.role === 'ut_admin',
      canAccessInternalNotes: user.role === 'ut_admin' || user.role === 'ut_staff',
      isAdmin: user.role === 'ut_admin',
      isStaff: user.role === 'ut_staff' || user.role === 'ut_admin',
    },
  });
});

// GET /api/auth/demo-users
authRouter.get('/demo-users', (_req, res) => {
  res.json(
    db.users.map((u) => {
      const org = u.organizationId ? db.organizations.find((o) => o.id === u.organizationId) : null;
      return {
        id: u.id,
        fullName: u.fullName,
        email: u.email,
        role: u.role,
        title: u.title,
        organizationName: org ? org.name : 'Universal Tech INC',
        canViewBilling: u.canViewBilling,
      };
    })
  );
});

// POST /api/auth/invitation/verify
authRouter.post('/invitation/verify', (req, res) => {
  const { token } = req.body;
  const invite = db.invitations.find((i) => i.token === token);

  if (!invite) {
    res.status(404).json({ valid: false, error: 'Invitation token is invalid or does not exist.' });
    return;
  }

  const isExpired = new Date(invite.expiresAt).getTime() < Date.now();
  if (isExpired || invite.status !== 'pending') {
    res.status(400).json({ valid: false, error: 'Invitation has expired or has already been used.' });
    return;
  }

  const org = db.organizations.find((o) => o.id === invite.organizationId);

  res.json({
    valid: true,
    email: invite.email,
    role: invite.role,
    organizationName: org?.name,
    expiresAt: invite.expiresAt,
  });
});

// POST /api/auth/invitation/accept
authRouter.post('/invitation/accept', (req, res) => {
  const { token, fullName, password } = req.body;
  const invite = db.invitations.find((i) => i.token === token);

  if (!invite || invite.status !== 'pending') {
    res.status(400).json({ error: 'Invalid or expired invitation' });
    return;
  }

  if (new Date(invite.expiresAt).getTime() < Date.now()) {
    invite.status = 'expired';
    res.status(400).json({ error: 'Invitation has expired. Please request a new invite.' });
    return;
  }

  // Create new active user
  const newUser = {
    id: `user_${Date.now()}`,
    email: invite.email,
    fullName: fullName || invite.email.split('@')[0],
    role: invite.role,
    organizationId: invite.organizationId,
    title: invite.role === 'client_admin' ? 'Account Administrator' : 'Team Member',
    canViewBilling: invite.role === 'client_admin',
    status: 'active' as const,
    createdAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString(),
  };

  db.users.push(newUser);
  invite.status = 'accepted';

  db.logAudit({
    organizationId: invite.organizationId,
    userId: newUser.id,
    userEmail: newUser.email,
    action: 'INVITATION_ACCEPTED',
    resourceType: 'user',
    resourceId: newUser.id,
    details: `User accepted invitation for role: ${newUser.role}`,
    ipAddress: req.ip || '127.0.0.1',
  });

  res.json({ success: true, user: newUser });
});

// POST /api/auth/login
authRouter.post('/login', (req, res) => {
  const { email } = req.body;
  if (!email) {
    res.status(400).json({ error: 'Email address is required' });
    return;
  }

  const user = db.users.find((u) => u.email.toLowerCase() === String(email).trim().toLowerCase());
  if (!user) {
    db.logAudit({
      userId: 'unauthenticated',
      userEmail: String(email),
      action: 'LOGIN_FAILED',
      resourceType: 'auth',
      details: `Failed authentication attempt for ${email}`,
      ipAddress: req.ip || '127.0.0.1',
    });
    res.status(401).json({ error: 'Invalid credentials. Please check your email or select a verified demo persona below.' });
    return;
  }

  user.lastLoginAt = new Date().toISOString();
  db.logAudit({
    organizationId: user.organizationId || undefined,
    userId: user.id,
    userEmail: user.email,
    action: 'LOGIN_SUCCESS',
    resourceType: 'auth',
    details: `User logged in successfully (Role: ${user.role})`,
    ipAddress: req.ip || '127.0.0.1',
  });

  const organization = user.organizationId
    ? db.organizations.find((o) => o.id === user.organizationId)
    : null;

  res.json({
    user,
    organization,
    permissions: {
      canViewBilling: user.canViewBilling,
      canApproveDeliverables: user.role === 'client_admin' || user.role === 'ut_admin',
      canManageTeam: user.role === 'client_admin' || user.role === 'ut_admin',
      canAccessInternalNotes: user.role === 'ut_admin' || user.role === 'ut_staff',
      isAdmin: user.role === 'ut_admin',
      isStaff: user.role === 'ut_staff' || user.role === 'ut_admin',
    },
  });
});

// POST /api/auth/request-password-reset
authRouter.post('/request-password-reset', (req, res) => {
  const { email } = req.body;
  const user = db.users.find((u) => u.email.toLowerCase() === String(email).toLowerCase());

  db.logAudit({
    userId: user ? user.id : 'unknown',
    userEmail: String(email),
    action: 'PASSWORD_RESET_REQUESTED',
    resourceType: 'auth',
    details: user ? `Password reset link dispatched to ${email}` : `Password reset requested for unrecognized email ${email}`,
    ipAddress: req.ip || '127.0.0.1',
  });

  // Always return success to prevent email enumeration attacks
  res.json({
    success: true,
    message: 'If the provided address is associated with a verified account, a secure recovery email has been dispatched.',
  });
});
