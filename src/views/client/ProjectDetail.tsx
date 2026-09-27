import React, { useState, useEffect } from 'react';
import {
  Layers,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileCheck,
  ExternalLink,
  MessageSquare,
  User,
  ShieldCheck,
  Send,
  Plus,
  Briefcase,
  Cpu,
  Code2,
  FileText,
  ThumbsUp,
  RotateCcw,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import { api } from '../../api/client.ts';
import { Project, Deliverable, CandidateProfile } from '../../types/index.ts';
import { ProjectTimeline } from '../../components/projects/ProjectTimeline.tsx';

interface ProjectDetailProps {
  projectId: string;
  onBack: () => void;
}

export const ProjectDetail: React.FC<ProjectDetailProps> = ({ projectId, onBack }) => {
  const { user, permissions, showToast } = useAuth();

  const [project, setProject] = useState<(Project & { deliverables: Deliverable[] }) | null>(null);
  const [candidates, setCandidates] = useState<CandidateProfile[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'deliverables' | 'tasks' | 'service_workspace' | 'notes'>('overview');
  const [loading, setLoading] = useState(true);

  // Approval Modal State
  const [approvalModalDeliverable, setApprovalModalDeliverable] = useState<Deliverable | null>(null);
  const [approvalAction, setApprovalAction] = useState<'approved' | 'revision_requested'>('approved');
  const [approvalFeedback, setApprovalFeedback] = useState('');
  const [submittingApproval, setSubmittingApproval] = useState(false);

  // Candidate Feedback Modal
  const [feedbackCandidate, setFeedbackCandidate] = useState<CandidateProfile | null>(null);
  const [candidateStatus, setCandidateStatus] = useState('interview_scheduled');
  const [candidateNotes, setCandidateNotes] = useState('');

  const loadProject = async () => {
    try {
      setLoading(true);
      const data = await api.getProject(projectId);
      setProject(data);

      if (data.servicePillar === 'staffing') {
        const cands = await api.getAuthorizedCandidates();
        setCandidates(cands.filter((c) => c.organizationId === data.organizationId));
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to load project details', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProject();
  }, [projectId]);

  const handleDeliverableApprovalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!approvalModalDeliverable) return;

    if (approvalAction === 'revision_requested' && !approvalFeedback.trim()) {
      showToast('Please provide feedback explaining the requested revisions', 'error');
      return;
    }

    try {
      setSubmittingApproval(true);
      await api.submitDeliverableApproval(
        approvalModalDeliverable.id,
        approvalAction,
        approvalFeedback
      );

      showToast(
        `Deliverable ${approvalAction === 'approved' ? 'approved' : 'revision requested'} successfully`,
        'success'
      );
      setApprovalModalDeliverable(null);
      setApprovalFeedback('');
      await loadProject();
    } catch (err: any) {
      showToast(err.message || 'Approval action failed', 'error');
    } finally {
      setSubmittingApproval(false);
    }
  };

  const handleUpdateCandidate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackCandidate) return;

    try {
      await api.updateCandidateFeedback(feedbackCandidate.id, candidateStatus, candidateNotes);
      showToast(`Updated feedback for ${feedbackCandidate.fullName}`, 'success');
      setFeedbackCandidate(null);
      const cands = await api.getAuthorizedCandidates();
      setCandidates(cands.filter((c) => c.organizationId === project?.organizationId));
    } catch (err: any) {
      showToast(err.message || 'Failed to update candidate', 'error');
    }
  };

  if (loading || !project) {
    return (
      <div className="p-8 max-w-7xl mx-auto space-y-6 animate-pulse">
        <div className="h-6 bg-slate-800 rounded w-1/4" />
        <div className="h-10 bg-slate-800 rounded w-1/2" />
        <div className="h-64 bg-slate-800 rounded-xl" />
      </div>
    );
  }

  const deliverables = project.deliverables || [];

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Back Button & Top Header */}
      <div>
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs text-[#00BFEA] hover:underline font-medium mb-3"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Projects</span>
        </button>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-800 text-[#00BFEA] border border-slate-700">
                {project.serviceTitle}
              </span>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                {project.status}
              </span>
            </div>
            <h1 className="text-xl md:text-2xl font-bold text-white mt-1">{project.name}</h1>
          </div>

          {project.previewUrl && (
            <a
              href={project.previewUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-colors"
            >
              <span>Launch Staging Preview</span>
              <ExternalLink className="w-3.5 h-3.5 text-[#00BFEA]" />
            </a>
          )}
        </div>
      </div>

      {/* Workspace Tabs */}
      <div className="flex items-center gap-1 border-b border-slate-800 pb-px overflow-x-auto text-xs font-medium">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'overview'
              ? 'border-[#00BFEA] text-[#00BFEA] font-bold'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          Scope & Milestones
        </button>
        <button
          onClick={() => setActiveTab('deliverables')}
          className={`px-4 py-2 border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'deliverables'
              ? 'border-[#00BFEA] text-[#00BFEA] font-bold'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <span>Deliverables & Reviews</span>
          {deliverables.some((d) => d.status === 'awaiting_approval') && (
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('tasks')}
          className={`px-4 py-2 border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'tasks'
              ? 'border-[#00BFEA] text-[#00BFEA] font-bold'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          Task Queue ({project.tasks.length})
        </button>

        {/* Dedicated Service Workspace Tab */}
        <button
          onClick={() => setActiveTab('service_workspace')}
          className={`px-4 py-2 border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'service_workspace'
              ? 'border-[#00BFEA] text-[#00BFEA] font-bold'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          {project.servicePillar === 'staffing' && <Briefcase className="w-3.5 h-3.5" />}
          {project.servicePillar === 'ai' && <Cpu className="w-3.5 h-3.5" />}
          {project.servicePillar === 'it' && <Code2 className="w-3.5 h-3.5" />}
          <span>
            {project.servicePillar === 'staffing'
              ? 'Candidate Pool'
              : project.servicePillar === 'ai'
              ? 'AI Architecture & Workflows'
              : 'IT Technical Specs'}
          </span>
        </button>

        {/* Internal Notes (Visible strictly to staff/admin) */}
        {permissions.canAccessInternalNotes && project.internalNotes && (
          <button
            onClick={() => setActiveTab('notes')}
            className={`px-4 py-2 border-b-2 transition-colors whitespace-nowrap text-amber-400 font-mono ${
              activeTab === 'notes' ? 'border-amber-400 font-bold' : 'border-transparent opacity-70 hover:opacity-100'
            }`}
          >
            [Staff Internal Notes]
          </button>
        )}
      </div>

      {/* TAB CONTENT */}

      {/* 1. OVERVIEW & MILESTONES */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Agreed Scope Box */}
          <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
            <h3 className="text-xs font-mono uppercase text-[#00BFEA] tracking-wider">Agreed Scope of Work</h3>
            <p className="text-sm text-slate-200 leading-relaxed">{project.agreedScope}</p>
            <div className="flex flex-wrap gap-4 text-xs text-slate-400 pt-2 border-t border-slate-800/80 font-mono">
              <span>Start: {project.startDate}</span>
              <span>Target Delivery: {project.targetDate}</span>
              <span>Governance: Universal Tech Managed</span>
            </div>
          </div>

          {/* Milestones Recharts Timeline */}
          <ProjectTimeline projects={[project]} selectedProjectId={project.id} />

          {/* Milestones Schedule & Verification */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#00BFEA]" />
              <span>Milestone Schedule & Verification</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {project.milestones.map((m, idx) => (
                <div
                  key={m.id}
                  className={`p-4 rounded-xl border space-y-2 ${
                    m.status === 'completed'
                      ? 'bg-slate-900/90 border-emerald-500/30'
                      : m.status === 'in_progress'
                      ? 'bg-slate-900/90 border-[#00BFEA]/40'
                      : 'bg-slate-900/40 border-slate-800 opacity-70'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <span className="text-slate-500">M0{idx + 1}</span>
                    <span
                      className={`uppercase font-bold ${
                        m.status === 'completed'
                          ? 'text-emerald-400'
                          : m.status === 'in_progress'
                          ? 'text-[#00BFEA]'
                          : 'text-slate-400'
                      }`}
                    >
                      {m.status.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="font-semibold text-xs text-white line-clamp-2">{m.title}</div>
                  <div className="text-[11px] text-slate-400 font-mono">Due: {m.dueDate}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Client Updates Log */}
          {project.clientUpdates && project.clientUpdates.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#00BFEA]" />
                <span>Formal Engagement Updates</span>
              </h3>
              <div className="space-y-2.5">
                {project.clientUpdates.map((up) => (
                  <div key={up.id} className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1 text-xs">
                    <div className="flex items-center justify-between text-slate-400 font-mono text-[11px]">
                      <span>{up.date} · Posted by {up.authorName}</span>
                    </div>
                    <div className="font-bold text-slate-100">{up.title}</div>
                    <p className="text-slate-300 leading-relaxed">{up.content}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 2. DELIVERABLES & OPERATIONAL APPROVALS */}
      {activeTab === 'deliverables' && (
        <div className="space-y-6">
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-[#00BFEA] shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-white">Deliverable Approval Protocol:</span> Operational approvals
              record client review and acceptance against technical requirements. Approvals strictly bind to the exact
              reviewed version and do not automatically carry over to new revisions.
            </div>
          </div>

          <div className="space-y-4">
            {deliverables.length === 0 ? (
              <div className="text-center p-8 rounded-xl bg-slate-900/40 border border-slate-800 text-slate-500 text-xs">
                No deliverables have been staged for review yet.
              </div>
            ) : (
              deliverables.map((deliv) => {
                const canApprove = permissions.canApproveDeliverables;

                return (
                  <div
                    key={deliv.id}
                    className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-4 text-xs"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[11px] font-bold text-[#00BFEA] px-2 py-0.5 rounded bg-[#00BFEA]/10 border border-[#00BFEA]/20">
                            Version {deliv.currentVersion}
                          </span>
                          <span
                            className={`font-mono text-[10px] uppercase px-2 py-0.5 rounded ${
                              deliv.status === 'approved'
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : deliv.status === 'awaiting_approval'
                                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                : 'bg-slate-800 text-slate-300'
                            }`}
                          >
                            {deliv.status.replace('_', ' ')}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-white mt-1.5">{deliv.title}</h4>
                      </div>

                      {/* Action buttons if awaiting approval */}
                      {deliv.status === 'awaiting_approval' && (
                        <div className="flex items-center gap-2 shrink-0">
                          {canApprove ? (
                            <>
                              <button
                                onClick={() => {
                                  setApprovalModalDeliverable(deliv);
                                  setApprovalAction('approved');
                                  setApprovalFeedback('');
                                }}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition-colors"
                              >
                                <ThumbsUp className="w-3.5 h-3.5" />
                                <span>Approve Version</span>
                              </button>
                              <button
                                onClick={() => {
                                  setApprovalModalDeliverable(deliv);
                                  setApprovalAction('revision_requested');
                                  setApprovalFeedback('');
                                }}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 font-semibold transition-colors"
                              >
                                <RotateCcw className="w-3.5 h-3.5" />
                                <span>Request Revisions</span>
                              </button>
                            </>
                          ) : (
                            <span className="text-[11px] text-slate-500 italic">
                              Deliverable approval restricted to client administrator
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    <p className="text-slate-300 leading-relaxed">{deliv.description}</p>

                    {/* Preview / Download Links */}
                    <div className="flex items-center gap-3 pt-2 border-t border-slate-800 text-[11px] font-mono">
                      {deliv.fileName && (
                        <span className="text-slate-400 flex items-center gap-1">
                          <FileText className="w-3.5 h-3.5 text-[#00BFEA]" />
                          <span>{deliv.fileName}</span>
                        </span>
                      )}
                      {deliv.previewUrl && (
                        <a
                          href={deliv.previewUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[#00BFEA] hover:underline flex items-center gap-1 font-semibold"
                        >
                          <span>Open Review Canvas</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>

                    {/* Approval Audit History */}
                    {deliv.approvalHistory && deliv.approvalHistory.length > 0 && (
                      <div className="pt-3 border-t border-slate-800/60 space-y-2">
                        <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500">
                          Recorded Acceptance History
                        </div>
                        <div className="space-y-1.5">
                          {deliv.approvalHistory.map((rec) => (
                            <div
                              key={rec.id}
                              className="p-2.5 rounded bg-slate-950/60 border border-slate-800/80 text-[11px] flex flex-col sm:flex-row sm:items-center justify-between gap-1"
                            >
                              <div>
                                <span
                                  className={`font-semibold ${
                                    rec.action === 'approved' ? 'text-emerald-400' : 'text-amber-400'
                                  }`}
                                >
                                  {rec.action === 'approved' ? '✓ Approved' : '↺ Revision Requested'} (Version {rec.version}):
                                </span>{' '}
                                <span className="text-slate-300">{rec.feedback}</span>
                              </div>
                              <span className="text-slate-500 font-mono text-[10px] shrink-0">
                                {rec.userName} · {new Date(rec.timestamp).toLocaleDateString()}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* 3. TASKS QUEUE */}
      {activeTab === 'tasks' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {project.tasks.map((task) => (
              <div
                key={task.id}
                className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`font-mono text-[10px] uppercase px-2 py-0.5 rounded font-semibold ${
                      task.status === 'completed'
                        ? 'bg-emerald-500/10 text-emerald-400'
                        : task.status === 'waiting_on_client'
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                        : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {task.status.replace(/_/g, ' ')}
                  </span>
                  <span className="text-slate-400 font-mono text-[10px]">Due: {task.dueDate}</span>
                </div>
                <div className="font-bold text-white">{task.title}</div>
                <p className="text-slate-400 text-[11px]">{task.description}</p>
                {task.assigneeName && (
                  <div className="text-[10px] text-slate-500 font-mono pt-2 border-t border-slate-800">
                    Assignee: {task.assigneeName}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. SERVICE-SPECIFIC WORKSPACE */}
      {activeTab === 'service_workspace' && (
        <div className="space-y-6">
          {/* AI AUTOMATION WORKSPACE */}
          {project.servicePillar === 'ai' && (
            <div className="space-y-6">
              {/* Architecture Summary */}
              {project.aiWorkflowDetails && (
                <>
                  <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3 text-xs">
                    <h3 className="font-bold text-sm text-white flex items-center gap-2">
                      <Cpu className="w-4 h-4 text-[#00BFEA]" />
                      <span>AI Pipeline Architecture & Orchestration</span>
                    </h3>
                    <p className="text-slate-300 leading-relaxed">
                      {project.aiWorkflowDetails.architectureSummary}
                    </p>

                    {/* Real Integration Status */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-800">
                      <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                        <div className="text-slate-500 text-[10px] font-mono">CRM SYNCHRONIZATION</div>
                        <div className="font-bold text-emerald-400 mt-1 uppercase text-xs">
                          {project.aiWorkflowDetails.integrationStatus.crm}
                        </div>
                      </div>
                      <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                        <div className="text-slate-500 text-[10px] font-mono">VOICE SIP GATEWAY</div>
                        <div className="font-bold text-emerald-400 mt-1 uppercase text-xs">
                          {project.aiWorkflowDetails.integrationStatus.voiceGateway}
                        </div>
                      </div>
                      <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                        <div className="text-slate-500 text-[10px] font-mono">WEBHOOK RELAY</div>
                        <div className="font-bold text-emerald-400 mt-1 uppercase text-xs">
                          {project.aiWorkflowDetails.integrationStatus.webhookRelay}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Approved Knowledge Base Documents */}
                  <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3 text-xs">
                    <h3 className="font-bold text-sm text-white flex items-center gap-2">
                      <FileCheck className="w-4 h-4 text-[#00BFEA]" />
                      <span>Approved Knowledge Base Corpus</span>
                    </h3>
                    <div className="space-y-1.5">
                      {project.aiWorkflowDetails.approvedKnowledgeDocs.map((docName, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-2.5 rounded bg-slate-950 border border-slate-800 font-mono text-[11px]"
                        >
                          <span className="text-slate-200">{docName}</span>
                          <span className="text-emerald-400">Verified & Ingested</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Test Scenarios & Operational Acceptance */}
                  <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3 text-xs">
                    <h3 className="font-bold text-sm text-white">Staging Test Scenarios & Acceptance</h3>
                    <div className="space-y-2">
                      {project.aiWorkflowDetails.testScenarios.map((scen, idx) => (
                        <div
                          key={idx}
                          className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-slate-200">{scen.title}</span>
                            <span
                              className={`font-mono text-[10px] uppercase font-bold px-1.5 py-0.2 rounded ${
                                scen.status === 'passed'
                                  ? 'text-emerald-400 bg-emerald-500/10'
                                  : 'text-amber-400 bg-amber-500/10'
                              }`}
                            >
                              {scen.status}
                            </span>
                          </div>
                          <p className="text-slate-400 text-[11px]">{scen.notes}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* STAFFING WORKSPACE */}
          {project.servicePillar === 'staffing' && (
            <div className="space-y-6">
              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300">
                <span className="font-semibold text-white">Compliance Guarantee:</span> Candidate dossiers displayed
                below are vetted and explicitly authorized for {project.name}. Universal Tech does not collect SSNs,
                banking information, or identity documents through ordinary forms.
              </div>

              <div className="space-y-4">
                {candidates.length === 0 ? (
                  <div className="text-center p-8 rounded-xl bg-slate-900/40 border border-slate-800 text-slate-500 text-xs">
                    Shortlist calibration in progress. Pre-screened candidates will appear here shortly.
                  </div>
                ) : (
                  candidates.map((cand) => (
                    <div
                      key={cand.id}
                      className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-4 text-xs"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-white">{cand.fullName}</h4>
                            <span className="font-mono text-[10px] uppercase px-2 py-0.5 rounded bg-slate-800 text-[#00BFEA] border border-slate-700">
                              {cand.status.replace(/_/g, ' ')}
                            </span>
                          </div>
                          <div className="text-slate-400 text-xs mt-0.5">{cand.roleTitle}</div>
                        </div>

                        <button
                          onClick={() => {
                            setFeedbackCandidate(cand);
                            setCandidateStatus(cand.status);
                            setCandidateNotes(cand.clientFeedback || '');
                          }}
                          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-[#00BFEA] text-slate-200 hover:text-slate-950 font-semibold transition-colors border border-slate-700 hover:border-[#00BFEA]"
                        >
                          Provide Feedback / Schedule
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] text-slate-400 font-mono">
                        <div>Experience: {cand.experienceYears} Years</div>
                        <div>Location: {cand.location}</div>
                        <div>Availability: {cand.availability}</div>
                      </div>

                      <p className="text-slate-300 leading-relaxed">{cand.summary}</p>

                      <div className="flex flex-wrap gap-1.5 pt-2">
                        {cand.skills.map((skill, i) => (
                          <span
                            key={i}
                            className="text-[10px] px-2 py-0.5 rounded bg-slate-950 text-slate-300 border border-slate-800"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>

                      {cand.clientFeedback && (
                        <div className="p-3 rounded bg-slate-950/70 border border-slate-800 text-[11px] space-y-0.5">
                          <span className="font-semibold text-[#00BFEA]">Client Feedback / Interview Log:</span>
                          <p className="text-slate-300">{cand.clientFeedback}</p>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* IT DEVELOPMENT WORKSPACE */}
          {project.servicePillar === 'it' && (
            <div className="space-y-4 text-xs">
              <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
                <h3 className="font-bold text-sm text-white">Full-Stack Sprint Engineering</h3>
                <p className="text-slate-300 leading-relaxed">
                  Continuous delivery pipelines, sprint demos, and code reviews governed under Universal Tech standard
                  architecture. Preview URLs reflect the active staging deployment.
                </p>
                {project.previewUrl && (
                  <div className="p-3 rounded bg-slate-950 border border-slate-800 flex items-center justify-between">
                    <span className="font-mono text-slate-300">{project.previewUrl}</span>
                    <a
                      href={project.previewUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[#00BFEA] hover:underline font-bold flex items-center gap-1"
                    >
                      Visit <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 5. INTERNAL STAFF NOTES (Only shown if authorized) */}
      {activeTab === 'notes' && permissions.canAccessInternalNotes && (
        <div className="p-5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs space-y-2">
          <div className="font-bold uppercase font-mono tracking-wider">Internal Staff & Pricing Notes</div>
          <p className="leading-relaxed text-amber-100">{project.internalNotes}</p>
          <div className="text-[10px] text-amber-300/80 pt-2 border-t border-amber-500/20 font-mono">
            CONFIDENTIAL: This section is never sent to client API endpoints.
          </div>
        </div>
      )}

      {/* DELIVERABLE APPROVAL / REVISION MODAL */}
      {approvalModalDeliverable && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="relative w-full max-w-lg bg-[#111820] border border-slate-700 rounded-2xl shadow-2xl p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="border-b border-slate-800 pb-3">
              <span className="text-[10px] font-mono uppercase text-[#00BFEA]">Operational Deliverable Review</span>
              <h3 className="text-lg font-bold text-white mt-0.5">{approvalModalDeliverable.title}</h3>
              <div className="text-xs text-slate-400 font-mono">
                Targeting Version: {approvalModalDeliverable.currentVersion}
              </div>
            </div>

            <form onSubmit={handleDeliverableApprovalSubmit} className="space-y-4 text-xs">
              <div className="space-y-2">
                <label className="block text-slate-300 font-semibold">Review Decision</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setApprovalAction('approved')}
                    className={`py-2 px-3 rounded-lg border font-semibold transition-colors flex items-center justify-center gap-1.5 ${
                      approvalAction === 'approved'
                        ? 'bg-emerald-600 border-emerald-500 text-white'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                    <span>Approve Deliverable</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setApprovalAction('revision_requested')}
                    className={`py-2 px-3 rounded-lg border font-semibold transition-colors flex items-center justify-center gap-1.5 ${
                      approvalAction === 'revision_requested'
                        ? 'bg-amber-600 border-amber-500 text-white'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Request Changes</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  {approvalAction === 'approved' ? 'Acceptance Comments (Optional)' : 'Required Revision Notes *'}
                </label>
                <textarea
                  rows={4}
                  required={approvalAction === 'revision_requested'}
                  placeholder={
                    approvalAction === 'approved'
                      ? 'Add any sign-off notes for the Universal Tech delivery team...'
                      : 'Specify what adjustments or additions are required before sign-off...'
                  }
                  value={approvalFeedback}
                  onChange={(e) => setApprovalFeedback(e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-[#00BFEA]"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setApprovalModalDeliverable(null)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingApproval}
                  className="px-4 py-2 rounded-lg bg-[#00BFEA] text-slate-950 font-bold hover:bg-[#00BFEA]/90 transition-colors shadow-sm disabled:opacity-50"
                >
                  {submittingApproval ? 'Recording...' : 'Submit Official Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CANDIDATE FEEDBACK MODAL */}
      {feedbackCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="relative w-full max-w-lg bg-[#111820] border border-slate-700 rounded-2xl shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="border-b border-slate-800 pb-3">
              <span className="text-[10px] font-mono uppercase text-[#00BFEA]">Candidate Coordination</span>
              <h3 className="text-lg font-bold text-white mt-0.5">{feedbackCandidate.fullName}</h3>
              <div className="text-xs text-slate-400">{feedbackCandidate.roleTitle}</div>
            </div>

            <form onSubmit={handleUpdateCandidate} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Status</label>
                <select
                  value={candidateStatus}
                  onChange={(e) => setCandidateStatus(e.target.value)}
                  className="w-full p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-100 focus:border-[#00BFEA] focus:outline-none"
                >
                  <option value="submitted">Submitted for Review</option>
                  <option value="interview_scheduled">Interview Scheduled</option>
                  <option value="offer_extended">Offer Extended</option>
                  <option value="hired">Hired</option>
                  <option value="rejected_by_client">Declined / Not Selected</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Feedback & Interview Notes</label>
                <textarea
                  rows={3}
                  placeholder="Record panel notes, interview dates, or qualification feedback..."
                  value={candidateNotes}
                  onChange={(e) => setCandidateNotes(e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-[#00BFEA]"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setFeedbackCandidate(null)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-[#00BFEA] text-slate-950 font-bold hover:bg-[#00BFEA]/90 transition-colors shadow-sm"
                >
                  Save Feedback
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
