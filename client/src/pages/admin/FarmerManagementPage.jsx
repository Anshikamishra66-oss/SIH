import { useState, useEffect, useCallback } from 'react';
import {
  Search, Users, CheckCircle2, XCircle, ShieldCheck, Phone, MapPin,
  RefreshCw, ChevronLeft, ChevronRight, Eye, CreditCard, Landmark,
  Filter, Download, AlertCircle, FileText, UserCheck
} from 'lucide-react';
import { IoClose } from 'react-icons/io5';
import AdminLayout from '../../layouts/AdminLayout';
import { adminService } from '../../services';
import { formatDate, extractError } from '../../utils/constants';

const STATE_SUMMARY_FARMERS = [
  { state: 'Punjab', registered: 6420, verified: 6290, active: 5840 },
  { state: 'Haryana', registered: 4890, verified: 4720, active: 4310 },
  { state: 'Madhya Pradesh', registered: 7150, verified: 6910, active: 6200 },
  { state: 'Uttar Pradesh', registered: 8940, verified: 8520, active: 7890 },
  { state: 'Rajasthan', registered: 3820, verified: 3640, active: 3120 },
];

const FarmerManagementPage = () => {
  const [farmers, setFarmers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 15, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedState, setSelectedState] = useState('All');
  const [activeFarmer, setActiveFarmer] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [msg, setMsg] = useState('');

  const fetchFarmers = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const res = await adminService.getFarmers({
        page,
        limit: pagination.limit,
        search: search || undefined,
        isActive: statusFilter !== '' ? statusFilter : undefined,
      });
      setFarmers(res.data.data.farmers || []);
      setPagination(res.data.data.pagination || { page, limit: 15, total: 0 });
      setError('');
    } catch (err) {
      setError(extractError(err));
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, pagination.limit]);

  useEffect(() => {
    fetchFarmers(1);
  }, [fetchFarmers]);

  const handleToggleStatus = async (farmerId, currentActive) => {
    setActionLoading(true);
    try {
      await adminService.toggleFarmerStatus(farmerId);
      setMsg(`Farmer account ${currentActive ? 'deactivated' : 'activated'} successfully.`);
      setTimeout(() => setMsg(''), 3500);
      fetchFarmers(pagination.page);
      if (activeFarmer) setActiveFarmer(null);
    } catch (err) {
      setError(extractError(err));
    } finally {
      setActionLoading(false);
    }
  };

  const totalPages = Math.ceil((pagination.total || 0) / pagination.limit) || 1;

  // Filter farmers by selected state
  const displayedFarmers = farmers.filter((f) => {
    if (selectedState === 'All') return true;
    const st = f.profile?.state || f.user?.state;
    return st?.toLowerCase() === selectedState.toLowerCase();
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
              <span className="text-blue-700 font-bold">Farmer Administration</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 mt-1 flex items-center gap-2">
              <span>Consolidated Farmer Surveillance</span>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                Aadhaar &amp; Land Registry Connected
              </span>
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Executive national registry surveillance, KYC status verification, and DBT eligibility oversight.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchFarmers(pagination.page)}
              className="p-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl transition flex items-center gap-1.5 text-xs font-bold shadow-sm"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* National Farmer Summary KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-[10px] uppercase font-bold text-slate-500">National Registered</span>
            <p className="text-2xl font-black text-slate-900 mt-0.5">31,220</p>
            <p className="text-[10px] text-slate-500 mt-0.5">Across 5 States</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-[10px] uppercase font-bold text-slate-500">Verified Producers</span>
            <p className="text-2xl font-black text-emerald-800 mt-0.5">30,080</p>
            <p className="text-[10px] text-emerald-700 font-bold mt-0.5">96.3% KYC Compliance</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-[10px] uppercase font-bold text-slate-500">Active Procurement</span>
            <p className="text-2xl font-black text-blue-900 mt-0.5">27,360</p>
            <p className="text-[10px] text-blue-700 font-bold mt-0.5">With Slot Bookings</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-[10px] uppercase font-bold text-slate-500">DBT Bank Verified</span>
            <p className="text-2xl font-black text-purple-900 mt-0.5">29,840</p>
            <p className="text-[10px] text-purple-700 font-bold mt-0.5">Direct Credit Enabled</p>
          </div>
        </div>

        {/* State Breakdown Cards */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Landmark className="w-3.5 h-3.5 text-blue-700" />
              <span>State-Wise Farmer Enrollment Distribution</span>
            </h2>
            <span className="text-[11px] text-slate-500">Drill down by selecting a state</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {STATE_SUMMARY_FARMERS.map((st) => (
              <button
                key={st.state}
                type="button"
                onClick={() => setSelectedState(selectedState === st.state ? 'All' : st.state)}
                className={`p-3 rounded-xl border text-left transition-all ${
                  selectedState === st.state
                    ? 'border-blue-600 bg-blue-50/70 shadow-sm'
                    : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                }`}
              >
                <p className="font-bold text-xs text-slate-900">{st.state}</p>
                <p className="text-lg font-black text-slate-800 font-mono mt-0.5">
                  {st.registered.toLocaleString()}
                </p>
                <p className="text-[10px] text-emerald-700 font-semibold mt-0.5">
                  {st.verified.toLocaleString()} verified
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Feedback messages */}
        {error && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError('')} className="p-1 hover:bg-rose-100 rounded-lg transition">
              <IoClose className="w-4 h-4" />
            </button>
          </div>
        )}
        {msg && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{msg}</span>
          </div>
        )}

        {/* Search & Filter Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative flex-1 w-full sm:w-auto">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by farmer name or mobile number..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700"
            >
              <option value="All">All States</option>
              <option value="Punjab">Punjab</option>
              <option value="Haryana">Haryana</option>
              <option value="Madhya Pradesh">Madhya Pradesh</option>
              <option value="Uttar Pradesh">Uttar Pradesh</option>
              <option value="Rajasthan">Rajasthan</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700"
            >
              <option value="">All Statuses</option>
              <option value="true">Active Only</option>
              <option value="false">Deactivated</option>
            </select>
          </div>
        </div>

        {/* Farmer Registry Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-700" />
              <span>National Producer Registry</span>
            </h2>
            <span className="text-xs text-slate-500 font-medium">
              Showing {displayedFarmers.length} of {pagination.total || displayedFarmers.length} records
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Farmer Profile</th>
                  <th className="py-3 px-3">Contact</th>
                  <th className="py-3 px-3">State / District</th>
                  <th className="py-3 px-3">Farmer ID Number</th>
                  <th className="py-3 px-3">Enrolled Date</th>
                  <th className="py-3 px-3 text-center">KYC / Verification</th>
                  <th className="py-3 px-3 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Administrative Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {displayedFarmers.map((row) => {
                  const u = row.user;
                  const p = row.profile;
                  const displayId = p?.farmerIdNumber || `FMR-IN-${String(u.mobile).slice(-4)}`;

                  return (
                    <tr key={u._id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 font-bold text-slate-900 flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs flex-shrink-0">
                          {u.name?.charAt(0) || 'F'}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{u.name}</p>
                          <p className="text-[10px] text-slate-400 font-normal">{p?.village || 'Primary Producer'}</p>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-slate-700 font-mono font-semibold">{u.mobile}</td>
                      <td className="py-3 px-3">
                        <p className="font-bold text-slate-800">{p?.state || u.state || 'Punjab'}</p>
                        <p className="text-[10px] text-slate-500">{p?.district || u.district || 'Ludhiana'}</p>
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-blue-800">{displayId}</td>
                      <td className="py-3 px-3 text-slate-500">{formatDate(u.createdAt)}</td>
                      <td className="py-3 px-3 text-center">
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Verified</span>
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span
                          className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            u.isActive
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : 'bg-rose-100 text-rose-800 border border-rose-200'
                          }`}
                        >
                          {u.isActive ? 'Active' : 'Suspended'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          disabled={actionLoading}
                          onClick={() => handleToggleStatus(u._id, u.isActive)}
                          className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all ${
                            u.isActive
                              ? 'text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200'
                              : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200'
                          }`}
                        >
                          {u.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>
              Page {pagination.page} of {totalPages}
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={pagination.page <= 1 || loading}
                onClick={() => fetchFarmers(pagination.page - 1)}
                className="p-1 rounded-lg border border-slate-200 hover:bg-white disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={pagination.page >= totalPages || loading}
                onClick={() => fetchFarmers(pagination.page + 1)}
                className="p-1 rounded-lg border border-slate-200 hover:bg-white disabled:opacity-40"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default FarmerManagementPage;
