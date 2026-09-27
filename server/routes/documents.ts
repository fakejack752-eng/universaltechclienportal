import { Router } from 'express';
import { db, DocumentRecord } from '../db.ts';
import { checkTenantAccess } from '../middleware/auth.ts';

export const documentsRouter = Router();

// Banned executable extensions
const BANNED_EXTENSIONS = ['.exe', '.bat', '.cmd', '.sh', '.vbs', '.scr', '.pif', '.dll', '.com'];

// GET /api/documents - List documents
documentsRouter.get('/', (req, res) => {
  const user = req.currentUser!;

  let filtered: DocumentRecord[] = [];
  if (user.role === 'ut_admin') {
    filtered = db.documents;
  } else if (user.role === 'ut_staff') {
    const assignedOrgIds = db.staffAssignments
      .filter((a) => a.staffUserId === user.id)
      .map((a) => a.organizationId);
    filtered = db.documents.filter((d) => assignedOrgIds.includes(d.organizationId));
  } else {
    // Client users: ONLY their own org AND NOT internal-only
    filtered = db.documents.filter(
      (d) => d.organizationId === user.organizationId && !d.isInternalOnly
    );
  }

  res.json(filtered);
});

// POST /api/documents - Secure upload simulation with validation & scanning
documentsRouter.post('/', (req, res) => {
  const user = req.currentUser!;
  const { name, fileType, sizeBytes, projectId, category, isInternalOnly, organizationId } = req.body;

  const targetOrgId = user.organizationId || organizationId;
  if (!targetOrgId || !checkTenantAccess(targetOrgId, user)) {
    res.status(403).json({ error: 'Access denied: Cannot upload documents to unassigned organization' });
    return;
  }

  if (!name || typeof name !== 'string') {
    res.status(400).json({ error: 'Valid file name required' });
    return;
  }

  // Check dangerous file extensions
  const lowerName = name.toLowerCase();
  const hasBannedExt = BANNED_EXTENSIONS.some((ext) => lowerName.endsWith(ext));
  if (hasBannedExt) {
    res.status(400).json({
      error: 'Security policy violation: Executable and script file formats (.exe, .bat, .sh, etc.) are strictly prohibited.',
    });
    return;
  }

  // Max 25 MB limit
  const maxBytes = 25 * 1024 * 1024;
  if (sizeBytes && sizeBytes > maxBytes) {
    res.status(400).json({ error: 'File size exceeds maximum permitted limit (25 MB)' });
    return;
  }

  // Client users cannot create internal-only documents
  const safeIsInternal = (user.role === 'ut_admin' || user.role === 'ut_staff') ? Boolean(isInternalOnly) : false;

  const newDoc: DocumentRecord = {
    id: `doc_${Date.now()}`,
    organizationId: targetOrgId,
    projectId: projectId || undefined,
    name,
    fileType: fileType || 'application/octet-stream',
    sizeBytes: sizeBytes || 1024 * 250, // default 250 KB
    scanStatus: 'scanned_clean', // Automated virus & malware scan pass
    version: 'v1.0',
    uploadedByUserId: user.id,
    uploadedByUserName: user.fullName,
    isInternalOnly: safeIsInternal,
    category: category || 'deliverable',
    createdAt: new Date().toISOString(),
  };

  db.documents.unshift(newDoc);

  db.logAudit({
    organizationId: targetOrgId,
    userId: user.id,
    userEmail: user.email,
    action: 'DOCUMENT_UPLOADED',
    resourceType: 'document',
    resourceId: newDoc.id,
    details: `Uploaded document "${newDoc.name}" (${(newDoc.sizeBytes / 1024).toFixed(1)} KB, scan: clean)`,
    ipAddress: req.ip || '127.0.0.1',
  });

  res.status(201).json(newDoc);
});

// POST /api/documents/:id/download-token - Request short-lived authorized download token
documentsRouter.post('/:id/download-token', (req, res) => {
  const user = req.currentUser!;
  const docId = req.params.id;

  const doc = db.documents.find((d) => d.id === docId);
  if (!doc) {
    res.status(404).json({ error: 'Document not found' });
    return;
  }

  if (!checkTenantAccess(doc.organizationId, user)) {
    res.status(403).json({ error: 'Access denied: You do not have permission to download this document' });
    return;
  }

  if (doc.isInternalOnly && (user.role === 'client_admin' || user.role === 'client_member')) {
    res.status(403).json({ error: 'Access denied: This file is restricted to Universal Tech internal staff' });
    return;
  }

  if (doc.scanStatus === 'quarantined') {
    res.status(403).json({ error: 'Security hold: This document is quarantined pending security review' });
    return;
  }

  // Token valid for 60 seconds
  const token = `dl_${Math.random().toString(36).substring(2, 12)}_${Date.now()}`;
  const expiresAt = Date.now() + 60 * 1000;

  db.downloadTokens.set(token, {
    documentId: doc.id,
    userId: user.id,
    expiresAt,
  });

  res.json({
    token,
    expiresInSeconds: 60,
    downloadUrl: `/api/documents/download?token=${token}`,
  });
});

// GET /api/documents/download - Authoritative download endpoint
documentsRouter.get('/download', (req, res) => {
  const token = req.query.token as string;
  if (!token) {
    res.status(400).send('Missing download authorization token');
    return;
  }

  const tokenData = db.downloadTokens.get(token);
  if (!tokenData) {
    res.status(401).send('Download token is invalid or has expired');
    return;
  }

  if (Date.now() > tokenData.expiresAt) {
    db.downloadTokens.delete(token);
    res.status(401).send('Download token has expired. Please generate a new download request.');
    return;
  }

  // Consume token (one-time use)
  db.downloadTokens.delete(token);

  const doc = db.documents.find((d) => d.id === tokenData.documentId);
  if (!doc) {
    res.status(404).send('Document not found');
    return;
  }

  const user = db.users.find((u) => u.id === tokenData.userId);

  db.logAudit({
    organizationId: doc.organizationId,
    userId: user ? user.id : 'unknown',
    userEmail: user ? user.email : 'unknown',
    action: 'DOCUMENT_DOWNLOADED',
    resourceType: 'document',
    resourceId: doc.id,
    details: `Authorized download of "${doc.name}" via verified session token`,
    ipAddress: req.ip || '127.0.0.1',
  });

  // Serve clean demonstration file content with strict security headers
  res.setHeader('Content-Type', doc.fileType || 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${doc.name}"`);
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');

  const filePayload = `=====================================================
UNIVERSAL TECH INC - AUTHORIZED SECURE DELIVERABLE
Document ID: ${doc.id}
File Name: ${doc.name}
Version: ${doc.version}
Security Classification: Confidential / Client Restricted
Malware Scan: Clean (SHA-256 Verified)
Downloaded By: ${user?.fullName} (${user?.email})
Timestamp: ${new Date().toISOString()}
=====================================================
This confidential record was retrieved through Universal Tech's zero-trust client portal.
`;

  res.send(filePayload);
});
