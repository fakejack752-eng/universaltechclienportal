import React, { useState, useEffect } from 'react';
import {
  Layers,
  ArrowRight,
  Calendar,
  CheckCircle2,
  Clock,
  Filter,
  PlusCircle,
  Briefcase,
  ExternalLink,
  LineChart,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import { api } from '../../api/client.ts';
import { Project } from '../../types/index.ts';
import { ProjectDetail } from './ProjectDetail.tsx';
import { ProjectTimeline } from '../../components/projects/ProjectTimeline.tsx';
import { RadialProgress } from '../../components/common/RadialProgress.tsx';

export const ClientProjects: React.FC = () => {
  const { selectedProjectId, setSelectedProjectId, setCurrentView, permissions } = useAuth();

  const [projects, setProjects] = useState<Project[]>([]);
  const [filterPillar, setFilterPillar] = useState<'all' | 'staffing' | 'it' | 'ai'>('all');
  const [loading, setLoading] = useState(true);
  const [showTimeline, setShowTimeline] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const data = await api.getProjects();
        setProjects(data);
      } catch (err) {
        console.error('Failed to load projects', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // If a project is selected, render the detail view!
  if (selectedProjectId) {
    return <ProjectDetail projectId={selectedProjectId} onBack={() => setSelectedProjectId(null)} />;
  }

  const filtered = projects.filter((p) => {
    if (filterPillar === 'all') return true;
    return p.servicePillar === filterPillar;
  });

  if (loading) {
    return (
      <div className="p-8 max-w-7xl mx-auto space-y-6 animate-pulse">
        <div className="h-8 bg-slate-800 rounded w-1/3" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="h-44 bg-slate-800 rounded-xl" />
          <div className="h-44 bg-slate-800 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
            Projects & Engagements
          </h1>
          <p className="text-sm text-[#BCC7D3] mt-1">
            Active project workspaces, agreed deliverables, sprint tasks, and review workflows.
          </p>
        </div>

        {/* Filter and View Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Timeline View Toggle Button */}
          <button
            onClick={() => setShowTimeline(!showTimeline)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-colors ${
              showTimeline
                ? 'bg-[#00BFEA]/15 text-[#00BFEA] border-[#00BFEA]/40'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
            }`}
          >
            <LineChart className="w-3.5 h-3.5" />
            <span>{showTimeline ? 'Hide Timeline' : 'Show Timeline'}</span>
          </button>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setFilterPillar('all')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                filterPillar === 'all' ? 'bg-[#00BFEA] text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              All ({projects.length})
            </button>
            <button
              onClick={() => setFilterPillar('staffing')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                filterPillar === 'staffing' ? 'bg-[#00BFEA] text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Staffing
            </button>
            <button
              onClick={() => setFilterPillar('it')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                filterPillar === 'it' ? 'bg-[#00BFEA] text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              IT Dev
            </button>
            <button
              onClick={() => setFilterPillar('ai')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                filterPillar === 'ai' ? 'bg-[#00BFEA] text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              AI Automation
            </button>
          </div>
        </div>
      </div>

      {/* Project Timeline Visualization Component */}
      {showTimeline && filtered.length > 0 && (
        <ProjectTimeline
          projects={filtered}
          onSelectProject={(projId) => setSelectedProjectId(projId)}
        />
      )}

      {filtered.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-slate-900/40 border border-slate-800 space-y-3">
          <Layers className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-white">No Projects in this category</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Ready to initiate a new engagement? Submit a service request to start scoping with our architects.
          </p>
          <div className="pt-2">
            <button
              onClick={() => setCurrentView('requests')}
              className="px-4 py-2 rounded-lg bg-[#00BFEA] text-slate-950 text-xs font-bold hover:bg-[#00BFEA]/90 transition-colors"
            >
              Request a Project
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filtered.map((proj) => {
            const completedMilestones = proj.milestones.filter((m) => m.status === 'completed').length;
            const totalMilestones = proj.milestones.length;

            return (
              <div
                key={proj.id}
                onClick={() => setSelectedProjectId(proj.id)}
                className="cursor-pointer p-6 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all space-y-4 group"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#00BFEA] px-2 py-0.5 rounded bg-[#00BFEA]/10 border border-[#00BFEA]/20">
                      {proj.serviceTitle}
                    </span>
                    <h3 className="text-base font-bold text-white mt-2 group-hover:text-[#00BFEA] transition-colors">
                      {proj.name}
                    </h3>
                  </div>
                  <span className="text-xs font-mono uppercase px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0 font-semibold">
                    {proj.status}
                  </span>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">{proj.description}</p>

                {/* Milestones Progress with Radial Indicator */}
                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-4">
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center justify-between text-xs text-[#BCC7D3]">
                      <span>Milestones Tracked</span>
                      <span className="font-mono text-white tabular-nums">
                        {completedMilestones} / {totalMilestones} Completed
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#00BFEA] to-emerald-400 transition-all duration-500"
                        style={{
                          width: totalMilestones > 0 ? `${(completedMilestones / totalMilestones) * 100}%` : '0%',
                        }}
                      />
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                      <span>Target: {proj.targetDate}</span>
                      {completedMilestones === totalMilestones && totalMilestones > 0 && (
                        <span className="text-emerald-400 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Fully Delivered
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Radial Progress Display */}
                  <div className="shrink-0 flex items-center justify-center pl-1">
                    <RadialProgress
                      value={totalMilestones > 0 ? (completedMilestones / totalMilestones) * 100 : 0}
                      size={48}
                      strokeWidth={4.5}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-800/60 font-mono">
                  <span className="text-[11px] text-slate-400 font-mono">
                    {totalMilestones - completedMilestones > 0
                      ? `${totalMilestones - completedMilestones} milestone${totalMilestones - completedMilestones > 1 ? 's' : ''} remaining`
                      : 'All milestones completed'}
                  </span>
                  <span className="text-[#00BFEA] flex items-center gap-1 font-semibold group-hover:translate-x-0.5 transition-transform font-sans">
                    Open Workspace <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
