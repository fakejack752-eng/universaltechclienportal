import React, { useState } from 'react';
import {
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Users,
  Code2,
  Cpu,
  Layers,
  FileCheck,
  Clock,
  Sparkles,
  ExternalLink,
  Lock,
  Headphones,
  Calendar,
  ChevronRight,
  BarChart3,
  Bot,
  Globe2,
  Building2,
  ArrowUpRight,
} from 'lucide-react';
import { UniversalTechLogo } from '../../components/common/UniversalTechLogo.tsx';
import { useAuth } from '../../context/AuthContext.tsx';

export const LandingPage: React.FC = () => {
  const { goToLogin, user } = useAuth();
  const [activeTab, setActiveTab] = useState<'staffing' | 'it' | 'ai'>('it');
  const [previewTab, setPreviewTab] = useState<'timeline' | 'reviews' | 'documents' | 'billing'>('timeline');

  return (
    <div className="min-h-screen bg-[#111820] text-slate-100 selection:bg-[#00BFEA]/20 selection:text-[#00BFEA] font-sans">
      {/* Top Public Navigation Header */}
      <header className="sticky top-0 z-50 bg-[#111820]/90 backdrop-blur-md border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <UniversalTechLogo size="md" variant="mark-only" />
            <div>
              <span className="text-base font-extrabold tracking-tight text-white block leading-none">
                UNIVERSAL TECH <span className="text-[#00BFEA]">INC</span>
              </span>
              <span className="text-[10px] tracking-wider text-[#BCC7D3] uppercase font-mono">
                Staffing · IT Dev · AI Automation
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-xs font-semibold text-slate-300">
            <a href="#services" className="hover:text-[#00BFEA] transition-colors">
              Capabilities
            </a>
            <a href="#portal-features" className="hover:text-[#00BFEA] transition-colors">
              Client Portal
            </a>
            <a href="#governance" className="hover:text-[#00BFEA] transition-colors">
              Security & Compliance
            </a>
            <a href="#impact" className="hover:text-[#00BFEA] transition-colors">
              Case Engagements
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={goToLogin}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white border border-slate-700/80 text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
            >
              <span>{user ? 'Enter Dashboard' : 'Client Sign In'}</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#00BFEA]" />
            </button>
            <button
              onClick={goToLogin}
              className="hidden sm:inline-flex px-4 py-2 rounded-xl bg-[#00BFEA] hover:bg-[#00BFEA]/90 text-slate-950 text-xs font-bold transition-all shadow-md shadow-[#00BFEA]/10"
            >
              Explore Demo Portal
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28 border-b border-slate-800/60 bg-radial-[at_top_center] from-[#071B33]/80 via-[#111820] to-[#111820]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-700/80 text-xs font-mono text-[#00BFEA]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>OPERATIONAL EXCELLENCE & VERIFIED DELIVERABLES</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight max-w-4xl mx-auto leading-[1.12]">
            Engineering, Staffing, and AI Automation for{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00BFEA] via-cyan-200 to-white">
              High-Stakes Operations
            </span>
          </h1>

          <p className="text-base sm:text-lg text-[#BCC7D3] max-w-2xl mx-auto leading-relaxed">
            Universal Tech delivers verified talent staffing, full-stack IT development, and real-time AI automation workflows—governed under a transparent client portal with milestone tracking and rigorous security.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button
              onClick={goToLogin}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-[#00BFEA] hover:bg-[#00BFEA]/90 text-slate-950 font-bold text-sm transition-all shadow-lg shadow-[#00BFEA]/20 flex items-center justify-center gap-2"
            >
              <span>Access Client Portal</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <a
              href="#services"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-semibold text-sm transition-all flex items-center justify-center gap-2"
            >
              <span>Explore Core Capabilities</span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </a>
          </div>

          {/* Trust & Performance Metrics Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-12 max-w-4xl mx-auto">
            <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800/80 backdrop-blur-sm text-left space-y-1">
              <div className="text-2xl font-mono font-bold text-white">99.98%</div>
              <div className="text-xs text-slate-400 font-medium">Uptime & Production SLA</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800/80 backdrop-blur-sm text-left space-y-1">
              <div className="text-2xl font-mono font-bold text-[#00BFEA]">&lt; 800ms</div>
              <div className="text-xs text-slate-400 font-medium">Voice AI Response Latency</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800/80 backdrop-blur-sm text-left space-y-1">
              <div className="text-2xl font-mono font-bold text-emerald-400">100%</div>
              <div className="text-xs text-slate-400 font-medium">Milestone Signoff Control</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800/80 backdrop-blur-sm text-left space-y-1">
              <div className="text-2xl font-mono font-bold text-white">SOC-2 / HIPAA</div>
              <div className="text-xs text-slate-400 font-medium">Enterprise Data Isolation</div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Showcase (Three Pillars) */}
      <section id="services" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-3">
          <span className="text-xs font-mono uppercase tracking-wider text-[#00BFEA]">Our Service Pillars</span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
            Integrated Solutions Built for Scale
          </h2>
          <p className="text-sm text-[#BCC7D3] max-w-2xl mx-auto">
            Every engagement is led by dedicated technical leads and client managers with complete operational visibility.
          </p>
        </div>

        {/* Pillar Switcher */}
        <div className="flex justify-center">
          <div className="p-1 bg-slate-900 border border-slate-800 rounded-2xl flex items-center gap-1 text-xs font-bold">
            <button
              onClick={() => setActiveTab('staffing')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all ${
                activeTab === 'staffing' ? 'bg-[#00BFEA] text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Staffing & Consulting</span>
            </button>
            <button
              onClick={() => setActiveTab('it')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all ${
                activeTab === 'it' ? 'bg-[#00BFEA] text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Code2 className="w-4 h-4" />
              <span>IT Development</span>
            </button>
            <button
              onClick={() => setActiveTab('ai')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all ${
                activeTab === 'ai' ? 'bg-[#00BFEA] text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Cpu className="w-4 h-4" />
              <span>AI Automation</span>
            </button>
          </div>
        </div>

        {/* Pillar Content Cards */}
        {activeTab === 'staffing' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in duration-300">
            <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-4 hover:border-slate-700 transition-all">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-[#00BFEA] flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white">Direct Hire & Contingent Staffing</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Pre-screened, verified candidates aligned with your technical stack and culture. Review authorized candidate dossiers, coordinate interview schedules, and give feedback directly through the portal.
              </p>
              <ul className="text-xs text-slate-300 space-y-2 pt-2 border-t border-slate-800">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#00BFEA]" />
                  <span>Technical skill matrix verification</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#00BFEA]" />
                  <span>Transparent placement tracking</span>
                </li>
              </ul>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-4 hover:border-slate-700 transition-all">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white">Healthcare & Clinical Staffing</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Credentialed clinical analysts, Epic/Cerner certified EHR coordinators, and medical administrative professionals. Complete license validation and strict HIPAA background checks.
              </p>
              <ul className="text-xs text-slate-300 space-y-2 pt-2 border-t border-slate-800">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Verified state license credentials</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>HIPAA compliance vetted</span>
                </li>
              </ul>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-4 hover:border-slate-700 transition-all">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center">
                <Building2 className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white">HR & Workforce Coordination</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Operational coordination for timesheet audits, contingent workforce onboarding, statutory compliance, and multi-state contractor governance.
              </p>
              <ul className="text-xs text-slate-300 space-y-2 pt-2 border-t border-slate-800">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" />
                  <span>Worker classification reviews</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" />
                  <span>Centralized compliance records</span>
                </li>
              </ul>
            </div>
          </div>
        )}

        {activeTab === 'it' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in duration-300">
            <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-4 hover:border-slate-700 transition-all">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-[#00BFEA] flex items-center justify-center">
                <Code2 className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white">Custom Web & Cloud Applications</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Full-stack engineering teams delivering modern React, TypeScript, and cloud-native microservices designed for high concurrency and zero-trust security.
              </p>
              <ul className="text-xs text-slate-300 space-y-2 pt-2 border-t border-slate-800">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#00BFEA]" />
                  <span>Live staging preview environments</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#00BFEA]" />
                  <span>Automated CI/CD security scanning</span>
                </li>
              </ul>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-4 hover:border-slate-700 transition-all">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white">MVP & Digital Product Sprints</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                From user story mapping to production MVP, our engineers ship feature-complete digital products with verifiable milestones and sprint demo releases.
              </p>
              <ul className="text-xs text-slate-300 space-y-2 pt-2 border-t border-slate-800">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Milestone acceptance gating</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Figma design tokens & code sync</span>
                </li>
              </ul>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-4 hover:border-slate-700 transition-all">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
                <Globe2 className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white">Offshore Development Centers</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Dedicated engineering squads with US-based tech lead management, aligned working hours, code quality metrics, and clear IP ownership.
              </p>
              <ul className="text-xs text-slate-300 space-y-2 pt-2 border-t border-slate-800">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
                  <span>US Tech Lead architecture oversight</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
                  <span>Sprint velocity & capacity tracking</span>
                </li>
              </ul>
            </div>
          </div>
        )}

        {activeTab === 'ai' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in duration-300">
            <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-4 hover:border-slate-700 transition-all">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-[#00BFEA] flex items-center justify-center">
                <Headphones className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white">24/7 AI Voice Receptionists</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Sub-second latency voice pipelines for inbound call answering, triage routing, appointment booking, and emergency escalations with direct EHR/CRM sync.
              </p>
              <ul className="text-xs text-slate-300 space-y-2 pt-2 border-t border-slate-800">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#00BFEA]" />
                  <span>Sub-second SIP telephony turnaround</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#00BFEA]" />
                  <span>Strict prompt guardrails & failovers</span>
                </li>
              </ul>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-4 hover:border-slate-700 transition-all">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
                <Bot className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white">CRM & GoHighLevel Setup</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Multi-location pipeline configuration, two-way automated SMS triggers, appointment reminders, and automated lead qualification workflows without manual intervention.
              </p>
              <ul className="text-xs text-slate-300 space-y-2 pt-2 border-t border-slate-800">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                  <span>Bidirectional opportunity sync</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                  <span>Carrier dispatch & review funnels</span>
                </li>
              </ul>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-4 hover:border-slate-700 transition-all">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <FileCheck className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white">Document OCR & Data Pipelines</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Automated extraction of structured data from complex invoices, clinical notes, and freight manifests directly into verified operational database records.
              </p>
              <ul className="text-xs text-slate-300 space-y-2 pt-2 border-t border-slate-800">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Schema-validated output parsing</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Exception review audit queues</span>
                </li>
              </ul>
            </div>
          </div>
        )}
      </section>

      {/* Interactive Portal Features Preview */}
      <section id="portal-features" className="py-20 bg-[#071B33]/40 border-y border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-3">
            <span className="text-xs font-mono uppercase tracking-wider text-[#00BFEA]">Client Experience</span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
              The Universal Tech Client Portal
            </h2>
            <p className="text-sm text-[#BCC7D3] max-w-2xl mx-auto">
              Our clients never guess what is happening with their projects, invoices, or deliverables. Everything is tracked in real-time.
            </p>
          </div>

          <div className="bg-[#111820] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
            {/* Feature Tabs */}
            <div className="flex border-b border-slate-800 overflow-x-auto text-xs font-semibold">
              <button
                onClick={() => setPreviewTab('timeline')}
                className={`px-6 py-4 transition-colors flex items-center gap-2 border-b-2 whitespace-nowrap ${
                  previewTab === 'timeline'
                    ? 'border-[#00BFEA] text-[#00BFEA] bg-slate-900/60'
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                <Calendar className="w-4 h-4" />
                <span>Project Timelines & Milestones</span>
              </button>
              <button
                onClick={() => setPreviewTab('reviews')}
                className={`px-6 py-4 transition-colors flex items-center gap-2 border-b-2 whitespace-nowrap ${
                  previewTab === 'reviews'
                    ? 'border-[#00BFEA] text-[#00BFEA] bg-slate-900/60'
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                <FileCheck className="w-4 h-4" />
                <span>Deliverable Review & Approval</span>
              </button>
              <button
                onClick={() => setPreviewTab('documents')}
                className={`px-6 py-4 transition-colors flex items-center gap-2 border-b-2 whitespace-nowrap ${
                  previewTab === 'documents'
                    ? 'border-[#00BFEA] text-[#00BFEA] bg-slate-900/60'
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                <Lock className="w-4 h-4" />
                <span>Secure Document Repository</span>
              </button>
              <button
                onClick={() => setPreviewTab('billing')}
                className={`px-6 py-4 transition-colors flex items-center gap-2 border-b-2 whitespace-nowrap ${
                  previewTab === 'billing'
                    ? 'border-[#00BFEA] text-[#00BFEA] bg-slate-900/60'
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                <span>Transparent Invoicing & Status</span>
              </button>
            </div>

            {/* Preview Panel View */}
            <div className="p-6 md:p-10 bg-slate-950/40">
              {previewTab === 'timeline' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                  <div className="space-y-4">
                    <span className="text-xs font-mono uppercase text-[#00BFEA]">Milestone Tracking</span>
                    <h3 className="text-xl md:text-2xl font-bold text-white">
                      Never Miss a Milestone or Delivery Deadline
                    </h3>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Every project features interactive delivery trajectory curves, comparative status breakdowns, and sprint task boards. Clients have granular visibility into every stage from planning to production.
                    </p>
                    <div className="space-y-2 text-xs text-slate-400">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>Interactive Recharts delivery trajectory analytics</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>Visual radial milestone completion indicators</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>Real-time sprint tasks and client updates</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-3 font-mono text-xs shadow-inner">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                      <span className="text-[#00BFEA]">PROJECT #PROJ-0824</span>
                      <span className="text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">ACTIVE</span>
                    </div>
                    <div className="text-white font-bold text-sm">24/7 Clinical Patient Intake Voice AI</div>
                    <div className="space-y-2 text-[11px] text-slate-400 pt-2">
                      <div className="flex justify-between items-center bg-slate-800/40 p-2 rounded">
                        <span>M1: Clinical Script & Guardrails</span>
                        <span className="text-emerald-400">COMPLETED ✓</span>
                      </div>
                      <div className="flex justify-between items-center bg-slate-800/40 p-2 rounded">
                        <span>M2: Telephony Trunks & Staging</span>
                        <span className="text-emerald-400">COMPLETED ✓</span>
                      </div>
                      <div className="flex justify-between items-center bg-[#00BFEA]/10 border border-[#00BFEA]/30 p-2 rounded text-white">
                        <span>M3: Pilot Staff Call Testing</span>
                        <span className="text-[#00BFEA] font-bold">IN PROGRESS</span>
                      </div>
                      <div className="flex justify-between items-center bg-slate-800/20 p-2 rounded opacity-60">
                        <span>M4: Production Go-Live</span>
                        <span className="text-slate-500">TARGET: OCT 15</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {previewTab === 'reviews' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                  <div className="space-y-4">
                    <span className="text-xs font-mono uppercase text-[#00BFEA]">Governance & Approvals</span>
                    <h3 className="text-xl md:text-2xl font-bold text-white">
                      Formal Deliverable Signoff & Versioning
                    </h3>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Deliverables must be formally reviewed and accepted by authorized client administrators before milestone invoicing. Every approval and revision request is recorded in an immutable audit ledger.
                    </p>
                    <div className="space-y-2 text-xs text-slate-400">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-[#00BFEA]" />
                        <span>One-click Approve or Request Revision with structured feedback</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-[#00BFEA]" />
                        <span>Full version history: v1.0, v1.1, v2.0 with timestamps</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4 font-mono text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-white font-bold">Deliverable v1.2</span>
                      <span className="text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded text-[10px]">AWAITING APPROVAL</span>
                    </div>
                    <div className="text-slate-300 text-xs font-sans">
                      HIPAA Guardrail Architecture & Staging Voice Benchmark Report
                    </div>
                    <div className="flex gap-2 pt-2">
                      <span className="flex-1 py-2 text-center rounded bg-emerald-500 text-slate-950 font-bold font-sans">
                        ✓ Formal Approve
                      </span>
                      <span className="flex-1 py-2 text-center rounded bg-slate-800 text-slate-300 border border-slate-700 font-sans">
                        Request Revision
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {previewTab === 'documents' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                  <div className="space-y-4">
                    <span className="text-xs font-mono uppercase text-[#00BFEA]">Secure Document Vault</span>
                    <h3 className="text-xl md:text-2xl font-bold text-white">
                      Encrypted, Tenant-Isolated File Exchange
                    </h3>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Exchange contracts, specifications, resumes, and invoices securely. Direct URL manipulation and cross-organization document downloads are strictly prohibited by our server-side security layer.
                    </p>
                    <div className="space-y-2 text-xs text-slate-400">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-[#00BFEA]" />
                        <span>Expiring single-use download tokens</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-[#00BFEA]" />
                        <span>Executable file blocking & size verification</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-2.5 font-mono text-xs">
                    <div className="flex items-center justify-between p-2 rounded bg-slate-800/40">
                      <div className="flex items-center gap-2">
                        <Lock className="w-3.5 h-3.5 text-[#00BFEA]" />
                        <span className="text-slate-200">Apex_Master_Services_Agmt.pdf</span>
                      </div>
                      <span className="text-emerald-400 text-[10px]">VERIFIED</span>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded bg-slate-800/40">
                      <div className="flex items-center gap-2">
                        <Lock className="w-3.5 h-3.5 text-[#00BFEA]" />
                        <span className="text-slate-200">Voice_Pipeline_Security_Spec.docx</span>
                      </div>
                      <span className="text-emerald-400 text-[10px]">VERIFIED</span>
                    </div>
                  </div>
                </div>
              )}

              {previewTab === 'billing' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                  <div className="space-y-4">
                    <span className="text-xs font-mono uppercase text-[#00BFEA]">Financial Transparency</span>
                    <h3 className="text-xl md:text-2xl font-bold text-white">
                      Milestone Invoicing & Clean Payment Status
                    </h3>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Only authorized client administrators with billing permissions have access to invoices, remittance instructions, and payment histories.
                    </p>
                    <div className="space-y-2 text-xs text-slate-400">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-[#00BFEA]" />
                        <span>Automated itemized billing linked directly to project deliverables</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-[#00BFEA]" />
                        <span>Clear wire/ACH payment coordination without hidden fees</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-3 font-mono text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-white font-bold">INVOICE #INV-2026-001</span>
                      <span className="text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded text-[10px]">PAID IN FULL</span>
                    </div>
                    <div className="text-xl font-bold text-white">$14,500.00 USD</div>
                    <div className="text-[11px] text-slate-400">Milestone 1 Clinical Intake Voice Pipeline Signoff</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Security & Governance Highlight */}
      <section id="governance" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-3">
          <span className="text-xs font-mono uppercase tracking-wider text-[#00BFEA]">Zero-Trust Architecture</span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
            Security & Compliance Built In
          </h2>
          <p className="text-sm text-[#BCC7D3] max-w-2xl mx-auto">
            Hiding interface buttons is not sufficient. Universal Tech enforces access control on the server and data-access layer.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
            <Lock className="w-6 h-6 text-[#00BFEA]" />
            <h4 className="text-sm font-bold text-white">Strict Tenant Isolation</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Every client organization is strictly isolated. Attempted cross-tenant database access or token spoofing produces immediate 403 Forbidden rejection and an audit alert.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
            <ShieldCheck className="w-6 h-6 text-emerald-400" />
            <h4 className="text-sm font-bold text-white">Tamper-Evident Audit Ledger</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Every critical action—logins, deliverable approvals, invite creation, and document downloads—is immutably recorded with timestamps, user IDs, and client IP addresses.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
            <Users className="w-6 h-6 text-purple-400" />
            <h4 className="text-sm font-bold text-white">Role-Based Governance (RBAC)</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Distinguishes between Universal Tech Admins, assigned Staff, Client Administrators, and Client Members. Staff can only access clients to which they are explicitly assigned.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
            <FileCheck className="w-6 h-6 text-amber-400" />
            <h4 className="text-sm font-bold text-white">Expiring Verified Invites</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Invitation-only onboarding with cryptographic expiring tokens. Users can never self-assign elevated privileges or bypass organizational boundary checks.
            </p>
          </div>
        </div>
      </section>

      {/* Case Engagements / Proof */}
      <section id="impact" className="py-20 bg-slate-950/40 border-t border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-3">
            <span className="text-xs font-mono uppercase tracking-wider text-[#00BFEA]">Client Engagements</span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
              Trusted by Operational Leaders
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-8 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-[#00BFEA] px-2.5 py-1 rounded bg-[#00BFEA]/10 border border-[#00BFEA]/20">
                  HEALTHCARE & CLINICAL AI
                </span>
                <span className="text-xs font-mono text-slate-500">Apex Health Systems</span>
              </div>
              <h3 className="text-lg font-bold text-white">
                "Sub-second voice intake that actually integrates with AthenaHealth."
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Universal Tech engineered a dedicated 24/7 AI voice receptionist handling patient intake and triage scheduling while placing 3 specialized Epic-certified analysts. Milestone delivery was 100% transparent.
              </p>
              <div className="pt-3 border-t border-slate-800 text-xs font-mono text-slate-400 flex items-center justify-between">
                <span>Dr. Elena Rodriguez, VP Operations</span>
                <span className="text-emerald-400">Enterprise Client</span>
              </div>
            </div>

            <div className="p-8 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-[#00BFEA] px-2.5 py-1 rounded bg-[#00BFEA]/10 border border-[#00BFEA]/20">
                  LOGISTICS & CRM AUTOMATION
                </span>
                <span className="text-xs font-mono text-slate-500">Nexus Logistics Global</span>
              </div>
              <h3 className="text-lg font-bold text-white">
                "Zero lead loss across 14 dispatch hubs with custom GoHighLevel sync."
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Re-architected our carrier dispatch pipelines, automated real-time SMS triggers, and coordinated operational shift staffing. Every deliverable was signed off with zero downtime.
              </p>
              <div className="pt-3 border-t border-slate-800 text-xs font-mono text-slate-400 flex items-center justify-between">
                <span>Robert Vance, Chief Operating Officer</span>
                <span className="text-emerald-400">Growth Client</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Footer Banner */}
      <section className="py-20 border-t border-slate-800/80 bg-radial-[at_top_center] from-[#071B33]/80 via-[#111820] to-[#111820]">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Ready to Accelerate Your Enterprise Operations?
          </h2>
          <p className="text-sm text-[#BCC7D3] max-w-xl mx-auto leading-relaxed">
            Sign in to your client workspace, review active sprints and milestone deliverables, or test our full operational environment with verified personas.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <button
              onClick={goToLogin}
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-[#00BFEA] hover:bg-[#00BFEA]/90 text-slate-950 font-bold text-sm transition-all shadow-xl shadow-[#00BFEA]/20 flex items-center justify-center gap-2"
            >
              <span>Enter Client Portal</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={goToLogin}
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-bold text-sm transition-all"
            >
              Explore Verified Demo Accounts
            </button>
          </div>
        </div>
      </section>

      {/* Public Footer */}
      <footer className="border-t border-slate-800 py-12 bg-[#0d131a] text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <UniversalTechLogo size="sm" variant="mark-only" />
            <div>
              <span className="font-bold text-white">Universal Tech INC.</span>
              <span className="block text-[11px] text-slate-500">
                Staffing · Consulting · IT Development · AI Automation
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-[11px]">
            <a href="#services" className="hover:text-white transition-colors">
              Services
            </a>
            <a href="#portal-features" className="hover:text-white transition-colors">
              Client Portal
            </a>
            <a href="#governance" className="hover:text-white transition-colors">
              Security
            </a>
            <button onClick={goToLogin} className="text-[#00BFEA] hover:underline font-bold">
              Sign In
            </button>
          </div>

          <div className="text-[11px] text-slate-500 font-mono">
            © 2026 Universal Tech INC. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};
