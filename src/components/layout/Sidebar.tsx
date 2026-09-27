import React from 'react';
import {
  LayoutDashboard,
  Briefcase,
  Layers,
  FileText,
  FolderLock,
  MessageSquare,
  CreditCard,
  LifeBuoy,
  Users,
  Settings,
  ShieldCheck,
  Building2,
  GitBranch,
  History,
  FileCode,
  Sparkles,
  Globe,
  LogOut,
} from 'lucide-react';
import { useAuth, PortalView } from '../../context/AuthContext.tsx';
import { UniversalTechLogo } from '../common/UniversalTechLogo.tsx';

interface SidebarProps {
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, setMobileOpen }) => {
  const {
    user,
    organization,
    permissions,
    currentView,
    setCurrentView,
    setSelectedProjectId,
    goToLanding,
    logout,
  } = useAuth();

  const handleNav = (view: PortalView) => {
    setCurrentView(view);
    setSelectedProjectId(null);
    setMobileOpen(false);
  };

  const isStaffOrAdmin = permissions.isStaff;

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        } bg-[#111820] border-r border-[#1E293B] select-none text-slate-200`}
      >
        {/* Brand Header */}
        <div className="h-18 px-5 flex items-center justify-between border-b border-[#1E293B] bg-[#0C131D]">
          <UniversalTechLogo size="sm" showSubtitle={true} />
        </div>

        {/* Workspace Organization Badge */}
        <div className="px-5 py-3.5 border-b border-[#1E293B]/70 bg-[#071B33]/40">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#00BFEA]">
              {isStaffOrAdmin ? 'Admin & Staff Ops' : 'Client Organization'}
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded font-mono bg-slate-800 text-slate-300 border border-slate-700">
              {user?.role.replace('_', ' ').toUpperCase()}
            </span>
          </div>
          <div className="mt-1 text-sm font-semibold text-white truncate">
            {isStaffOrAdmin ? 'Universal Tech Operations' : organization?.name || 'Client Portal'}
          </div>
          <div className="text-[11px] text-[#BCC7D3] truncate">
            {isStaffOrAdmin ? 'Portfolio & Governance' : organization?.industry || 'Active Engagement'}
          </div>
        </div>

        {/* Navigation Modules */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {/* Main Workspace Navigation */}
          <div>
            <div className="px-3 pb-2 text-[10px] font-mono uppercase tracking-widest text-[#BCC7D3]">
              {isStaffOrAdmin ? 'Administration' : 'Client Workspace'}
            </div>

            <nav className="space-y-1">
              <button
                onClick={() => handleNav('overview')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-left ${
                  currentView === 'overview'
                    ? 'bg-[#00BFEA]/15 text-[#00BFEA] border-l-2 border-[#00BFEA]'
                    : 'text-slate-300 hover:bg-[#1E293B] hover:text-white'
                }`}
              >
                <LayoutDashboard className="w-4 h-4 shrink-0" />
                <span>Overview</span>
              </button>

              {/* Client Organizations (Staff/Admin only) */}
              {isStaffOrAdmin && (
                <button
                  onClick={() => handleNav('admin_organizations')}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-left ${
                    currentView === 'admin_organizations'
                      ? 'bg-[#00BFEA]/15 text-[#00BFEA] border-l-2 border-[#00BFEA]'
                      : 'text-slate-300 hover:bg-[#1E293B] hover:text-white'
                  }`}
                >
                  <Building2 className="w-4 h-4 shrink-0" />
                  <span>Client Organizations</span>
                </button>
              )}

              {/* Services Catalog / My Services */}
              <button
                onClick={() => handleNav('services')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-left ${
                  currentView === 'services'
                    ? 'bg-[#00BFEA]/15 text-[#00BFEA] border-l-2 border-[#00BFEA]'
                    : 'text-slate-300 hover:bg-[#1E293B] hover:text-white'
                }`}
              >
                <Briefcase className="w-4 h-4 shrink-0" />
                <span>{isStaffOrAdmin ? 'Services Catalog' : 'My Services'}</span>
              </button>

              {/* Projects */}
              <button
                onClick={() => handleNav('projects')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-left ${
                  currentView === 'projects' || currentView === 'project_detail'
                    ? 'bg-[#00BFEA]/15 text-[#00BFEA] border-l-2 border-[#00BFEA]'
                    : 'text-slate-300 hover:bg-[#1E293B] hover:text-white'
                }`}
              >
                <Layers className="w-4 h-4 shrink-0" />
                <span>Projects & Milestones</span>
              </button>

              {/* Requests */}
              <button
                onClick={() => handleNav('requests')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-left ${
                  currentView === 'requests'
                    ? 'bg-[#00BFEA]/15 text-[#00BFEA] border-l-2 border-[#00BFEA]'
                    : 'text-slate-300 hover:bg-[#1E293B] hover:text-white'
                }`}
              >
                <FileText className="w-4 h-4 shrink-0" />
                <span>Service Requests</span>
              </button>

              {/* Documents */}
              <button
                onClick={() => handleNav('documents')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-left ${
                  currentView === 'documents'
                    ? 'bg-[#00BFEA]/15 text-[#00BFEA] border-l-2 border-[#00BFEA]'
                    : 'text-slate-300 hover:bg-[#1E293B] hover:text-white'
                }`}
              >
                <FolderLock className="w-4 h-4 shrink-0" />
                <span>Secure Documents</span>
              </button>

              {/* Messages */}
              <button
                onClick={() => handleNav('messages')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-left ${
                  currentView === 'messages'
                    ? 'bg-[#00BFEA]/15 text-[#00BFEA] border-l-2 border-[#00BFEA]'
                    : 'text-slate-300 hover:bg-[#1E293B] hover:text-white'
                }`}
              >
                <MessageSquare className="w-4 h-4 shrink-0" />
                <span>Messages & Updates</span>
              </button>

              {/* Billing (Strictly conditional on canViewBilling) */}
              {permissions.canViewBilling && (
                <button
                  onClick={() => handleNav('billing')}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-left ${
                    currentView === 'billing'
                      ? 'bg-[#00BFEA]/15 text-[#00BFEA] border-l-2 border-[#00BFEA]'
                      : 'text-slate-300 hover:bg-[#1E293B] hover:text-white'
                  }`}
                >
                  <CreditCard className="w-4 h-4 shrink-0" />
                  <span>Invoices & Billing</span>
                </button>
              )}

              {/* Support */}
              <button
                onClick={() => handleNav('support')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-left ${
                  currentView === 'support'
                    ? 'bg-[#00BFEA]/15 text-[#00BFEA] border-l-2 border-[#00BFEA]'
                    : 'text-slate-300 hover:bg-[#1E293B] hover:text-white'
                }`}
              >
                <LifeBuoy className="w-4 h-4 shrink-0" />
                <span>Support Tickets</span>
              </button>

              {/* Organization Settings (Client Admin / Team) */}
              {!isStaffOrAdmin && (
                <button
                  onClick={() => handleNav('team_settings')}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-left ${
                    currentView === 'team_settings'
                      ? 'bg-[#00BFEA]/15 text-[#00BFEA] border-l-2 border-[#00BFEA]'
                      : 'text-slate-300 hover:bg-[#1E293B] hover:text-white'
                  }`}
                >
                  <Settings className="w-4 h-4 shrink-0" />
                  <span>Team & Organization</span>
                </button>
              )}
            </nav>
          </div>

          {/* Admin Operations Section (Only for Universal Tech Staff/Admin) */}
          {isStaffOrAdmin && (
            <div>
              <div className="px-3 pb-2 text-[10px] font-mono uppercase tracking-widest text-[#BCC7D3]">
                Governance & Systems
              </div>
              <nav className="space-y-1">
                {/* Team & Permissions */}
                <button
                  onClick={() => handleNav('team_settings')}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-left ${
                    currentView === 'team_settings'
                      ? 'bg-[#00BFEA]/15 text-[#00BFEA] border-l-2 border-[#00BFEA]'
                      : 'text-slate-300 hover:bg-[#1E293B] hover:text-white'
                  }`}
                >
                  <Users className="w-4 h-4 shrink-0" />
                  <span>Team & Assignments</span>
                </button>

                {/* GoHighLevel & CRM Integrations */}
                <button
                  onClick={() => handleNav('admin_integrations')}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-left ${
                    currentView === 'admin_integrations'
                      ? 'bg-[#00BFEA]/15 text-[#00BFEA] border-l-2 border-[#00BFEA]'
                      : 'text-slate-300 hover:bg-[#1E293B] hover:text-white'
                  }`}
                >
                  <GitBranch className="w-4 h-4 shrink-0" />
                  <span>GoHighLevel & Integrations</span>
                </button>

                {/* Audit History */}
                <button
                  onClick={() => handleNav('admin_audit')}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-left ${
                    currentView === 'admin_audit'
                      ? 'bg-[#00BFEA]/15 text-[#00BFEA] border-l-2 border-[#00BFEA]'
                      : 'text-slate-300 hover:bg-[#1E293B] hover:text-white'
                  }`}
                >
                  <History className="w-4 h-4 shrink-0" />
                  <span>Audit History</span>
                </button>
              </nav>
            </div>
          )}

          {/* Verification & Deliverables Suite */}
          <div>
            <div className="px-3 pb-2 text-[10px] font-mono uppercase tracking-widest text-[#BCC7D3]">
              Quality & Verification
            </div>
            <nav className="space-y-1">
              <button
                onClick={() => handleNav('admin_security_tests')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-left ${
                  currentView === 'admin_security_tests'
                    ? 'bg-emerald-500/15 text-emerald-400 border-l-2 border-emerald-400'
                    : 'text-slate-300 hover:bg-[#1E293B] hover:text-white'
                }`}
              >
                <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>Security Test Runner</span>
              </button>

              <button
                onClick={() => handleNav('system_documentation')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-left ${
                  currentView === 'system_documentation'
                    ? 'bg-[#00BFEA]/15 text-[#00BFEA] border-l-2 border-[#00BFEA]'
                    : 'text-slate-300 hover:bg-[#1E293B] hover:text-white'
                }`}
              >
                <FileCode className="w-4 h-4 shrink-0 text-[#00BFEA]" />
                <span>System Architecture & Docs</span>
              </button>
            </nav>
          </div>
        </div>

        {/* User Profile Card */}
        <div className="p-4 border-t border-[#1E293B] bg-[#0C131D] space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-xs text-[#00BFEA]">
              {user?.fullName.split(' ').map((n) => n[0]).join('').substring(0, 2)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-white truncate">{user?.fullName}</div>
              <div className="text-[11px] text-[#BCC7D3] truncate">{user?.email}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-800/80 text-[11px]">
            <button
              onClick={() => {
                goToLanding();
                setMobileOpen(false);
              }}
              className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-colors"
              title="Return to Public Website"
            >
              <Globe className="w-3.5 h-3.5 text-[#00BFEA]" />
              <span>Public Site</span>
            </button>
            <button
              onClick={() => {
                logout();
                setMobileOpen(false);
              }}
              className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg bg-slate-900 hover:bg-rose-950/30 text-slate-400 hover:text-[#E94B54] border border-slate-800 hover:border-[#E94B54]/40 transition-colors"
              title="Sign Out of Portal"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
