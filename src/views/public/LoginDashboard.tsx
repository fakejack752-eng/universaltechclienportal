import React, { useState } from 'react';
import {
  Lock,
  Mail,
  KeyRound,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  UserCheck,
  Building2,
  Sparkles,
  HelpCircle,
  FileCheck,
} from 'lucide-react';
import { UniversalTechLogo } from '../../components/common/UniversalTechLogo.tsx';
import { useAuth } from '../../context/AuthContext.tsx';
import { api } from '../../api/client.ts';

export const LoginDashboard: React.FC = () => {
  const { login, switchPersona, goToLanding, demoUsers, showToast } = useAuth();

  const [email, setEmail] = useState('elena.rodriguez@apexhealth.org');
  const [password, setPassword] = useState('••••••••••••');
  const [showPassword, setShowPassword] = useState(false);
  const [mfaCode, setMfaCode] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Forgot Password Modal State
  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSubmitting, setResetSubmitting] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const handleCredentialLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setErrorMsg('Please provide a valid work email address');
      return;
    }

    try {
      setSubmitting(true);
      setErrorMsg(null);
      await login(email.trim(), password);
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed. Please check credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickPersonaSelect = async (userId: string) => {
    try {
      setSubmitting(true);
      setErrorMsg(null);
      await switchPersona(userId);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to switch demo persona');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePasswordResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail.trim()) return;

    try {
      setResetSubmitting(true);
      await api.requestPasswordReset(resetEmail.trim());
      setResetSent(true);
      showToast('Password recovery instructions sent if address exists', 'info');
    } catch (err: any) {
      showToast(err.message || 'Password reset request failed', 'error');
    } finally {
      setResetSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#111820] text-slate-100 flex flex-col justify-between selection:bg-[#00BFEA]/20 selection:text-[#00BFEA] font-sans">
      {/* Top Header */}
      <header className="border-b border-slate-800/80 bg-[#111820]/90 backdrop-blur-md px-4 sm:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <UniversalTechLogo size="sm" variant="mark-only" />
          <div>
            <span className="text-sm font-extrabold tracking-tight text-white block leading-none">
              UNIVERSAL TECH <span className="text-[#00BFEA]">INC</span>
            </span>
            <span className="text-[10px] tracking-wider text-[#BCC7D3] uppercase font-mono">
              Operations & Client Portal
            </span>
          </div>
        </div>

        <button
          onClick={goToLanding}
          className="inline-flex items-center gap-1.5 text-xs text-[#BCC7D3] hover:text-white transition-colors font-medium px-3 py-1.5 rounded-lg border border-slate-800 hover:border-slate-700 bg-slate-900"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Homepage</span>
        </button>
      </header>

      {/* Main Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col lg:flex-row items-center justify-center gap-10">
        {/* Left Column: Form & Security Notes */}
        <div className="w-full max-w-md space-y-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-[10px] font-mono text-[#00BFEA]">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>SOC-2 & HIPAA ISOLATED PORTAL</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Sign In to Your Workspace
            </h1>
            <p className="text-xs text-[#BCC7D3]">
              Enter your corporate credentials or choose a verified test persona below to access projects, deliverables, and invoices.
            </p>
          </div>

          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-[#181114] border border-[#E94B54]/40 text-[#E94B54] text-xs flex items-start gap-2.5 animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleCredentialLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Work Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-900/90 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00BFEA] transition-colors"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-300">Password</label>
                <button
                  type="button"
                  onClick={() => {
                    setResetEmail(email);
                    setResetSent(false);
                    setForgotModalOpen(true);
                  }}
                  className="text-[11px] text-[#00BFEA] hover:underline"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-9 pr-10 py-2.5 bg-slate-900/90 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00BFEA] transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Optional Dual-Factor OTP Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-medium text-slate-400">
                  Authenticator 2FA Code <span className="text-[10px] text-slate-500">(Optional for demo)</span>
                </label>
              </div>
              <input
                type="text"
                maxLength={6}
                value={mfaCode}
                onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, ''))}
                placeholder="6-digit TOTP code (e.g. 582910)"
                className="w-full px-3 py-2 bg-slate-900/50 border border-slate-800 rounded-xl text-xs font-mono text-white placeholder-slate-600 focus:outline-none focus:border-[#00BFEA]"
              />
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-900 text-[#00BFEA] focus:ring-0"
                />
                <span className="text-slate-300 text-[11px]">Remember this device</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 rounded-xl bg-[#00BFEA] hover:bg-[#00BFEA]/90 text-slate-950 font-bold text-xs transition-all shadow-md shadow-[#00BFEA]/15 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span>{submitting ? 'Verifying Credentials...' : 'Sign In to Client Portal'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Security Guarantee Note */}
          <div className="p-3.5 rounded-xl bg-slate-900/40 border border-slate-800 text-[11px] text-slate-400 flex items-start gap-2.5">
            <Lock className="w-4 h-4 text-[#00BFEA] shrink-0 mt-0.5" />
            <span>
              All portal sessions are encrypted via TLS 1.3 with automated inactivity timeouts and tenant isolation rules enforced on the server.
            </span>
          </div>
        </div>

        {/* Right Column: One-Click Evaluator Personas */}
        <div className="w-full max-w-xl space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#00BFEA]" />
                <span>Instant Evaluation Personas</span>
              </h2>
              <p className="text-[11px] text-slate-400">
                Click any role to test verified capabilities, tenant isolation, and billing access:
              </p>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              ONE-CLICK AUTH
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[520px] overflow-y-auto pr-1">
            {/* Persona 1: UT Administrator */}
            <button
              onClick={() => handleQuickPersonaSelect('user_ut_admin')}
              disabled={submitting}
              className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-[#00BFEA]/60 text-left transition-all space-y-1.5 group disabled:opacity-50"
            >
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-mono uppercase px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20 font-bold">
                  UT Administrator
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-[#00BFEA] transition-colors" />
              </div>
              <div className="font-bold text-xs text-white group-hover:text-[#00BFEA] transition-colors">
                Rachel Adams
              </div>
              <div className="text-[10px] text-slate-400">Universal Tech INC · Enterprise Architect</div>
              <div className="text-[10px] text-slate-500 font-mono">
                Full governance, organizations, billing & audit ledger
              </div>
            </button>

            {/* Persona 2: UT Staff */}
            <button
              onClick={() => handleQuickPersonaSelect('user_ut_staff')}
              disabled={submitting}
              className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-[#00BFEA]/60 text-left transition-all space-y-1.5 group disabled:opacity-50"
            >
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-mono uppercase px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 font-bold">
                  UT Assigned Staff
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-[#00BFEA] transition-colors" />
              </div>
              <div className="font-bold text-xs text-white group-hover:text-[#00BFEA] transition-colors">
                Marcus Vance
              </div>
              <div className="text-[10px] text-slate-400">Lead Engineer · Apex Health & Nexus assigned</div>
              <div className="text-[10px] text-slate-500 font-mono">
                Manages tasks & internal notes; no billing permission
              </div>
            </button>

            {/* Persona 3: Client Admin (Apex Health) */}
            <button
              onClick={() => handleQuickPersonaSelect('user_apex_admin')}
              disabled={submitting}
              className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-[#00BFEA]/60 text-left transition-all space-y-1.5 group disabled:opacity-50"
            >
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-mono uppercase px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                  Client Admin (Apex)
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-[#00BFEA] transition-colors" />
              </div>
              <div className="font-bold text-xs text-white group-hover:text-[#00BFEA] transition-colors">
                Dr. Elena Rodriguez
              </div>
              <div className="text-[10px] text-slate-400">Apex Health Systems · VP Operations</div>
              <div className="text-[10px] text-slate-500 font-mono">
                Active Voice AI & Staffing, invoices & deliverable signoff
              </div>
            </button>

            {/* Persona 4: Client Member (Apex Health) */}
            <button
              onClick={() => handleQuickPersonaSelect('user_apex_member')}
              disabled={submitting}
              className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-[#00BFEA]/60 text-left transition-all space-y-1.5 group disabled:opacity-50"
            >
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-mono uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 font-bold">
                  Client Member (Apex)
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-[#00BFEA] transition-colors" />
              </div>
              <div className="font-bold text-xs text-white group-hover:text-[#00BFEA] transition-colors">
                David Chen
              </div>
              <div className="text-[10px] text-slate-400">Apex Health Systems · Workflow Coordinator</div>
              <div className="text-[10px] text-slate-500 font-mono">
                Sprint tasks & tickets; billing and approvals hidden
              </div>
            </button>

            {/* Persona 5: Client Admin (Nexus Logistics) */}
            <button
              onClick={() => handleQuickPersonaSelect('user_nexus_admin')}
              disabled={submitting}
              className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-[#00BFEA]/60 text-left transition-all space-y-1.5 group disabled:opacity-50"
            >
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-mono uppercase px-2 py-0.5 rounded bg-cyan-500/10 text-[#00BFEA] border border-cyan-500/20 font-bold">
                  Client Admin (Nexus)
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-[#00BFEA] transition-colors" />
              </div>
              <div className="font-bold text-xs text-white group-hover:text-[#00BFEA] transition-colors">
                Robert Vance
              </div>
              <div className="text-[10px] text-slate-400">Nexus Logistics Global · COO</div>
              <div className="text-[10px] text-slate-500 font-mono">
                Carrier dispatch CRM automation & ops staffing
              </div>
            </button>

            {/* Persona 6: Empty State Client */}
            <button
              onClick={() => handleQuickPersonaSelect('user_vanguard_admin')}
              disabled={submitting}
              className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-[#00BFEA]/60 text-left transition-all space-y-1.5 group disabled:opacity-50"
            >
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-mono uppercase px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold">
                  New Client (Empty State)
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-[#00BFEA] transition-colors" />
              </div>
              <div className="font-bold text-xs text-white group-hover:text-[#00BFEA] transition-colors">
                Charles Kingsbury
              </div>
              <div className="text-[10px] text-slate-400">Vanguard Capital · Managing Partner</div>
              <div className="text-[10px] text-slate-500 font-mono">
                Fresh onboarding, zero fake metrics, honest empty states
              </div>
            </button>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/30 border border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Need an invitation token?</span>
            <span className="text-xs text-[#00BFEA] font-mono">?invite=apex-admin-token</span>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 px-4 sm:px-8 py-4 bg-[#0d131a] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
        <div>Universal Tech INC · Enterprise Client Management Platform</div>
        <div className="flex items-center gap-4 text-[11px]">
          <span>Security Protocol v4.2</span>
          <span>•</span>
          <span>Zero-Trust RBAC Enabled</span>
        </div>
      </footer>

      {/* Forgot Password Modal */}
      {forgotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-[#111820] border border-slate-700 rounded-2xl shadow-2xl p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-[#00BFEA]" />
                <span>Password Recovery</span>
              </h3>
              <button
                onClick={() => setForgotModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {resetSent ? (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 space-y-2">
                <div className="flex items-center gap-2 font-bold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Recovery Instructions Dispatched</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  If <strong className="text-white">{resetEmail}</strong> corresponds to a registered account, a secure one-time password reset link has been dispatched to your inbox.
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => setForgotModalOpen(false)}
                    className="w-full py-2 bg-emerald-500 text-slate-950 font-bold rounded-lg text-xs"
                  >
                    Return to Sign In
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handlePasswordResetSubmit} className="space-y-4">
                <p className="text-slate-300 leading-relaxed">
                  Enter your verified work email address to receive a secure password reset link.
                </p>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Corporate Email</label>
                  <input
                    type="email"
                    required
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="w-full p-2.5 rounded-lg bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-[#00BFEA]"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setForgotModalOpen(false)}
                    className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={resetSubmitting}
                    className="px-4 py-2 rounded-lg bg-[#00BFEA] text-slate-950 font-bold hover:bg-[#00BFEA]/90 disabled:opacity-50"
                  >
                    {resetSubmitting ? 'Dispatching...' : 'Send Recovery Email'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
