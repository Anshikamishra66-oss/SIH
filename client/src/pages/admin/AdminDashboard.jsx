import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users, UserCheck, Building2, ClipboardList, TrendingUp, CheckCircle,
  Clock, IndianRupee, Wheat, CalendarPlus, ShieldAlert, BarChart3,
  ArrowUpRight, RefreshCw
} from 'lucide-react';
import { IoClose } from 'react-icons/io5';
import AdminLayout from '../../layouts/AdminLayout';
import { adminService } from '../../services';
import { formatCurrency, extractError } from '../../utils/constants';

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const res = await adminService.getDashboard();
      setData(res.data.data);
      setError('');
    } catch (err) {
      setError(extractError(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading && !data) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <RefreshCw className="w-8 h-8 text-primary-600 animate-spin mx-auto mb-3" />
            <p className="text-sm font-medium text-gray-600">Loading State Analytics...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  const { summary, bookingTrend = [], centreUtilization = [], cropStats = [] } = data || {};

  // Maximum value for scaling trends
  const maxTrend = Math.max(...bookingTrend.map((t) => t.count), 5);

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs bg-accent-100 text-accent-800 font-bold px-2.5 py-0.5 rounded-full uppercase">
                System Administration
              </span>
              <span className="text-xs text-gray-500 font-medium">State Procurement Command</span>
            </div>
            <h1 className="text-2xl font-black text-gray-950 mt-1">Operational Overview</h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchDashboard}
              className="p-2.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl transition flex items-center gap-2 text-xs font-semibold"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Refresh Data
            </button>
            <Link
              to="/admin/centres"
              className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-bold shadow-md transition flex items-center gap-1.5"
            >
              <CalendarPlus className="w-4 h-4" />
              Manage Slots
            </Link>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError('')} className="p-1 hover:bg-red-100 rounded-lg transition"><IoClose className="w-4 h-4" /></button>
          </div>
        )}

        {/* Primary Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between text-gray-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Registered Farmers</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-gray-900">{summary?.totalFarmers || 0}</p>
            <p className="text-[11px] text-gray-500 mt-1">Verified Aadhaar & Bank accounts</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between text-gray-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Total MSP Payouts</span>
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <IndianRupee className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-blue-900 font-mono">
              {formatCurrency(summary?.totalProcurementValue || 0)}
            </p>
            <p className="text-[11px] text-gray-500 mt-1">Direct Bank Settlements</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between text-gray-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Total Bookings</span>
              <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                <ClipboardList className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-gray-900">{summary?.totalBookings || 0}</p>
            <p className="text-[11px] text-emerald-600 font-semibold mt-1">
              +{summary?.todayBookings || 0} scheduled today
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between text-gray-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Procurement Centres</span>
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                <Building2 className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-gray-900">{summary?.totalCentres || 0}</p>
            <p className="text-[11px] text-gray-500 mt-1">{summary?.totalOfficers || 0} active officers on duty</p>
          </div>
        </div>

        {/* Charts & Analytical Visualizations */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 7-Day Booking Trend */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-base font-black text-gray-900">7-Day Booking Trend</h3>
                <p className="text-xs text-gray-500">Daily slot reservation volume across all mandis</p>
              </div>
              <span className="text-xs font-bold text-primary-600 bg-primary-50 px-2.5 py-1 rounded-full">
                Real-time
              </span>
            </div>

            {bookingTrend.length === 0 ? (
              <div className="h-48 flex items-center justify-center text-xs text-gray-400">
                No recent booking trend data available.
              </div>
            ) : (
              <div className="h-48 flex items-end justify-between gap-4 pt-4 px-2 border-b border-gray-100">
                {bookingTrend.map((day, i) => {
                  const heightPercent = Math.max((day.count / maxTrend) * 100, 10);
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                      <span className="text-[10px] font-bold text-gray-600 opacity-0 group-hover:opacity-100 transition">
                        {day.count}
                      </span>
                      <div className="w-full bg-gray-100 rounded-t-lg h-36 flex items-end overflow-hidden p-0.5">
                        <div
                          style={{ height: `${heightPercent}%` }}
                          className="w-full bg-gradient-to-t from-primary-600 to-primary-500 rounded-t-md transition-all duration-500 group-hover:from-emerald-600 group-hover:to-emerald-500"
                        ></div>
                      </div>
                      <span className="text-[10px] font-medium text-gray-500 truncate w-full text-center">
                        {day._id?.split('-').slice(1).join('/')}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Centre Capacity Utilization */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <h3 className="text-base font-black text-gray-900 mb-1">Mandi Utilization</h3>
            <p className="text-xs text-gray-500 mb-6">Booking distribution by centre</p>

            <div className="space-y-4">
              {centreUtilization.slice(0, 5).map((c, i) => (
                <div key={i} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-gray-800 truncate max-w-[180px]">{c.name}</span>
                    <span className="text-primary-700">{c.count} bookings</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div
                      className="bg-primary-600 h-2 rounded-full"
                      style={{ width: `${Math.min((c.count / 20) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
              ))}
              {centreUtilization.length === 0 && (
                <p className="text-xs text-gray-400 py-6 text-center">No centre utilization data recorded.</p>
              )}
            </div>
          </div>
        </div>

        {/* Crops Procurement Volume & Value Breakdown */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-base font-black text-gray-900">Crop Procurement Breakdown</h3>
              <p className="text-xs text-gray-500">Government MSP intake by major agricultural commodity</p>
            </div>
            <Link
              to="/admin/crops"
              className="text-xs font-bold text-primary-600 hover:text-primary-700 flex items-center gap-1"
            >
              Manage MSP Rates <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gray-200 text-gray-500 font-bold uppercase tracking-wider">
                  <th className="pb-3">Commodity</th>
                  <th className="pb-3">Procurements</th>
                  <th className="pb-3">Total Quantity</th>
                  <th className="pb-3">Disbursed Value</th>
                  <th className="pb-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {cropStats.map((item, idx) => (
                  <tr key={idx} className="hover:bg-gray-50 transition">
                    <td className="py-3.5 font-bold text-gray-900 flex items-center gap-2">
                      <Wheat className="w-4 h-4 text-amber-600" />
                      {item._id}
                    </td>
                    <td className="py-3.5 font-semibold text-gray-700">{item.count} lots</td>
                    <td className="py-3.5 font-semibold text-gray-700">{item.totalQuantity} Qtl</td>
                    <td className="py-3.5 font-bold font-mono text-emerald-800">
                      {formatCurrency(item.totalValue)}
                    </td>
                    <td className="py-3.5 text-right">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        Active MSP
                      </span>
                    </td>
                  </tr>
                ))}
                {cropStats.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-gray-400">
                      No procurement batches completed yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
