import {
  User,
  Organization,
  ServiceCatalogItem,
  ServiceRequest,
  Project,
  Deliverable,
  CandidateProfile,
  DocumentRecord,
  MessageRecord,
  Invoice,
  SupportTicket,
  AuditEvent,
  SecurityTestResult,
  RequestStatus,
} from '../types/index.ts';

const CURRENT_USER_KEY = 'ut_current_user_id';

class ApiClient {
  private currentUserId: string = 'user_apex_admin'; // Default Elena Rodriguez (Client Admin)

  constructor() {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(CURRENT_USER_KEY);
      if (stored) {
        this.currentUserId = stored;
      }
    }
  }

  getCurrentUserId(): string {
    return this.currentUserId;
  }

  setCurrentUserId(id: string) {
    this.currentUserId = id;
    if (typeof window !== 'undefined') {
      localStorage.setItem(CURRENT_USER_KEY, id);
    }
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.currentUserId}`,
      'x-user-id': this.currentUserId,
      ...(options.headers as Record<string, string>),
    };

    const res = await fetch(endpoint, {
      ...options,
      headers,
    });

    if (!res.ok) {
      let errMsg = `Request failed: ${res.status} ${res.statusText}`;
      try {
        const errorData = await res.json();
        if (errorData.error) errMsg = errorData.error;
      } catch {
        // Fallback to text
      }
      throw new Error(errMsg);
    }

    return res.json() as Promise<T>;
  }

  // Auth & Session
  async getMe() {
    return this.request<{
      user: User;
      organization: Organization | null;
      permissions: {
        canViewBilling: boolean;
        canApproveDeliverables: boolean;
        canManageTeam: boolean;
        canAccessInternalNotes: boolean;
        isAdmin: boolean;
        isStaff: boolean;
      };
    }>('/api/auth/me');
  }

  async login(email: string, password?: string) {
    const res = await this.request<{
      user: User;
      organization: Organization | null;
      permissions: any;
    }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    this.setCurrentUserId(res.user.id);
    return res;
  }

  async logout() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(CURRENT_USER_KEY);
    }
  }

  async requestPasswordReset(email: string) {
    return this.request<{ success: boolean; message: string }>('/api/auth/request-password-reset', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async switchDemo(userId: string) {
    this.setCurrentUserId(userId);
    return this.request<{
      user: User;
      organization: Organization | null;
      permissions: any;
    }>('/api/auth/switch-demo', {
      method: 'POST',
      body: JSON.stringify({ userId }),
    });
  }

  async getDemoUsers() {
    return this.request<
      Array<{
        id: string;
        fullName: string;
        email: string;
        role: string;
        title: string;
        organizationName: string;
        canViewBilling: boolean;
      }>
    >('/api/auth/demo-users');
  }

  async verifyInvitation(token: string) {
    return this.request<{
      valid: boolean;
      email?: string;
      role?: string;
      organizationName?: string;
      expiresAt?: string;
      error?: string;
    }>('/api/auth/invitation/verify', {
      method: 'POST',
      body: JSON.stringify({ token }),
    });
  }

  async acceptInvitation(token: string, fullName: string) {
    return this.request<{ success: boolean; user: User }>('/api/auth/invitation/accept', {
      method: 'POST',
      body: JSON.stringify({ token, fullName }),
    });
  }

  // Organizations
  async getOrganizations() {
    return this.request<Organization[]>('/api/organizations');
  }

  async getOrganization(id: string) {
    return this.request<Organization>(`/api/organizations/${id}`);
  }

  async updateOrganization(id: string, updates: Partial<Organization>) {
    return this.request<Organization>(`/api/organizations/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  async getOrganizationTeam(id: string) {
    return this.request<{
      members: User[];
      pendingInvites: Array<{ id: string; email: string; role: string; expiresAt: string; createdAt: string }>;
    }>(`/api/organizations/${id}/team`);
  }

  async inviteTeamMember(orgId: string, email: string, role: string) {
    return this.request<{ message: string; invitation: any }>(`/api/organizations/${orgId}/invite`, {
      method: 'POST',
      body: JSON.stringify({ email, role }),
    });
  }

  // Services & Requests
  async getServicesCatalog() {
    return this.request<ServiceCatalogItem[]>('/api/services');
  }

  async getServiceRequests() {
    return this.request<ServiceRequest[]>('/api/services/requests');
  }

  async submitServiceRequest(payload: {
    serviceId: string;
    organizationId?: string;
    businessNeed: string;
    desiredOutcome: string;
    preferredTimeframe: string;
    budgetRange?: string;
    hiringDetails?: any;
    attachments?: Array<{ name: string; size: string; key: string }>;
  }) {
    return this.request<ServiceRequest>('/api/services/requests', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async updateRequestStatus(
    id: string,
    status: RequestStatus,
    statusReason?: string,
    scopedEstimate?: { estimatedDays: number; proposedScope: string; proposedBudget?: string }
  ) {
    return this.request<ServiceRequest>(`/api/services/requests/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, statusReason, scopedEstimate }),
    });
  }

  // Projects
  async getProjects() {
    return this.request<Project[]>('/api/projects');
  }

  async getProject(id: string) {
    return this.request<Project & { deliverables: Deliverable[] }>(`/api/projects/${id}`);
  }

  async addProjectTask(
    projectId: string,
    task: { title: string; description: string; priority: string; dueDate?: string }
  ) {
    return this.request<any>(`/api/projects/${projectId}/tasks`, {
      method: 'POST',
      body: JSON.stringify(task),
    });
  }

  async updateTaskStatus(projectId: string, taskId: string, status: string) {
    return this.request<any>(`/api/projects/${projectId}/tasks/${taskId}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  async submitDeliverableApproval(
    deliverableId: string,
    action: 'approved' | 'revision_requested',
    feedback: string
  ) {
    return this.request<{ deliverable: Deliverable; record: any }>(
      `/api/projects/deliverables/${deliverableId}/approval`,
      {
        method: 'POST',
        body: JSON.stringify({ action, feedback }),
      }
    );
  }

  // Candidate Profiles
  async getAuthorizedCandidates() {
    return this.request<CandidateProfile[]>('/api/projects/candidates/authorized');
  }

  async updateCandidateFeedback(
    id: string,
    status: string,
    clientFeedback?: string,
    interviewDate?: string
  ) {
    return this.request<CandidateProfile>(`/api/projects/candidates/${id}/feedback`, {
      method: 'PATCH',
      body: JSON.stringify({ status, clientFeedback, interviewDate }),
    });
  }

  // Documents
  async getDocuments() {
    return this.request<DocumentRecord[]>('/api/documents');
  }

  async uploadDocument(doc: {
    name: string;
    fileType: string;
    sizeBytes: number;
    projectId?: string;
    category?: string;
    isInternalOnly?: boolean;
    organizationId?: string;
  }) {
    return this.request<DocumentRecord>('/api/documents', {
      method: 'POST',
      body: JSON.stringify(doc),
    });
  }

  async requestDownloadToken(docId: string) {
    return this.request<{ token: string; expiresInSeconds: number; downloadUrl: string }>(
      `/api/documents/${docId}/download-token`,
      {
        method: 'POST',
      }
    );
  }

  // Messages
  async getMessages(options: { projectId?: string; organizationId?: string } = {}) {
    const params = new URLSearchParams();
    if (options.projectId) params.set('projectId', options.projectId);
    if (options.organizationId) params.set('organizationId', options.organizationId);
    return this.request<MessageRecord[]>(`/api/messages?${params.toString()}`);
  }

  async sendMessage(msg: {
    content: string;
    projectId?: string;
    organizationId?: string;
    isInternal?: boolean;
  }) {
    return this.request<MessageRecord>('/api/messages', {
      method: 'POST',
      body: JSON.stringify(msg),
    });
  }

  // Billing
  async getInvoices() {
    return this.request<Invoice[]>('/api/billing/invoices');
  }

  async getBillingStatus() {
    return this.request<{
      provider: string;
      connectionStatus: string;
      livePaymentsEnabled: boolean;
      message: string;
      supportedPaymentMethods: string[];
      wireInstructions: any;
    }>('/api/billing/status');
  }

  async createInvoice(payload: {
    organizationId: string;
    projectId?: string;
    lineItems: Array<{ description: string; quantity: number; unitPrice: number; total: number }>;
    dueDate?: string;
    notes?: string;
  }) {
    return this.request<Invoice>('/api/billing/invoices', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async simulatePaymentWebhook(invoiceNumber: string, amountPaid: number) {
    return this.request<any>('/api/billing/webhook', {
      method: 'POST',
      headers: {
        'stripe-signature': 'sig_simulated_hmac_sha256_valid',
      },
      body: JSON.stringify({
        eventId: `evt_sim_${Date.now()}`,
        eventType: 'invoice.payment_succeeded',
        invoiceNumber,
        amountPaid,
        paymentReference: `ACH-WIRE-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      }),
    });
  }

  // Support
  async getSupportTickets() {
    return this.request<SupportTicket[]>('/api/support/tickets');
  }

  async createSupportTicket(ticket: {
    category: string;
    subject: string;
    description: string;
    urgency: string;
    relatedProjectId?: string;
    organizationId?: string;
  }) {
    return this.request<SupportTicket>('/api/support/tickets', {
      method: 'POST',
      body: JSON.stringify(ticket),
    });
  }

  async replySupportTicket(ticketId: string, content: string) {
    return this.request<any>(`/api/support/tickets/${ticketId}/reply`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
  }

  async updateTicketStatus(ticketId: string, status: string, assignedStaffId?: string) {
    return this.request<SupportTicket>(`/api/support/tickets/${ticketId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, assignedStaffId }),
    });
  }

  // Integrations (GoHighLevel)
  async getGhlConfig(organizationId?: string) {
    const params = organizationId ? `?organizationId=${organizationId}` : '';
    return this.request<any>(`/api/integrations/gohighlevel${params}`);
  }

  async configureGhl(payload: any) {
    return this.request<any>('/api/integrations/gohighlevel/configure', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async syncGhl(organizationId?: string) {
    return this.request<any>('/api/integrations/gohighlevel/sync', {
      method: 'POST',
      body: JSON.stringify({ organizationId }),
    });
  }

  // Audit Logs
  async getAuditLogs() {
    return this.request<AuditEvent[]>('/api/audit-logs');
  }

  // Security Acceptance Test Suite
  async runSecurityTests() {
    return this.request<{
      summary: {
        total: number;
        passed: number;
        failed: number;
        evaluatedAt: string;
        environment: string;
      };
      results: SecurityTestResult[];
    }>('/api/security-tests/run', {
      method: 'POST',
    });
  }
}

export const api = new ApiClient();
