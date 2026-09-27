import React, { useState, useEffect } from 'react';
import {
  Layers,
  Clock,
  AlertCircle,
  FileCheck,
  CheckCircle2,
  ArrowRight,
  PlusCircle,
  Upload,
  MessageSquare,
  LifeBuoy,
  FileText,
  CreditCard,
  Briefcase,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import { api } from '../../api/client.ts';
import { Project, ServiceRequest, SupportTicket, Invoice, DocumentRecord } from '../../types/index.ts';
import { RadialProgress } from '../../components/common/RadialProgress.tsx';

export const ClientOverview: React.FC = () => {
  const { user, organization, permissions, setCurrentView, setSelectedProjectId } = useAuth();

  const [projects, setProjects] = useState<Project[]>([]);
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [projData, reqData, tickData] = await Promise.all([
          api.getProjects(),
          api.getServiceRequests(),
          api.getSupportTickets(),
        ]);
        setProjects(projData);
        setRequests(reqData);
        setTickets(tickData);

        if (permissions.canViewBilling) {
          try {
            const invData = await api.getInvoices();
            setInvoices(invData);
          } catch {
            // Handled
          }
        }
      } catch (err) {
        console.error('Failed to load overview data', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [user, permissions.canViewBilling]);

  // Calculate items awaiting client action
  const pendingDeliverables: Array<{ projectId: string; projectName: string; title: string; version: string; id: string }> = [];
  projects.forEach((p) => {
    // Check deliverables or tasks
    p.tasks.forEach((t) => {
      if (t.status === 'waiting_on_client') {
        pendingDeliverables.push({
          projectId: p.id,
          projectName: p.name,
          title: t.title,
          version: 'Action Required',
          id: t.id,
        });
      }
    });
  });

  const openTickets = tickets.filter((t) => t.status === 'open' || t.status === 'waiting_on_client');
  const outstandingInvoices = invoices.filter((i) => i.status === 'sent' || i.status === 'overdue');

  if (loading) {
    return (
      <div className="p-8 space-y-6 animate-pulse">
        <div className="h-8 bg-slate-800 rounded w-1/3" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="h-28 bg-slate-800 rounded-xl" />
          <div className="h-28 bg-slate-800 rounded-xl" />
          <div className="h-28 bg-slate-800 rounded-xl" />
          <div className="h-28 bg-slate-800 rounded-xl" />
        </div>
      </div>
    );
  }

  // Honest empty state for newly onboarded clients (like Vanguard Capital)
  const isBrandNewOrg = projects.length === 0 && requests.length === 0;

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
            Operational Portal
          </h1>
          <p className="text-sm text-[#BCC7D3] mt-1">
            Active engagements, milestone progress, deliverables, and team collaboration for{' '}
            <span className="text-white font-semibold">{organization?.name || 'Your Organization'}</span>.
          </p>
        </div>

        {/* Quick Actions Bar */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setCurrentView('requests')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#00BFEA] hover:bg-[#00BFEA]/90 text-slate-950 font-semibold text-xs transition-colors shadow-sm"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Request a Service</span>
          </button>
          <button
            onClick={() => setCurrentView('documents')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium text-xs transition-colors"
          >
            <Upload className="w-4 h-4 text-slate-400" />
            <span>Upload Document</span>
          </button>
          <button
            onClick={() => setCurrentView('messages')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium text-xs transition-colors"
          >
            <MessageSquare className="w-4 h-4 text-slate-400" />
            <span>Contact Team</span>
          </button>
          <button
            onClick={() => setCurrentView('support')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium text-xs transition-colors"
          >
            <LifeBuoy className="w-4 h-4 text-slate-400" />
            <span>Open Ticket</span>
          </button>
        </div>
      </div>

      {/* Honest Empty State for New Clients */}
      {isBrandNewOrg ? (
        <div className="p-8 md:p-12 rounded-2xl bg-slate-900/60 border border-slate-800 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-center mx-auto text-[#00BFEA]">
            <Briefcase className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-white">Welcome to Universal Tech INC</h2>
          <p className="text-slate-400 text-sm max-w-xl mx-auto">
            Your client organization workspace has been provisioned. To begin, submit a service request for
            Staffing & Consulting, IT Development, or AI Automation. Our solution architects will scope your requirements.
          </p>
          <div className="pt-2">
            <button
              onClick={() => setCurrentView('requests')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#00BFEA] text-slate-950 font-bold text-xs uppercase tracking-wider hover:bg-[#00BFEA]/90 transition-colors"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Submit First Service Request</span>
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Key Operational Metrics (No fake percentages) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div
              onClick={() => setCurrentView('projects')}
              className="cursor-pointer p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-colors"
            >
              <div className="flex items-center justify-between text-[#BCC7D3]">
                <span className="text-xs font-mono uppercase tracking-wider">Active Projects</span>
                <Layers className="w-4 h-4 text-[#00BFEA]" />
              </div>
              <div className="text-2xl font-bold text-white font-mono mt-2 tabular-nums">
                {projects.filter((p) => p.status === 'active').length}
              </div>
              <div className="text-xs text-slate-400 mt-1">Across 3 service categories</div>
            </div>

            <div
              onClick={() => setCurrentView('projects')}
              className="cursor-pointer p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-colors"
            >
              <div className="flex items-center justify-between text-[#BCC7D3]">
                <span className="text-xs font-mono uppercase tracking-wider">Awaiting Client Action</span>
                <Clock className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-2xl font-bold text-amber-400 font-mono mt-2 tabular-nums">
                {pendingDeliverables.length}
              </div>
              <div className="text-xs text-slate-400 mt-1">Deliverable sign-offs & inputs</div>
            </div>

            <div
              onClick={() => setCurrentView('support')}
              className="cursor-pointer p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-colors"
            >
              <div className="flex items-center justify-between text-[#BCC7D3]">
                <span className="text-xs font-mono uppercase tracking-wider">Open Support Requests</span>
                <LifeBuoy className="w-4 h-4 text-[#00BFEA]" />
              </div>
              <div className="text-2xl font-bold text-white font-mono mt-2 tabular-nums">
                {openTickets.length}
              </div>
              <div className="text-xs text-slate-400 mt-1">Technical & operational inquiries</div>
            </div>

            {permissions.canViewBilling ? (
              <div
                onClick={() => setCurrentView('billing')}
                className="cursor-pointer p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center justify-between text-[#BCC7D3]">
                  <span className="text-xs font-mono uppercase tracking-wider">Pending Invoices</span>
                  <CreditCard className="w-4 h-4 text-[#00BFEA]" />
                </div>
                <div className="text-2xl font-bold text-white font-mono mt-2 tabular-nums">
                  {outstandingInvoices.length}
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  ${outstandingInvoices.reduce((a, b) => a + (b.total - b.amountPaid), 0).toLocaleString()} USD due
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/60 opacity-70">
                <div className="flex items-center justify-between text-slate-500">
                  <span className="text-xs font-mono uppercase tracking-wider">Billing Access</span>
                  <CreditCard className="w-4 h-4" />
                </div>
                <div className="text-sm font-semibold text-slate-400 mt-2">Restricted</div>
                <div className="text-xs text-slate-500 mt-1">Requires financial authorization</div>
              </div>
            )}
          </div>

          {/* Action Items Callout */}
          {pendingDeliverables.length > 0 && (
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200">
              <div className="flex items-center gap-2 font-semibold text-sm">
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Immediate Client Input Needed</span>
              </div>
              <div className="mt-2 space-y-2">
                {pendingDeliverables.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => {
                      setSelectedProjectId(item.projectId);
                      setCurrentView('project_detail');
                    }}
                    className="cursor-pointer flex items-center justify-between p-2.5 rounded-lg bg-slate-900/60 border border-amber-500/20 hover:bg-slate-900 transition-colors text-xs"
                  >
                    <div>
                      <span className="font-semibold text-white">{item.title}</span>
                      <span className="text-slate-400 ml-2">({item.projectName})</span>
                    </div>
                    <span className="text-[#00BFEA] hover:underline flex items-center gap-1 font-medium">
                      Review & Respond <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Active Projects Grid */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-[#00BFEA]" />
                <span>Active Projects & Deliverables</span>
              </h2>
              <button
                onClick={() => setCurrentView('projects')}
                className="text-xs font-medium text-[#00BFEA] hover:underline flex items-center gap-1"
              >
                <span>View All Projects</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {projects.map((proj) => {
                const completedMilestones = proj.milestones.filter((m) => m.status === 'completed').length;
                const totalMilestones = proj.milestones.length;

                return (
                  <div
                    key={proj.id}
                    onClick={() => {
                      setSelectedProjectId(proj.id);
                      setCurrentView('project_detail');
                    }}
                    className="cursor-pointer p-5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all space-y-4 group"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-mono uppercase tracking-wider text-[#00BFEA] px-2 py-0.5 rounded bg-[#00BFEA]/10 border border-[#00BFEA]/20">
                          {proj.serviceTitle}
                        </span>
                        <h3 className="text-base font-bold text-white mt-2 group-hover:text-[#00BFEA] transition-colors">
                          {proj.name}
                        </h3>
                      </div>
                      <span className="text-xs font-mono uppercase px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
                        {proj.status}
                      </span>
                    </div>

                    <p className="text-xs text-slate-400 line-clamp-2">{proj.description}</p>

                    {/* Milestones Progress with Radial Indicator */}
                    <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-4">
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex items-center justify-between text-xs text-[#BCC7D3]">
                          <span>Milestones Verified</span>
                          <span className="font-mono text-white tabular-nums">
                            {completedMilestones} / {totalMilestones} Completed
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-[#00BFEA] to-emerald-400 transition-all duration-500"
                            style={{
                              width: totalMilestones > 0 ? `${(completedMilestones / totalMilestones) * 100}%` : '0%',
                            }}
                          />
                        </div>
                      </div>

                      <div className="shrink-0 flex items-center justify-center pl-1">
                        <RadialProgress
                          value={totalMilestones > 0 ? (completedMilestones / totalMilestones) * 100 : 0}
                          size={44}
                          strokeWidth={4}
                        />
                      </div>
                    </div>

                    {/* Footer Info */}
                    <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-800/60 font-mono">
                      <span>Target: {proj.targetDate}</span>
                      <span className="text-[#00BFEA] group-hover:translate-x-0.5 transition-transform flex items-center gap-1 font-sans">
                        Workspace <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bottom Grid: Recent Activity Feed & Open Requests */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Service Requests Pipeline Snapshot */}
            <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#00BFEA]" />
                  <span>Submitted Service Requests</span>
                </h3>
                <button
                  onClick={() => setCurrentView('requests')}
                  className="text-xs text-[#00BFEA] hover:underline"
                >
                  View All
                </button>
              </div>

              {requests.length === 0 ? (
                <div className="text-xs text-slate-500 py-4 text-center">No active service requests.</div>
              ) : (
                <div className="space-y-2.5">
                  {requests.slice(0, 3).map((req) => (
                    <div
                      key={req.id}
                      onClick={() => setCurrentView('requests')}
                      className="cursor-pointer p-3 rounded-lg bg-slate-950/60 border border-slate-800 hover:border-slate-700 transition-colors text-xs flex items-center justify-between"
                    >
                      <div className="space-y-1">
                        <div className="font-semibold text-slate-200">{req.serviceTitle}</div>
                        <div className="text-slate-400 line-clamp-1">{req.businessNeed}</div>
                      </div>
                      <span className="font-mono text-[10px] uppercase px-2 py-0.5 rounded bg-slate-800 text-[#00BFEA] border border-slate-700 shrink-0 ml-2">
                        {req.status.replace('_', ' ')}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Support Tickets Snapshot */}
            <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <LifeBuoy className="w-4 h-4 text-[#00BFEA]" />
                  <span>Support & Inquiries</span>
                </h3>
                <button
                  onClick={() => setCurrentView('support')}
                  className="text-xs text-[#00BFEA] hover:underline"
                >
                  View All
                </button>
              </div>

              {tickets.length === 0 ? (
                <div className="text-xs text-slate-500 py-4 text-center">No open support tickets.</div>
              ) : (
                <div className="space-y-2.5">
                  {tickets.slice(0, 3).map((tick) => (
                    <div
                      key={tick.id}
                      onClick={() => setCurrentView('support')}
                      className="cursor-pointer p-3 rounded-lg bg-slate-950/60 border border-slate-800 hover:border-slate-700 transition-colors text-xs flex items-center justify-between"
                    >
                      <div className="space-y-1">
                        <div className="font-semibold text-slate-200">{tick.subject}</div>
                        <div className="text-slate-400 font-mono text-[11px]">{tick.ticketNumber} · {tick.category}</div>
                      </div>
                      <span className="font-mono text-[10px] uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 shrink-0 ml-2">
                        {tick.status.replace('_', ' ')}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
