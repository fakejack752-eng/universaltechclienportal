import React, { useState, useEffect } from 'react';
import {
  Briefcase,
  Code2,
  Cpu,
  PlusCircle,
  CheckCircle2,
  Search,
  Filter,
  ArrowRight,
  X,
  FileCheck,
  ShieldAlert,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import { api } from '../../api/client.ts';
import { ServiceCatalogItem } from '../../types/index.ts';

export const ClientServices: React.FC = () => {
  const { organization, showToast, setCurrentView } = useAuth();

  const [catalog, setCatalog] = useState<ServiceCatalogItem[]>([]);
  const [selectedPillar, setSelectedPillar] = useState<'all' | 'staffing' | 'it' | 'ai'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [requestModalService, setRequestModalService] = useState<ServiceCatalogItem | null>(null);

  // Form State
  const [businessNeed, setBusinessNeed] = useState('');
  const [desiredOutcome, setDesiredOutcome] = useState('');
  const [preferredTimeframe, setPreferredTimeframe] = useState('Within 30 Days');
  const [budgetRange, setBudgetRange] = useState('$10,000 - $25,000');
  const [hiringRoleTitle, setHiringRoleTitle] = useState('');
  const [hiringLocation, setHiringLocation] = useState('');
  const [hiringEmploymentType, setHiringEmploymentType] = useState<'Direct Hire' | 'Contract' | 'Temp-to-Hire' | 'Full-time'>('Direct Hire');
  const [hiringHeadcount, setHiringHeadcount] = useState(1);
  const [hiringResponsibilities, setHiringResponsibilities] = useState('');
  const [hiringQualifications, setHiringQualifications] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function loadServices() {
      try {
        const data = await api.getServicesCatalog();
        setCatalog(data);
      } catch (err) {
        console.error('Failed to load services', err);
      }
    }
    loadServices();
  }, []);

  const activeServiceIds = organization?.activeServiceIds || [];

  const filteredServices = catalog.filter((svc) => {
    const matchesPillar = selectedPillar === 'all' || svc.pillar === selectedPillar;
    const matchesSearch =
      svc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      svc.shortDesc.toLowerCase().includes(searchQuery.toLowerCase()) ||
      svc.features.some((f) => f.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesPillar && matchesSearch;
  });

  const handleOpenRequestModal = (svc: ServiceCatalogItem) => {
    setRequestModalService(svc);
    setBusinessNeed('');
    setDesiredOutcome('');
    setPreferredTimeframe('Within 30 Days');
    setBudgetRange('$15,000 - $30,000');
    setHiringRoleTitle('');
    setHiringLocation('');
    setHiringHeadcount(1);
    setHiringResponsibilities('');
    setHiringQualifications('');
  };

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestModalService) return;

    if (!businessNeed.trim() || !desiredOutcome.trim()) {
      showToast('Please provide both the business need and desired outcome', 'error');
      return;
    }

    try {
      setSubmitting(true);
      await api.submitServiceRequest({
        serviceId: requestModalService.id,
        businessNeed,
        desiredOutcome,
        preferredTimeframe,
        budgetRange,
        hiringDetails: requestModalService.requiresHiringSpec
          ? {
              roleTitle: hiringRoleTitle || requestModalService.title,
              location: hiringLocation || 'Remote / Hybrid',
              employmentType: hiringEmploymentType,
              headcount: Number(hiringHeadcount) || 1,
              startTimeline: preferredTimeframe,
              responsibilities: hiringResponsibilities || 'Detailed in attached briefing document',
              requiredQualifications: hiringQualifications || 'Standard domain certification and verified track record',
            }
          : undefined,
      });

      showToast(`Service request for "${requestModalService.title}" submitted successfully!`, 'success');
      setRequestModalService(null);
      setCurrentView('requests');
    } catch (err: any) {
      showToast(err.message || 'Failed to submit service request', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
            Universal Tech Services
          </h1>
          <p className="text-sm text-[#BCC7D3] mt-1">
            Enterprise solutions spanning Staffing & Consulting, IT Development, and AI Automation.
          </p>
        </div>

        {/* Filter Controls (Segmented Tabs complying with anti-slop rules) */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-xl">
          <button
            onClick={() => setSelectedPillar('all')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              selectedPillar === 'all'
                ? 'bg-[#00BFEA] text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            All Offerings ({catalog.length})
          </button>
          <button
            onClick={() => setSelectedPillar('staffing')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
              selectedPillar === 'staffing'
                ? 'bg-[#00BFEA] text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>Staffing & Consulting</span>
          </button>
          <button
            onClick={() => setSelectedPillar('it')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
              selectedPillar === 'it'
                ? 'bg-[#00BFEA] text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>IT Development</span>
          </button>
          <button
            onClick={() => setSelectedPillar('ai')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
              selectedPillar === 'ai'
                ? 'bg-[#00BFEA] text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>AI Automation</span>
          </button>
        </div>
      </div>

      {/* Search Input Bar */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Filter by capability, tech stack, or service title..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-4 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-[#00BFEA]"
        />
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredServices.map((svc) => {
          const isActiveForClient = activeServiceIds.includes(svc.id);

          return (
            <div
              key={svc.id}
              className={`p-5 rounded-xl border flex flex-col justify-between transition-all ${
                isActiveForClient
                  ? 'bg-slate-900/90 border-[#00BFEA]/40 shadow-[0_0_15px_rgba(0,191,234,0.08)]'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#BCC7D3] px-2 py-0.5 rounded bg-slate-800 border border-slate-700">
                    {svc.category}
                  </span>
                  {isActiveForClient && (
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1 font-semibold">
                      <CheckCircle2 className="w-3 h-3" /> Active Engagement
                    </span>
                  )}
                </div>

                <h3 className="text-base font-bold text-white">{svc.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{svc.fullDesc}</p>

                {/* Features List */}
                <div className="pt-2 space-y-1">
                  <div className="text-[11px] font-mono text-[#00BFEA] uppercase tracking-wide">Key Capabilities</div>
                  <ul className="text-xs text-slate-300 space-y-1">
                    {svc.features.map((feat, idx) => (
                      <li key={idx} className="flex items-center gap-1.5">
                        <span className="w-1 h-1 rounded-full bg-[#00BFEA]" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-5 mt-4 border-t border-slate-800">
                <button
                  onClick={() => handleOpenRequestModal(svc)}
                  className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-slate-800 hover:bg-[#00BFEA] text-slate-200 hover:text-slate-950 font-semibold text-xs transition-colors border border-slate-700 hover:border-[#00BFEA]"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Request Proposal / Scope</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Service Request Drawer / Modal */}
      {requestModalService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-[#111820] border border-slate-700 rounded-2xl shadow-2xl p-6 md:p-8 space-y-6 my-8 animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-800 pb-4">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#00BFEA]">
                  New Service Scope Request
                </span>
                <h2 className="text-xl font-bold text-white mt-1">{requestModalService.title}</h2>
                <div className="text-xs text-[#BCC7D3]">{requestModalService.category}</div>
              </div>
              <button
                onClick={() => setRequestModalService(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Legal / Operational Notice */}
            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-slate-400 leading-relaxed flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 text-[#00BFEA] shrink-0 mt-0.5" />
              <span>
                Submitting a service request records your operational need and notifies Universal Tech architects.
                It initiates discovery and does not automatically authorize billing, commit contracts, or guarantee delivery dates.
              </span>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmitRequest} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Business Need & Background <span className="text-[#E94B54]">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Describe the operational challenge, bottleneck, or growth objective..."
                  value={businessNeed}
                  onChange={(e) => setBusinessNeed(e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-[#00BFEA]"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Desired Outcome & Deliverables <span className="text-[#E94B54]">*</span>
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="What does success look like? (e.g. 3 Epic certified analysts on-site, 24/7 Voice AI answering 95% of calls)"
                  value={desiredOutcome}
                  onChange={(e) => setDesiredOutcome(e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-[#00BFEA]"
                />
              </div>

              {/* Staffing Specific Fields if required */}
              {requestModalService.requiresHiringSpec && (
                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Briefcase className="w-4 h-4 text-[#00BFEA]" />
                    <span>Hiring Specification Details</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-400 mb-1">Target Role Title</label>
                      <input
                        type="text"
                        placeholder="e.g. Senior Epic Cadence Analyst"
                        value={hiringRoleTitle}
                        onChange={(e) => setHiringRoleTitle(e.target.value)}
                        className="w-full p-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 focus:border-[#00BFEA] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1">Location / Work Arrangement</label>
                      <input
                        type="text"
                        placeholder="e.g. Chicago, IL (Hybrid) or Fully Remote"
                        value={hiringLocation}
                        onChange={(e) => setHiringLocation(e.target.value)}
                        className="w-full p-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 focus:border-[#00BFEA] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1">Employment Type</label>
                      <select
                        value={hiringEmploymentType}
                        onChange={(e: any) => setHiringEmploymentType(e.target.value)}
                        className="w-full p-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 focus:border-[#00BFEA] focus:outline-none"
                      >
                        <option value="Direct Hire">Direct Hire (Permanent Search)</option>
                        <option value="Contract">Contract / Project-Based</option>
                        <option value="Temp-to-Hire">Temp-to-Hire</option>
                        <option value="Full-time">Retained Executive Search</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1">Headcount Required</label>
                      <input
                        type="number"
                        min="1"
                        max="50"
                        value={hiringHeadcount}
                        onChange={(e) => setHiringHeadcount(parseInt(e.target.value, 10))}
                        className="w-full p-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 focus:border-[#00BFEA] focus:outline-none font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Timeframe and Budget */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Preferred Timeframe</label>
                  <select
                    value={preferredTimeframe}
                    onChange={(e) => setPreferredTimeframe(e.target.value)}
                    className="w-full p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-100 focus:border-[#00BFEA] focus:outline-none"
                  >
                    <option value="Immediate (within 2 weeks)">Immediate (within 2 weeks)</option>
                    <option value="Within 30 Days">Within 30 Days</option>
                    <option value="Next Quarter (Q4)">Next Quarter (Q4)</option>
                    <option value="Strategic Exploration / Scoping">Strategic Exploration / Scoping</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Target Budget Range (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. $25k - $50k or Hourly target"
                    value={budgetRange}
                    onChange={(e) => setBudgetRange(e.target.value)}
                    className="w-full p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-100 focus:border-[#00BFEA] focus:outline-none"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setRequestModalService(null)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-lg bg-[#00BFEA] text-slate-950 font-bold hover:bg-[#00BFEA]/90 transition-colors shadow-sm disabled:opacity-50"
                >
                  {submitting ? 'Submitting...' : 'Submit Service Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
