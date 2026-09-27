import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { Sidebar } from './components/layout/Sidebar.tsx';
import { Header } from './components/layout/Header.tsx';
import { ClientOverview } from './views/client/ClientOverview.tsx';
import { ClientServices } from './views/client/ClientServices.tsx';
import { ClientProjects } from './views/client/ClientProjects.tsx';
import { ClientRequests } from './views/client/ClientRequests.tsx';
import { ClientDocuments } from './views/client/ClientDocuments.tsx';
import { ClientMessages } from './views/client/ClientMessages.tsx';
import { ClientBilling } from './views/client/ClientBilling.tsx';
import { ClientSupport } from './views/client/ClientSupport.tsx';
import { ClientOrgSettings } from './views/client/ClientOrgSettings.tsx';
import { AdminOrganizations } from './views/admin/AdminOrganizations.tsx';
import { AdminIntegrations } from './views/admin/AdminIntegrations.tsx';
import { AdminAudit } from './views/admin/AdminAudit.tsx';
import { AdminSecurityTests } from './views/admin/AdminSecurityTests.tsx';
import { SystemDocumentation } from './views/admin/SystemDocumentation.tsx';
import { LandingPage } from './views/public/LandingPage.tsx';
import { LoginDashboard } from './views/public/LoginDashboard.tsx';
import { api } from './api/client.ts';
import { CheckCircle2, AlertCircle, Info, X, ShieldCheck } from 'lucide-react';

const PortalMain: React.FC = () => {
  const { currentView, toast, loading, refreshState, showToast, user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Invitation Modal State if URL contains ?invite=TOKEN
  const [inviteToken, setInviteToken] = useState<string | null>(null);
  const [inviteDetails, setInviteDetails] = useState<any>(null);
  const [inviteFullName, setInviteFullName] = useState('');
  const [invitePassword, setInvitePassword] = useState('');
  const [acceptingInvite, setAcceptingInvite] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const token = params.get('invite');
      if (token) {
        setInviteToken(token);
        api
          .verifyInvitation(token)
          .then((res) => {
            if (res.valid) {
              setInviteDetails(res);
            } else {
              showToast(res.error || 'Invitation is invalid or has expired', 'error');
              setInviteToken(null);
            }
          })
          .catch((err) => {
            showToast(err.message || 'Invitation verification failed', 'error');
            setInviteToken(null);
          });
      }
    }
  }, []);

  const handleAcceptInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteToken) return;

    try {
      setAcceptingInvite(true);
      const res = await api.acceptInvitation(inviteToken, inviteFullName);
      showToast(`Welcome to Universal Tech, ${res.user.fullName}!`, 'success');
      setInviteToken(null);
      // Clean query string
      window.history.replaceState({}, document.title, window.location.pathname);
      await api.switchDemo(res.user.id);
      await refreshState();
    } catch (err: any) {
      showToast(err.message || 'Failed to accept invitation', 'error');
    } finally {
      setAcceptingInvite(false);
    }
  };

  const renderActiveView = () => {
    switch (currentView) {
      case 'overview':
        return <ClientOverview />;
      case 'services':
        return <ClientServices />;
      case 'projects':
      case 'project_detail':
        return <ClientProjects />;
      case 'requests':
        return <ClientRequests />;
      case 'documents':
        return <ClientDocuments />;
      case 'messages':
        return <ClientMessages />;
      case 'billing':
        return <ClientBilling />;
      case 'support':
        return <ClientSupport />;
      case 'team_settings':
        return <ClientOrgSettings />;
      case 'admin_organizations':
        return <AdminOrganizations />;
      case 'admin_integrations':
        return <AdminIntegrations />;
      case 'admin_audit':
        return <AdminAudit />;
      case 'admin_security_tests':
        return <AdminSecurityTests />;
      case 'system_documentation':
        return <SystemDocumentation />;
      default:
        return <ClientOverview />;
    }
  };

  const renderToast = () => {
    if (!toast) return null;
    return (
      <div className="fixed bottom-5 right-5 z-50 animate-in fade-in slide-in-from-bottom-5 duration-150 max-w-md">
        <div
          className={`p-3.5 rounded-xl shadow-2xl flex items-center gap-3 text-xs border ${
            toast.type === 'success'
              ? 'bg-[#071B33] border-[#00BFEA]/60 text-white'
              : toast.type === 'error'
              ? 'bg-[#181114] border-[#E94B54]/60 text-white'
              : 'bg-slate-900 border-slate-700 text-slate-200'
          }`}
        >
          {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-[#00BFEA] shrink-0" />}
          {toast.type === 'error' && <AlertCircle className="w-4 h-4 text-[#E94B54] shrink-0" />}
          {toast.type === 'info' && <Info className="w-4 h-4 text-[#00BFEA] shrink-0" />}
          <span className="font-medium leading-relaxed">{toast.message}</span>
        </div>
      </div>
    );
  };

  const renderInviteModal = () => {
    if (!inviteToken || !inviteDetails) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
        <div className="relative w-full max-w-md bg-[#111820] border border-slate-700 rounded-2xl shadow-2xl p-6 md:p-8 space-y-5 animate-in fade-in zoom-in-95 duration-150 text-xs">
          <div className="border-b border-slate-800 pb-3">
            <span className="text-[10px] font-mono uppercase text-[#00BFEA]">Verified Invitation</span>
            <h3 className="text-xl font-bold text-white mt-1">Join {inviteDetails.organizationName}</h3>
            <div className="text-slate-400 text-xs mt-0.5">
              Universal Tech Client Portal · Assigned Role: <span className="text-white font-mono">{inviteDetails.role}</span>
            </div>
          </div>

          <form onSubmit={handleAcceptInvite} className="space-y-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Your Full Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Michael Ross"
                value={inviteFullName}
                onChange={(e) => setInviteFullName(e.target.value)}
                className="w-full p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-[#00BFEA]"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Create Password</label>
              <input
                type="password"
                required
                placeholder="••••••••••••"
                value={invitePassword}
                onChange={(e) => setInvitePassword(e.target.value)}
                className="w-full p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-[#00BFEA]"
              />
            </div>

            <button
              type="submit"
              disabled={acceptingInvite}
              className="w-full py-2.5 rounded-lg bg-[#00BFEA] text-slate-950 font-bold hover:bg-[#00BFEA]/90 transition-colors shadow-sm disabled:opacity-50 text-sm"
            >
              {acceptingInvite ? 'Verifying Account...' : 'Accept Invitation & Enter Portal'}
            </button>
          </form>
        </div>
      </div>
    );
  };

  // 1. Landing Page View
  if (currentView === 'landing') {
    return (
      <>
        <LandingPage />
        {renderToast()}
        {renderInviteModal()}
      </>
    );
  }

  // 2. Login Dashboard View
  if (currentView === 'login') {
    return (
      <>
        <LoginDashboard />
        {renderToast()}
        {renderInviteModal()}
      </>
    );
  }

  return (
    <div className="min-h-screen bg-[#111820] text-slate-100 flex flex-col antialiased selection:bg-[#00BFEA]/20 selection:text-[#00BFEA]">
      {/* Sidebar Navigation */}
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      {/* Main Content Area (offset by 72 (18rem) on lg screens) */}
      <div className="lg:pl-72 flex-1 flex flex-col min-w-0">
        <Header setMobileOpen={setMobileOpen} />

        {/* Viewport Content */}
        <main className="flex-1 pb-16 overflow-y-auto">
          {renderActiveView()}
        </main>
      </div>

      {/* Floating System Toast */}
      {renderToast()}

      {/* Invitation Acceptance Modal */}
      {renderInviteModal()}
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <PortalMain />
    </AuthProvider>
  );
}
