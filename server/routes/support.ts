import { Router } from 'express';
import { db, SupportTicket } from '../db.ts';
import { checkTenantAccess } from '../middleware/auth.ts';

export const supportRouter = Router();

// GET /api/support/tickets
supportRouter.get('/tickets', (req, res) => {
  const user = req.currentUser!;

  let tickets: SupportTicket[] = [];
  if (user.role === 'ut_admin') {
    tickets = db.supportTickets;
  } else if (user.role === 'ut_staff') {
    const assignedOrgIds = db.staffAssignments
      .filter((a) => a.staffUserId === user.id)
      .map((a) => a.organizationId);
    tickets = db.supportTickets.filter(
      (t) => assignedOrgIds.includes(t.organizationId) || t.assignedStaffId === user.id
    );
  } else {
    // Client user
    tickets = db.supportTickets.filter((t) => t.organizationId === user.organizationId);
  }

  res.json(tickets);
});

// POST /api/support/tickets - Open support request
supportRouter.post('/tickets', (req, res) => {
  const user = req.currentUser!;
  const { category, subject, description, urgency, relatedProjectId, organizationId } = req.body;

  const targetOrgId = user.organizationId || organizationId;
  if (!targetOrgId || !checkTenantAccess(targetOrgId, user)) {
    res.status(403).json({ error: 'Access denied' });
    return;
  }

  if (!category || !subject || !description || !urgency) {
    res.status(400).json({ error: 'Category, subject, description, and urgency are required' });
    return;
  }

  const ticketNumber = `SUP-2026-${(1000 + db.supportTickets.length + 1).toString().padStart(4, '0')}`;

  const newTicket: SupportTicket = {
    id: `tick_${Date.now()}`,
    ticketNumber,
    organizationId: targetOrgId,
    requesterId: user.id,
    requesterName: user.fullName,
    category,
    subject,
    description,
    urgency,
    relatedProjectId: relatedProjectId || undefined,
    status: 'open',
    messages: [
      {
        id: `tmsg_${Date.now()}`,
        senderId: user.id,
        senderName: user.fullName,
        senderRole: user.role,
        content: description,
        createdAt: new Date().toISOString(),
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  db.supportTickets.unshift(newTicket);

  db.logAudit({
    organizationId: targetOrgId,
    userId: user.id,
    userEmail: user.email,
    action: 'SUPPORT_TICKET_OPENED',
    resourceType: 'support_ticket',
    resourceId: newTicket.id,
    details: `Opened ticket ${ticketNumber}: "${newTicket.subject}" [Urgency: ${newTicket.urgency}]`,
    ipAddress: req.ip || '127.0.0.1',
  });

  res.status(201).json(newTicket);
});

// POST /api/support/tickets/:id/reply - Add message to ticket
supportRouter.post('/tickets/:id/reply', (req, res) => {
  const user = req.currentUser!;
  const ticketId = req.params.id;
  const { content } = req.body;

  const ticket = db.supportTickets.find((t) => t.id === ticketId);
  if (!ticket) {
    res.status(404).json({ error: 'Ticket not found' });
    return;
  }

  if (!checkTenantAccess(ticket.organizationId, user)) {
    res.status(403).json({ error: 'Access denied' });
    return;
  }

  if (!content || !content.trim()) {
    res.status(400).json({ error: 'Reply content cannot be empty' });
    return;
  }

  const replyMsg = {
    id: `tmsg_${Date.now()}`,
    senderId: user.id,
    senderName: user.fullName,
    senderRole: user.role,
    content: content.trim(),
    createdAt: new Date().toISOString(),
  };

  ticket.messages.push(replyMsg);
  ticket.updatedAt = new Date().toISOString();

  // If client replied, set status to in_progress; if staff replied, set to waiting_on_client
  if (user.role === 'client_admin' || user.role === 'client_member') {
    ticket.status = 'in_progress';
  } else {
    ticket.status = 'waiting_on_client';
  }

  res.status(201).json(replyMsg);
});

// PATCH /api/support/tickets/:id/status - Update status
supportRouter.patch('/tickets/:id/status', (req, res) => {
  const user = req.currentUser!;
  const ticketId = req.params.id;
  const { status, assignedStaffId } = req.body;

  const ticket = db.supportTickets.find((t) => t.id === ticketId);
  if (!ticket) {
    res.status(404).json({ error: 'Ticket not found' });
    return;
  }

  if (!checkTenantAccess(ticket.organizationId, user)) {
    res.status(403).json({ error: 'Access denied' });
    return;
  }

  if (status) ticket.status = status;
  if (assignedStaffId !== undefined && (user.role === 'ut_admin' || user.role === 'ut_staff')) {
    ticket.assignedStaffId = assignedStaffId;
  }
  ticket.updatedAt = new Date().toISOString();

  db.logAudit({
    organizationId: ticket.organizationId,
    userId: user.id,
    userEmail: user.email,
    action: 'SUPPORT_TICKET_STATUS_UPDATED',
    resourceType: 'support_ticket',
    resourceId: ticket.id,
    details: `Updated ticket ${ticket.ticketNumber} to "${ticket.status}"`,
    ipAddress: req.ip || '127.0.0.1',
  });

  res.json(ticket);
});
