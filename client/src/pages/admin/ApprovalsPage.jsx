import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  CheckSquare, Clock, AlertTriangle, CheckCircle2, XCircle,
  FileText, ShieldCheck, UserCheck, Eye, Search, Filter,
  Building2, Landmark, Download
} from 'lucide-react';
import AdminLayout from '../../layouts/AdminLayout';
import toast from 'react-hot-toast';

const INITIAL_APPROVALS = [
  {
    id: 'APP-2026-104',
    title: 'Punjab Mandi Capacity Expansion (Khanna Center)',
    type: 'Infrastructure & Capacity',
    level: 'State ➔ Central CPO',
    submittedBy: 'SPO-PUN-001 (Sh. Sukhdev Singh, IAS)',
    date: '14 Sep 2026',
    priority: 'High',
    status: 'Pending',
    description: 'Request to increase daily procurement intake quota from 100 quintal/day to 150 quintal/day to handle heavy harvesting inflow.',
  },
  {
    id: 'APP-2026-103',
    title: 'Special Rabi Procurement Window Extension',
    type: 'Policy Exception',
    level: 'State ➔ Central CPO',
    submittedBy: 'SPO-HRY-001 (Smt. Anita Sharma, IAS)',
    date: '13 Sep 2026',
    priority: 'High',
    status: 'Pending',
    description: 'Extension of procurement operations by 7 calendar days due to unseasonal rain interruptions during the standard harvesting cycle.',
  },
  {
    id: 'APP-2026-102',
    title: 'District Nodal Officer Appointment (Ludhiana)',
    type: 'Officer Appointment',
    level: 'District ➔ Central CPO',
    submittedBy: 'DNO-LDH-001',
    date: '12 Sep 2026',
    priority: 'Normal',
    status: 'Pending',
    description: 'Formal administrative elevation of Sh. Gurpreet Singh to District Nodal Officer with digital sign-off delegation.',
  },
  {
    id: 'APP-2026-101',
    title: 'Emergency Grain Dryer Subvention Sanction',
    type: 'Financial Sanction',
    level: 'State ➔ Central CPO',
    submittedBy: 'SPO-MP-001',
    date: '11 Sep 2026',
    priority: 'Urgent',
    status: 'Under Review',
    description: 'Immediate release of financial assistance for mechanical grain drying equipment following excessive moisture readings.',
  },
  {
    id: 'APP-2026-098',
    title: 'MSP Procurement Rate Notice #04 Gazetted',
    type: 'Rate Configuration',
    level: 'Central Policy',
    submittedBy: 'CPO-001 (Director Procurement)',
    date: '10 Sep 2026',
    priority: 'Normal',
    status: 'Approved',
    description: 'Approval of final Grade-A moisture and foreign matter tolerance parameters for wheat procurement.',
  },
  {
    id: 'APP-2026-095',
    title: 'Non-Accredited Private Storage Lease Request',
    type: 'Storage Lease',
    level: 'District Level',
    submittedBy: 'DNO-KTA-001',
    date: '08 Sep 2026',
    priority: 'Normal',
    status: 'Rejected',
    description: 'Proposed storage warehouse failed standard Central Warehousing Corporation (CWC) fire safety and rodent proofing specifications.',
  },
];

const ApprovalsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get('tab') || 'pending';

  const [approvals, setApprovals] = useState(INITIAL_APPROVALS);
  const [activeModal, setActiveModal] = useState(null);
  const [remarks, setRemarks] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const counts = {
    pending: approvals.filter((a) => a.status === 'Pending').length,
    review: approvals.filter((a) => a.status === 'Under Review').length,
    approved: approvals.filter((a) => a.status === 'Approved').length,
    rejected: approvals.filter((a) => a.status === 'Rejected').length,
  };

  const handleAction = (item, newStatus) => {
    setApprovals((prev) =>
      prev.map((a) => (a.id === item.id ? { ...a, status: newStatus } : a))
    );
    toast.success(`Request ${item.id} has been marked as ${newStatus}.`);
    setActiveModal(null);
    setRemarks('');
  };

  const filteredApprovals = approvals.filter((item) => {
    if (currentTab === 'pending' && item.status !== 'Pending') return false;
    if (currentTab === 'review' && item.status !== 'Under Review') return false;
    if (currentTab === 'approved' && item.status !== 'Approved') return false;
    if (currentTab === 'rejected' && item.status !== 'Rejected') return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return (
        item.id.toLowerCase().includes(q) ||
        item.title.toLowerCase().includes(q) ||
        item.submittedBy.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Breadcrumb & Header */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <span>CPO Portal</span>
              <span>/</span>
              <span className="text-blue-700 font-bold">Central Governance</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 mt-1 flex items-center gap-2">
              <span>CPO Executive Approval Console</span>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                {counts.pending} Action Required
              </span>
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Statutory central clearances, state capacity variances, and administrative appointments.
            </p>
          </div>
        </div>

        {/* 4 Status KPI Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button
            type="button"
            onClick={() => setSearchParams({ tab: 'pending' })}
            className={`p-4 rounded-xl border text-left transition-all ${
              currentTab === 'pending'
                ? 'bg-amber-50/80 border-amber-400 shadow-sm'
                : 'bg-white border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between text-amber-800">
              <span className="text-[10px] uppercase font-bold tracking-wider">Pending Action</span>
              <Clock className="w-4 h-4" />
            </div>
            <p className="text-2xl font-black text-amber-900 mt-1">{counts.pending}</p>
            <p className="text-[10px] text-amber-700 mt-0.5 font-semibold">Immediate CPO Decision</p>
          </button>

          <button
            type="button"
            onClick={() => setSearchParams({ tab: 'review' })}
            className={`p-4 rounded-xl border text-left transition-all ${
              currentTab === 'review'
                ? 'bg-blue-50/80 border-blue-400 shadow-sm'
                : 'bg-white border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between text-blue-800">
              <span className="text-[10px] uppercase font-bold tracking-wider">Under Review</span>
              <FileText className="w-4 h-4" />
            </div>
            <p className="text-2xl font-black text-blue-900 mt-1">{counts.review}</p>
            <p className="text-[10px] text-blue-700 mt-0.5 font-semibold">In Technical Assessment</p>
          </button>

          <button
            type="button"
            onClick={() => setSearchParams({ tab: 'approved' })}
            className={`p-4 rounded-xl border text-left transition-all ${
              currentTab === 'approved'
                ? 'bg-emerald-50/80 border-emerald-400 shadow-sm'
                : 'bg-white border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between text-emerald-800">
              <span className="text-[10px] uppercase font-bold tracking-wider">Approved</span>
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <p className="text-2xl font-black text-emerald-900 mt-1">{counts.approved}</p>
            <p className="text-[10px] text-emerald-700 mt-0.5 font-semibold">Gazetted &amp; Executed</p>
          </button>

          <button
            type="button"
            onClick={() => setSearchParams({ tab: 'rejected' })}
            className={`p-4 rounded-xl border text-left transition-all ${
              currentTab === 'rejected'
                ? 'bg-rose-50/80 border-rose-400 shadow-sm'
                : 'bg-white border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between text-rose-800">
              <span className="text-[10px] uppercase font-bold tracking-wider">Rejected</span>
              <XCircle className="w-4 h-4" />
            </div>
            <p className="text-2xl font-black text-rose-900 mt-1">{counts.rejected}</p>
            <p className="text-[10px] text-rose-700 mt-0.5 font-semibold">Non-Compliant</p>
          </button>
        </div>

        {/* Tab Selection & Filter */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
            {[
              { key: 'pending', label: 'Pending Approvals' },
              { key: 'review', label: 'Under Review' },
              { key: 'approved', label: 'Approved Requests' },
              { key: 'rejected', label: 'Rejected' },
            ].map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setSearchParams({ tab: tab.key })}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  currentTab === tab.key
                    ? 'bg-blue-700 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search request ID or title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Approval Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-blue-700" />
              <span>Official Request Docket ({filteredApprovals.length})</span>
            </h2>
            <span className="text-xs text-slate-500">
              CPO Digital Authorization Console
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Request Ref.</th>
                  <th className="py-3 px-3">Subject / Request</th>
                  <th className="py-3 px-3">Level / Scope</th>
                  <th className="py-3 px-3">Submitted By</th>
                  <th className="py-3 px-3">Date</th>
                  <th className="py-3 px-3 text-center">Priority</th>
                  <th className="py-3 px-3 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredApprovals.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-500">
                      No requests found matching this filter.
                    </td>
                  </tr>
                ) : (
                  filteredApprovals.map((row) => (
                    <tr key={row.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-blue-800">{row.id}</td>
                      <td className="py-3 px-3 max-w-xs">
                        <p className="font-bold text-slate-900 leading-snug">{row.title}</p>
                        <p className="text-[10px] text-slate-500 truncate mt-0.5">{row.type}</p>
                      </td>
                      <td className="py-3 px-3">
                        <span className="text-[10px] font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                          {row.level}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-700 font-semibold">{row.submittedBy}</td>
                      <td className="py-3 px-3 text-slate-500">{row.date}</td>
                      <td className="py-3 px-3 text-center">
                        <span
                          className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded ${
                            row.priority === 'Urgent'
                              ? 'bg-rose-100 text-rose-800 border border-rose-200'
                              : row.priority === 'High'
                              ? 'bg-amber-100 text-amber-800 border border-amber-200'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {row.priority}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span
                          className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            row.status === 'Approved'
                              ? 'bg-emerald-100 text-emerald-800'
                              : row.status === 'Rejected'
                              ? 'bg-rose-100 text-rose-800'
                              : row.status === 'Under Review'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {row.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setActiveModal(row)}
                            className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition"
                          >
                            Review
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal for Approval / Rejection Action */}
        {activeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-fadeIn">
              <div className="flex items-start justify-between border-b border-slate-100 pb-3 mb-4">
                <div>
                  <span className="text-[10px] font-mono font-bold text-blue-700">{activeModal.id}</span>
                  <h3 className="text-base font-black text-slate-900 mt-0.5">{activeModal.title}</h3>
                </div>
                <button
                  onClick={() => setActiveModal(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <p className="text-[10px] uppercase font-bold text-slate-500">Detailed Justification</p>
                  <p className="text-slate-800 mt-1 leading-relaxed">{activeModal.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-slate-500">Submitted By:</span>
                    <p className="font-bold text-slate-900">{activeModal.submittedBy}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Submission Date:</span>
                    <p className="font-bold text-slate-900">{activeModal.date}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1 text-[11px]">
                    Central CPO Executive Remarks / Order Note
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Enter official remarks, conditions, or statutory directives..."
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    className="w-full p-2.5 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="mt-6 pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => handleAction(activeModal, 'Rejected')}
                  className="px-4 py-2 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-xl transition border border-rose-200"
                >
                  Reject Request
                </button>
                <button
                  type="button"
                  onClick={() => handleAction(activeModal, 'Under Review')}
                  className="px-4 py-2 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-xl transition border border-blue-200"
                >
                  Mark for Review
                </button>
                <button
                  type="button"
                  onClick={() => handleAction(activeModal, 'Approved')}
                  className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md transition"
                >
                  Approve &amp; Sign Order
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default ApprovalsPage;
