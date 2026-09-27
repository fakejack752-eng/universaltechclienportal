import React, { useState, useEffect } from 'react';
import {
  LifeBuoy,
  PlusCircle,
  MessageSquare,
  AlertCircle,
  CheckCircle2,
  Clock,
  Send,
  X,
  User,
  Filter,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import { api } from '../../api/client.ts';
import { SupportTicket, Project } from '../../types/index.ts';

export const ClientSupport: React.FC = () => {
  const { user, showToast } = useAuth();

  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [loading, setLoading] = useState(true);
  const [newTicketModalOpen, setNewTicketModalOpen] = useState(false);

  // New Ticket Form State
  const [category, setCategory] = useState<string>('Technical Bug');
  const [urgency, setUrgency] = useState<string>('medium');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [relatedProjectId, setRelatedProjectId] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Reply State
  const [replyContent, setReplyContent] = useState('');
  const [replying, setReplying] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [tickList, projList] = await Promise.all([
        api.getSupportTickets(),
        api.getProjects(),
      ]);
      setTickets(tickList);
      setProjects(projList);

      if (selectedTicket) {
        const refreshed = tickList.find((t) => t.id === selectedTicket.id);
        if (refreshed) setSelectedTicket(refreshed);
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to load tickets', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !description.trim()) {
      showToast('Subject and description are required', 'error');
      return;
    }

    try {
      setSubmitting(true);
      const newTick = await api.createSupportTicket({
        category,
        urgency,
        subject: subject.trim(),
        description: description.trim(),
        relatedProjectId: relatedProjectId || undefined,
      });

      showToast(`Support ticket ${newTick.ticketNumber} created successfully`, 'success');
      setNewTicketModalOpen(false);
      setSubject('');
      setDescription('');
      await loadData();
    } catch (err: any) {
      showToast(err.message || 'Failed to create ticket', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReplyTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !replyContent.trim()) return;

    try {
      setReplying(true);
      await api.replySupportTicket(selectedTicket.id, replyContent.trim());
      setReplyContent('');
      await loadData();
      showToast('Response dispatched to support specialists', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to send reply', 'error');
    } finally {
      setReplying(false);
    }
  };

  const urgencyBadge = (urg: string) => {
    switch (urg) {
      case 'critical':
        return 'text-[#E94B54] bg-[#E94B54]/10 border-[#E94B54]/30';
      case 'high':
        return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
      case 'medium':
        return 'text-[#00BFEA] bg-[#00BFEA]/10 border-[#00BFEA]/30';
      default:
        return 'text-slate-400 bg-slate-800 border-slate-700';
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
            Support & Incident Operations
          </h1>
          <p className="text-sm text-[#BCC7D3] mt-1">
            Operational triage, AI workflow tuning requests, and technical escalation tracking.
          </p>
        </div>

        <button
          onClick={() => setNewTicketModalOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#00BFEA] hover:bg-[#00BFEA]/90 text-slate-950 font-bold text-xs transition-colors shadow-sm self-start md:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Open Support Request</span>
        </button>
      </div>

      {/* Main Ticket Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Ticket List (Left 1 col) */}
        <div className="lg:col-span-1 space-y-3">
          <div className="text-xs font-mono uppercase text-[#BCC7D3] tracking-wider">
            Ticket Queue ({tickets.length})
          </div>

          {loading ? (
            <div className="space-y-3 animate-pulse">
              <div className="h-20 bg-slate-800 rounded-xl" />
              <div className="h-20 bg-slate-800 rounded-xl" />
            </div>
          ) : tickets.length === 0 ? (
            <div className="p-8 text-center rounded-xl bg-slate-900/40 border border-slate-800 text-slate-500 text-xs">
              No tickets submitted.
            </div>
          ) : (
            <div className="space-y-2.5">
              {tickets.map((t) => {
                const isSelected = selectedTicket?.id === t.id;

                return (
                  <div
                    key={t.id}
                    onClick={() => setSelectedTicket(t)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all text-xs space-y-2 ${
                      isSelected
                        ? 'bg-[#00BFEA]/10 border-[#00BFEA]/60'
                        : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] text-slate-400">{t.ticketNumber}</span>
                      <span
                        className={`font-mono text-[9px] uppercase font-bold px-1.5 py-0.2 rounded border ${urgencyBadge(
                          t.urgency
                        )}`}
                      >
                        {t.urgency}
                      </span>
                    </div>

                    <div className="font-bold text-white line-clamp-1">{t.subject}</div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono pt-1">
                      <span>{t.category}</span>
                      <span className="capitalize">{t.status.replace(/_/g, ' ')}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Selected Ticket Conversation Thread (Right 2 cols) */}
        <div className="lg:col-span-2">
          {selectedTicket ? (
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl flex flex-col h-[650px] overflow-hidden">
              {/* Ticket Details Header */}
              <div className="p-5 border-b border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-[#00BFEA]">{selectedTicket.ticketNumber}</span>
                    <span
                      className={`font-mono text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${urgencyBadge(
                        selectedTicket.urgency
                      )}`}
                    >
                      Urgency: {selectedTicket.urgency}
                    </span>
                  </div>
                  <span className="font-mono text-xs text-slate-400 uppercase">
                    Status: {selectedTicket.status.replace(/_/g, ' ')}
                  </span>
                </div>
                <h3 className="text-base font-bold text-white">{selectedTicket.subject}</h3>
                <div className="text-xs text-slate-400 font-mono">
                  Category: {selectedTicket.category} · Opened by {selectedTicket.requesterName} on{' '}
                  {new Date(selectedTicket.createdAt).toLocaleDateString()}
                </div>
              </div>

              {/* Messages Thread */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
                {selectedTicket.messages.map((m) => {
                  const isMe = m.senderId === user?.id;

                  return (
                    <div
                      key={m.id}
                      className={`flex flex-col max-w-xl space-y-1 ${
                        isMe ? 'ml-auto items-end' : 'mr-auto items-start'
                      }`}
                    >
                      <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1.5">
                        <span className="font-semibold text-slate-200">{m.senderName}</span>
                        <span>({m.senderRole.replace('_', ' ')})</span>
                        <span>·</span>
                        <span>{new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <div
                        className={`p-3.5 rounded-2xl leading-relaxed ${
                          isMe
                            ? 'bg-[#00BFEA] text-slate-950 font-medium'
                            : 'bg-slate-800 border border-slate-700 text-slate-100'
                        }`}
                      >
                        <p>{m.content}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Reply Input */}
              <div className="p-4 border-t border-slate-800 bg-slate-950">
                <form onSubmit={handleReplyTicket} className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Type an operational response or additional context..."
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    className="flex-1 p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-[#00BFEA]"
                  />
                  <button
                    type="submit"
                    disabled={replying || !replyContent.trim()}
                    className="px-4 py-2.5 rounded-xl bg-[#00BFEA] text-slate-950 font-bold text-xs hover:bg-[#00BFEA]/90 transition-colors flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Reply</span>
                  </button>
                </form>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-12 rounded-2xl bg-slate-900/40 border border-slate-800 text-slate-500 text-center space-y-2">
              <LifeBuoy className="w-10 h-10 text-slate-700" />
              <div className="text-sm font-semibold text-slate-300">Select a support ticket</div>
              <p className="text-xs max-w-sm">
                Choose an incident from the queue on the left to review investigation history and submit replies.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* New Ticket Modal */}
      {newTicketModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="relative w-full max-w-lg bg-[#111820] border border-slate-700 rounded-2xl shadow-2xl p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <LifeBuoy className="w-4 h-4 text-[#00BFEA]" />
                <span>Open Support Ticket</span>
              </h3>
              <button onClick={() => setNewTicketModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTicket} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-100 focus:border-[#00BFEA] focus:outline-none"
                  >
                    <option value="Technical Bug">Technical Bug</option>
                    <option value="AI Workflow Adjustment">AI Workflow Adjustment</option>
                    <option value="Staffing Inquiry">Staffing Inquiry</option>
                    <option value="Billing & Account">Billing & Account</option>
                    <option value="Feature Request">Feature Request</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Urgency</label>
                  <select
                    value={urgency}
                    onChange={(e) => setUrgency(e.target.value)}
                    className="w-full p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-100 focus:border-[#00BFEA] focus:outline-none"
                  >
                    <option value="low">Low (Standard Question)</option>
                    <option value="medium">Medium (Workflow Issue)</option>
                    <option value="high">High (Production Impairment)</option>
                    <option value="critical">Critical (System Outage)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Subject / Summary <span className="text-[#E94B54]">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Carrier SMS webhook timeout during evening freight shift"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-[#00BFEA]"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Detailed Description & Steps to Reproduce <span className="text-[#E94B54]">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Describe the unexpected behaviour, affected phone numbers/endpoints, and timestamp of occurrence..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-[#00BFEA]"
                />
              </div>

              {projects.length > 0 && (
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Related Project (Optional)</label>
                  <select
                    value={relatedProjectId}
                    onChange={(e) => setRelatedProjectId(e.target.value)}
                    className="w-full p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-100 focus:border-[#00BFEA] focus:outline-none"
                  >
                    <option value="">None / General</option>
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setNewTicketModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-lg bg-[#00BFEA] text-slate-950 font-bold hover:bg-[#00BFEA]/90 transition-colors shadow-sm disabled:opacity-50"
                >
                  {submitting ? 'Submitting...' : 'Dispatch Ticket'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
