// Universal Tech INC - Relational In-Memory Store & Data Access Layer
// Fully enforces tenant isolation, role-based authorization, and audit logging

export type UserRole = 'ut_admin' | 'ut_staff' | 'client_admin' | 'client_member';

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  organizationId: string | null; // null for Universal Tech staff/admin
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
}

export interface StaffAssignment {
  id: string;
  staffUserId: string;
  organizationId: string;
  roleInOrg: 'Account Lead' | 'Lead Engineer' | 'Staffing Partner' | 'Support Specialist';
  assignedAt: string;
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

export interface CandidateProfile {
  id: string;
  organizationId: string; // authorized strictly for this client
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
  internalNotes?: string; // Must be scrubbed for client!
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
  internalNotes?: string; // STRICTLY scrubbed for client responses!
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
  isInternal: boolean; // Must be scrubbed for client!
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

export interface Invitation {
  id: string;
  organizationId: string;
  email: string;
  role: UserRole;
  token: string;
  invitedByUserId: string;
  expiresAt: string;
  status: 'pending' | 'accepted' | 'expired' | 'revoked';
  createdAt: string;
}

export interface GoHighLevelSyncConfig {
  organizationId: string;
  isConnected: boolean;
  status: 'unconfigured' | 'active' | 'sync_error' | 'paused';
  locationId: string;
  apiKeyMasked: string;
  webhookSecretMasked: string;
  syncDirections: {
    contacts: 'bidirectional' | 'crm_to_portal' | 'portal_to_crm';
    opportunities: 'bidirectional' | 'crm_to_portal' | 'portal_to_crm';
  };
  fieldMappings: Array<{
    portalField: string;
    ghlField: string;
    owner: 'UniversalTechPortal' | 'GoHighLevel';
  }>;
  lastSyncTimestamp?: string;
  syncErrors: string[];
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

// ==========================================
// SEED DATA INITIALIZATION
// ==========================================

export const INITIAL_SERVICES: ServiceCatalogItem[] = [
  // Staffing & Consulting
  {
    id: 'staffing_temp',
    pillar: 'staffing',
    title: 'Temporary Staffing',
    shortDesc: 'Flexible talent for peak demands, special projects, or interim coverage.',
    fullDesc: 'Pre-screened, specialized professionals deployed rapidly for specific durations with Universal Tech handling complete on-boarding and compliance.',
    category: 'Staffing & Consulting',
    features: ['Vetted talent pool', 'Flexible duration', 'Rapid deployment', 'Payroll compliance'],
    deliverableTypes: ['Candidate Shortlists', 'Interview Schedules', 'Timesheet Reports'],
    requiresHiringSpec: true,
  },
  {
    id: 'staffing_direct',
    pillar: 'staffing',
    title: 'Direct Hire Placement',
    shortDesc: 'Permanent talent acquisition tailored to your exact technical and cultural requirements.',
    fullDesc: 'End-to-end executive search and direct placement matching senior specialists with long-term retention in mind.',
    category: 'Staffing & Consulting',
    features: ['Retained & contingent search', 'Technical assessment', 'Culture-match interview', 'Replacement guarantee'],
    deliverableTypes: ['Executive Dossiers', 'Assessment Scorecards', 'Offer Finalization'],
    requiresHiringSpec: true,
  },
  {
    id: 'consulting_services',
    pillar: 'staffing',
    title: 'Consulting Services',
    shortDesc: 'Strategic guidance on tech stacks, digital transformation, and organizational scale.',
    fullDesc: 'Senior advisory teams embedded with your leadership to define operational blueprints, enterprise architecture, and automation roadmaps.',
    category: 'Staffing & Consulting',
    features: ['Architecture reviews', 'Process re-engineering', 'Vendor evaluations', 'Capability roadmaps'],
    deliverableTypes: ['Architecture Blueprint', 'Recommendation Report', 'Executive Presentation'],
  },
  {
    id: 'hr_payroll_services',
    pillar: 'staffing',
    title: 'HR & Payroll Services',
    shortDesc: 'Comprehensive workforce management coordination and compliance oversight.',
    fullDesc: 'Dedicated service coordination for contingent workforce payroll, statutory reporting, benefits onboarding, and multi-state compliance.',
    category: 'Staffing & Consulting',
    features: ['Multi-state compliance', 'Timesheet auditing', 'Benefits coordination', 'Worker classification'],
    deliverableTypes: ['Compliance Audit', 'Monthly Payroll Summaries', 'Classification Reviews'],
  },
  {
    id: 'staffing_admin',
    pillar: 'staffing',
    title: 'Administrative Staffing',
    shortDesc: 'Executive assistants, operational coordinators, and office leadership.',
    fullDesc: 'Skilled administrative personnel experienced in CRM, scheduling, and client communication.',
    category: 'Staffing & Consulting',
    features: ['Executive support', 'CRM data maintenance', 'Scheduling precision', 'Client hospitality'],
    deliverableTypes: ['Candidate Dossiers', 'Skill Matrix'],
    requiresHiringSpec: true,
  },
  {
    id: 'staffing_ops',
    pillar: 'staffing',
    title: 'Operational Staffing',
    shortDesc: 'Supply chain coordinators, logistics specialists, and shift supervisors.',
    fullDesc: 'Front-line operational management to keep facilities, warehouses, and dispatch hubs running reliably.',
    category: 'Staffing & Consulting',
    features: ['Facility oversight', 'ERP/WMS fluency', 'Shift scheduling', 'Safety certification'],
    deliverableTypes: ['Candidate Profiles', 'Deployment Schedule'],
    requiresHiringSpec: true,
  },
  {
    id: 'staffing_health',
    pillar: 'staffing',
    title: 'Healthcare Staffing',
    shortDesc: 'Credentialed clinical coordinators, medical coders, and health IT specialists.',
    fullDesc: 'HIPAA-trained personnel with verified state licenses and clinical credential verification.',
    category: 'Staffing & Consulting',
    features: ['License verification', 'HIPAA certified', 'EMR/EHR familiarity', 'Shift continuity'],
    deliverableTypes: ['Credential Verification Package', 'Placement Schedule'],
    requiresHiringSpec: true,
  },
  {
    id: 'staffing_construction',
    pillar: 'staffing',
    title: 'Construction Staffing',
    shortDesc: 'OSHA-certified project managers, superintendents, and safety inspectors.',
    fullDesc: 'Experienced commercial and residential construction personnel to keep builds on schedule and within code.',
    category: 'Staffing & Consulting',
    features: ['OSHA compliance', 'Subcontractor coordination', 'Blueprint literacy', 'Site safety'],
    deliverableTypes: ['Field Staff Certifications', 'Safety Records'],
    requiresHiringSpec: true,
  },

  // IT Development
  {
    id: 'it_app_dev',
    pillar: 'it',
    title: 'Application Development',
    shortDesc: 'Modern custom web and mobile web applications built with scalable architectures.',
    fullDesc: 'Full-stack engineering teams delivering robust TypeScript, React, Node.js, and cloud-native solutions designed for high concurrency.',
    category: 'IT Development',
    features: ['Microservices architecture', 'Zero-trust security', 'Automated CI/CD', 'Responsive UX'],
    deliverableTypes: ['Specification Spec', 'Sprint Demo Releases', 'Security Audit', 'Source Code Access'],
  },
  {
    id: 'it_prod_dev',
    pillar: 'it',
    title: 'Product Development',
    shortDesc: 'End-to-end product design, wireframing, MVP construction, and user testing.',
    fullDesc: 'From initial market validation to production MVP, our engineers and designers ship feature-complete digital products in sprints.',
    category: 'IT Development',
    features: ['Figma design systems', 'User story mapping', 'Rapid MVP cycles', 'Analytics instrumentation'],
    deliverableTypes: ['Design Tokens & UI Kit', 'MVP Deployment', 'Usability Findings'],
  },
  {
    id: 'it_offshore_dev',
    pillar: 'it',
    title: 'Offshore Development Centers',
    shortDesc: 'Dedicated global development teams managed under Universal Tech standard governance.',
    fullDesc: 'Co-located engineering squads with US-based tech lead management, aligned working hours, and rigorous code reviews.',
    category: 'IT Development',
    features: ['Timezone alignment', 'US Tech Lead oversight', 'IP protection', 'Scalable squad size'],
    deliverableTypes: ['Sprint Velocity Reports', 'Code Quality Metrics', 'Monthly Capacity Summaries'],
  },

  // AI Automation
  {
    id: 'ai_voice_receptionist',
    pillar: 'ai',
    title: 'AI Voice Receptionists',
    shortDesc: 'Human-parity inbound voice reception for 24/7 call answering, routing, and booking.',
    fullDesc: 'Custom low-latency voice pipelines with real-time calendar checks, caller qualification, and CRM logging without hold queues.',
    category: 'AI Automation',
    features: ['Sub-second latency', 'Call recording & summary', 'Direct calendar sync', 'Escalation transfers'],
    deliverableTypes: ['Prompt Architecture', 'Twilio/SIP Routing Spec', 'Staging Test Suite', 'Live Go-Live'],
  },
  {
    id: 'ai_chat_assistant',
    pillar: 'ai',
    title: 'AI Chat Assistants',
    shortDesc: 'Multi-turn web and SMS assistants grounded strictly in your proprietary documentation.',
    fullDesc: 'Hallucination-resistant retrieval assistants that answer complex customer inquiries and schedule meetings directly into your sales queue.',
    category: 'AI Automation',
    features: ['RAG vector store', 'Zero-hallucination guardrails', 'Lead capture hooks', 'Brand voice tuning'],
    deliverableTypes: ['Knowledge Base Corpus', 'Web Widget Bundle', 'Guardrail Matrix'],
  },
  {
    id: 'ai_lead_qual',
    pillar: 'ai',
    title: 'Lead Capture & Qualification',
    shortDesc: 'Automated speed-to-lead response pipelines that qualify leads in under 60 seconds.',
    fullDesc: 'Multi-channel response systems (SMS, email, voice) that instantly contact new inquiries, score intent, and book high-value demos.',
    category: 'AI Automation',
    features: ['60-second response', 'Custom qualification logic', 'CRM tag triggers', 'Anti-spam protection'],
    deliverableTypes: ['Routing Flowchart', 'Qualification Matrix', 'CRM Trigger Bundle'],
  },
  {
    id: 'ai_crm_ghl',
    pillar: 'ai',
    title: 'CRM & GoHighLevel Setup',
    shortDesc: 'End-to-end GoHighLevel sub-account architecture, custom fields, and pipeline triggers.',
    fullDesc: 'Complete sub-account configuration including custom pipelines, snapshots, attribution tracking, and bidirectional portal syncing.',
    category: 'AI Automation',
    features: ['Sub-account architecture', 'Custom field modeling', 'Pipeline stage automations', 'Attribution tracking'],
    deliverableTypes: ['CRM Architecture Blueprint', 'Snapshot Deployment', 'Field Mapping Guide'],
  },
  {
    id: 'ai_followup_automation',
    pillar: 'ai',
    title: 'Follow-Up Automation',
    shortDesc: 'Drip campaigns and behavioural triggers that nurture cold leads into active meetings.',
    fullDesc: 'Dynamic email and SMS nurture sequences adapting message content based on recipient website visits and prior interactions.',
    category: 'AI Automation',
    features: ['Dynamic conditional branching', 'SMS compliance opt-in/out', 'Split testing', 'Engagement triggers'],
    deliverableTypes: ['Campaign Sequence Copy', 'Trigger Map', 'Deliverability Setup'],
  },
  {
    id: 'ai_booking_reminders',
    pillar: 'ai',
    title: 'Appointment Booking & Reminders',
    shortDesc: 'No-show reduction automation with 2-way SMS confirmation and rescheduling.',
    fullDesc: 'Automated booking confirmations, calendar invites, preparation questionnaires, and intelligent confirmation loops that reduce no-shows.',
    category: 'AI Automation',
    features: ['Google/Outlook calendar sync', '2-way SMS rescheduling', 'Timezone auto-detect', 'Pre-call forms'],
    deliverableTypes: ['Calendar Workflow Map', 'Reminder Template Set'],
  },
  {
    id: 'ai_support_automation',
    pillar: 'ai',
    title: 'Customer Support Automation',
    shortDesc: 'Tier-1 ticket resolution with intelligent human escalation for complex incidents.',
    fullDesc: 'Automated ticket classification, knowledge retrieval, and standard resolution execution integrated with your helpdesk.',
    category: 'AI Automation',
    features: ['Automated triage', 'Sentiment detection', 'Escalation routing', 'SLA tracking'],
    deliverableTypes: ['Resolution Flowchart', 'Triage Policy File'],
  },
  {
    id: 'ai_reactivation_workflows',
    pillar: 'ai',
    title: 'Review Request & Customer Reactivation',
    shortDesc: 'Systematic Google review collection and win-back campaigns for past accounts.',
    fullDesc: 'Automated post-service satisfaction surveys that funnel 5-star clients to public review sites and re-engage stale accounts with targeted offers.',
    category: 'AI Automation',
    features: ['Review funnel routing', 'Stale lead win-back', 'Coupon generation', 'Response notifications'],
    deliverableTypes: ['Review Sequence Templates', 'Campaign Playbook'],
  },
  {
    id: 'ai_workflow_integrations',
    pillar: 'ai',
    title: 'Workflow & API Integrations',
    shortDesc: 'Custom webhooks, Make/Zapier recipes, and server-side data synchronization.',
    fullDesc: 'Resilient middleware tying disparate ERPs, accounting tools, and communication hubs into single automated operational loops.',
    category: 'AI Automation',
    features: ['Retry handling', 'Idempotent processing', 'Error notification alerts', 'Data transformation'],
    deliverableTypes: ['API Integration Map', 'Webhook Documentation', 'Failover Runbook'],
  },
  {
    id: 'ai_doc_processing',
    pillar: 'ai',
    title: 'Document Processing & Reporting',
    shortDesc: 'Automated invoice, resume, and PDF data extraction directly into database records.',
    fullDesc: 'Structured data extraction from messy PDFs and scans using verified OCR and parsing schemas, eliminating manual copy-pasting.',
    category: 'AI Automation',
    features: ['PDF OCR parser', 'Schema validation', 'Exception review queue', 'Automated CSV/DB export'],
    deliverableTypes: ['Extraction Schema', 'Processing Pipeline', 'Accuracy Audit'],
  },
];

class DatabaseStore {
  users: User[] = [];
  organizations: Organization[] = [];
  staffAssignments: StaffAssignment[] = [];
  serviceRequests: ServiceRequest[] = [];
  projects: Project[] = [];
  deliverables: Deliverable[] = [];
  candidateProfiles: CandidateProfile[] = [];
  documents: DocumentRecord[] = [];
  messages: MessageRecord[] = [];
  invoices: Invoice[] = [];
  supportTickets: SupportTicket[] = [];
  invitations: Invitation[] = [];
  ghlConfigs: GoHighLevelSyncConfig[] = [];
  auditEvents: AuditEvent[] = [];
  downloadTokens: Map<string, { documentId: string; userId: string; expiresAt: number }> = new Map();

  constructor() {
    this.seed();
  }

  seed() {
    // Organizations
    const orgApex: Organization = {
      id: 'org_apex_health',
      name: 'Apex Health Systems',
      slug: 'apex-health',
      industry: 'Healthcare & Clinical Services',
      contactEmail: 'contact@apexhealth.org',
      contactPhone: '+1 (555) 234-8901',
      tier: 'Enterprise',
      status: 'active',
      ghlContactId: 'ghl_cnt_98124',
      createdAt: '2026-01-15T09:00:00Z',
      activeServiceIds: ['staffing_health', 'it_app_dev', 'ai_voice_receptionist'],
    };

    const orgNexus: Organization = {
      id: 'org_nexus_logistics',
      name: 'Nexus Logistics Global',
      slug: 'nexus-logistics',
      industry: 'Supply Chain & Freight Tech',
      contactEmail: 'operations@nexuslogistics.io',
      contactPhone: '+1 (555) 876-4321',
      tier: 'Growth',
      status: 'active',
      ghlContactId: 'ghl_cnt_44102',
      createdAt: '2026-03-01T10:00:00Z',
      activeServiceIds: ['staffing_ops', 'ai_crm_ghl'],
    };

    const orgBrandNew: Organization = {
      id: 'org_brand_new',
      name: 'Vanguard Capital Partners',
      slug: 'vanguard-capital',
      industry: 'Private Equity & Advisory',
      contactEmail: 'info@vanguardcap.com',
      contactPhone: '+1 (555) 432-1100',
      tier: 'Standard',
      status: 'onboarding',
      createdAt: '2026-09-20T14:00:00Z',
      activeServiceIds: [],
    };

    this.organizations = [orgApex, orgNexus, orgBrandNew];

    // Users
    this.users = [
      {
        id: 'user_ut_admin',
        email: 'sarah.admin@universaltech.com',
        fullName: 'Sarah Jenkins',
        role: 'ut_admin',
        organizationId: null,
        title: 'Managing Director & Principal Architect',
        canViewBilling: true,
        status: 'active',
        createdAt: '2025-11-01T08:00:00Z',
        lastLoginAt: '2026-09-27T15:45:00Z',
      },
      {
        id: 'user_ut_staff',
        email: 'marcus.tech@universaltech.com',
        fullName: 'Marcus Vance',
        role: 'ut_staff',
        organizationId: null,
        title: 'Senior Solutions Lead',
        canViewBilling: false, // Does NOT have financial access
        status: 'active',
        createdAt: '2025-12-10T08:00:00Z',
        lastLoginAt: '2026-09-27T14:10:00Z',
      },
      {
        id: 'user_ut_staff_finance',
        email: 'rachel.finance@universaltech.com',
        fullName: 'Rachel Sterling',
        role: 'ut_staff',
        organizationId: null,
        title: 'Client Finance & Operations Partner',
        canViewBilling: true, // Has financial access
        status: 'active',
        createdAt: '2026-01-05T08:00:00Z',
        lastLoginAt: '2026-09-26T16:00:00Z',
      },
      // Client 1: Apex Health
      {
        id: 'user_apex_admin',
        email: 'elena.rodriguez@apexhealth.org',
        fullName: 'Dr. Elena Rodriguez',
        role: 'client_admin',
        organizationId: 'org_apex_health',
        title: 'VP of Digital Operations',
        canViewBilling: true,
        status: 'active',
        createdAt: '2026-01-16T09:30:00Z',
        lastLoginAt: '2026-09-27T12:30:00Z',
      },
      {
        id: 'user_apex_member',
        email: 'david.chen@apexhealth.org',
        fullName: 'David Chen',
        role: 'client_member',
        organizationId: 'org_apex_health',
        title: 'Clinical Workflow Coordinator',
        canViewBilling: false, // Member cannot view billing or approve contracts
        status: 'active',
        createdAt: '2026-02-01T10:00:00Z',
        lastLoginAt: '2026-09-25T11:00:00Z',
      },
      // Client 2: Nexus Logistics
      {
        id: 'user_nexus_admin',
        email: 'robert.vance@nexuslogistics.io',
        fullName: 'Robert Vance',
        role: 'client_admin',
        organizationId: 'org_nexus_logistics',
        title: 'Chief Operating Officer',
        canViewBilling: true,
        status: 'active',
        createdAt: '2026-03-02T11:00:00Z',
        lastLoginAt: '2026-09-27T09:15:00Z',
      },
      // Client 3: Vanguard (Empty state demo)
      {
        id: 'user_vanguard_admin',
        email: 'charles.k@vanguardcap.com',
        fullName: 'Charles Kingsbury',
        role: 'client_admin',
        organizationId: 'org_brand_new',
        title: 'Managing Partner',
        canViewBilling: true,
        status: 'active',
        createdAt: '2026-09-20T14:15:00Z',
        lastLoginAt: '2026-09-21T09:00:00Z',
      },
    ];

    // Staff Assignments
    this.staffAssignments = [
      {
        id: 'asgn_1',
        staffUserId: 'user_ut_staff',
        organizationId: 'org_apex_health',
        roleInOrg: 'Lead Engineer',
        assignedAt: '2026-01-20T09:00:00Z',
      },
      {
        id: 'asgn_2',
        staffUserId: 'user_ut_staff',
        organizationId: 'org_nexus_logistics',
        roleInOrg: 'Account Lead',
        assignedAt: '2026-03-05T09:00:00Z',
      },
      // Note: user_ut_staff is NOT assigned to org_brand_new (tests tenant isolation for staff!)
    ];

    // Projects for Apex Health
    const projApexVoice: Project = {
      id: 'proj_apex_voice',
      organizationId: 'org_apex_health',
      name: '24/7 Clinical Patient Intake Voice AI',
      servicePillar: 'ai',
      serviceTitle: 'AI Voice Receptionists',
      description: 'Intelligent multi-line voice receptionist that handles patient inquiries, triage scheduling, and prescription refill dispatch with direct EHR EHR-safe routing.',
      agreedScope: 'Configure low-latency SIP trunks, speech-to-text pipeline, HIPAA-compliant prompt guardrails, and automated booking into AthenaHealth clinical calendar.',
      status: 'active',
      assignedStaffIds: ['user_ut_staff', 'user_ut_admin'],
      startDate: '2026-08-01',
      targetDate: '2026-10-15',
      previewUrl: 'https://staging-voice-apex.demo.universaltech.cloud',
      milestones: [
        { id: 'm1', title: 'Clinical Script & Guardrail Signoff', dueDate: '2026-08-15', status: 'completed' },
        { id: 'm2', title: 'Telephony Trunks & Staging Simulation', dueDate: '2026-09-10', status: 'completed' },
        { id: 'm3', title: 'Pilot Staff Verification & Call Testing', dueDate: '2026-09-30', status: 'in_progress' },
        { id: 'm4', title: 'Production Go-Live & Monitoring', dueDate: '2026-10-15', status: 'pending' },
      ],
      tasks: [
        { id: 't1', title: 'Complete HIPAA audit log mapping for voice transcripts', description: 'Ensure no PHI leaks to third-party endpoints', status: 'completed', priority: 'high', assigneeName: 'Marcus Vance', dueDate: '2026-09-08' },
        { id: 't2', title: 'Staging clinic voice latency benchmark', description: 'Confirm sub-800ms turnaround for prompt responses', status: 'in_progress', priority: 'urgent', assigneeName: 'Marcus Vance', dueDate: '2026-09-28' },
        { id: 't3', title: 'Review exception escalation phone numbers', description: 'Client confirmation needed for on-call triage physician line', status: 'waiting_on_client', priority: 'high', assigneeName: 'Dr. Elena Rodriguez', dueDate: '2026-09-29' },
        { id: 't4', title: 'Finalize off-hours greeting message audio', description: 'Record studio IVR backup prompt', status: 'todo', priority: 'medium', assigneeName: 'Sarah Jenkins', dueDate: '2026-10-05' },
      ],
      clientUpdates: [
        { id: 'up1', date: '2026-09-22', title: 'Milestone 2 Verified & Staging Environment Ready', content: 'Our engineering squad has provisioned the dedicated low-latency voice pipeline. Test numbers are active for clinical staff review.', authorName: 'Marcus Vance' },
        { id: 'up2', date: '2026-09-12', title: 'Prompt Guardrails Hardened', content: 'Emergency redirect algorithms now successfully detect critical cardiac/respiratory keywords and immediately transfer to the 911 dispatch loop.', authorName: 'Sarah Jenkins' },
      ],
      internalNotes: 'Apex leadership is sensitive regarding call-hold latency. We must maintain dedicated worker threads on the telephony cluster. Rachel: invoice Milestone 2 upon signoff.',
      aiWorkflowDetails: {
        architectureSummary: 'Telephony ingest via Twilio SIP -> streaming WebSocket -> Deepgram Nova-2 -> LLM Guardrail Orchestrator -> ElevenLabs Turbo v2.5 voice synthesis.',
        integrationStatus: {
          crm: 'connected',
          voiceGateway: 'connected',
          webhookRelay: 'healthy',
        },
        approvedKnowledgeDocs: [
          'Apex_Health_Clinical_Guidelines_v3.pdf',
          'Clinic_Operating_Hours_And_Holiday_Schedule_2026.docx',
          'Insurance_Accepted_Providers_Q3_2026.xlsx',
        ],
        testScenarios: [
          { title: 'Standard appointment booking for recurring patient', status: 'passed', notes: 'Identified patient ID and matched open calendar slot cleanly.' },
          { title: 'Urgent acute symptom detection & emergency routing', status: 'passed', notes: 'Immediate break-in handler executed in 210ms.' },
          { title: 'Out-of-network insurance inquiry', status: 'needs_review', notes: 'Awaiting updated copay deductible table from Apex billing team.' },
        ],
      },
      createdAt: '2026-08-01T08:00:00Z',
    };

    const projApexStaffing: Project = {
      id: 'proj_apex_staffing',
      organizationId: 'org_apex_health',
      name: 'Clinical Health IT Specialist Hiring',
      servicePillar: 'staffing',
      serviceTitle: 'Healthcare Staffing',
      description: 'Dedicated search and placement for 3 Epic EMR certified application analysts to support clinic migration.',
      agreedScope: 'Direct hire search across Midwest region, technical competency screening, background license validation.',
      status: 'active',
      assignedStaffIds: ['user_ut_staff'],
      startDate: '2026-09-01',
      targetDate: '2026-10-31',
      milestones: [
        { id: 'm_s1', title: 'Role Specification & Market Calibration', dueDate: '2026-09-10', status: 'completed' },
        { id: 'm_s2', title: 'First Candidate Shortlist (6 Vetted Profiles)', dueDate: '2026-09-25', status: 'completed' },
        { id: 'm_s3', title: 'Client Panel Interviews', dueDate: '2026-10-15', status: 'in_progress' },
        { id: 'm_s4', title: 'Offer Finalization & Start Date', dueDate: '2026-10-31', status: 'pending' },
      ],
      tasks: [
        { id: 't_s1', title: 'Review feedback on Candidate #2 (Patricia Miller)', description: 'Dr. Rodriguez to confirm second round interview availability', status: 'waiting_on_client', priority: 'high', assigneeName: 'Dr. Elena Rodriguez', dueDate: '2026-09-28' },
        { id: 't_s2', title: 'Coordinate technical panel with clinical lead', description: 'Schedule 45-minute architectural walkthrough', status: 'in_progress', priority: 'medium', assigneeName: 'Marcus Vance', dueDate: '2026-09-30' },
      ],
      clientUpdates: [
        { id: 'up_s1', date: '2026-09-24', title: 'Shortlist Dossiers Delivered', content: 'Four pre-screened candidates holding active Epic Clinical Documentation certifications have been added to your candidate portal for review.', authorName: 'Marcus Vance' },
      ],
      internalNotes: 'Client target salary is $115k-$130k. Candidate Patricia Miller has a competing offer from Cleveland Clinic expiring Friday.',
      createdAt: '2026-09-01T08:00:00Z',
    };

    // Projects for Nexus Logistics
    const projNexusCrm: Project = {
      id: 'proj_nexus_crm',
      organizationId: 'org_nexus_logistics',
      name: 'GoHighLevel Carrier Dispatch Pipeline & Automation',
      servicePillar: 'ai',
      serviceTitle: 'CRM and GoHighLevel Setup',
      description: 'End-to-end configuration of multi-location carrier pipelines, automated load tracking alerts, and broker follow-ups.',
      agreedScope: 'Configure custom broker opportunity stages, two-way SMS trigger workflows, and webhook sync to Nexus dispatch database.',
      status: 'active',
      assignedStaffIds: ['user_ut_staff', 'user_ut_admin'],
      startDate: '2026-08-15',
      targetDate: '2026-10-01',
      milestones: [
        { id: 'm_n1', title: 'Sub-Account Setup & Custom Field Architecture', dueDate: '2026-08-25', status: 'completed' },
        { id: 'm_n2', title: 'Carrier Inbound Automation & SMS Templates', dueDate: '2026-09-15', status: 'completed' },
        { id: 'm_n3', title: 'Webhook Dispatch Sync & Acceptance Review', dueDate: '2026-09-28', status: 'in_progress' },
      ],
      tasks: [
        { id: 't_n1', title: 'Approve Load Status Webhook Payload Spec', description: 'Awaiting client sign-off on Deliverable v1.2', status: 'waiting_on_client', priority: 'urgent', assigneeName: 'Robert Vance', dueDate: '2026-09-28' },
      ],
      clientUpdates: [
        { id: 'up_n1', date: '2026-09-20', title: 'Integration Test Passed in Sandbox', content: 'Carrier SMS response rate tested at 98.4% during mock simulation.', authorName: 'Marcus Vance' },
      ],
      internalNotes: 'Nexus CEO requested emergency hotline setup. Keep integration payload compact for cellular dispatchers.',
      createdAt: '2026-08-15T08:00:00Z',
    };

    this.projects = [projApexVoice, projApexStaffing, projNexusCrm];

    // Deliverables with Versioned Approvals
    this.deliverables = [
      {
        id: 'del_voice_script',
        projectId: 'proj_apex_voice',
        organizationId: 'org_apex_health',
        title: 'Clinical Triage Prompt Architecture & Dialogue Tree',
        description: 'Comprehensive conversational specification for patient intake, emergency red-flags, insurance intake, and appointment booking logic.',
        currentVersion: 'v2.1',
        status: 'awaiting_approval',
        previewUrl: 'https://specs.universaltech.cloud/apex/voice-prompt-v2-1.html',
        fileKey: 'docs/Apex_Voice_Dialogue_Tree_v2.1.pdf',
        fileName: 'Apex_Voice_Dialogue_Tree_v2.1.pdf',
        internalNotes: 'Addresses feedback from Dr. Rodriguez regarding prescription refill wording.',
        approvalHistory: [
          {
            id: 'app_1',
            version: 'v1.0',
            userId: 'user_apex_admin',
            userName: 'Dr. Elena Rodriguez',
            userRole: 'client_admin',
            action: 'revision_requested',
            feedback: 'Need clearer guidance that the voice agent must explicitly mention prescription refills cannot be authorized for controlled substances without physician review.',
            timestamp: '2026-08-18T14:22:00Z',
          },
          {
            id: 'app_2',
            version: 'v2.0',
            userId: 'user_ut_staff',
            userName: 'Marcus Vance',
            userRole: 'ut_staff',
            action: 'approved',
            feedback: 'Updated dialogue flow and added controlled substances hard stop rule.',
            timestamp: '2026-08-22T09:10:00Z',
          },
        ],
      },
      {
        id: 'del_hipaa_compliance',
        projectId: 'proj_apex_voice',
        organizationId: 'org_apex_health',
        title: 'HIPAA Security & Audio Encryption Architecture Document',
        description: 'Data flow mapping detailing end-to-end TLS 1.3 in-flight encryption, zero-retention voice synthesis endpoints, and BAA agreements.',
        currentVersion: 'v1.0',
        status: 'approved',
        fileName: 'UniversalTech_HIPAA_Voice_Encryption_Architecture_Apex.pdf',
        fileKey: 'docs/UniversalTech_HIPAA_Voice_Encryption_Architecture_Apex.pdf',
        approvalHistory: [
          {
            id: 'app_3',
            version: 'v1.0',
            userId: 'user_apex_admin',
            userName: 'Dr. Elena Rodriguez',
            userRole: 'client_admin',
            action: 'approved',
            feedback: 'Approved by Apex Security Council for clinical pilot.',
            timestamp: '2026-08-25T11:05:00Z',
          },
        ],
      },
      {
        id: 'del_nexus_spec',
        projectId: 'proj_nexus_crm',
        organizationId: 'org_nexus_logistics',
        title: 'Carrier Dispatch Webhook Payload Specification',
        description: 'JSON Schema and HMAC SHA-256 signature verification protocol for bidirectional GoHighLevel load updates.',
        currentVersion: 'v1.2',
        status: 'awaiting_approval',
        fileName: 'Nexus_GHL_Dispatch_Webhook_Spec_v1.2.pdf',
        fileKey: 'docs/Nexus_GHL_Dispatch_Webhook_Spec_v1.2.pdf',
        internalNotes: 'Ensure Robert confirms their broker API authentication header.',
        approvalHistory: [
          {
            id: 'app_4',
            version: 'v1.0',
            userId: 'user_nexus_admin',
            userName: 'Robert Vance',
            userRole: 'client_admin',
            action: 'revision_requested',
            feedback: 'Please add broker invoice ID and fuel surcharge calculation parameters into the payload schema.',
            timestamp: '2026-09-02T16:30:00Z',
          },
        ],
      },
    ];

    // Candidate Profiles for Staffing (Client Authorized only)
    this.candidateProfiles = [
      {
        id: 'cand_1',
        organizationId: 'org_apex_health',
        requestId: 'req_apex_1',
        fullName: 'Patricia Miller, RN, BSN',
        roleTitle: 'Senior Epic Ambulatory & Cadence Analyst',
        experienceYears: 8,
        location: 'Chicago, IL (Hybrid / Remote)',
        availability: '2 Weeks Notice',
        skills: ['Epic Ambulatory 2024', 'Cadence Scheduling', 'Clinical Documentation', 'HIPAA Security', 'HL7/FHIR'],
        summary: 'Experienced clinical informatics specialist with dual clinical nursing background and 8 years implementing ambulatory workflows across 4 major hospital networks.',
        resumeFileName: 'Candidate_Dossier_Patricia_Miller_Redacted.pdf',
        status: 'interview_scheduled',
        interviewDate: '2026-10-02T14:00:00Z',
        clientFeedback: 'Strong profile. Panel interview confirmed with Chief Medical Officer on Oct 2nd.',
      },
      {
        id: 'cand_2',
        organizationId: 'org_apex_health',
        requestId: 'req_apex_1',
        fullName: 'Kevin Albers',
        roleTitle: 'Epic Clarity & Reporting Specialist',
        experienceYears: 6,
        location: 'Milwaukee, WI (Remote)',
        availability: 'Immediate',
        skills: ['Epic Clarity ETL', 'SQL', 'Caboodle Data Model', 'PowerBI Healthcare Dashboards'],
        summary: 'Healthcare data architect focused on operational turnaround metrics, clinic scheduling analytics, and physician productivity reporting.',
        resumeFileName: 'Candidate_Dossier_Kevin_Albers_Redacted.pdf',
        status: 'submitted',
        clientFeedback: 'Dr. Rodriguez reviewing portfolio.',
      },
    ];

    // Service Requests
    this.serviceRequests = [
      {
        id: 'req_apex_1',
        organizationId: 'org_apex_health',
        requesterId: 'user_apex_admin',
        requesterName: 'Dr. Elena Rodriguez',
        requesterEmail: 'elena.rodriguez@apexhealth.org',
        serviceId: 'staffing_health',
        serviceTitle: 'Healthcare Staffing',
        serviceCategory: 'staffing',
        businessNeed: 'Expanding outpatient clinics requires 3 dedicated Epic application analysts for go-live support.',
        desiredOutcome: 'Fully certified Epic analysts embedded with our clinical IT squad by end of October.',
        preferredTimeframe: 'Immediate (within 30 days)',
        budgetRange: '$120k - $140k / role or hourly contract equivalent',
        status: 'in_progress',
        hiringDetails: {
          roleTitle: 'Epic Clinical Systems Analyst',
          location: 'Chicago Regional Clinics (Hybrid)',
          employmentType: 'Direct Hire',
          headcount: 3,
          startTimeline: 'October 2026',
          responsibilities: 'Build and refine ambulatory clinical templates, doctor preference lists, and appointment booking logic.',
          requiredQualifications: 'Active Epic Ambulatory certification, minimum 4 years clinical health system implementation.',
        },
        attachments: [{ name: 'Apex_Clinic_Expansion_Job_Description.pdf', size: '240 KB', key: 'req_docs/job_desc_apex.pdf' }],
        createdAt: '2026-08-25T11:00:00Z',
        updatedAt: '2026-09-01T08:00:00Z',
        scopedEstimate: {
          estimatedDays: 45,
          proposedScope: 'Direct hire search across Midwest healthcare market, technical vetting, and interview coordination.',
          proposedBudget: 'Standard direct placement fee upon verified hiring',
        },
      },
      {
        id: 'req_apex_2',
        organizationId: 'org_apex_health',
        requesterId: 'user_apex_admin',
        requesterName: 'Dr. Elena Rodriguez',
        requesterEmail: 'elena.rodriguez@apexhealth.org',
        serviceId: 'ai_doc_processing',
        serviceTitle: 'Document Processing & Reporting',
        serviceCategory: 'ai',
        businessNeed: 'We receive ~400 faxed referral forms daily that require manual data entry into our patient registration database.',
        desiredOutcome: 'Automated OCR extraction pipeline that parses patient demographic and insurance carrier data into a structured staging queue for registrar one-click verification.',
        preferredTimeframe: 'Q4 2026',
        budgetRange: '$25,000 - $35,000 initial setup',
        status: 'scoped',
        attachments: [{ name: 'Sample_Redacted_Fax_Referral.pdf', size: '1.2 MB', key: 'req_docs/sample_referral.pdf' }],
        createdAt: '2026-09-18T15:20:00Z',
        updatedAt: '2026-09-24T10:00:00Z',
        scopedEstimate: {
          estimatedDays: 28,
          proposedScope: 'Deploy AWS Textract / Google Document AI pipeline with custom HIPAA-compliant clinical regex parser and exception management dashboard.',
          proposedBudget: '$28,500 milestone-based delivery',
        },
      },
      {
        id: 'req_nexus_1',
        organizationId: 'org_nexus_logistics',
        requesterId: 'user_nexus_admin',
        requesterName: 'Robert Vance',
        requesterEmail: 'robert.vance@nexuslogistics.io',
        serviceId: 'ai_followup_automation',
        serviceTitle: 'Follow-Up Automation',
        serviceCategory: 'ai',
        businessNeed: 'Shippers that request freight quotes often go cold if not followed up within 2 hours.',
        desiredOutcome: 'Automated SMS and email quote follow-up sequences triggered by our freight TMS rating engine.',
        preferredTimeframe: '2-4 weeks',
        budgetRange: '$10,000 - $15,000',
        status: 'under_review',
        attachments: [],
        createdAt: '2026-09-25T16:00:00Z',
        updatedAt: '2026-09-26T09:00:00Z',
      },
    ];

    // Documents (Secure repo with scan statuses)
    this.documents = [
      {
        id: 'doc_1',
        organizationId: 'org_apex_health',
        projectId: 'proj_apex_voice',
        name: 'Apex_Voice_Dialogue_Tree_v2.1.pdf',
        fileType: 'application/pdf',
        sizeBytes: 1420580,
        scanStatus: 'scanned_clean',
        version: 'v2.1',
        uploadedByUserId: 'user_ut_staff',
        uploadedByUserName: 'Marcus Vance',
        isInternalOnly: false,
        category: 'deliverable',
        createdAt: '2026-09-22T10:30:00Z',
      },
      {
        id: 'doc_2',
        organizationId: 'org_apex_health',
        projectId: 'proj_apex_voice',
        name: 'UniversalTech_Master_Services_Agreement_Signed.pdf',
        fileType: 'application/pdf',
        sizeBytes: 3120000,
        scanStatus: 'scanned_clean',
        version: 'v1.0',
        uploadedByUserId: 'user_ut_admin',
        uploadedByUserName: 'Sarah Jenkins',
        isInternalOnly: false,
        category: 'contract',
        createdAt: '2026-07-28T14:00:00Z',
      },
      {
        id: 'doc_3',
        organizationId: 'org_apex_health',
        projectId: 'proj_apex_voice',
        name: 'UniversalTech_Internal_Cost_Model_Q3.xlsx',
        fileType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        sizeBytes: 420000,
        scanStatus: 'scanned_clean',
        version: 'v1.0',
        uploadedByUserId: 'user_ut_admin',
        uploadedByUserName: 'Sarah Jenkins',
        isInternalOnly: true, // Internal file - MUST never appear in client queries!
        category: 'report',
        createdAt: '2026-08-05T09:00:00Z',
      },
      {
        id: 'doc_4',
        organizationId: 'org_apex_health',
        projectId: 'proj_apex_staffing',
        name: 'Candidate_Dossier_Patricia_Miller_Redacted.pdf',
        fileType: 'application/pdf',
        sizeBytes: 850000,
        scanStatus: 'scanned_clean',
        version: 'v1.0',
        uploadedByUserId: 'user_ut_staff',
        uploadedByUserName: 'Marcus Vance',
        isInternalOnly: false,
        category: 'deliverable',
        createdAt: '2026-09-24T16:00:00Z',
      },
      {
        id: 'doc_5',
        organizationId: 'org_nexus_logistics',
        projectId: 'proj_nexus_crm',
        name: 'Nexus_GHL_Dispatch_Webhook_Spec_v1.2.pdf',
        fileType: 'application/pdf',
        sizeBytes: 980000,
        scanStatus: 'scanned_clean',
        version: 'v1.2',
        uploadedByUserId: 'user_ut_staff',
        uploadedByUserName: 'Marcus Vance',
        isInternalOnly: false,
        category: 'deliverable',
        createdAt: '2026-09-12T11:20:00Z',
      },
    ];

    // Messages
    this.messages = [
      {
        id: 'msg_1',
        conversationId: 'conv_apex_voice',
        organizationId: 'org_apex_health',
        projectId: 'proj_apex_voice',
        senderId: 'user_ut_staff',
        senderName: 'Marcus Vance',
        senderRole: 'ut_staff',
        content: 'Hi Dr. Rodriguez, we have updated the staging environment with the new prompt revision (v2.1). The controlled substance redirect now executes cleanly. Please test and submit your review.',
        isInternal: false,
        createdAt: '2026-09-22T11:00:00Z',
      },
      {
        id: 'msg_2',
        conversationId: 'conv_apex_voice',
        organizationId: 'org_apex_health',
        projectId: 'proj_apex_voice',
        senderId: 'user_apex_admin',
        senderName: 'Dr. Elena Rodriguez',
        senderRole: 'client_admin',
        content: 'Thank you Marcus. Our triage nurse supervisor is running test calls this afternoon. We will record any anomalies in the review form.',
        isInternal: false,
        createdAt: '2026-09-22T14:15:00Z',
      },
      {
        id: 'msg_3',
        conversationId: 'conv_apex_voice',
        organizationId: 'org_apex_health',
        projectId: 'proj_apex_voice',
        senderId: 'user_ut_admin',
        senderName: 'Sarah Jenkins',
        senderRole: 'ut_admin',
        content: '[INTERNAL STAFF NOTE] Checked telephony concurrency logs. Peak CPU on the transcriber was 42%. We have ample capacity for their 10 clinics.',
        isInternal: true, // Internal only note!
        createdAt: '2026-09-23T09:00:00Z',
      },
    ];

    // Invoices
    this.invoices = [
      {
        id: 'inv_1001',
        organizationId: 'org_apex_health',
        projectId: 'proj_apex_voice',
        projectName: '24/7 Clinical Patient Intake Voice AI',
        invoiceNumber: 'UT-INV-2026-1001',
        issueDate: '2026-08-01',
        dueDate: '2026-08-31',
        currency: 'USD',
        lineItems: [
          { id: 'li_1', description: 'Milestone 1: Voice Architecture & Clinical Dialogue Tree Design', quantity: 1, unitPrice: 12500, total: 12500 },
          { id: 'li_2', description: 'HIPAA Security Protocol & Dedicated Telephony Setup', quantity: 1, unitPrice: 5000, total: 5000 },
        ],
        subtotal: 17500,
        tax: 0,
        total: 17500,
        amountPaid: 17500,
        status: 'paid',
        paidAt: '2026-08-28T16:00:00Z',
        notes: 'Paid via verified ACH transfer ref #ACH-982143.',
      },
      {
        id: 'inv_1002',
        organizationId: 'org_apex_health',
        projectId: 'proj_apex_voice',
        projectName: '24/7 Clinical Patient Intake Voice AI',
        invoiceNumber: 'UT-INV-2026-1002',
        issueDate: '2026-09-15',
        dueDate: '2026-10-15',
        currency: 'USD',
        lineItems: [
          { id: 'li_3', description: 'Milestone 2: Staging Telephony Deployment & Clinical Pilot Validation', quantity: 1, unitPrice: 15000, total: 15000 },
        ],
        subtotal: 15000,
        tax: 0,
        total: 15000,
        amountPaid: 0,
        status: 'sent',
        notes: 'Net 30 terms. Electronic payment gateway awaiting merchant API production key.',
      },
      {
        id: 'inv_1003',
        organizationId: 'org_nexus_logistics',
        projectId: 'proj_nexus_crm',
        projectName: 'GoHighLevel Carrier Dispatch Pipeline & Automation',
        invoiceNumber: 'UT-INV-2026-1003',
        issueDate: '2026-09-01',
        dueDate: '2026-10-01',
        currency: 'USD',
        lineItems: [
          { id: 'li_4', description: 'GoHighLevel Sub-Account Provisioning & Custom Field Architecture', quantity: 1, unitPrice: 7500, total: 7500 },
        ],
        subtotal: 7500,
        tax: 0,
        total: 7500,
        amountPaid: 7500,
        status: 'paid',
        paidAt: '2026-09-18T10:20:00Z',
        notes: 'Paid via corporate wire transfer ref #WIRE-2026-0918.',
      },
    ];

    // Support Tickets
    this.supportTickets = [
      {
        id: 'tick_1',
        ticketNumber: 'SUP-2026-0042',
        organizationId: 'org_apex_health',
        requesterId: 'user_apex_admin',
        requesterName: 'Dr. Elena Rodriguez',
        category: 'AI Workflow Adjustment',
        subject: 'Add Spanish audio translation routing to intake queue',
        description: 'Two of our Southside outpatient clinics have a 60% native Spanish-speaking population. We need the incoming voice receptionist to offer "Para español, oprima el dos" and transfer to a specialized Spanish prompt tree.',
        urgency: 'high',
        relatedProjectId: 'proj_apex_voice',
        assignedStaffId: 'user_ut_staff',
        status: 'in_progress',
        messages: [
          {
            id: 'tmsg_1',
            senderId: 'user_apex_admin',
            senderName: 'Dr. Elena Rodriguez',
            senderRole: 'client_admin',
            content: 'Can we configure Spanish language routing before the public clinic launch next month?',
            createdAt: '2026-09-24T14:00:00Z',
          },
          {
            id: 'tmsg_2',
            senderId: 'user_ut_staff',
            senderName: 'Marcus Vance',
            senderRole: 'ut_staff',
            content: 'Yes! We have provisioned the Spanish localized prompt engine with certified medical terminology vocabulary. We will have a demonstration branch deployed to staging by Thursday.',
            createdAt: '2026-09-25T09:30:00Z',
          },
        ],
        createdAt: '2026-09-24T14:00:00Z',
        updatedAt: '2026-09-25T09:30:00Z',
      },
      {
        id: 'tick_2',
        ticketNumber: 'SUP-2026-0039',
        organizationId: 'org_nexus_logistics',
        requesterId: 'user_nexus_admin',
        requesterName: 'Robert Vance',
        category: 'Technical Bug',
        subject: 'Carrier SMS webhook timeout during evening freight shift',
        description: 'At 11:30 PM EST yesterday, three carrier response SMS webhooks timed out with 504 Gateway errors.',
        urgency: 'critical',
        relatedProjectId: 'proj_nexus_crm',
        assignedStaffId: 'user_ut_staff',
        status: 'resolved',
        messages: [
          {
            id: 'tmsg_3',
            senderId: 'user_nexus_admin',
            senderName: 'Robert Vance',
            senderRole: 'client_admin',
            content: 'Looking for root cause on the 11:30 PM timeout.',
            createdAt: '2026-09-23T06:00:00Z',
          },
          {
            id: 'tmsg_4',
            senderId: 'user_ut_staff',
            senderName: 'Marcus Vance',
            senderRole: 'ut_staff',
            content: 'Investigated and resolved: GoHighLevel webhook retry window experienced a 4-minute upstream API throttle. We implemented an asynchronous Redis queue on our server-side relay to absorb throttling spikes.',
            createdAt: '2026-09-23T08:15:00Z',
          },
        ],
        createdAt: '2026-09-23T06:00:00Z',
        updatedAt: '2026-09-23T08:15:00Z',
      },
    ];

    // Invitations
    this.invitations = [
      {
        id: 'inv_token_1',
        organizationId: 'org_apex_health',
        email: 'michael.ross@apexhealth.org',
        role: 'client_member',
        token: 'invite_apex_michael_2026',
        invitedByUserId: 'user_apex_admin',
        expiresAt: '2026-10-05T23:59:59Z',
        status: 'pending',
        createdAt: '2026-09-25T10:00:00Z',
      },
    ];

    // GoHighLevel Integrations Configurations
    this.ghlConfigs = [
      {
        organizationId: 'org_apex_health',
        isConnected: true,
        status: 'active',
        locationId: 'loc_apex_hl_99182',
        apiKeyMasked: 'ghl_live_••••••••••••34a1',
        webhookSecretMasked: 'whsec_••••••••••••89c2',
        syncDirections: {
          contacts: 'bidirectional',
          opportunities: 'portal_to_crm',
        },
        fieldMappings: [
          { portalField: 'fullName', ghlField: 'contact_name', owner: 'UniversalTechPortal' },
          { portalField: 'email', ghlField: 'email', owner: 'UniversalTechPortal' },
          { portalField: 'phone', ghlField: 'phone', owner: 'UniversalTechPortal' },
          { portalField: 'organizationName', ghlField: 'company_name', owner: 'UniversalTechPortal' },
          { portalField: 'serviceCategory', ghlField: 'lead_interest_tag', owner: 'UniversalTechPortal' },
          { portalField: 'requestStatus', ghlField: 'opportunity_stage', owner: 'GoHighLevel' },
        ],
        lastSyncTimestamp: '2026-09-27T15:30:00Z',
        syncErrors: [],
      },
      {
        organizationId: 'org_nexus_logistics',
        isConnected: true,
        status: 'active',
        locationId: 'loc_nexus_trans_5521',
        apiKeyMasked: 'ghl_live_••••••••••••91e4',
        webhookSecretMasked: 'whsec_••••••••••••22f7',
        syncDirections: {
          contacts: 'bidirectional',
          opportunities: 'bidirectional',
        },
        fieldMappings: [
          { portalField: 'fullName', ghlField: 'contact_name', owner: 'UniversalTechPortal' },
          { portalField: 'email', ghlField: 'email', owner: 'UniversalTechPortal' },
          { portalField: 'phone', ghlField: 'phone', owner: 'UniversalTechPortal' },
          { portalField: 'requestStatus', ghlField: 'pipeline_stage', owner: 'UniversalTechPortal' },
        ],
        lastSyncTimestamp: '2026-09-27T12:00:00Z',
        syncErrors: [],
      },
      {
        organizationId: 'org_brand_new',
        isConnected: false,
        status: 'unconfigured',
        locationId: '',
        apiKeyMasked: '',
        webhookSecretMasked: '',
        syncDirections: {
          contacts: 'bidirectional',
          opportunities: 'portal_to_crm',
        },
        fieldMappings: [
          { portalField: 'fullName', ghlField: 'contact_name', owner: 'UniversalTechPortal' },
          { portalField: 'email', ghlField: 'email', owner: 'UniversalTechPortal' },
        ],
        syncErrors: ['Integration unconfigured: API token and Location ID required'],
      },
    ];

    // Audit Events
    this.auditEvents = [
      {
        id: 'aud_1',
        organizationId: 'org_apex_health',
        userId: 'user_apex_admin',
        userEmail: 'elena.rodriguez@apexhealth.org',
        action: 'DELIVERABLE_REVIEW_REVISED',
        resourceType: 'deliverable',
        resourceId: 'del_voice_script',
        details: 'Requested revisions on Clinical Triage Prompt Architecture (v1.0) with prescription guardrail requirements.',
        ipAddress: '198.51.100.45',
        timestamp: '2026-08-18T14:22:00Z',
      },
      {
        id: 'aud_2',
        organizationId: 'org_apex_health',
        userId: 'user_ut_staff',
        userEmail: 'marcus.tech@universaltech.com',
        action: 'DELIVERABLE_VERSION_UPLOADED',
        resourceType: 'deliverable',
        resourceId: 'del_voice_script',
        details: 'Uploaded updated version v2.1 addressing client prescription guardrails.',
        ipAddress: '192.0.2.14',
        timestamp: '2026-09-22T10:30:00Z',
      },
      {
        id: 'aud_3',
        organizationId: 'org_apex_health',
        userId: 'user_apex_admin',
        userEmail: 'elena.rodriguez@apexhealth.org',
        action: 'INVITATION_ISSUED',
        resourceType: 'invitation',
        resourceId: 'inv_token_1',
        details: 'Issued client_member invitation to michael.ross@apexhealth.org (expires 2026-10-05).',
        ipAddress: '198.51.100.45',
        timestamp: '2026-09-25T10:00:00Z',
      },
      {
        id: 'aud_4',
        organizationId: 'org_apex_health',
        userId: 'user_apex_admin',
        userEmail: 'elena.rodriguez@apexhealth.org',
        action: 'SERVICE_REQUEST_SUBMITTED',
        resourceType: 'service_request',
        resourceId: 'req_apex_2',
        details: 'Submitted new service request: Document Processing & Reporting for fax referral automation.',
        ipAddress: '198.51.100.45',
        timestamp: '2026-09-18T15:20:00Z',
      },
      {
        id: 'aud_5',
        organizationId: 'org_nexus_logistics',
        userId: 'user_ut_staff',
        userEmail: 'marcus.tech@universaltech.com',
        action: 'INTEGRATION_SYNC_TRIGGERED',
        resourceType: 'integration',
        resourceId: 'org_nexus_logistics',
        details: 'Triggered manual sync verification with GoHighLevel API.',
        ipAddress: '192.0.2.14',
        timestamp: '2026-09-27T12:00:00Z',
      },
    ];
  }

  // Audit Logging Helper
  logAudit(event: Omit<AuditEvent, 'id' | 'timestamp'>) {
    const record: AuditEvent = {
      ...event,
      id: `aud_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
    };
    this.auditEvents.unshift(record);
    // Keep max 500 records
    if (this.auditEvents.length > 500) {
      this.auditEvents.pop();
    }
    return record;
  }
}

export const db = new DatabaseStore();
