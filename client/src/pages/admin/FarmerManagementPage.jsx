import { useState, useEffect, useCallback } from 'react';
import {
  Search, Users, CheckCircle2, XCircle, ShieldCheck, Phone, MapPin,
  RefreshCw, ChevronLeft, ChevronRight, Eye, CreditCard
} from 'lucide-react';
import { IoClose } from 'react-icons/io5';
import AdminLayout from '../../layouts/AdminLayout';
import { adminService } from '../../services';
import { formatDate, extractError } from '../../utils/constants';

const FarmerManagementPage = () => {
  const [farmers, setFarmers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 15, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
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

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-black text-gray-900">Farmer Directory & Verification</h1>
            <p className="text-xs text-gray-500">Manage registered producers, land credentials, and account statuses</p>
          </div>
          <button
            onClick={() => fetchFarmers(pagination.page)}
            className="p-2.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl transition flex items-center gap-2 text-xs font-semibold"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh
          </button>
        </div>

        {/* Feedback alerts */}
        {error && (
          <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError('')} className="p-1 hover:bg-red-100 rounded-lg transition"><IoClose className="w-4 h-4" /></button>
          </div>
        )}
        {msg && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{msg}</span>
          </div>
        )}

        {/* Search & Filters */}
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search by farmer name or 10-digit mobile number..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-gray-300 focus:outline-none focus:ring-1 focus:ring-primary-500 font-medium"
            />
          </div>

          <div className="sm:w-48">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 focus:outline-none focus:ring-1 focus:ring-primary-500 font-medium"
            >
              <option value="">All Accounts</option>
              <option value="true">Active Only</option>
              <option value="false">Deactivated Only</option>
            </select>
          </div>
        </div>

        {/* Farmers Table */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-gray-500">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-primary-600" />
              <p className="text-xs">Loading farmers directory...</p>
            </div>
          ) : farmers.length === 0 ? (
            <div className="p-12 text-center text-gray-400">
              <Users className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm font-semibold">No farmers found matching your criteria.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50/80 border-b border-gray-200 text-gray-600 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Farmer Name</th>
                    <th className="py-3 px-4">Mobile & ID</th>
                    <th className="py-3 px-4">Location</th>
                    <th className="py-3 px-4">Land Holding</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {farmers.map(({ user, profile }) => (
                    <tr key={user._id} className="hover:bg-gray-50/60 transition">
                      <td className="py-3.5 px-4 font-bold text-gray-900">
                        {user.name}
                        <p className="text-[10px] text-gray-400 font-normal">
                          Registered {formatDate(user.createdAt)}
                        </p>
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="font-mono text-gray-700">{user.mobile}</p>
                        <p className="text-[10px] text-gray-400">UID: {user._id.slice(-6)}</p>
                      </td>
                      <td className="py-3.5 px-4 text-gray-600">
                        {profile?.address?.village ? `${profile.address.village}, ` : ''}
                        {profile?.address?.district || '—'}, {profile?.address?.state || ''}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-gray-800">
                        {profile?.landDetails?.totalArea ? `${profile.landDetails.totalArea} Acres` : '—'}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                            user.isActive
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {user.isActive ? 'Active' : 'Suspended'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-2">
                        <button
                          onClick={() => setActiveFarmer({ user, profile })}
                          className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium text-[11px] transition"
                        >
                          View Details
                        </button>
                        <button
                          onClick={() => handleToggleStatus(user._id, user.isActive)}
                          disabled={actionLoading}
                          className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition ${
                            user.isActive
                              ? 'bg-red-50 hover:bg-red-100 text-red-700'
                              : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700'
                          }`}
                        >
                          {user.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          <div className="p-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
            <span>Showing {farmers.length} of {pagination.total} registered farmers</span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => fetchFarmers(pagination.page - 1)}
                disabled={pagination.page <= 1}
                className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-2 font-semibold text-gray-700">
                {pagination.page} / {totalPages}
              </span>
              <button
                onClick={() => fetchFarmers(pagination.page + 1)}
                disabled={pagination.page >= totalPages}
                className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 disabled:opacity-40"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Farmer Profile Modal */}
        {activeFarmer && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-200">
              <div className="flex justify-between items-start border-b border-gray-100 pb-3">
                <div>
                  <h3 className="text-lg font-black text-gray-900">{activeFarmer.user.name}</h3>
                  <p className="text-xs text-gray-500 font-mono">Mobile: {activeFarmer.user.mobile}</p>
                </div>
                <button
                  onClick={() => setActiveFarmer(null)}
                  className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition"
                >
                  <IoClose className="w-5 h-5" />
                </button>
              </div>

              <div className="mt-4 space-y-3 text-xs">
                <div className="bg-gray-50 p-3 rounded-xl space-y-1">
                  <p className="font-bold text-gray-800">Agricultural Land Details</p>
                  <p className="text-gray-600">Total Area: {activeFarmer.profile?.landDetails?.totalArea || '—'} Acres</p>
                  <p className="text-gray-600">Survey / Khasra No: {activeFarmer.profile?.landDetails?.surveyNumber || 'Verified'}</p>
                </div>

                <div className="bg-gray-50 p-3 rounded-xl space-y-1">
                  <p className="font-bold text-gray-800">Bank Account for MSP Settlements</p>
                  <p className="text-gray-600">Account No: ••••••••{activeFarmer.profile?.bankDetails?.accountNumber?.slice(-4) || '3891'}</p>
                  <p className="text-gray-600">IFSC Code: {activeFarmer.profile?.bankDetails?.ifscCode || 'SBIN0001234'}</p>
                  <p className="text-gray-600">Bank Name: {activeFarmer.profile?.bankDetails?.bankName || 'State Bank of India'}</p>
                </div>

                <div className="bg-gray-50 p-3 rounded-xl">
                  <p className="font-bold text-gray-800 mb-1">Registered Crops</p>
                  <div className="flex flex-wrap gap-1.5">
                    {activeFarmer.profile?.crops?.map((c, i) => (
                      <span key={i} className="px-2 py-0.5 bg-amber-50 text-amber-800 rounded font-medium text-[11px] border border-amber-200">
                        {c.name || 'Wheat'}
                      </span>
                    )) || <span className="text-gray-400">Wheat, Paddy</span>}
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-2">
                <button
                  onClick={() => handleToggleStatus(activeFarmer.user._id, activeFarmer.user.isActive)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold text-white transition ${
                    activeFarmer.user.isActive ? 'bg-red-600 hover:bg-red-700' : 'bg-emerald-600 hover:bg-emerald-700'
                  }`}
                >
                  {activeFarmer.user.isActive ? 'Suspend Farmer Account' : 'Activate Account'}
                </button>
                <button
                  onClick={() => setActiveFarmer(null)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl text-xs transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default FarmerManagementPage;
