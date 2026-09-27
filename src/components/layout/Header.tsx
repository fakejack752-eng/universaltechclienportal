import React, { useState } from 'react';
import {
  Menu,
  Sun,
  Moon,
  ShieldCheck,
  ChevronDown,
  UserCheck,
  PlusCircle,
  Bell,
  X,
  CheckCircle2,
  Globe,
  LogOut,
} from 'lucide-react';
import { useAuth, PortalView } from '../../context/AuthContext.tsx';

interface HeaderProps {
  setMobileOpen: (open: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({ setMobileOpen }) => {
  const {
    user,
    organization,
    currentView,
    setCurrentView,
    demoUsers,
    switchPersona,
    darkMode,
    toggleDarkMode,
    permissions,
    goToLanding,
    logout,
  } = useAuth();

  const [personaMenuOpen, setPersonaMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  // Friendly title mapping for view breadcrumb
  const viewTitles: Record<PortalView, string> = {
    landing: 'Public Homepage',
    login: 'Portal Sign In',
    overview: 'Operational Overview',
    services: permissions.isStaff ? 'Services Catalog' : 'Active Services',
    projects: 'Projects & Milestones',
    project_detail: 'Project Workspace',
    requests: 'Service Requests',
    documents: 'Secure File Repository',
    messages: 'Communication & Updates',
    billing: 'Invoices & Billing',
    support: 'Support Center',
    team_settings: permissions.isStaff ? 'Staff & Team Assignments' : 'Organization Team',
    admin_organizations: 'Client Organizations',
    admin_integrations: 'GoHighLevel & CRM Integrations',
    admin_audit: 'Tamper-Evident Audit History',
    admin_security_tests: 'Acceptance Security Test Suite',
    system_documentation: 'System Architecture & Deliverables',
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-[#111820]/95 backdrop-blur-md border-b border-[#1E293B] px-4 lg:px-8 flex items-center justify-between text-slate-100 transition-colors">
      {/* Zone 1: Breadcrumb Trail & Mobile Toggle */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={() => setMobileOpen(true)}
          className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          aria-label="Toggle Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs md:text-sm font-medium truncate">
          <span className="text-[#BCC7D3] truncate">Universal Tech</span>
          <span className="text-slate-600">/</span>
          <span className="text-slate-400 truncate">
            {permissions.isStaff ? 'Internal Admin' : organization?.name || 'Workspace'}
          </span>
          <span className="text-slate-600">/</span>
          <span className="text-white font-semibold truncate text-[#00BFEA]">
            {viewTitles[currentView] || 'Workspace'}
          </span>
        </nav>
      </div>

      {/* Zone 2: Evaluation Persona Quick-Switcher */}
      <div className="relative">
        <button
          onClick={() => setPersonaMenuOpen(!personaMenuOpen)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700/80 hover:border-[#00BFEA]/60 text-xs text-slate-200 transition-colors"
          title="Switch evaluation persona to verify multi-tenant isolation and role permissions"
        >
          <UserCheck className="w-3.5 h-3.5 text-[#00BFEA]" />
          <span className="hidden sm:inline text-[#BCC7D3]">Role:</span>
          <span className="font-semibold text-white truncate max-w-[130px] md:max-w-[180px]">
            {user?.fullName}
          </span>
          <span className="text-[10px] px-1.5 py-0.2 rounded font-mono bg-slate-800 text-[#00BFEA]">
            {user?.role.replace('_', ' ')}
          </span>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
        </button>

        {/* Persona Dropdown Menu */}
        {personaMenuOpen && (
          <>
            <div className="fixed inset-0 z-30" onClick={() => setPersonaMenuOpen(false)} />
            <div className="absolute right-0 mt-2 w-84 rounded-xl bg-[#111820] border border-slate-700 shadow-2xl z-40 p-2 text-xs divide-y divide-slate-800 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-3 py-2 text-[11px] font-mono text-[#BCC7D3]">
                DEMO PERSONA SWITCHER (Zero-Trust RBAC Verification)
              </div>
              <div className="py-1 space-y-1">
                {demoUsers.map((u) => {
                  const isCurrent = u.id === user?.id;
                  return (
                    <button
                      key={u.id}
                      onClick={() => {
                        switchPersona(u.id);
                        setPersonaMenuOpen(false);
                      }}
                      className={`w-full flex items-start gap-2.5 p-2 rounded-lg text-left transition-colors ${
                        isCurrent ? 'bg-[#00BFEA]/20 border border-[#00BFEA]/40' : 'hover:bg-slate-800 text-slate-300'
                      }`}
                    >
                      <div className="mt-0.5">
                        <CheckCircle2
                          className={`w-4 h-4 ${isCurrent ? 'text-[#00BFEA]' : 'text-transparent'}`}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-white truncate">{u.fullName}</span>
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
                            {u.role}
                          </span>
                        </div>
                        <div className="text-[11px] text-[#BCC7D3] truncate">{u.title}</div>
                        <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                          Org: {u.organizationName}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Dropdown Footer Actions */}
              <div className="p-2.5 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between text-[11px]">
                <button
                  onClick={() => {
                    setPersonaMenuOpen(false);
                    goToLanding();
                  }}
                  className="text-[#00BFEA] hover:underline flex items-center gap-1 font-medium"
                >
                  <Globe className="w-3 h-3" />
                  <span>Public Landing Page</span>
                </button>
                <button
                  onClick={() => {
                    setPersonaMenuOpen(false);
                    logout();
                  }}
                  className="text-slate-400 hover:text-[#E94B54] flex items-center gap-1 font-medium transition-colors"
                >
                  <LogOut className="w-3 h-3" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Zone 3: Fast Actions (Dark mode, Notifs, Primary CTA) */}
      <div className="flex items-center gap-2">
        {/* Public Site Quick Button */}
        <button
          onClick={goToLanding}
          className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-700/80 bg-slate-900 text-slate-300 hover:text-white text-xs font-medium transition-colors"
          title="Return to Public Homepage"
        >
          <Globe className="w-3.5 h-3.5 text-[#00BFEA]" />
          <span className="hidden lg:inline">Public Site</span>
        </button>

        {/* Notifications Icon */}
        <div className="relative">
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors relative"
            aria-label="View activity notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#00BFEA] animate-pulse" />
          </button>

          {notifOpen && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setNotifOpen(false)} />
              <div className="absolute right-0 mt-2 w-80 rounded-xl bg-[#111820] border border-slate-700 shadow-2xl z-40 p-3 text-xs space-y-2">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="font-semibold text-white">Operational Activity</span>
                  <button onClick={() => setNotifOpen(false)} className="text-slate-400 hover:text-white">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="space-y-2">
                  <div className="p-2 rounded bg-slate-900 border border-slate-800">
                    <div className="font-semibold text-slate-200">Deliverable v2.1 Ready</div>
                    <div className="text-slate-400 text-[11px]">Clinical prompt dialogue tree waiting for client approval.</div>
                    <div className="text-[10px] text-slate-500 mt-1 font-mono">15m ago</div>
                  </div>
                  <div className="p-2 rounded bg-slate-900 border border-slate-800">
                    <div className="font-semibold text-slate-200">Security Audit Passed</div>
                    <div className="text-slate-400 text-[11px]">All tenant isolation and data scrubbing policies verified.</div>
                    <div className="text-[10px] text-slate-500 mt-1 font-mono">1h ago</div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Dark/Light mode toggle */}
        <button
          onClick={toggleDarkMode}
          className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          title={darkMode ? 'Switch to accessible Light Mode' : 'Switch to Dark Mode'}
        >
          {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Primary Action Button */}
        <button
          onClick={() => setCurrentView('requests')}
          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#00BFEA] hover:bg-[#00BFEA]/90 text-slate-950 font-semibold text-xs transition-colors shadow-sm"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>Request a Service</span>
        </button>
      </div>
    </header>
  );
};
