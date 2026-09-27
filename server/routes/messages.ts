import { Router } from 'express';
import { db, MessageRecord } from '../db.ts';
import { checkTenantAccess } from '../middleware/auth.ts';

export const messagesRouter = Router();

// GET /api/messages - List messages for a project or conversation
messagesRouter.get('/', (req, res) => {
  const user = req.currentUser!;
  const { projectId, organizationId } = req.query as { projectId?: string; organizationId?: string };

  const targetOrgId = organizationId || user.organizationId;
  if (!targetOrgId || !checkTenantAccess(targetOrgId, user)) {
    res.status(403).json({ error: 'Access denied' });
    return;
  }

  let messages = db.messages.filter((m) => m.organizationId === targetOrgId);

  if (projectId) {
    messages = messages.filter((m) => m.projectId === projectId);
  }

  // CRITICAL SECURITY REQUIREMENT:
  // Internal notes MUST NEVER appear in client responses!
  if (user.role === 'client_admin' || user.role === 'client_member') {
    messages = messages.filter((m) => !m.isInternal);
  }

  res.json(messages);
});

// POST /api/messages - Send a message
messagesRouter.post('/', (req, res) => {
  const user = req.currentUser!;
  const { projectId, organizationId, content, isInternal } = req.body;

  const targetOrgId = user.organizationId || organizationId;
  if (!targetOrgId || !checkTenantAccess(targetOrgId, user)) {
    res.status(403).json({ error: 'Access denied' });
    return;
  }

  if (!content || !content.trim()) {
    res.status(400).json({ error: 'Message content cannot be empty' });
    return;
  }

  // Client users CANNOT create internal staff notes
  const safeIsInternal = (user.role === 'ut_admin' || user.role === 'ut_staff') ? Boolean(isInternal) : false;

  const newMsg: MessageRecord = {
    id: `msg_${Date.now()}`,
    conversationId: projectId ? `conv_${projectId}` : `conv_org_${targetOrgId}`,
    organizationId: targetOrgId,
    projectId: projectId || undefined,
    senderId: user.id,
    senderName: user.fullName,
    senderRole: user.role,
    content: content.trim(),
    isInternal: safeIsInternal,
    createdAt: new Date().toISOString(),
  };

  db.messages.push(newMsg);

  res.status(201).json(newMsg);
});
