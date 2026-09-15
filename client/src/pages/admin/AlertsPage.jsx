import { useState } from 'react';
import {
  Bell, AlertTriangle, AlertCircle, Info, CheckCircle2,
  Filter, Search, Send, ShieldAlert, Landmark, Building2
} from 'lucide-react';
import AdminLayout from '../../layouts/AdminLayout';
import toast from 'react-hot-toast';

const INITIAL_ALERTS = [
  {
    id: 'ALT-CRIT-092',
    severity: 'CRITICAL',
    title: 'Mandi Overcapacity Alert — Khanna Grain Market (Punjab)',
    description: 'Operating at 96% daily capacity for 3 consecutive days. Immediate district quota balancing advisory recommended.',
    level: 'Procurement Centre',
    location: 'Punjab / Ludhiana',
    timestamp: '25 mins ago',
    status: 'Active',
    actionRequired: 'Reroute incoming arrivals to Sahnewal & Samrala centres.',
  },
  {
    id: 'ALT-WARN-088',
    severity: 'WARNING',
    title: 'Kota District Procurement Target Lagging Behind Schedule',
    description: 'Procurement intake currently 28% below projected Kharif trajectory due to delayed local mandi openings.',
    level: 'District Level',
    location: 'Rajasthan / Kota',
    timestamp: '2 hours ago',
    status: 'Active',
    actionRequired: 'Issue performance directive to District Nodal Officer.',
  },
  {
    id: 'ALT-WARN-084',
    severity: 'WARNING',
    title: 'DBT Payment Clearing Window Pending (>48 Hours)',
    description: 'Batch #489 containing 142 payment records delayed at state clearing agency awaiting treasury reconciliation.',
    level: 'State Treasury',
    location: 'Madhya Pradesh',
    timestamp: '4 hours ago',
    status: 'Active',
    actionRequired: 'Escalate to State Food Corporation Finance Head.',
  },
  {
    id: 'ALT-INFO-081',
    severity: 'INFO',
    title: 'New Grade-A Grain Moisture Quality Directives Gazetted',
    description: 'Central guidelines for Rabi 2026 standardized moisture threshold (12.0%) successfully pushed to all state dashboards.',
    level: 'Central Policy',
    location: 'All States',
    timestamp: 'Yesterday',
    status: 'Acknowledged',
    actionRequired: 'Verification by State Quality Inspectors.',
  },
  {
    id: 'ALT-INFO-079',
    severity: 'INFO',
    title: 'Weekly National Foodgrain Intake Report Compiled',
    description: 'Consolidated report generated for Joint Secretary review. Total volume: 132,900 MT across 82 centres.',
    level: 'Central CPO',
    location: 'National HQ',
    timestamp: 'Yesterday',
    status: 'Resolved',
    actionRequired: 'Filed in Cabinet Secretariat docket.',
  },
];

const AlertsPage = () => {
  const [alerts, setAlerts] = useState(INITIAL_ALERTS);
  const [severityFilter, setSeverityFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  const handleResolve = (id) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: 'Resolved' } : a))
    );
    toast.success(`Alert ${id} has been marked as Resolved.`);
  };

  const filteredAlerts = alerts.filter((a) => {
    if (severityFilter !== 'All' && a.severity !== severityFilter) return false;
    if (statusFilter !== 'All' && a.status !== statusFilter) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return (
        a.id.toLowerCase().includes(q) ||
        a.title.toLowerCase().includes(q) ||
        a.location.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const criticalCount = alerts.filter((a) => a.severity === 'CRITICAL' && a.status === 'Active').length;
  const warningCount = alerts.filter((a) => a.severity === 'WARNING' && a.status === 'Active').length;
  const infoCount = alerts.filter((a) => a.severity === 'INFO').length;

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Breadcrumb & Header */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <span>CPO Portal</span>
              <span>/</span>
              <span className="text-blue-700 font-bold">Exceptions &amp; Vigilance</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 mt-1 flex items-center gap-2">
              <span>Central Alerts &amp; Exceptions Command</span>
              {criticalCount > 0 && (
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-300">
                  {criticalCount} Critical
                </span>
              )}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Automated anomaly detection across mandi capacity, procurement pacing, and payment realization.
            </p>
          </div>
        </div>

        {/* 3 Severity KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <button
            type="button"
            onClick={() => setSeverityFilter(severityFilter === 'CRITICAL' ? 'All' : 'CRITICAL')}
            className={`p-4 rounded-2xl border text-left transition-all ${
              severityFilter === 'CRITICAL'
                ? 'bg-rose-50 border-rose-300 shadow-sm'
                : 'bg-white border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between text-rose-800">
              <span className="text-xs font-bold uppercase tracking-wider">Critical Exceptions</span>
              <AlertTriangle className="w-5 h-5 text-rose-600" />
            </div>
            <p className="text-3xl font-black text-rose-900 mt-1">{criticalCount}</p>
            <p className="text-xs text-rose-700 mt-0.5 font-medium">Requires Immediate Intervention</p>
          </button>

          <button
            type="button"
            onClick={() => setSeverityFilter(severityFilter === 'WARNING' ? 'All' : 'WARNING')}
            className={`p-4 rounded-2xl border text-left transition-all ${
              severityFilter === 'WARNING'
                ? 'bg-amber-50 border-amber-300 shadow-sm'
                : 'bg-white border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between text-amber-800">
              <span className="text-xs font-bold uppercase tracking-wider">Warning Advisories</span>
              <AlertCircle className="w-5 h-5 text-amber-600" />
            </div>
            <p className="text-3xl font-black text-amber-900 mt-1">{warningCount}</p>
            <p className="text-xs text-amber-700 mt-0.5 font-medium">Potential Threshold Breaches</p>
          </button>

          <button
            type="button"
            onClick={() => setSeverityFilter(severityFilter === 'INFO' ? 'All' : 'INFO')}
            className={`p-4 rounded-2xl border text-left transition-all ${
              severityFilter === 'INFO'
                ? 'bg-blue-50 border-blue-300 shadow-sm'
                : 'bg-white border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between text-blue-800">
              <span className="text-xs font-bold uppercase tracking-wider">Informational Notices</span>
              <Info className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-3xl font-black text-blue-900 mt-1">{infoCount}</p>
            <p className="text-xs text-blue-700 mt-0.5 font-medium">Policy &amp; National Dispatches</p>
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative flex-1 w-full sm:w-auto">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search alert title or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center gap-3">
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700"
            >
              <option value="All">All Severities</option>
              <option value="CRITICAL">Critical</option>
              <option value="WARNING">Warning</option>
              <option value="INFO">Informational</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active Only</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>
        </div>

        {/* Alerts List */}
        <div className="space-y-3">
          {filteredAlerts.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 text-xs">
              No alerts found matching this filter.
            </div>
          ) : (
            filteredAlerts.map((alt) => (
              <div
                key={alt.id}
                className={`bg-white rounded-2xl p-5 border shadow-sm transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                  alt.severity === 'CRITICAL'
                    ? 'border-rose-300 hover:border-rose-400'
                    : alt.severity === 'WARNING'
                    ? 'border-amber-300 hover:border-amber-400'
                    : 'border-slate-200 hover:border-blue-300'
                }`}
              >
                <div className="flex items-start gap-3.5 min-w-0 flex-1">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${
                      alt.severity === 'CRITICAL'
                        ? 'bg-rose-100 text-rose-700'
                        : alt.severity === 'WARNING'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}
                  >
                    {alt.severity === 'CRITICAL' ? (
                      <AlertTriangle className="w-5 h-5" />
                    ) : alt.severity === 'WARNING' ? (
                      <AlertCircle className="w-5 h-5" />
                    ) : (
                      <Info className="w-5 h-5" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="text-[10px] font-mono font-bold text-slate-500">{alt.id}</span>
                      <span
                        className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded ${
                          alt.severity === 'CRITICAL'
                            ? 'bg-rose-100 text-rose-800'
                            : alt.severity === 'WARNING'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {alt.severity}
                      </span>
                      <span className="text-[10px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                        {alt.level}
                      </span>
                      <span className="text-[10px] font-bold text-slate-800">
                        {alt.location}
                      </span>
                      <span className="text-[10px] text-slate-400 ml-auto">{alt.timestamp}</span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 leading-snug">{alt.title}</h3>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">{alt.description}</p>
                    <p className="text-xs text-blue-800 font-semibold mt-1 bg-blue-50/70 p-2 rounded-lg border border-blue-100">
                      <strong>Directive:</strong> {alt.actionRequired}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0 self-end md:self-center">
                  {alt.status === 'Active' ? (
                    <button
                      type="button"
                      onClick={() => handleResolve(alt.id)}
                      className="px-3.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold rounded-xl border border-emerald-300 transition"
                    >
                      Acknowledge &amp; Resolve
                    </button>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Resolved
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AlertsPage;
