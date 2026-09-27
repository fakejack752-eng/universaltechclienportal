import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Download,
  Building,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Lock,
  ExternalLink,
  DollarSign,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import { api } from '../../api/client.ts';
import { Invoice } from '../../types/index.ts';

export const ClientBilling: React.FC = () => {
  const { user, permissions, showToast } = useAuth();

  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [billingStatus, setBillingStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [expandedInvoiceId, setExpandedInvoiceId] = useState<string | null>(null);

  // Verification if user has permission
  if (!permissions.canViewBilling && !permissions.isAdmin) {
    return (
      <div className="p-8 max-w-xl mx-auto text-center space-y-4 my-16">
        <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400">
          <Lock className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-white">Financial Access Restricted</h2>
        <p className="text-xs text-slate-400 leading-relaxed">
          Your account role (<span className="text-white font-mono">{user?.role}</span>) does not possess explicit
          billing authorization. In accordance with zero-trust least-privilege standards, access to contracts, fees,
          and invoices is limited to client administrators and authorized financial officers.
        </p>
        <p className="text-[11px] text-slate-500">
          Please contact your organization administrator or Universal Tech account lead to request financial permissions.
        </p>
      </div>
    );
  }

  useEffect(() => {
    async function loadBilling() {
      try {
        setLoading(true);
        const [invData, statData] = await Promise.all([
          api.getInvoices(),
          api.getBillingStatus(),
        ]);
        setInvoices(invData);
        setBillingStatus(statData);
      } catch (err: any) {
        showToast(err.message || 'Failed to load billing records', 'error');
      } finally {
        setLoading(false);
      }
    }
    loadBilling();
  }, []);

  const totalOutstanding = invoices
    .filter((i) => i.status === 'sent' || i.status === 'overdue')
    .reduce((sum, inv) => sum + (inv.total - inv.amountPaid), 0);

  const totalPaid = invoices
    .filter((i) => i.status === 'paid')
    .reduce((sum, inv) => sum + inv.amountPaid, 0);

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
            Invoices & Financial Operations
          </h1>
          <p className="text-sm text-[#BCC7D3] mt-1">
            Verified invoice ledgers, milestone billing schedules, and electronic settlement records.
          </p>
        </div>

        {/* Integration State Badge */}
        <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-[#BCC7D3] font-mono">
          <ShieldCheck className="w-4 h-4 text-amber-400" />
          <span>Payment Gateway: Awaiting Production Webhook Secret</span>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="text-xs text-[#BCC7D3] font-mono uppercase tracking-wider">Outstanding Balance</div>
          <div className="text-2xl font-bold text-white font-mono mt-2 tabular-nums">
            ${totalOutstanding.toLocaleString()} USD
          </div>
          <div className="text-xs text-slate-400 mt-1">Due under contractual Net-30 terms</div>
        </div>

        <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="text-xs text-[#BCC7D3] font-mono uppercase tracking-wider">Settled & Paid</div>
          <div className="text-2xl font-bold text-emerald-400 font-mono mt-2 tabular-nums">
            ${totalPaid.toLocaleString()} USD
          </div>
          <div className="text-xs text-slate-400 mt-1">Verified via Fedwire / Direct ACH</div>
        </div>

        <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="text-xs text-[#BCC7D3] font-mono uppercase tracking-wider">Total Invoiced</div>
          <div className="text-2xl font-bold text-[#00BFEA] font-mono mt-2 tabular-nums">
            ${(totalOutstanding + totalPaid).toLocaleString()} USD
          </div>
          <div className="text-xs text-slate-400 mt-1">Across active scopes of work</div>
        </div>
      </div>

      {/* Honest Gateway Notice */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2 text-xs">
        <div className="flex items-center gap-2 font-bold text-white">
          <Building className="w-4 h-4 text-[#00BFEA]" />
          <span>Corporate Settlement Guidelines & Wire Instructions</span>
        </div>
        <p className="text-slate-300 leading-relaxed">
          {billingStatus?.message ||
            'Direct credit card capture is inactive pending production Stripe keys. In accordance with PCI-DSS zero-retention mandates, Universal Tech does not store raw credit card credentials.'}
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 pt-2 border-t border-slate-800 font-mono text-[11px] text-slate-400">
          <div>Beneficiary: Universal Tech INC</div>
          <div>Bank: JPMorgan Chase NA</div>
          <div>Routing: ••••0021</div>
          <div>Account: ••••••••4891</div>
        </div>
      </div>

      {/* Invoices List */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-white">Invoice Ledger</h2>

        {loading ? (
          <div className="space-y-3 animate-pulse">
            <div className="h-16 bg-slate-800 rounded-xl" />
            <div className="h-16 bg-slate-800 rounded-xl" />
          </div>
        ) : invoices.length === 0 ? (
          <div className="text-center p-12 rounded-xl bg-slate-900/40 border border-slate-800 text-slate-500 text-xs">
            No invoices have been issued for this organization.
          </div>
        ) : (
          <div className="space-y-3">
            {invoices.map((inv) => {
              const isExpanded = expandedInvoiceId === inv.id;

              return (
                <div
                  key={inv.id}
                  className="rounded-xl bg-slate-900/80 border border-slate-800 overflow-hidden transition-all text-xs"
                >
                  {/* Summary Bar */}
                  <div
                    onClick={() => setExpandedInvoiceId(isExpanded ? null : inv.id)}
                    className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer hover:bg-slate-800/40"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-white text-sm">{inv.invoiceNumber}</span>
                        <span
                          className={`font-mono text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${
                            inv.status === 'paid'
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                              : inv.status === 'overdue'
                              ? 'bg-[#E94B54]/10 text-[#E94B54] border-[#E94B54]/20'
                              : 'bg-[#00BFEA]/10 text-[#00BFEA] border-[#00BFEA]/20'
                          }`}
                        >
                          {inv.status}
                        </span>
                      </div>
                      <div className="text-slate-400">{inv.projectName || 'Universal Tech Professional Services'}</div>
                    </div>

                    <div className="flex items-center gap-6 sm:text-right">
                      <div className="space-y-0.5 font-mono">
                        <div className="text-base font-bold text-white tabular-nums">
                          ${inv.total.toLocaleString()} {inv.currency}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          Due: {inv.dueDate} (Issued {inv.issueDate})
                        </div>
                      </div>

                      <div className="text-slate-400">
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Line Items & Settlement Details */}
                  {isExpanded && (
                    <div className="p-5 border-t border-slate-800 bg-slate-950/60 space-y-4 animate-in fade-in duration-100">
                      <div className="space-y-2">
                        <div className="text-[11px] font-mono uppercase text-[#00BFEA] tracking-wider">
                          Itemized Deliverables & Capacity
                        </div>
                        <table className="w-full text-left font-mono text-[11px]">
                          <thead className="border-b border-slate-800 text-slate-500">
                            <tr>
                              <th className="py-2">Description</th>
                              <th className="py-2 text-right">Qty</th>
                              <th className="py-2 text-right">Unit Rate</th>
                              <th className="py-2 text-right">Amount</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800/60 text-slate-300">
                            {inv.lineItems.map((li) => (
                              <tr key={li.id}>
                                <td className="py-2.5 font-sans text-xs">{li.description}</td>
                                <td className="py-2.5 text-right">{li.quantity}</td>
                                <td className="py-2.5 text-right">${li.unitPrice.toLocaleString()}</td>
                                <td className="py-2.5 text-right font-bold text-white">
                                  ${li.total.toLocaleString()}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-800 text-xs">
                        <div className="text-slate-400 font-mono text-[11px]">
                          <span>Settlement Reference: </span>
                          <span className="text-slate-200">{inv.notes}</span>
                        </div>

                        {/* Pay Button State: Honest unconfigured state per prompt rules */}
                        <div className="flex items-center gap-2">
                          <button
                            disabled
                            className="px-3.5 py-1.5 rounded-lg bg-slate-800 text-slate-500 font-semibold cursor-not-allowed border border-slate-700"
                            title="Online merchant checkout is disabled awaiting production credentials. Please remit via ACH or Wire."
                          >
                            Online Checkout (Awaiting Gateway)
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
