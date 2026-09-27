import React, { useState, useEffect } from 'react';
import {
  Building2,
  PlusCircle,
  Users,
  Briefcase,
  Layers,
  ChevronRight,
  ShieldCheck,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import { api } from '../../api/client.ts';
import { Organization } from '../../types/index.ts';

export const AdminOrganizations: React.FC = () => {
  const { showToast, permissions } = useAuth();

  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [industry, setIndustry] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [tier, setTier] = useState<'Standard' | 'Growth' | 'Enterprise'>('Standard');
  const [submitting, setSubmitting] = useState(false);

  const loadOrgs = async () => {
    try {
      setLoading(true);
      const data = await api.getOrganizations();
      setOrganizations(data);
    } catch (err: any) {
      showToast(err.message || 'Failed to load organizations', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrgs();
  }, []);

  const handleCreateOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !contactEmail.trim()) {
      showToast('Organization name and contact email are required', 'error');
      return;
    }

    try {
      setSubmitting(true);
      // Call endpoint
      const res = await fetch('/api/organizations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${api.getCurrentUserId()}`,
        },
        body: JSON.stringify({
          name: name.trim(),
          industry: industry.trim(),
          contactEmail: contactEmail.trim(),
          contactPhone: contactPhone.trim(),
          tier,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to provision organization');
      }

      showToast(`Provisioned organization "${name}" successfully`, 'success');
      setModalOpen(false);
      setName('');
      setIndustry('');
      setContactEmail('');
      setContactPhone('');
      await loadOrgs();
    } catch (err: any) {
      showToast(err.message || 'Failed to create organization', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
            Client Organizations
          </h1>
          <p className="text-sm text-[#BCC7D3] mt-1">
            Enterprise tenant directory, staff assignments, SLA tiers, and engagement scopes.
          </p>
        </div>

        {permissions.isAdmin && (
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#00BFEA] hover:bg-[#00BFEA]/90 text-slate-950 font-bold text-xs transition-colors shadow-sm self-start md:self-auto"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Provision Client Account</span>
          </button>
        )}
      </div>

      {/* Organizations Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 animate-pulse">
          <div className="h-48 bg-slate-800 rounded-xl" />
          <div className="h-48 bg-slate-800 rounded-xl" />
          <div className="h-48 bg-slate-800 rounded-xl" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {organizations.map((org) => (
            <div
              key={org.id}
              className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4 text-xs flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <span className="font-mono text-[10px] uppercase px-2 py-0.5 rounded bg-slate-800 text-[#00BFEA] border border-slate-700">
                    Tier: {org.tier}
                  </span>
                  <span
                    className={`font-mono text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                      org.status === 'active'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    }`}
                  >
                    {org.status}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-white">{org.name}</h3>
                  <div className="text-slate-400 text-xs mt-0.5">{org.industry}</div>
                </div>

                <div className="space-y-1 text-[11px] text-slate-400 font-mono pt-2 border-t border-slate-800">
                  <div>Email: {org.contactEmail}</div>
                  <div>Phone: {org.contactPhone || 'N/A'}</div>
                  <div>Account ID: {org.id}</div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-500">
                <span>Active Services: {org.activeServiceIds.length}</span>
                <span className="text-[#00BFEA]">Tenant Isolated</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Provision Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="relative w-full max-w-lg bg-[#111820] border border-slate-700 rounded-2xl shadow-2xl p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[#00BFEA]" />
                <span>Provision Client Organization</span>
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateOrg} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Organization Legal Name <span className="text-[#E94B54]">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Apex Health Systems"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-[#00BFEA]"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Industry Domain</label>
                <input
                  type="text"
                  placeholder="e.g. Clinical Healthcare & Health IT"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-[#00BFEA]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Primary Contact Email <span className="text-[#E94B54]">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="contact@company.com"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    className="w-full p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-[#00BFEA]"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Service SLA Tier</label>
                  <select
                    value={tier}
                    onChange={(e: any) => setTier(e.target.value)}
                    className="w-full p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-100 focus:outline-none focus:border-[#00BFEA]"
                  >
                    <option value="Standard">Standard Tier</option>
                    <option value="Growth">Growth Tier</option>
                    <option value="Enterprise">Enterprise Dedicated</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-lg bg-[#00BFEA] text-slate-950 font-bold hover:bg-[#00BFEA]/90 transition-colors shadow-sm disabled:opacity-50"
                >
                  {submitting ? 'Provisioning...' : 'Provision Tenant'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
