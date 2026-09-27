import React, { useState, useEffect } from 'react';
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  PlusCircle,
  XCircle,
  Filter,
  DollarSign,
  Calendar,
  Briefcase,
  Layers,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import { api } from '../../api/client.ts';
import { ServiceRequest, RequestStatus } from '../../types/index.ts';

export const ClientRequests: React.FC = () => {
  const { setCurrentView, showToast, permissions } = useAuth();

  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [cancelModalReq, setCancelModalReq] = useState<ServiceRequest | null>(null);
  const [cancelReason, setCancelReason] = useState('');

  const loadRequests = async () => {
    try {
      setLoading(true);
      const data = await api.getServiceRequests();
      setRequests(data);
    } catch (err: any) {
      showToast(err.message || 'Failed to load requests', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const handleCancelRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cancelModalReq) return;

    try {
      await api.updateRequestStatus(
        cancelModalReq.id,
        'cancelled',
        cancelReason || 'Cancelled by requester'
      );
      showToast('Service request has been cancelled', 'info');
      setCancelModalReq(null);
      setCancelReason('');
      await loadRequests();
    } catch (err: any) {
      showToast(err.message || 'Failed to cancel request', 'error');
    }
  };

  const statusColors: Record<RequestStatus, string> = {
    submitted: 'bg-slate-800 text-slate-300 border-slate-700',
    under_review: 'bg-[#00BFEA]/10 text-[#00BFEA] border-[#00BFEA]/20',
    needs_information: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    scoped: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    approved: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    in_progress: 'bg-[#00BFEA]/15 text-[#00BFEA] border-[#00BFEA]/30',
    completed: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    declined: 'bg-[#E94B54]/10 text-[#E94B54] border-[#E94B54]/20',
    cancelled: 'bg-slate-800 text-slate-400 border-slate-700',
  };

  const filtered = requests.filter((r) => {
    if (selectedStatus === 'all') return true;
    return r.status === selectedStatus;
  });

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
            Service Requests Pipeline
          </h1>
          <p className="text-sm text-[#BCC7D3] mt-1">
            Track submitted operational requirements, architecture scoping, and review transitions.
          </p>
        </div>

        <button
          onClick={() => setCurrentView('services')}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#00BFEA] hover:bg-[#00BFEA]/90 text-slate-950 font-bold text-xs transition-colors shadow-sm self-start md:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Service Request</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        {['all', 'submitted', 'under_review', 'scoped', 'in_progress', 'completed'].map((st) => (
          <button
            key={st}
            onClick={() => setSelectedStatus(st)}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap ${
              selectedStatus === st
                ? 'bg-[#00BFEA] text-slate-950 font-bold'
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            {st === 'all' ? 'All Requests' : st.replace('_', ' ').toUpperCase()}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="p-8 space-y-4 animate-pulse">
          <div className="h-28 bg-slate-800 rounded-xl" />
          <div className="h-28 bg-slate-800 rounded-xl" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-slate-900/40 border border-slate-800 space-y-3">
          <FileText className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-white">No requests in this view</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Need staffing, custom software engineering, or AI automation? Submit a requirement to initiate discovery.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((req) => (
            <div
              key={req.id}
              className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-4 text-xs"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] text-slate-400">{req.id}</span>
                  <span className="font-mono text-[10px] uppercase tracking-wider text-[#00BFEA] px-2 py-0.5 rounded bg-[#00BFEA]/10 border border-[#00BFEA]/20">
                    {req.serviceCategory.toUpperCase()}
                  </span>
                  <span
                    className={`font-mono text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${
                      statusColors[req.status] || 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {req.status.replace(/_/g, ' ')}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-slate-400 font-mono text-[11px]">
                  <span>Submitted: {new Date(req.createdAt).toLocaleDateString()}</span>
                  {req.status !== 'cancelled' && req.status !== 'completed' && (
                    <button
                      onClick={() => setCancelModalReq(req)}
                      className="text-[#E94B54] hover:underline"
                    >
                      Cancel Request
                    </button>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-base font-bold text-white">{req.serviceTitle}</h3>
                <div className="mt-1 text-slate-300 leading-relaxed">
                  <span className="font-semibold text-slate-400">Business Need: </span>
                  {req.businessNeed}
                </div>
                <div className="mt-1 text-slate-300 leading-relaxed">
                  <span className="font-semibold text-slate-400">Desired Outcome: </span>
                  {req.desiredOutcome}
                </div>
              </div>

              {/* Scoped Estimate if provided by Universal Tech */}
              {req.scopedEstimate && (
                <div className="p-4 rounded-xl bg-[#00BFEA]/10 border border-[#00BFEA]/20 space-y-2">
                  <div className="text-xs font-bold text-[#00BFEA] flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Universal Tech Architectural Scoping Review</span>
                  </div>
                  <div className="text-slate-200 leading-relaxed">{req.scopedEstimate.proposedScope}</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-[#00BFEA]/20 font-mono text-[11px] text-slate-300">
                    <div>Estimated Delivery: {req.scopedEstimate.estimatedDays} Business Days</div>
                    <div>Proposed Budget: {req.scopedEstimate.proposedBudget || 'Milestone Based'}</div>
                  </div>
                </div>
              )}

              {/* Hiring Details if staffing */}
              {req.hiringDetails && (
                <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 space-y-1 font-mono text-[11px] text-slate-300">
                  <div className="text-xs font-bold text-white font-sans">Staffing Requirements:</div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div>Role: {req.hiringDetails.roleTitle}</div>
                    <div>Headcount: {req.hiringDetails.headcount}</div>
                    <div>Type: {req.hiringDetails.employmentType}</div>
                  </div>
                </div>
              )}

              {/* Meta Footer */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/80 text-[11px] text-slate-500 font-mono">
                <div className="flex items-center gap-4">
                  <span>Timeframe: {req.preferredTimeframe}</span>
                  <span>Budget: {req.budgetRange || 'Discovery Scoping'}</span>
                </div>
                <div>Requester: {req.requesterName}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Cancel Request Modal */}
      {cancelModalReq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-[#111820] border border-slate-700 rounded-2xl shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-base font-bold text-white">Cancel Service Request?</h3>
            <p className="text-xs text-slate-400">
              Are you sure you want to cancel request <span className="font-mono text-[#00BFEA]">{cancelModalReq.id}</span> ({cancelModalReq.serviceTitle})?
            </p>

            <form onSubmit={handleCancelRequest} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Reason for Cancellation</label>
                <textarea
                  rows={3}
                  required
                  placeholder="e.g. Budget re-allocation, project postponed..."
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-[#E94B54]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setCancelModalReq(null)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-[#E94B54] text-white font-bold hover:bg-[#E94B54]/90 transition-colors"
                >
                  Confirm Cancellation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
