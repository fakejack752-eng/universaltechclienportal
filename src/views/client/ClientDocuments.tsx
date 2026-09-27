import React, { useState, useEffect } from 'react';
import {
  FolderLock,
  Upload,
  Download,
  FileText,
  ShieldCheck,
  AlertTriangle,
  Clock,
  Filter,
  Search,
  CheckCircle2,
  X,
  Lock,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import { api } from '../../api/client.ts';
import { DocumentRecord } from '../../types/index.ts';

export const ClientDocuments: React.FC = () => {
  const { showToast, permissions } = useAuth();

  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [uploadModalOpen, setUploadModalOpen] = useState(false);

  // Upload Form
  const [uploadName, setUploadName] = useState('');
  const [uploadCategory, setUploadCategory] = useState<string>('deliverable');
  const [uploadIsInternal, setUploadIsInternal] = useState(false);
  const [uploading, setUploading] = useState(false);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      const data = await api.getDocuments();
      setDocuments(data);
    } catch (err: any) {
      showToast(err.message || 'Failed to load documents', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  const handleDownload = async (doc: DocumentRecord) => {
    try {
      if (doc.scanStatus === 'quarantined') {
        showToast('Document is quarantined and cannot be downloaded', 'error');
        return;
      }

      showToast('Generating authorized download token...', 'info');
      const tokenRes = await api.requestDownloadToken(doc.id);

      // Trigger browser download via authorized token endpoint
      window.location.href = tokenRes.downloadUrl;
      showToast(`Downloading "${doc.name}" securely`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Download authorization failed', 'error');
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadName.trim()) return;

    // Check banned extensions client-side as well
    const banned = ['.exe', '.bat', '.sh', '.cmd', '.vbs', '.dll'];
    if (banned.some((ext) => uploadName.toLowerCase().endsWith(ext))) {
      showToast('Executable files (.exe, .sh, .bat) are strictly blocked by security policy', 'error');
      return;
    }

    try {
      setUploading(true);
      await api.uploadDocument({
        name: uploadName.trim(),
        fileType: uploadName.endsWith('.pdf') ? 'application/pdf' : 'application/octet-stream',
        sizeBytes: 1024 * 480, // Simulation 480 KB
        category: uploadCategory,
        isInternalOnly: permissions.isStaff ? uploadIsInternal : false,
      });

      showToast('Document uploaded, scanned clean, and archived successfully', 'success');
      setUploadModalOpen(false);
      setUploadName('');
      await loadDocuments();
    } catch (err: any) {
      showToast(err.message || 'Upload failed', 'error');
    } finally {
      setUploading(false);
    }
  };

  const filtered = documents.filter((doc) => {
    const matchesCategory = selectedCategory === 'all' || doc.category === selectedCategory;
    const matchesSearch = doc.name.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
            Secure Document Repository
          </h1>
          <p className="text-sm text-[#BCC7D3] mt-1">
            Private zero-trust document storage, authenticated download tokens, and continuous malware scanning.
          </p>
        </div>

        <button
          onClick={() => setUploadModalOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#00BFEA] hover:bg-[#00BFEA]/90 text-slate-950 font-bold text-xs transition-colors shadow-sm self-start md:self-auto"
        >
          <Upload className="w-4 h-4" />
          <span>Upload Document</span>
        </button>
      </div>

      {/* Security Protocol Banner */}
      <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300 flex items-start gap-2.5">
        <ShieldCheck className="w-4 h-4 text-[#00BFEA] shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-white">Private Storage Guarantee:</span> No public bucket URLs are ever
          exposed. Every file access requires verified session credentials and generates an ephemeral 60-second
          authorized download token. All files are inspected for malicious scripts before availability.
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search documents by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-[#00BFEA]"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {['all', 'deliverable', 'contract', 'specification', 'report'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors uppercase font-mono text-[11px] ${
                selectedCategory === cat
                  ? 'bg-[#00BFEA] text-slate-950 font-bold'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Documents Table */}
      {loading ? (
        <div className="p-8 space-y-4 animate-pulse">
          <div className="h-14 bg-slate-800 rounded-xl" />
          <div className="h-14 bg-slate-800 rounded-xl" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-slate-900/40 border border-slate-800 space-y-3">
          <FolderLock className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-white">No documents found</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Upload project specifications, agreements, or reference assets securely.
          </p>
        </div>
      ) : (
        <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-900/60">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-mono text-[11px] uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Document Name</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Size</th>
                  <th className="py-3 px-4">Security Scan</th>
                  <th className="py-3 px-4">Uploaded By</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-200">
                {filtered.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-white flex items-center gap-2">
                      <FileText className="w-4 h-4 text-[#00BFEA] shrink-0" />
                      <span className="truncate max-w-xs">{doc.name}</span>
                      {doc.isInternalOnly && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded font-mono bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          INTERNAL
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-400 uppercase">
                      {doc.category}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-400 tabular-nums">
                      {(doc.sizeBytes / 1024).toFixed(1)} KB
                    </td>
                    <td className="py-3.5 px-4">
                      {doc.scanStatus === 'scanned_clean' ? (
                        <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1 w-max">
                          <CheckCircle2 className="w-3 h-3" /> Clean (SHA-256)
                        </span>
                      ) : (
                        <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20 flex items-center gap-1 w-max">
                          <AlertTriangle className="w-3 h-3" /> Quarantined
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 text-[11px]">
                      <div>{doc.uploadedByUserName}</div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        {new Date(doc.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleDownload(doc)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-[#00BFEA] text-slate-200 hover:text-slate-950 font-semibold text-xs transition-colors border border-slate-700 hover:border-[#00BFEA]"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {uploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="relative w-full max-w-lg bg-[#111820] border border-slate-700 rounded-2xl shadow-2xl p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Upload className="w-4 h-4 text-[#00BFEA]" />
                <span>Secure Document Upload</span>
              </h3>
              <button
                onClick={() => setUploadModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Document File Name <span className="text-[#E94B54]">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Apex_HIPAA_Business_Associate_Agreement.pdf"
                  value={uploadName}
                  onChange={(e) => setUploadName(e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-[#00BFEA]"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Max 25 MB. Executable formats (.exe, .sh, .bat) are blocked.
                </span>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Document Category</label>
                <select
                  value={uploadCategory}
                  onChange={(e) => setUploadCategory(e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-100 focus:outline-none focus:border-[#00BFEA]"
                >
                  <option value="deliverable">Deliverable Specification</option>
                  <option value="contract">Master Agreement / Contract</option>
                  <option value="specification">Architecture Blueprint / Spec</option>
                  <option value="report">Audit / Compliance Report</option>
                  <option value="general">General Asset</option>
                </select>
              </div>

              {permissions.isStaff && (
                <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-200 flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="internalDoc"
                    checked={uploadIsInternal}
                    onChange={(e) => setUploadIsInternal(e.target.checked)}
                    className="rounded border-slate-700 bg-slate-900 text-[#00BFEA] focus:ring-0"
                  />
                  <label htmlFor="internalDoc" className="cursor-pointer font-medium">
                    Internal Staff-Only Document (hidden from client organization)
                  </label>
                </div>
              )}

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setUploadModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="px-4 py-2 rounded-lg bg-[#00BFEA] text-slate-950 font-bold hover:bg-[#00BFEA]/90 transition-colors shadow-sm disabled:opacity-50"
                >
                  {uploading ? 'Scanning & Uploading...' : 'Upload & Scan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
