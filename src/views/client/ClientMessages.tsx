import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  Send,
  User,
  ShieldAlert,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import { api } from '../../api/client.ts';
import { MessageRecord, Project } from '../../types/index.ts';

export const ClientMessages: React.FC = () => {
  const { user, permissions, showToast } = useAuth();

  const [messages, setMessages] = useState<MessageRecord[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [content, setContent] = useState('');
  const [isInternalNote, setIsInternalNote] = useState(false);
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const [projList, msgList] = await Promise.all([
        api.getProjects(),
        api.getMessages({ projectId: selectedProjectId || undefined }),
      ]);
      setProjects(projList);
      setMessages(msgList);
    } catch (err: any) {
      showToast(err.message || 'Failed to load messages', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedProjectId]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    try {
      setSending(true);
      await api.sendMessage({
        content: content.trim(),
        projectId: selectedProjectId || undefined,
        isInternal: permissions.isStaff ? isInternalNote : false,
      });

      setContent('');
      setIsInternalNote(false);
      const updated = await api.getMessages({ projectId: selectedProjectId || undefined });
      setMessages(updated);
      showToast('Message sent to project team', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to send message', 'error');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
            Project & Team Communications
          </h1>
          <p className="text-sm text-[#BCC7D3] mt-1">
            Async operational message threads with your assigned Universal Tech engineering and delivery squad.
          </p>
        </div>

        {/* Project Selector */}
        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-400 font-mono">Scope:</label>
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-100 focus:border-[#00BFEA] focus:outline-none"
          >
            <option value="">All Engagements</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Messages Thread Container */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl flex flex-col h-[600px] overflow-hidden">
        {/* Messages List Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
          {loading ? (
            <div className="space-y-4 animate-pulse">
              <div className="h-16 bg-slate-800 rounded-xl w-3/4" />
              <div className="h-16 bg-slate-800 rounded-xl w-3/4 ml-auto" />
            </div>
          ) : messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-3 text-slate-500">
              <MessageSquare className="w-10 h-10 text-slate-700" />
              <div className="text-sm font-semibold text-slate-300">No messages in this thread</div>
              <p className="text-xs max-w-sm">
                Have a question regarding milestones, deliverable progress, or technical scoping? Post a message below.
              </p>
            </div>
          ) : (
            messages.map((msg) => {
              const isMe = msg.senderId === user?.id;
              const isInternal = msg.isInternal;

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col max-w-2xl text-xs space-y-1 ${
                    isMe ? 'ml-auto items-end' : 'mr-auto items-start'
                  }`}
                >
                  <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
                    <span className="font-semibold text-slate-200">{msg.senderName}</span>
                    <span>·</span>
                    <span className="uppercase text-[10px] text-[#00BFEA]">{msg.senderRole.replace('_', ' ')}</span>
                    <span>·</span>
                    <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>

                  <div
                    className={`p-3.5 rounded-2xl leading-relaxed ${
                      isInternal
                        ? 'bg-amber-500/15 border border-amber-500/30 text-amber-100'
                        : isMe
                        ? 'bg-[#00BFEA] text-slate-950 font-medium'
                        : 'bg-slate-800 border border-slate-700 text-slate-100'
                    }`}
                  >
                    {isInternal && (
                      <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-300 mb-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        <span>Staff Internal Note</span>
                      </div>
                    )}
                    <p>{msg.content}</p>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-slate-800 bg-slate-950">
          <form onSubmit={handleSendMessage} className="space-y-3">
            {permissions.isStaff && (
              <div className="flex items-center gap-2 text-xs text-amber-300">
                <input
                  type="checkbox"
                  id="internalMsg"
                  checked={isInternalNote}
                  onChange={(e) => setIsInternalNote(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-900 text-amber-400"
                />
                <label htmlFor="internalMsg" className="cursor-pointer font-medium font-mono text-[11px]">
                  Post as Internal Staff Note (hidden from client organization)
                </label>
              </div>
            )}

            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Write an operational update, feedback, or question for the delivery team..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="flex-1 p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-[#00BFEA]"
              />
              <button
                type="submit"
                disabled={sending || !content.trim()}
                className="px-4 py-2.5 rounded-xl bg-[#00BFEA] text-slate-950 font-bold text-xs hover:bg-[#00BFEA]/90 transition-colors flex items-center gap-1.5 shadow-sm disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
