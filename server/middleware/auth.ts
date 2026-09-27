import { Request, Response, NextFunction } from 'express';
import { db, User } from '../db.ts';

// Extend Express Request
declare global {
  namespace Express {
    interface Request {
      currentUser?: User;
      currentOrgId?: string;
    }
  }
}

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  // Look for Authorization header: Bearer <userId> or x-user-id header
  const authHeader = req.headers.authorization;
  let userId = '';

  if (authHeader && authHeader.startsWith('Bearer ')) {
    userId = authHeader.substring(7).trim();
  } else if (req.headers['x-user-id']) {
    userId = String(req.headers['x-user-id']).trim();
  }

  // Fallback default for demo convenience if no header passed
  if (!userId) {
    // Default to client admin (Elena Rodriguez) for direct visits
    userId = 'user_apex_admin';
  }

  const user = db.users.find((u) => u.id === userId);
  if (!user) {
    res.status(401).json({ error: 'Unauthorized: Invalid or expired session credentials' });
    return;
  }

  if (user.status === 'suspended') {
    res.status(403).json({ error: 'Forbidden: User account is suspended' });
    return;
  }

  req.currentUser = user;
  if (user.organizationId) {
    req.currentOrgId = user.organizationId;
  }

  next();
}

/**
 * Enforces organization boundary.
 * - If user is client_admin or client_member: can ONLY access their own organization.
 * - If user is ut_staff: must be explicitly assigned to this organization.
 * - If user is ut_admin: allowed across all organizations.
 */
export function checkTenantAccess(targetOrgId: string, user: User): boolean {
  if (user.role === 'ut_admin') {
    return true;
  }

  if (user.role === 'client_admin' || user.role === 'client_member') {
    return user.organizationId === targetOrgId;
  }

  if (user.role === 'ut_staff') {
    return db.staffAssignments.some(
      (a) => a.staffUserId === user.id && a.organizationId === targetOrgId
    );
  }

  return false;
}

/**
 * Sanitizes project data before returning to client roles.
 * Client users MUST NEVER receive internalNotes.
 */
export function sanitizeProjectForUser<T extends { internalNotes?: string }>(project: T, user: User): T {
  if (user.role === 'client_admin' || user.role === 'client_member') {
    const copy = { ...project };
    delete copy.internalNotes;
    return copy;
  }
  return project;
}

/**
 * Sanitizes deliverable data before returning to client roles.
 */
export function sanitizeDeliverableForUser<T extends { internalNotes?: string }>(deliverable: T, user: User): T {
  if (user.role === 'client_admin' || user.role === 'client_member') {
    const copy = { ...deliverable };
    delete copy.internalNotes;
    return copy;
  }
  return deliverable;
}
