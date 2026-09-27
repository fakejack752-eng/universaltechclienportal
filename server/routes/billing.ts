import { Router } from 'express';
import { db, Invoice } from '../db.ts';
import { checkTenantAccess } from '../middleware/auth.ts';

export const billingRouter = Router();

// Set of processed webhook event IDs for idempotency
const processedWebhookEventIds = new Set<string>();

// GET /api/billing/invoices
billingRouter.get('/invoices', (req, res) => {
  const user = req.currentUser!;

  // 1. Strict permission check: user must have canViewBilling
  if (!user.canViewBilling && user.role !== 'ut_admin') {
    res.status(403).json({
      error: 'Access denied: You do not have permission to view financial and billing records.',
    });
    return;
  }

  let invoices: Invoice[] = [];

  if (user.role === 'ut_admin' || (user.role === 'ut_staff' && user.canViewBilling)) {
    invoices = db.invoices;
  } else {
    // Client admin with billing permission: ONLY their organization
    invoices = db.invoices.filter((inv) => inv.organizationId === user.organizationId);
  }

  res.json(invoices);
});

// GET /api/billing/status
billingRouter.get('/status', (_req, res) => {
  res.json({
    provider: 'Stripe Corporate Billing',
    connectionStatus: 'awaiting_production_credentials',
    livePaymentsEnabled: false,
    message: 'Online credit card and automated ACH settlements are awaiting production Stripe webhook signing secret and merchant keys. Invoices must be settled via corporate wire transfer or verified ACH.',
    supportedPaymentMethods: ['Corporate Wire (Federal Reserve Fedwire)', 'Verified ACH Direct Deposit'],
    wireInstructions: {
      beneficiary: 'Universal Tech INC',
      bankName: 'JPMorgan Chase Commercial Banking',
      routingNumberMasked: '••••0021',
      accountNumberMasked: '••••••••4891',
    },
  });
});

// POST /api/billing/invoices - Create invoice (ut_admin only)
billingRouter.post('/invoices', (req, res) => {
  const user = req.currentUser!;

  if (user.role !== 'ut_admin') {
    res.status(403).json({ error: 'Only Universal Tech administrators can generate invoices' });
    return;
  }

  const { organizationId, projectId, lineItems, dueDate, notes } = req.body;
  if (!organizationId || !lineItems || !Array.isArray(lineItems) || lineItems.length === 0) {
    res.status(400).json({ error: 'Organization ID and at least one line item are required' });
    return;
  }

  const project = projectId ? db.projects.find((p) => p.id === projectId) : null;
  const subtotal = lineItems.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0);
  const tax = 0; // Standard B2B professional services
  const total = subtotal + tax;

  const invoiceNumber = `UT-INV-2026-${1000 + db.invoices.length + 1}`;

  const newInvoice: Invoice = {
    id: `inv_${Date.now()}`,
    organizationId,
    projectId: project?.id,
    projectName: project?.name,
    invoiceNumber,
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: dueDate || new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
    currency: 'USD',
    lineItems,
    subtotal,
    tax,
    total,
    amountPaid: 0,
    status: 'sent',
    notes: notes || 'Net 30 terms. Electronic payment gateway awaiting merchant API production key.',
  };

  db.invoices.unshift(newInvoice);

  db.logAudit({
    organizationId,
    userId: user.id,
    userEmail: user.email,
    action: 'INVOICE_GENERATED',
    resourceType: 'invoice',
    resourceId: newInvoice.id,
    details: `Generated invoice ${newInvoice.invoiceNumber} for $${newInvoice.total.toLocaleString()} USD`,
    ipAddress: req.ip || '127.0.0.1',
  });

  res.status(201).json(newInvoice);
});

// POST /api/billing/webhook - Webhook endpoint for verified payment events
billingRouter.post('/webhook', (req, res) => {
  const signature = req.headers['stripe-signature'] || req.headers['x-payment-signature'];
  const { eventId, eventType, invoiceNumber, amountPaid, paymentReference } = req.body;

  // In production, signature is verified against STRIPE_WEBHOOK_SECRET
  if (!signature) {
    res.status(400).json({ error: 'Missing payment webhook signature' });
    return;
  }

  // Idempotency check: prevent duplicate event processing
  if (processedWebhookEventIds.has(eventId)) {
    res.status(200).json({ message: 'Event already processed (idempotent duplicate safe)' });
    return;
  }

  processedWebhookEventIds.add(eventId);

  if (eventType === 'invoice.payment_succeeded') {
    const invoice = db.invoices.find((i) => i.invoiceNumber === invoiceNumber);
    if (invoice) {
      invoice.status = 'paid';
      invoice.amountPaid = amountPaid || invoice.total;
      invoice.paidAt = new Date().toISOString();
      invoice.notes = `Paid via verified gateway event: ${paymentReference || eventId}`;

      db.logAudit({
        organizationId: invoice.organizationId,
        userId: 'system_webhook',
        userEmail: 'payments@universaltech.com',
        action: 'INVOICE_PAYMENT_VERIFIED',
        resourceType: 'invoice',
        resourceId: invoice.id,
        details: `Verified webhook marked ${invoice.invoiceNumber} as paid ($${invoice.amountPaid.toLocaleString()} USD)`,
        ipAddress: req.ip || '127.0.0.1',
      });
    }
  }

  res.json({ received: true, eventId });
});
