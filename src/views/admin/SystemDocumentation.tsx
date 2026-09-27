import React, { useState } from 'react';
import {
  FileCode,
  Database,
  Shield,
  Key,
  Terminal,
  BookOpen,
  CheckCircle2,
  Copy,
  Check,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';

export const SystemDocumentation: React.FC = () => {
  const { showToast } = useAuth();
  const [activeTab, setActiveTab] = useState<'schema' | 'rbac' | 'integrations' | 'deploy' | 'onboarding' | 'credentials'>('schema');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2500);
    showToast('Code snippet copied to clipboard', 'info');
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="pb-6 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
            Architecture & System Deliverables
          </h1>
          <span className="font-mono text-xs px-2 py-0.5 rounded bg-[#00BFEA]/10 text-[#00BFEA] border border-[#00BFEA]/20 font-bold uppercase">
            Universal Tech INC.
          </span>
        </div>
        <p className="text-sm text-[#BCC7D3] mt-1">
          Complete engineering reference, relational schemas, RBAC matrix, configuration guides, and onboarding manuals.
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-semibold">
        {[
          { id: 'schema', label: '1. Relational Schema', icon: Database },
          { id: 'rbac', label: '2. Role/Permission Matrix', icon: Shield },
          { id: 'integrations', label: '3. Integration Recipes', icon: Key },
          { id: 'deploy', label: '4. Setup & Deployment', icon: Terminal },
          { id: 'onboarding', label: '5. Admin Onboarding', icon: BookOpen },
          { id: 'credentials', label: '6. Pending Credentials', icon: CheckCircle2 },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-[#00BFEA] text-slate-950 font-bold shadow-sm'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 1. RELATIONAL SCHEMA */}
      {activeTab === 'schema' && (
        <div className="space-y-6 text-xs text-slate-300">
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Database className="w-4 h-4 text-[#00BFEA]" />
              <span>Relational Entity Relationship & In-Memory Store</span>
            </h3>
            <p className="leading-relaxed">
              Every tenant-owned entity carries an authoritative <code className="text-[#00BFEA]">organization_id</code>.
              The application server enforces tenant boundaries on all reads, mutations, and download streams.
            </p>

            <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px] text-slate-200 overflow-x-auto leading-relaxed">
{`-- SQL DDL Relational Schema Specification for PostgreSQL / Cloud SQL

CREATE TABLE organizations (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    industry VARCHAR(255),
    contact_email VARCHAR(255) NOT NULL,
    contact_phone VARCHAR(64),
    tier VARCHAR(32) NOT NULL DEFAULT 'Standard',
    status VARCHAR(32) NOT NULL DEFAULT 'onboarding',
    ghl_contact_id VARCHAR(64),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE users (
    id VARCHAR(64) PRIMARY KEY,
    organization_id VARCHAR(64) REFERENCES organizations(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(32) NOT NULL CHECK (role IN ('ut_admin', 'ut_staff', 'client_admin', 'client_member')),
    title VARCHAR(255),
    can_view_billing BOOLEAN DEFAULT FALSE,
    status VARCHAR(32) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE staff_assignments (
    id VARCHAR(64) PRIMARY KEY,
    staff_user_id VARCHAR(64) NOT NULL REFERENCES users(id),
    organization_id VARCHAR(64) NOT NULL REFERENCES organizations(id),
    role_in_org VARCHAR(64) NOT NULL,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE projects (
    id VARCHAR(64) PRIMARY KEY,
    organization_id VARCHAR(64) NOT NULL REFERENCES organizations(id),
    name VARCHAR(255) NOT NULL,
    service_pillar VARCHAR(32) NOT NULL CHECK (service_pillar IN ('staffing', 'it', 'ai')),
    service_title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    agreed_scope TEXT NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'active',
    internal_notes TEXT, -- STRIPPED from client API serialization!
    start_date DATE,
    target_date DATE,
    preview_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE deliverables (
    id VARCHAR(64) PRIMARY KEY,
    project_id VARCHAR(64) NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    organization_id VARCHAR(64) NOT NULL REFERENCES organizations(id),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    current_version VARCHAR(32) NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'draft',
    internal_notes TEXT, -- STRIPPED from client API serialization!
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE deliverable_approvals (
    id VARCHAR(64) PRIMARY KEY,
    deliverable_id VARCHAR(64) NOT NULL REFERENCES deliverables(id) ON DELETE CASCADE,
    version VARCHAR(32) NOT NULL, -- Fixed binding: new versions never inherit old sign-offs
    user_id VARCHAR(64) NOT NULL REFERENCES users(id),
    action VARCHAR(32) NOT NULL CHECK (action IN ('approved', 'revision_requested')),
    feedback TEXT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);`}
            </pre>
          </div>
        </div>
      )}

      {/* 2. RBAC MATRIX */}
      {activeTab === 'rbac' && (
        <div className="space-y-6 text-xs text-slate-300">
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#00BFEA]" />
              <span>Role-Based Access Control (RBAC) Governance Matrix</span>
            </h3>

            <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950/60">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-900 border-b border-slate-800 text-slate-400 uppercase text-[11px]">
                  <tr>
                    <th className="py-3 px-4">Action / Capability</th>
                    <th className="py-3 px-4 text-center">UT Admin</th>
                    <th className="py-3 px-4 text-center">UT Staff</th>
                    <th className="py-3 px-4 text-center">Client Admin</th>
                    <th className="py-3 px-4 text-center">Client Member</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300">
                  <tr>
                    <td className="py-3 px-4 font-sans font-semibold text-white">Cross-Tenant Global Access</td>
                    <td className="py-3 px-4 text-center text-emerald-400 font-bold">YES</td>
                    <td className="py-3 px-4 text-center text-amber-400">Assigned Orgs Only</td>
                    <td className="py-3 px-4 text-center text-[#E94B54]">NO (Own Org)</td>
                    <td className="py-3 px-4 text-center text-[#E94B54]">NO (Own Org)</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-sans font-semibold text-white">View Internal Engineering Notes</td>
                    <td className="py-3 px-4 text-center text-emerald-400 font-bold">YES</td>
                    <td className="py-3 px-4 text-center text-emerald-400 font-bold">YES</td>
                    <td className="py-3 px-4 text-center text-[#E94B54]">BLOCKED</td>
                    <td className="py-3 px-4 text-center text-[#E94B54]">BLOCKED</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-sans font-semibold text-white">Approve Deliverables / Request Revisions</td>
                    <td className="py-3 px-4 text-center text-emerald-400 font-bold">YES</td>
                    <td className="py-3 px-4 text-center text-slate-500">NO</td>
                    <td className="py-3 px-4 text-center text-emerald-400 font-bold">YES</td>
                    <td className="py-3 px-4 text-center text-[#E94B54]">BLOCKED</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-sans font-semibold text-white">View Invoices & Financials</td>
                    <td className="py-3 px-4 text-center text-emerald-400 font-bold">YES</td>
                    <td className="py-3 px-4 text-center text-amber-400">Requires Permission</td>
                    <td className="py-3 px-4 text-center text-emerald-400 font-bold">YES</td>
                    <td className="py-3 px-4 text-center text-[#E94B54]">BLOCKED</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-sans font-semibold text-white">Issue Team Invitations</td>
                    <td className="py-3 px-4 text-center text-emerald-400 font-bold">Global</td>
                    <td className="py-3 px-4 text-center text-slate-500">NO</td>
                    <td className="py-3 px-4 text-center text-emerald-400 font-bold">Own Org Only</td>
                    <td className="py-3 px-4 text-center text-[#E94B54]">BLOCKED</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 3. INTEGRATION RECIPES */}
      {activeTab === 'integrations' && (
        <div className="space-y-6 text-xs text-slate-300">
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Key className="w-4 h-4 text-[#00BFEA]" />
              <span>GoHighLevel Server-Side HMAC Webhook Verification Recipe</span>
            </h3>

            <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px] text-slate-200 overflow-x-auto leading-relaxed">
{`import crypto from 'crypto';
import express from 'express';

export function verifyGhlWebhook(req: express.Request, secret: string): boolean {
  const signature = req.headers['x-ghl-signature'] as string;
  if (!signature) return false;

  const hmac = crypto.createHmac('sha256', secret);
  const digest = hmac.update(JSON.stringify(req.body)).digest('hex');

  // Constant-time buffer comparison to prevent timing attacks
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest));
}`}
            </pre>
          </div>
        </div>
      )}

      {/* 4. SETUP & DEPLOYMENT */}
      {activeTab === 'deploy' && (
        <div className="space-y-6 text-xs text-slate-300">
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Terminal className="w-4 h-4 text-[#00BFEA]" />
              <span>Build & Deployment Guide</span>
            </h3>

            <div className="space-y-2">
              <div className="font-semibold text-white">Local Full-Stack Development:</div>
              <div className="p-3 rounded-lg bg-slate-950 font-mono text-[11px] text-[#00BFEA]">
                npm run dev # Launches server.ts on port 3000 mounting Vite SPA
              </div>
            </div>

            <div className="space-y-2">
              <div className="font-semibold text-white">Production Build & Start:</div>
              <div className="p-3 rounded-lg bg-slate-950 font-mono text-[11px] text-slate-200 space-y-1">
                <div>npm run build # Generates dist/ bundle</div>
                <div>npm run start # Launches production Express server serving dist/</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. ONBOARDING GUIDE */}
      {activeTab === 'onboarding' && (
        <div className="space-y-6 text-xs text-slate-300">
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#00BFEA]" />
              <span>Administrator Onboarding Guide</span>
            </h3>

            <ol className="list-decimal pl-5 space-y-2 leading-relaxed">
              <li>
                <strong>Provision Client Account:</strong> Navigate to{' '}
                <span className="text-white font-semibold">Client Organizations</span> and input legal business name,
                contact email, and service tier.
              </li>
              <li>
                <strong>Assign Staff Specialists:</strong> Assign dedicated technical leads and staffing coordinators
                in <span className="text-white font-semibold">Team & Permissions</span>.
              </li>
              <li>
                <strong>Dispatch Client Admin Invite:</strong> Issue an invitation token to the client champion with 7-day
                expiration.
              </li>
              <li>
                <strong>Configure Integrations:</strong> Enter the GoHighLevel Location ID in{' '}
                <span className="text-white font-semibold">GoHighLevel & Integrations</span> to link CRM contacts and
                opportunity pipelines.
              </li>
            </ol>
          </div>
        </div>
      )}

      {/* 6. PENDING CREDENTIALS & BUSINESS DECISIONS */}
      {activeTab === 'credentials' && (
        <div className="space-y-6 text-xs text-slate-300">
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#00BFEA]" />
              <span>Production Credential Matrix & Business Decisions</span>
            </h3>

            <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950/60 divide-y divide-slate-800 font-mono text-[11px]">
              <div className="p-3.5 flex items-center justify-between">
                <div>
                  <span className="font-bold text-white font-sans">Stripe Payment Gateway Secret</span>
                  <div className="text-slate-400">Required to enable automated online card/ACH settlements</div>
                </div>
                <span className="text-amber-400 uppercase font-bold text-[10px]">Awaiting Key</span>
              </div>
              <div className="p-3.5 flex items-center justify-between">
                <div>
                  <span className="font-bold text-white font-sans">GoHighLevel Production API OAuth Secret</span>
                  <div className="text-slate-400">Required for live sub-account bidirectional sync</div>
                </div>
                <span className="text-emerald-400 uppercase font-bold text-[10px]">Ready for Injection</span>
              </div>
              <div className="p-3.5 flex items-center justify-between">
                <div>
                  <span className="font-bold text-white font-sans">Twilio / SIP Voice Carrier Trunks</span>
                  <div className="text-slate-400">Required for production telephony call answering</div>
                </div>
                <span className="text-emerald-400 uppercase font-bold text-[10px]">Ready for Injection</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
