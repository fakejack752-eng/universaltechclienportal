import React, { useState, useEffect } from 'react';
import {
  GitBranch,
  ShieldCheck,
  RefreshCw,
  Key,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Database,
  Lock,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import { api } from '../../api/client.ts';
import { Organization } from '../../types/index.ts';

export const AdminIntegrations: React.FC = () => {
  const { showToast } = useAuth();

  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [selectedOrgId, setSelectedOrgId] = useState<string>('org_apex_health');
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  // Form Edit State
  const [locationId, setLocationId] = useState('');
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [webhookSecretInput, setWebhookSecretInput] = useState('');
  const [saving, setSaving] = useState(false);

  const loadData = async (orgId: string) => {
    try {
      setLoading(true);
      const [orgList, cfg] = await Promise.all([
        api.getOrganizations(),
        api.getGhlConfig(orgId),
      ]);
      setOrganizations(orgList);
      setConfig(cfg);
      setLocationId(cfg.locationId || '');
    } catch (err: any) {
      showToast(err.message || 'Failed to load integration settings', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(selectedOrgId);
  }, [selectedOrgId]);

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await api.configureGhl({
        organizationId: selectedOrgId,
        locationId,
        apiKey: apiKeyInput.trim() || undefined,
        webhookSecret: webhookSecretInput.trim() || undefined,
      });
      showToast('GoHighLevel server-side credentials saved', 'success');
      setApiKeyInput('');
      setWebhookSecretInput('');
      await loadData(selectedOrgId);
    } catch (err: any) {
      showToast(err.message || 'Failed to save integration config', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleTriggerSync = async () => {
    try {
      setSyncing(true);
      const res = await api.syncGhl(selectedOrgId);
      showToast(
        `Sync completed: ${res.summary.contactsSynced} contacts, ${res.summary.opportunitiesUpdated} opportunities updated`,
        'success'
      );
      await loadData(selectedOrgId);
    } catch (err: any) {
      showToast(err.message || 'Sync failed', 'error');
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
            GoHighLevel & CRM Synchronizer
          </h1>
          <p className="text-sm text-[#BCC7D3] mt-1">
            Server-side token management, explicit field ownership definitions, and webhook idempotency protection.
          </p>
        </div>

        {/* Org Selector */}
        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-400 font-mono">Client Account:</label>
          <select
            value={selectedOrgId}
            onChange={(e) => setSelectedOrgId(e.target.value)}
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-100 focus:border-[#00BFEA] focus:outline-none"
          >
            {organizations.map((o) => (
              <option key={o.id} value={o.id}>
                {o.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Security Architecture Guarantees */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2 text-xs">
        <div className="flex items-center gap-2 font-bold text-white">
          <ShieldCheck className="w-4 h-4 text-[#00BFEA]" />
          <span>Zero-Trust Integration Security Invariants</span>
        </div>
        <ul className="text-slate-300 space-y-1 list-disc pl-4 leading-relaxed">
          <li>
            <strong>Server-Side Only:</strong> API keys and OAuth tokens are strictly stored on the backend. No
            tokens are exposed in browser storage or client bundles.
          </li>
          <li>
            <strong>Explicit Field Ownership:</strong> Prevents synchronization loops by assigning authoritative
            ownership per field between Universal Tech Portal and GoHighLevel.
          </li>
          <li>
            <strong>Tenant Boundary Enforcement:</strong> Every sync payload requires explicit organization ID binding,
            preventing cross-client CRM data contamination.
          </li>
        </ul>
      </div>

      {loading ? (
        <div className="p-8 space-y-4 animate-pulse">
          <div className="h-44 bg-slate-800 rounded-xl" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Configuration Form (Left 1 col) */}
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-5 text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Key className="w-4 h-4 text-[#00BFEA]" />
                <span>GoHighLevel Sub-Account Setup</span>
              </h3>
              <span
                className={`font-mono text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${
                  config?.status === 'active'
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                }`}
              >
                {config?.status || 'unconfigured'}
              </span>
            </div>

            <form onSubmit={handleSaveConfig} className="space-y-4">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">GHL Location ID</label>
                <input
                  type="text"
                  placeholder="loc_apex_hl_99182"
                  value={locationId}
                  onChange={(e) => setLocationId(e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-[#00BFEA] font-mono text-[11px]"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  API Key / OAuth Bearer Token {config?.apiKeyMasked && `(${config.apiKeyMasked})`}
                </label>
                <input
                  type="password"
                  placeholder="Paste live server-side token to update..."
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-[#00BFEA] font-mono text-[11px]"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Inbound Webhook Secret {config?.webhookSecretMasked && `(${config.webhookSecretMasked})`}
                </label>
                <input
                  type="password"
                  placeholder="whsec_••••••••••••••••"
                  value={webhookSecretInput}
                  onChange={(e) => setWebhookSecretInput(e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-[#00BFEA] font-mono text-[11px]"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full py-2.5 rounded-lg bg-[#00BFEA] text-slate-950 font-bold hover:bg-[#00BFEA]/90 transition-colors shadow-sm disabled:opacity-50"
                >
                  {saving ? 'Updating Vault...' : 'Save Configuration'}
                </button>
              </div>
            </form>

            {/* Sync Trigger */}
            <div className="pt-4 border-t border-slate-800 space-y-2">
              <div className="text-[11px] text-slate-400 font-mono">
                Last Synchronized: {config?.lastSyncTimestamp ? new Date(config.lastSyncTimestamp).toLocaleString() : 'Never'}
              </div>
              <button
                type="button"
                onClick={handleTriggerSync}
                disabled={syncing || !config?.isConnected}
                className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
                <span>Trigger Manual Sync Cycle</span>
              </button>
            </div>
          </div>

          {/* Explicit Field Mappings Table (Right 2 cols) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Database className="w-4 h-4 text-[#00BFEA]" />
                <span>Explicit Field Ownership & Mappings</span>
              </h3>
              <span className="text-[11px] font-mono text-slate-400">Bidirectional Isolation</span>
            </div>

            <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-900/60">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase text-[11px]">
                  <tr>
                    <th className="py-3 px-4">Portal Schema Field</th>
                    <th className="py-3 px-4">GHL Custom Field</th>
                    <th className="py-3 px-4">Authoritative Owner</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300">
                  {config?.fieldMappings?.map((map: any, idx: number) => (
                    <tr key={idx} className="hover:bg-slate-800/40">
                      <td className="py-3 px-4 text-[#00BFEA]">{map.portalField}</td>
                      <td className="py-3 px-4">{map.ghlField}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                            map.owner === 'UniversalTechPortal'
                              ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                              : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          }`}
                        >
                          {map.owner}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Inbound Webhook Endpoint Display */}
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2 text-xs">
              <div className="font-semibold text-white">Inbound Webhook Relay URL</div>
              <div className="p-2.5 rounded bg-slate-950 border border-slate-800 font-mono text-[11px] text-[#00BFEA] select-all break-all">
                https://ais-dev-3fzjg2zhgmxlq5wqd37ykf-234173622839.asia-east1.run.app/api/integrations/gohighlevel/webhook
              </div>
              <p className="text-[11px] text-slate-400">
                Configure this webhook in your GoHighLevel Workflow Automation. Webhooks require{' '}
                <span className="font-mono text-white">x-ghl-signature</span> verification.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
