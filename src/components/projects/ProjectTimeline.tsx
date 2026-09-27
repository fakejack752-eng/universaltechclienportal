import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
  PieChart,
  Pie,
} from 'recharts';
import {
  Calendar,
  CheckCircle2,
  Clock,
  TrendingUp,
  BarChart3,
  PieChart as PieChartIcon,
  ChevronRight,
  Filter,
  Layers,
  Sparkles,
  AlertCircle,
} from 'lucide-react';
import { Project, ProjectMilestone } from '../../types/index.ts';

interface ProjectTimelineProps {
  projects: Project[];
  selectedProjectId?: string | null;
  onSelectProject?: (projectId: string) => void;
  className?: string;
  compact?: boolean;
}

type TimelineViewMode = 'trajectory' | 'comparison' | 'distribution' | 'schedule';

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

// Custom tooltip styled to match Universal Tech brand guidelines
const CustomTimelineTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-[#111820] border border-slate-700/80 p-3 rounded-xl shadow-2xl text-xs space-y-1.5 backdrop-blur-md min-w-[200px] z-50">
        <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
          <span className="font-mono text-slate-400 text-[10px]">{label || data.date || data.name}</span>
          {data.status && (
            <span
              className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded font-bold ${
                data.status === 'completed'
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : data.status === 'in_progress'
                  ? 'bg-[#00BFEA]/10 text-[#00BFEA] border border-[#00BFEA]/20'
                  : 'bg-slate-800 text-slate-400 border border-slate-700'
              }`}
            >
              {data.status.replace('_', ' ')}
            </span>
          )}
        </div>

        {data.title && (
          <div className="font-semibold text-white text-xs leading-snug">{data.title}</div>
        )}

        {data.projectName && (
          <div className="text-[11px] text-[#00BFEA] flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00BFEA]" />
            <span>{data.projectName}</span>
          </div>
        )}

        {payload.map((entry: any, index: number) => {
          if (!entry.value && entry.value !== 0) return null;
          return (
            <div key={`item-${index}`} className="flex items-center justify-between text-[11px] pt-1 text-slate-300">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                <span>{entry.name}:</span>
              </span>
              <span className="font-mono font-bold text-white tabular-nums">
                {entry.value}
                {entry.unit || ''}
              </span>
            </div>
          );
        })}
      </div>
    );
  }
  return null;
};

export const ProjectTimeline: React.FC<ProjectTimelineProps> = ({
  projects,
  selectedProjectId,
  onSelectProject,
  className = '',
  compact = false,
}) => {
  const [activeProjectFilter, setActiveProjectFilter] = useState<string>(
    selectedProjectId || 'all'
  );
  const [viewMode, setViewMode] = useState<TimelineViewMode>('trajectory');

  // Filter projects based on dropdown/selector
  const displayedProjects = useMemo(() => {
    if (activeProjectFilter === 'all') {
      return projects;
    }
    return projects.filter((p) => p.id === activeProjectFilter);
  }, [projects, activeProjectFilter]);

  // Extract all milestones across displayed projects
  const allMilestones = useMemo(() => {
    return displayedProjects.flatMap((proj) =>
      proj.milestones.map((m) => ({
        ...m,
        projectId: proj.id,
        projectName: proj.name,
        serviceTitle: proj.serviceTitle,
      }))
    );
  }, [displayedProjects]);

  // Aggregate Metrics
  const stats = useMemo(() => {
    const total = allMilestones.length;
    const completed = allMilestones.filter((m) => m.status === 'completed').length;
    const inProgress = allMilestones.filter((m) => m.status === 'in_progress').length;
    const pending = allMilestones.filter((m) => m.status === 'pending').length;
    const progressPct = total > 0 ? Math.round((completed / total) * 100) : 0;

    // Find next upcoming milestone
    const upcoming = [...allMilestones]
      .filter((m) => m.status !== 'completed')
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())[0];

    return { total, completed, inProgress, pending, progressPct, upcoming };
  }, [allMilestones]);

  // Data for Trajectory (Cumulative Progress Over Time)
  const trajectoryData = useMemo(() => {
    if (allMilestones.length === 0) return [];

    // Sort milestones chronologically
    const sorted = [...allMilestones].sort(
      (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
    );

    let cumulativeCompleted = 0;
    let cumulativePlanned = 0;

    return sorted.map((m, index) => {
      cumulativePlanned += 1;
      if (m.status === 'completed') {
        cumulativeCompleted += 1;
      }
      return {
        date: m.dueDate,
        title: m.title,
        status: m.status,
        projectName: m.projectName,
        plannedMilestones: cumulativePlanned,
        completedMilestones: cumulativeCompleted,
        completionRate: Math.round((cumulativeCompleted / cumulativePlanned) * 100),
      };
    });
  }, [allMilestones]);

  // Data for Project Comparison (Milestone Status by Project)
  const comparisonData = useMemo(() => {
    return projects.map((proj) => {
      const completed = proj.milestones.filter((m) => m.status === 'completed').length;
      const inProgress = proj.milestones.filter((m) => m.status === 'in_progress').length;
      const pending = proj.milestones.filter((m) => m.status === 'pending').length;
      const total = proj.milestones.length;
      const completionPct = total > 0 ? Math.round((completed / total) * 100) : 0;

      return {
        id: proj.id,
        name: proj.name.length > 20 ? proj.name.slice(0, 18) + '...' : proj.name,
        fullName: proj.name,
        Completed: completed,
        InProgress: inProgress,
        Pending: pending,
        total,
        completionPct,
      };
    });
  }, [projects]);

  // Data for Pie Distribution Chart
  const distributionData = useMemo(() => {
    return [
      { name: 'Completed', value: stats.completed, color: '#10B981' },
      { name: 'In Progress', value: stats.inProgress, color: '#00BFEA' },
      { name: 'Pending', value: stats.pending, color: '#475569' },
    ].filter((item) => item.value > 0);
  }, [stats]);

  if (projects.length === 0) {
    return null;
  }

  return (
    <div
      className={`rounded-2xl bg-[#0b131f]/90 border border-slate-800/90 shadow-xl overflow-hidden backdrop-blur-md transition-all ${className}`}
    >
      {/* Top Banner / Controls */}
      <div className="p-4 md:p-6 border-b border-slate-800/80 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-[#00BFEA]/10 text-[#00BFEA] border border-[#00BFEA]/20">
              <TrendingUp className="w-4 h-4" />
            </span>
            <h2 className="text-base md:text-lg font-bold text-white tracking-tight flex items-center gap-2">
              Milestone & Progress Timeline
            </h2>
            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
              Recharts Analytics
            </span>
          </div>
          <p className="text-xs text-[#BCC7D3]">
            Track delivery velocity, milestone fulfillment schedules, and project milestone completion.
          </p>
        </div>

        {/* View Mode and Project Filter Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Project Selector */}
          <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-700/80 rounded-xl px-2.5 py-1.5 text-xs text-slate-200">
            <Layers className="w-3.5 h-3.5 text-[#00BFEA]" />
            <select
              value={activeProjectFilter}
              onChange={(e) => setActiveProjectFilter(e.target.value)}
              className="bg-transparent text-xs text-white focus:outline-none cursor-pointer pr-1"
            >
              <option value="all" className="bg-[#111820] text-white">
                All Engagements ({projects.length})
              </option>
              {projects.map((p) => (
                <option key={p.id} value={p.id} className="bg-[#111820] text-white">
                  {p.name.length > 28 ? p.name.slice(0, 26) + '...' : p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Visualization Mode Toggles */}
          <div className="flex items-center p-1 bg-slate-900/90 border border-slate-800 rounded-xl text-xs">
            <button
              onClick={() => setViewMode('trajectory')}
              title="Milestone Delivery Trajectory"
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all text-xs font-semibold ${
                viewMode === 'trajectory'
                  ? 'bg-[#00BFEA] text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Trajectory</span>
            </button>
            <button
              onClick={() => setViewMode('comparison')}
              title="Project Milestone Breakdown"
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all text-xs font-semibold ${
                viewMode === 'comparison'
                  ? 'bg-[#00BFEA] text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Breakdown</span>
            </button>
            <button
              onClick={() => setViewMode('distribution')}
              title="Status Allocation"
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all text-xs font-semibold ${
                viewMode === 'distribution'
                  ? 'bg-[#00BFEA] text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <PieChartIcon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Status</span>
            </button>
            <button
              onClick={() => setViewMode('schedule')}
              title="Milestone Schedule List"
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all text-xs font-semibold ${
                viewMode === 'schedule'
                  ? 'bg-[#00BFEA] text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Schedule</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Highlights Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 md:p-6 bg-slate-950/40 border-b border-slate-800/60">
        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-1">
          <div className="text-[11px] font-medium text-slate-400 flex items-center justify-between">
            <span>Overall Completion</span>
            <span className="font-mono text-xs text-[#00BFEA] font-bold">{stats.progressPct}%</span>
          </div>
          <div className="text-xl font-bold font-mono text-white">
            {stats.completed} <span className="text-xs text-slate-500 font-normal">/ {stats.total} M</span>
          </div>
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden mt-1">
            <div
              className="h-full bg-gradient-to-r from-[#00BFEA] to-emerald-400 transition-all duration-500"
              style={{ width: `${stats.progressPct}%` }}
            />
          </div>
        </div>

        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-1">
          <div className="text-[11px] font-medium text-slate-400 flex items-center justify-between">
            <span>Milestones Verified</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-xl font-bold font-mono text-emerald-400">{stats.completed}</div>
          <div className="text-[10px] text-slate-500">Signoffs & Deliverables completed</div>
        </div>

        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-1">
          <div className="text-[11px] font-medium text-slate-400 flex items-center justify-between">
            <span>Active In Progress</span>
            <Clock className="w-3.5 h-3.5 text-[#00BFEA]" />
          </div>
          <div className="text-xl font-bold font-mono text-[#00BFEA]">{stats.inProgress}</div>
          <div className="text-[10px] text-slate-500">Currently executing in sprints</div>
        </div>

        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-1">
          <div className="text-[11px] font-medium text-slate-400 flex items-center justify-between">
            <span>Next Target Date</span>
            <Calendar className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-sm font-bold font-mono text-white truncate">
            {stats.upcoming ? stats.upcoming.dueDate : 'All Complete'}
          </div>
          <div className="text-[10px] text-slate-400 truncate">
            {stats.upcoming ? stats.upcoming.title : 'No pending deadlines'}
          </div>
        </div>
      </div>

      {/* Main Chart Visualization Body */}
      <div className="p-4 md:p-6">
        {allMilestones.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">
            No milestones configured for the selected filter.
          </div>
        ) : (
          <>
            {/* 1. TRAJECTORY VIEW (Cumulative Recharts AreaChart) */}
            {viewMode === 'trajectory' && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1.5 text-slate-300">
                      <span className="w-3 h-3 rounded-sm bg-[#00BFEA]/80 border border-[#00BFEA]" />
                      <span>Planned Milestones</span>
                    </span>
                    <span className="flex items-center gap-1.5 text-slate-300">
                      <span className="w-3 h-3 rounded-sm bg-emerald-500/80 border border-emerald-500" />
                      <span>Completed Milestones</span>
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-500">
                    Chronological milestone delivery progress
                  </span>
                </div>

                <div className="h-64 sm:h-72 w-full pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={trajectoryData}
                      margin={{ top: 10, right: 15, left: -20, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="colorPlanned" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#00BFEA" stopOpacity={0.35} />
                          <stop offset="95%" stopColor="#00BFEA" stopOpacity={0.0} />
                        </linearGradient>
                        <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10B981" stopOpacity={0.45} />
                          <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.6} />
                      <XAxis
                        dataKey="date"
                        stroke="#64748b"
                        tick={{ fill: '#94a3b8', fontSize: 11 }}
                        tickLine={{ stroke: '#334155' }}
                      />
                      <YAxis
                        stroke="#64748b"
                        tick={{ fill: '#94a3b8', fontSize: 11 }}
                        tickLine={{ stroke: '#334155' }}
                        allowDecimals={false}
                      />
                      <Tooltip content={<CustomTimelineTooltip />} />
                      <Area
                        type="monotone"
                        dataKey="plannedMilestones"
                        name="Planned Delivery Target"
                        stroke="#00BFEA"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorPlanned)"
                        activeDot={{ r: 6, fill: '#00BFEA', stroke: '#071B33', strokeWidth: 2 }}
                      />
                      <Area
                        type="monotone"
                        dataKey="completedMilestones"
                        name="Completed & Accepted"
                        stroke="#10B981"
                        strokeWidth={2.5}
                        fillOpacity={1}
                        fill="url(#colorCompleted)"
                        activeDot={{ r: 6, fill: '#10B981', stroke: '#071B33', strokeWidth: 2 }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* 2. PROJECT COMPARISON VIEW (Stacked BarChart) */}
            {viewMode === 'comparison' && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1.5 text-slate-300">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                      <span>Completed</span>
                    </span>
                    <span className="flex items-center gap-1.5 text-slate-300">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#00BFEA]" />
                      <span>In Progress</span>
                    </span>
                    <span className="flex items-center gap-1.5 text-slate-300">
                      <span className="w-2.5 h-2.5 rounded-full bg-slate-600" />
                      <span>Pending</span>
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-500">
                    Comparative status distribution by active project
                  </span>
                </div>

                <div className="h-64 sm:h-72 w-full pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={comparisonData}
                      margin={{ top: 10, right: 15, left: -20, bottom: 20 }}
                      onClick={(state: any) => {
                        if (state && state.activePayload && state.activePayload.length && onSelectProject) {
                          const clickedProj = state.activePayload[0].payload;
                          if (clickedProj && clickedProj.id) {
                            onSelectProject(clickedProj.id);
                          }
                        }
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.6} />
                      <XAxis
                        dataKey="name"
                        stroke="#64748b"
                        tick={{ fill: '#94a3b8', fontSize: 11 }}
                        tickLine={{ stroke: '#334155' }}
                        interval={0}
                      />
                      <YAxis
                        stroke="#64748b"
                        tick={{ fill: '#94a3b8', fontSize: 11 }}
                        tickLine={{ stroke: '#334155' }}
                        allowDecimals={false}
                      />
                      <Tooltip content={<CustomTimelineTooltip />} />
                      <Bar dataKey="Completed" stackId="a" fill="#10B981" radius={[0, 0, 0, 0]} />
                      <Bar dataKey="InProgress" stackId="a" fill="#00BFEA" radius={[0, 0, 0, 0]} />
                      <Bar dataKey="Pending" stackId="a" fill="#475569" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* 3. DISTRIBUTION STATUS (PieChart) */}
            {viewMode === 'distribution' && (
              <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-6 py-2">
                <div className="h-60 sm:h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={distributionData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {distributionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} stroke="#071B33" strokeWidth={2} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTimelineTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="space-y-4">
                  <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400">
                    Fulfillment Distribution
                  </h4>
                  <div className="space-y-3">
                    <div className="p-3 rounded-xl bg-slate-900/80 border border-emerald-500/20 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className="w-3 h-3 rounded-full bg-emerald-500" />
                        <div>
                          <div className="text-xs font-bold text-white">Completed & Verified</div>
                          <div className="text-[11px] text-slate-400">Client signed-off deliverables</div>
                        </div>
                      </div>
                      <div className="text-right font-mono">
                        <span className="text-sm font-bold text-emerald-400">{stats.completed}</span>
                        <span className="text-[10px] text-slate-500 block">
                          {stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}%
                        </span>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-900/80 border border-[#00BFEA]/20 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className="w-3 h-3 rounded-full bg-[#00BFEA]" />
                        <div>
                          <div className="text-xs font-bold text-white">In Progress Execution</div>
                          <div className="text-[11px] text-slate-400">Engineering & staffing in flight</div>
                        </div>
                      </div>
                      <div className="text-right font-mono">
                        <span className="text-sm font-bold text-[#00BFEA]">{stats.inProgress}</span>
                        <span className="text-[10px] text-slate-500 block">
                          {stats.total > 0 ? Math.round((stats.inProgress / stats.total) * 100) : 0}%
                        </span>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-700/50 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className="w-3 h-3 rounded-full bg-slate-600" />
                        <div>
                          <div className="text-xs font-bold text-white">Pending Scheduling</div>
                          <div className="text-[11px] text-slate-400">Subsequent project stages</div>
                        </div>
                      </div>
                      <div className="text-right font-mono">
                        <span className="text-sm font-bold text-slate-400">{stats.pending}</span>
                        <span className="text-[10px] text-slate-500 block">
                          {stats.total > 0 ? Math.round((stats.pending / stats.total) * 100) : 0}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 4. CHRONOLOGICAL SCHEDULE GANTT TIMELINE */}
            {viewMode === 'schedule' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs pb-1 border-b border-slate-800">
                  <span className="font-semibold text-white">Milestone Roadmap</span>
                  <span className="font-mono text-slate-400 text-[11px]">Sorted chronologically by due date</span>
                </div>

                <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                  {allMilestones
                    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
                    .map((m, idx) => {
                      const isPast = new Date(m.dueDate).getTime() < new Date().getTime();
                      return (
                        <div
                          key={`${m.projectId}-${m.id}-${idx}`}
                          onClick={() => onSelectProject && onSelectProject(m.projectId)}
                          className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${
                            onSelectProject ? 'cursor-pointer hover:border-[#00BFEA]/60' : ''
                          } ${
                            m.status === 'completed'
                              ? 'bg-slate-900/70 border-emerald-500/30'
                              : m.status === 'in_progress'
                              ? 'bg-slate-900/90 border-[#00BFEA]/40'
                              : 'bg-slate-900/40 border-slate-800'
                          }`}
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-mono text-[#00BFEA] px-1.5 py-0.5 rounded bg-[#00BFEA]/10 border border-[#00BFEA]/20">
                                {m.projectName}
                              </span>
                              <span className="text-[10px] font-mono text-slate-500">M0{idx + 1}</span>
                            </div>
                            <div className="text-xs font-bold text-white">{m.title}</div>
                          </div>

                          <div className="flex items-center gap-3 shrink-0">
                            <div className="text-right font-mono text-xs">
                              <div className="text-slate-300 flex items-center gap-1">
                                <Calendar className="w-3 h-3 text-[#00BFEA]" />
                                <span>{m.dueDate}</span>
                              </div>
                              {m.status !== 'completed' && (
                                <span className={`text-[10px] ${isPast ? 'text-amber-400' : 'text-slate-500'}`}>
                                  {isPast ? 'Current window' : 'Upcoming target'}
                                </span>
                              )}
                            </div>

                            <span
                              className={`text-[10px] font-mono uppercase px-2.5 py-1 rounded-lg font-bold shrink-0 ${
                                m.status === 'completed'
                                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                  : m.status === 'in_progress'
                                  ? 'bg-[#00BFEA]/10 text-[#00BFEA] border border-[#00BFEA]/20'
                                  : 'bg-slate-800 text-slate-400 border border-slate-700'
                              }`}
                            >
                              {m.status.replace('_', ' ')}
                            </span>

                            {onSelectProject && (
                              <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white" />
                            )}
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
