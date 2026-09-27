import { Router } from 'express';
import { db, Project, DeliverableApprovalRecord } from '../db.ts';
import { checkTenantAccess, sanitizeProjectForUser, sanitizeDeliverableForUser } from '../middleware/auth.ts';

export const projectsRouter = Router();

// GET /api/projects - List projects
projectsRouter.get('/', (req, res) => {
  const user = req.currentUser!;

  let filtered: Project[] = [];
  if (user.role === 'ut_admin') {
    filtered = db.projects;
  } else if (user.role === 'ut_staff') {
    const assignedOrgIds = db.staffAssignments
      .filter((a) => a.staffUserId === user.id)
      .map((a) => a.organizationId);
    filtered = db.projects.filter(
      (p) => assignedOrgIds.includes(p.organizationId) || p.assignedStaffIds.includes(user.id)
    );
  } else {
    // Client user
    filtered = db.projects.filter((p) => p.organizationId === user.organizationId);
  }

  // Strip internalNotes for client users
  const sanitized = filtered.map((p) => sanitizeProjectForUser(p, user));
  res.json(sanitized);
});

// GET /api/projects/:id - Single project detail
projectsRouter.get('/:id', (req, res) => {
  const user = req.currentUser!;
  const projId = req.params.id;

  const project = db.projects.find((p) => p.id === projId);
  if (!project) {
    res.status(404).json({ error: 'Project not found' });
    return;
  }

  if (!checkTenantAccess(project.organizationId, user)) {
    res.status(403).json({ error: 'Access denied: You do not have permission to view this project' });
    return;
  }

  // Deliverables for this project
  const deliverables = db.deliverables
    .filter((d) => d.projectId === projId)
    .map((d) => sanitizeDeliverableForUser(d, user));

  const sanitized = sanitizeProjectForUser(project, user);
  res.json({
    ...sanitized,
    deliverables,
  });
});

// POST /api/projects/:id/tasks - Add a task
projectsRouter.post('/:id/tasks', (req, res) => {
  const user = req.currentUser!;
  const projId = req.params.id;

  const project = db.projects.find((p) => p.id === projId);
  if (!project) {
    res.status(404).json({ error: 'Project not found' });
    return;
  }

  if (!checkTenantAccess(project.organizationId, user)) {
    res.status(403).json({ error: 'Access denied' });
    return;
  }

  const { title, description, priority, dueDate, assigneeName } = req.body;
  if (!title) {
    res.status(400).json({ error: 'Task title is required' });
    return;
  }

  const newTask = {
    id: `t_${Date.now()}`,
    title,
    description: description || '',
    status: 'todo' as const,
    priority: priority || 'medium',
    assigneeName: assigneeName || user.fullName,
    dueDate: dueDate || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
  };

  project.tasks.push(newTask);

  db.logAudit({
    organizationId: project.organizationId,
    userId: user.id,
    userEmail: user.email,
    action: 'PROJECT_TASK_CREATED',
    resourceType: 'project_task',
    resourceId: newTask.id,
    details: `Created task "${newTask.title}" in project ${project.name}`,
    ipAddress: req.ip || '127.0.0.1',
  });

  res.status(201).json(newTask);
});

// PATCH /api/projects/:id/tasks/:taskId - Update task status
projectsRouter.patch('/:id/tasks/:taskId', (req, res) => {
  const user = req.currentUser!;
  const { id: projId, taskId } = req.params;

  const project = db.projects.find((p) => p.id === projId);
  if (!project) {
    res.status(404).json({ error: 'Project not found' });
    return;
  }

  if (!checkTenantAccess(project.organizationId, user)) {
    res.status(403).json({ error: 'Access denied' });
    return;
  }

  const task = project.tasks.find((t) => t.id === taskId);
  if (!task) {
    res.status(404).json({ error: 'Task not found' });
    return;
  }

  const { status } = req.body;
  if (status) task.status = status;

  res.json(task);
});

// POST /api/deliverables/:id/approval - Approve or Request Revision on a deliverable
projectsRouter.post('/deliverables/:id/approval', (req, res) => {
  const user = req.currentUser!;
  const delivId = req.params.id;

  const deliverable = db.deliverables.find((d) => d.id === delivId);
  if (!deliverable) {
    res.status(404).json({ error: 'Deliverable not found' });
    return;
  }

  if (!checkTenantAccess(deliverable.organizationId, user)) {
    res.status(403).json({ error: 'Access denied' });
    return;
  }

  // Client member CANNOT approve deliverables or sign off
  if (user.role === 'client_member') {
    res.status(403).json({ error: 'Client members are not authorized to submit deliverable approvals or revision signoffs' });
    return;
  }

  const { action, feedback } = req.body as { action: 'approved' | 'revision_requested'; feedback: string };
  if (!action || !['approved', 'revision_requested'].includes(action)) {
    res.status(400).json({ error: 'Action must be "approved" or "revision_requested"' });
    return;
  }

  if (action === 'revision_requested' && (!feedback || feedback.trim().length < 5)) {
    res.status(400).json({ error: 'A specific explanation or revision notes must be provided when requesting changes' });
    return;
  }

  const approvalRecord: DeliverableApprovalRecord = {
    id: `app_${Date.now()}`,
    version: deliverable.currentVersion,
    userId: user.id,
    userName: user.fullName,
    userRole: user.role,
    action,
    feedback: feedback || (action === 'approved' ? 'Deliverable approved for operational signoff' : ''),
    timestamp: new Date().toISOString(),
  };

  deliverable.approvalHistory.push(approvalRecord);
  deliverable.status = action === 'approved' ? 'approved' : 'revision_requested';

  db.logAudit({
    organizationId: deliverable.organizationId,
    userId: user.id,
    userEmail: user.email,
    action: action === 'approved' ? 'DELIVERABLE_APPROVED' : 'DELIVERABLE_REVISION_REQUESTED',
    resourceType: 'deliverable',
    resourceId: deliverable.id,
    details: `${action === 'approved' ? 'Approved' : 'Requested revisions on'} deliverable "${deliverable.title}" (version ${deliverable.currentVersion}): ${feedback || 'No comments'}`,
    ipAddress: req.ip || '127.0.0.1',
  });

  res.json({
    deliverable: sanitizeDeliverableForUser(deliverable, user),
    record: approvalRecord,
  });
});

// GET /api/candidates - Candidate profiles strictly authorized for client org
projectsRouter.get('/candidates/authorized', (req, res) => {
  const user = req.currentUser!;

  if (user.role === 'ut_admin') {
    res.json(db.candidateProfiles);
    return;
  }

  if (user.role === 'ut_staff') {
    const assignedOrgIds = db.staffAssignments
      .filter((a) => a.staffUserId === user.id)
      .map((a) => a.organizationId);
    const candidates = db.candidateProfiles.filter((c) => assignedOrgIds.includes(c.organizationId));
    res.json(candidates);
    return;
  }

  // Client user: strictly own organization
  const ownCandidates = db.candidateProfiles.filter((c) => c.organizationId === user.organizationId);
  res.json(ownCandidates);
});

// PATCH /api/candidates/:id/feedback - Record interview notes and candidate status
projectsRouter.patch('/candidates/:id/feedback', (req, res) => {
  const user = req.currentUser!;
  const candId = req.params.id;

  const candidate = db.candidateProfiles.find((c) => c.id === candId);
  if (!candidate) {
    res.status(404).json({ error: 'Candidate profile not found' });
    return;
  }

  if (!checkTenantAccess(candidate.organizationId, user)) {
    res.status(403).json({ error: 'Access denied' });
    return;
  }

  const { status, clientFeedback, interviewDate } = req.body;
  if (status) candidate.status = status;
  if (clientFeedback !== undefined) candidate.clientFeedback = clientFeedback;
  if (interviewDate !== undefined) candidate.interviewDate = interviewDate;

  db.logAudit({
    organizationId: candidate.organizationId,
    userId: user.id,
    userEmail: user.email,
    action: 'CANDIDATE_FEEDBACK_RECORDED',
    resourceType: 'candidate',
    resourceId: candidate.id,
    details: `Updated feedback for candidate ${candidate.fullName} to status "${candidate.status}"`,
    ipAddress: req.ip || '127.0.0.1',
  });

  res.json(candidate);
});
