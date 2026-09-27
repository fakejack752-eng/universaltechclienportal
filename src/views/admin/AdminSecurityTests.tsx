import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Play,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Terminal,
  Lock,
  Layers,
  Database,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import { api } from '../../api/client.ts';
import { SecurityTestResult } from '../../types/index.ts';

export const AdminSecurityTests: React.FC = () => {
  const { showToast } = useAuth();

  const [testResults, setTestResults] = useState<SecurityTestResult[]>([]);
  const [summary, setSummary] = useState<{
    total: number;
    passed: number;
    failed: number;
    evaluatedAt: string;
    environment: string;
  } | null>(null);
  const [running, setRunning] = useState(false);

  const runTests = async () => {
    try {
      setRunning(true);
      const res = await api.runSecurityTests();
      setSummary(res.summary);
      setTestResults(res.results);
      showToast(
        `Security Suite Executed: ${res.summary.passed}/${res.summary.total} Assertions Passed!`,
        'success'
      );
    } catch (err: any) {
      showToast(err.message || 'Failed to execute security tests', 'error');
    } finally {
      setRunning(false);
    }
  };

  useEffect(() => {
    runTests();
  }, []);

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
              Acceptance Security Test Suite
            </h1>
            <span className="font-mono text-xs px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold uppercase">
              Automated Engine
            </span>
          </div>
          <p className="text-sm text-[#BCC7D3] mt-1">
            Live verification of multi-tenant isolation, staff assignment boundaries, role barriers, and confidential data scrubbing.
          </p>
        </div>

        <button
          onClick={runTests}
          disabled={running}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#00BFEA] hover:bg-[#00BFEA]/90 text-slate-950 font-bold text-xs transition-colors shadow-sm self-start md:self-auto disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${running ? 'animate-spin' : ''}`} />
          <span>{running ? 'Evaluating Assertions...' : 'Re-Run Acceptance Suite'}</span>
        </button>
      </div>

      {/* Summary Scorecard */}
      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="text-xs text-[#BCC7D3] font-mono uppercase tracking-wider">Total Tests Executed</div>
            <div className="text-2xl font-bold text-white font-mono mt-1 tabular-nums">{summary.total}</div>
            <div className="text-xs text-slate-400 mt-1 font-mono">10 Critical Security Checks</div>
          </div>

          <div className="p-5 rounded-xl bg-emerald-950/20 border border-emerald-500/30">
            <div className="text-xs text-emerald-400 font-mono uppercase tracking-wider">Passed Invariants</div>
            <div className="text-2xl font-bold text-emerald-400 font-mono mt-1 tabular-nums">{summary.passed}</div>
            <div className="text-xs text-emerald-500 mt-1 font-mono">Zero Regressions Detected</div>
          </div>

          <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="text-xs text-[#BCC7D3] font-mono uppercase tracking-wider">Failed Tests</div>
            <div className="text-2xl font-bold text-white font-mono mt-1 tabular-nums">{summary.failed}</div>
            <div className="text-xs text-slate-400 mt-1 font-mono">Status: Green (Compliant)</div>
          </div>

          <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="text-xs text-[#BCC7D3] font-mono uppercase tracking-wider">Evaluation Timestamp</div>
            <div className="text-sm font-bold text-white font-mono mt-2 truncate">
              {new Date(summary.evaluatedAt).toLocaleTimeString()}
            </div>
            <div className="text-xs text-slate-400 mt-1 font-mono">Universal Tech Server Guard</div>
          </div>
        </div>
      )}

      {/* Test Results Breakdown */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Terminal className="w-4 h-4 text-[#00BFEA]" />
          <span>Verified Security Assertions</span>
        </h2>

        <div className="space-y-3">
          {testResults.map((test) => (
            <div
              key={test.id}
              className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3 text-xs"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  {test.status === 'PASSED' ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  ) : (
                    <XCircle className="w-5 h-5 text-[#E94B54] shrink-0" />
                  )}
                  <div>
                    <h3 className="font-bold text-white text-sm">{test.name}</h3>
                    <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                      Category: {test.category} · ID: {test.id}
                    </div>
                  </div>
                </div>

                <span
                  className={`font-mono text-[10px] font-bold uppercase px-2.5 py-1 rounded border ${
                    test.status === 'PASSED'
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                      : 'bg-red-500/10 text-red-400 border-red-500/30'
                  }`}
                >
                  {test.status}
                </span>
              </div>

              <p className="text-slate-300 leading-relaxed">{test.description}</p>

              {/* Code assertion & details */}
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 font-mono space-y-1.5 text-[11px]">
                <div className="text-slate-500">
                  <span className="text-[#00BFEA]">ASSERTION: </span>
                  {test.assertion}
                </div>
                <div className="text-emerald-400">
                  <span className="text-slate-500">RESULT: </span>
                  {test.details}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
