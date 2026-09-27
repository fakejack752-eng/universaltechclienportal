import { Router } from 'express';
import { db } from '../db.ts';

export const auditRouter = Router();

// GET /api/audit-logs
auditRouter.get('/', (req, res) => {
  const user = req.currentUser!;

  if (user.role === 'ut_admin') {
    res.json(db.auditEvents);
    return;
  }

  if (user.role === 'client_admin') {
    const orgEvents = db.auditEvents.filter((e) => e.organizationId === user.organizationId);
    res.json(orgEvents);
    return;
  }

  if (user.role === 'ut_staff') {
    const assignedOrgIds = db.staffAssignments
      .filter((a) => a.staffUserId === user.id)
      .map((a) => a.organizationId);
    const staffEvents = db.auditEvents.filter(
      (e) => e.organizationId && assignedOrgIds.includes(e.organizationId)
    );
    res.json(staffEvents);
    return;
  }

  res.status(403).json({ error: 'Access denied: Audit log viewing requires administrative privileges' });
});
