import React, { useState, useEffect } from 'react';
import {
  Building2,
  Users,
  UserPlus,
  Mail,
  ShieldCheck,
  Clock,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import { api } from '../../api/client.ts';
import { User } from '../../types/index.ts';

export const ClientOrgSettings: React.FC = () => {
  const { user, organization, permissions, showToast } = useAuth();

  const [members, setMembers] = useState<User[]>([]);
  const [pendingInvites, setPendingInvites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Invite Form
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'client_member' | 'client_admin'>('client_member');
  const [inviting, setInviting] = useState(false);
  const [generatedInviteLink, setGeneratedInviteLink] = useState('');
  const [copied, setCopied] = useState(false);

  const loadTeam = async () => {
    if (!organization) return;
    try {
      setLoading(true);
      const data = await api.getOrganizationTeam(organization.id);
      setMembers(data.members);
      setPendingInvites(data.pendingInvites);
    } catch (err: any) {
      showToast(err.message || 'Failed to load organization team', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTeam();
  }, [organization?.id]);

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!organization || !inviteEmail.trim()) return;

    try {
      setInviting(true);
      const res = await api.inviteTeamMember(organization.id, inviteEmail.trim(), inviteRole);
      showToast(`Invitation dispatched to ${inviteEmail}`, 'success');
      setGeneratedInviteLink(res.invitation.inviteUrl || '');
      setInviteEmail('');
      await loadTeam();
    } catch (err: any) {
      showToast(err.message || 'Failed to issue invitation', 'error');
    } finally {
      setInviting(false);
    }
  };

  const handleCopyLink = () => {
    if (!generatedInviteLink) return;
    navigator.clipboard.writeText(generatedInviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
    showToast('Secure invitation URL copied to clipboard', 'info');
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="pb-6 border-b border-slate-800">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
          Organization Profile & Team
        </h1>
        <p className="text-sm text-[#BCC7D3] mt-1">
          Manage authorized team members, issue expiring invitations, and verify access roles.
        </p>
      </div>

      {/* Organization Meta Card */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-[10px] font-mono uppercase text-[#00BFEA] tracking-wider">Client Account</span>
            <h2 className="text-xl font-bold text-white mt-1">{organization?.name}</h2>
            <div className="text-xs text-slate-400">{organization?.industry}</div>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs px-2.5 py-1 rounded bg-[#00BFEA]/10 text-[#00BFEA] border border-[#00BFEA]/20">
              Tier: {organization?.tier}
            </span>
            <span className="font-mono text-xs px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase">
              {organization?.status}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 border-t border-slate-800 text-xs font-mono text-slate-400">
          <div>Primary Contact: {organization?.contactEmail}</div>
          <div>Telephone: {organization?.contactPhone || 'On File'}</div>
          <div>Account ID: {organization?.id}</div>
        </div>
      </div>

      {/* Team Management */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Members List (Left 2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="space-y-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-[#00BFEA]" />
              <span>Active Team Members ({members.length})</span>
            </h3>

            <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-900/60 divide-y divide-slate-800 text-xs">
              {members.map((mem) => (
                <div key={mem.id} className="p-4 flex items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white">{mem.fullName}</span>
                      <span className="font-mono text-[10px] uppercase px-1.5 py-0.2 rounded bg-slate-800 text-[#00BFEA] border border-slate-700">
                        {mem.role.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="text-slate-400">{mem.email} · {mem.title}</div>
                  </div>

                  <div className="text-right text-[11px] font-mono text-slate-500">
                    <div>Status: {mem.status}</div>
                    <div>Last Login: {new Date(mem.lastLoginAt).toLocaleDateString()}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pending Invitations */}
          {pendingInvites.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400" />
                <span>Pending Invitations ({pendingInvites.length})</span>
              </h3>

              <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-900/60 divide-y divide-slate-800 text-xs font-mono">
                {pendingInvites.map((inv) => (
                  <div key={inv.id} className="p-3.5 flex items-center justify-between text-slate-300">
                    <div>
                      <span className="font-semibold text-white">{inv.email}</span>
                      <span className="text-slate-500 ml-2">[{inv.role}]</span>
                    </div>
                    <span className="text-amber-400 text-[11px]">
                      Expires: {new Date(inv.expiresAt).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Invite Member Box (Right 1 col) */}
        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4 text-xs">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-[#00BFEA]" />
              <span>Invite Organization Member</span>
            </h3>

            <p className="text-slate-400 leading-relaxed">
              Issue an invitation token with a strict 7-day expiration. The recipient will be required to authenticate
              and set their password.
            </p>

            <form onSubmit={handleSendInvite} className="space-y-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Corporate Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="colleague@yourcompany.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-[#00BFEA]"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Assigned Role</label>
                <select
                  value={inviteRole}
                  onChange={(e: any) => setInviteRole(e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-[#00BFEA]"
                >
                  <option value="client_member">Client Member (Tasks, files, support)</option>
                  <option value="client_admin">Client Admin (Approvals, billing, invitations)</option>
                </select>
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Role self-elevation is blocked. You cannot invite Universal Tech staff roles.
                </span>
              </div>

              <button
                type="submit"
                disabled={inviting}
                className="w-full py-2.5 rounded-lg bg-[#00BFEA] text-slate-950 font-bold hover:bg-[#00BFEA]/90 transition-colors shadow-sm disabled:opacity-50"
              >
                {inviting ? 'Generating...' : 'Issue Invitation Token'}
              </button>
            </form>

            {/* Generated Link Display */}
            {generatedInviteLink && (
              <div className="p-3 rounded-lg bg-slate-950 border border-[#00BFEA]/30 space-y-2">
                <div className="text-[11px] font-mono text-[#00BFEA]">Active Invitation Link:</div>
                <div className="p-2 rounded bg-slate-900 font-mono text-[10px] text-slate-300 break-all select-all">
                  {generatedInviteLink}
                </div>
                <button
                  onClick={handleCopyLink}
                  className="w-full py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-white font-mono text-[11px] flex items-center justify-center gap-1.5 transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied Link' : 'Copy Onboarding Link'}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
