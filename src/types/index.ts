export type UserRole = 'ut_admin' | 'ut_staff' | 'client_admin' | 'client_member';

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  organizationId: string | null;
  title: string;
  avatarUrl?: string;
  canViewBilling: boolean;
  status: 'active' | 'invited' | 'suspended';
  phone?: string;
  createdAt: string;
  lastLoginAt: string;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  industry: string;
  contactEmail: string;
  contactPhone: string;
  tier: 'Enterprise' | 'Growth' | 'Standard';
  status: 'active' | 'onboarding' | 'suspended';
  ghlContactId?: string;
  createdAt: string;
  activeServiceIds: string[];
  assignedStaff?: Array<{
    id: string;
    staffUserId: string;
    name: string;
    email: string;
    title: string;
    roleInOrg: string;
  }>;
}

export interface ServiceCatalogItem {
  id: string;
  pillar: 'staffing' | 'it' | 'ai';
  title: string;
  shortDesc: string;
  fullDesc: string;
  category: string;
  features: string[];
  deliverableTypes: string[];
  requiresHiringSpec?: boolean;
}

export type RequestStatus = 
  | 'submitted' 
  | 'under_review' 
  | 'needs_information' 
  | 'scoped' 
  | 'approved' 
  | 'in_progress' 
  | 'completed' 
  | 'declined' 
  | 'cancelled';

export interface ServiceRequest {
  id: string;
  organizationId: string;
  requesterId: string;
  requesterName: string;
  requesterEmail: string;
  serviceId: string;
  serviceTitle: string;
  serviceCategory: 'staffing' | 'it' | 'ai';
  businessNeed: string;
  desiredOutcome: string;
  preferredTimeframe: string;
  budgetRange?: string;
  status: RequestStatus;
  statusReason?: string;
  hiringDetails?: {
    roleTitle: string;
    location: string;
    employmentType: 'Full-time' | 'Contract' | 'Temp-to-Hire' | 'Direct Hire';
    headcount: number;
    startTimeline: string;
    responsibilities: string;
    requiredQualifications: string;
  };
  attachments: Array<{ name: string; size: string; key: string }>;
  createdAt: string;
  updatedAt: string;
  scopedEstimate?: {
    estimatedDays: number;
    proposedScope: string;
    proposedBudget?: string;
  };
}

export interface ProjectMilestone {
  id: string;
  title: string;
  dueDate: string;
  status: 'pending' | 'in_progress' | 'completed';
}

export interface ProjectTask {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in_progress' | 'waiting_on_client' | 'completed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assigneeName?: string;
  dueDate: string;
}

export interface DeliverableApprovalRecord {
  id: string;
  version: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: 'approved' | 'revision_requested';
  feedback: string;
  timestamp: string;
}

export interface Deliverable {
  id: string;
  projectId: string;
  organizationId: string;
  title: string;
  description: string;
  currentVersion: string;
  status: 'draft' | 'awaiting_approval' | 'approved' | 'revision_requested';
  previewUrl?: string;
  fileKey?: string;
  fileName?: string;
  internalNotes?: string;
  approvalHistory: DeliverableApprovalRecord[];
}

export interface Project {
  id: string;
  organizationId: string;
  name: string;
  servicePillar: 'staffing' | 'it' | 'ai';
  serviceTitle: string;
  description: string;
  agreedScope: string;
  status: 'planning' | 'active' | 'on_hold' | 'completed';
  assignedStaffIds: string[];
  startDate: string;
  targetDate: string;
  previewUrl?: string;
  milestones: ProjectMilestone[];
  tasks: ProjectTask[];
  clientUpdates: Array<{ id: string; date: string; title: string; content: string; authorName: string }>;
  internalNotes?: string;
  deliverables?: Deliverable[];
  aiWorkflowDetails?: {
    architectureSummary: string;
    integrationStatus: {
      crm: 'connected' | 'not_connected' | 'pending';
      voiceGateway: 'connected' | 'not_connected';
      webhookRelay: 'healthy' | 'unconfigured';
    };
    approvedKnowledgeDocs: string[];
    testScenarios: Array<{ title: string; status: 'passed' | 'pending' | 'needs_review'; notes: string }>;
  };
  createdAt: string;
}

export interface CandidateProfile {
  id: string;
  organizationId: string;
  requestId?: string;
  fullName: string;
  roleTitle: string;
  experienceYears: number;
  location: string;
  availability: string;
  skills: string[];
  summary: string;
  resumeFileName?: string;
  status: 'submitted' | 'interview_scheduled' | 'offer_extended' | 'hired' | 'rejected_by_client';
  clientFeedback?: string;
  interviewDate?: string;
}

export interface DocumentRecord {
  id: string;
  organizationId: string;
  projectId?: string;
  name: string;
  fileType: string;
  sizeBytes: number;
  scanStatus: 'scanned_clean' | 'quarantined' | 'scanning';
  version: string;
  uploadedByUserId: string;
  uploadedByUserName: string;
  isInternalOnly: boolean;
  category: 'deliverable' | 'contract' | 'specification' | 'report' | 'general';
  createdAt: string;
}

export interface MessageRecord {
  id: string;
  conversationId: string;
  organizationId: string;
  projectId?: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  content: string;
  attachments?: Array<{ name: string; key: string }>;
  isInternal: boolean;
  createdAt: string;
}

export interface InvoiceLineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Invoice {
  id: string;
  organizationId: string;
  projectId?: string;
  projectName?: string;
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  currency: 'USD';
  lineItems: InvoiceLineItem[];
  subtotal: number;
  tax: number;
  total: number;
  amountPaid: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  paidAt?: string;
  notes?: string;
}

export interface SupportTicket {
  id: string;
  ticketNumber: string;
  organizationId: string;
  requesterId: string;
  requesterName: string;
  category: 'Technical Bug' | 'AI Workflow Adjustment' | 'Staffing Inquiry' | 'Billing & Account' | 'Feature Request';
  subject: string;
  description: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  relatedProjectId?: string;
  assignedStaffId?: string;
  status: 'open' | 'in_progress' | 'waiting_on_client' | 'resolved' | 'closed';
  messages: Array<{
    id: string;
    senderId: string;
    senderName: string;
    senderRole: UserRole;
    content: string;
    createdAt: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface AuditEvent {
  id: string;
  organizationId?: string;
  userId: string;
  userEmail: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  details: string;
  ipAddress: string;
  timestamp: string;
}

export interface SecurityTestResult {
  id: string;
  name: string;
  category: 'Tenant Isolation' | 'RBAC Enforcement' | 'Data Scrubbing' | 'Integrity & Validation';
  status: 'PASSED' | 'FAILED';
  description: string;
  assertion: string;
  details: string;
}
