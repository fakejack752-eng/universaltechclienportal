import React, { useState, useEffect } from 'react';
import {
  History,
  ShieldCheck,
  Search,
  Filter,
  User,
  Clock,
  Terminal,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import { api } from '../../api/client.ts';
import { AuditEvent } from '../../types/index.ts';

export const AdminAudit: React.FC = () => {
  const { showToast } = useAuth();

  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterAction, setFilterAction] = useState('all');
  const [search, setSearch] = useState('');

  const loadAudit = async () => {
    try {
      setLoading(true);
      const data = await api.getAuditLogs();
      setEvents(data);
    } catch (err: any) {
      showToast(err.message || 'Failed to load audit trail', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAudit();
  }, []);

  const filtered = events.filter((e) => {
    const matchesAction = filterAction === 'all' || e.action.includes(filterAction);
    const matchesSearch =
      e.action.toLowerCase().includes(search.toLowerCase()) ||
      e.userEmail.toLowerCase().includes(search.toLowerCase()) ||
      e.details.toLowerCase().includes(search.toLowerCase()) ||
      (e.resourceId && e.resourceId.toLowerCase().includes(search.toLowerCase()));
    return matchesAction && matchesSearch;
  });

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
            Tamper-Evident Audit History
          </h1>
          <p className="text-sm text-[#BCC7D3] mt-1">
            Immutable compliance record of authentications, role assignments, document accesses, and deliverable approvals.
          </p>
        </div>

        <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-[#00BFEA] font-mono">
          <ShieldCheck className="w-4 h-4" />
          <span>Audit Stream: Active & Enforced</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search audit trail by user, resource ID, or details..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-[#00BFEA]"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 font-mono text-[11px]">
          {['all', 'DELIVERABLE', 'INVITATION', 'SERVICE_REQUEST', 'DOCUMENT', 'INTEGRATION'].map((act) => (
            <button
              key={act}
              onClick={() => setFilterAction(act)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                filterAction === act
                  ? 'bg-[#00BFEA] text-slate-950 font-bold'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {act}
            </button>
          ))}
        </div>
      </div>

      {/* Audit Log Table */}
      {loading ? (
        <div className="space-y-3 animate-pulse">
          <div className="h-16 bg-slate-800 rounded-xl" />
          <div className="h-16 bg-slate-800 rounded-xl" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center rounded-xl bg-slate-900/40 border border-slate-800 text-slate-500 text-xs">
          No audit records matching query.
        </div>
      ) : (
        <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-900/60">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase text-[11px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Action Event</th>
                  <th className="py-3 px-4">Principal User</th>
                  <th className="py-3 px-4">Resource Target</th>
                  <th className="py-3 px-4">Event Details</th>
                  <th className="py-3 px-4">Client IP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {filtered.map((evt) => (
                  <tr key={evt.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 text-slate-400 whitespace-nowrap text-[11px]">
                      {new Date(evt.timestamp).toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-[#00BFEA]/10 text-[#00BFEA] border border-[#00BFEA]/20">
                        {evt.action}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-white font-sans text-xs">
                      <div>{evt.userEmail}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{evt.userId}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-400 text-[11px]">
                      <div>{evt.resourceType}</div>
                      {evt.resourceId && (
                        <div className="text-[10px] text-slate-500 font-mono truncate max-w-[120px]">
                          {evt.resourceId}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-200 font-sans text-xs max-w-sm">
                      {evt.details}
                    </td>
                    <td className="py-3 px-4 text-slate-500 text-[11px]">
                      {evt.ipAddress}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
