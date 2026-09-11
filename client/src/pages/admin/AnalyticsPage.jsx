import { useState, useEffect, useCallback } from 'react';
import {
  BarChart3, TrendingUp, IndianRupee, Wheat, Calendar, RefreshCw,
  CheckCircle2, Clock, AlertCircle, Award
} from 'lucide-react';
import { IoClose } from 'react-icons/io5';
import AdminLayout from '../../layouts/AdminLayout';
import { adminService } from '../../services';
import { formatCurrency, extractError } from '../../utils/constants';

const AnalyticsPage = () => {
  const [days, setDays] = useState(30);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminService.getAnalytics({ days });
      setData(res.data.data);
      setError('');
    } catch (err) {
      setError(extractError(err));
    } finally {
      setLoading(false);
    }
  }, [days]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const { bookingsByDay = [], paymentStats = [], topCrops = [] } = data || {};

  const totalPaymentValue = paymentStats.reduce((acc, curr) => acc + (curr.total || 0), 0);
  const maxDayBookings = Math.max(...bookingsByDay.map((b) => b.total), 5);

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-black text-gray-900">Procurement & Financial Analytics</h1>
            <p className="text-xs text-gray-500">Government MSP disbursement audit, throughput efficiency, and commodity trends</p>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
              className="px-3 py-2 bg-white border border-gray-200 text-xs rounded-xl font-bold text-gray-700 focus:ring-primary-500"
            >
              <option value={7}>Past 7 Days</option>
              <option value={15}>Past 15 Days</option>
              <option value={30}>Past 30 Days</option>
              <option value={90}>Past Quarter (90 Days)</option>
            </select>

            <button
              onClick={fetchAnalytics}
              className="p-2.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl transition"
              title="Refresh Data"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {error && (
          <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError('')} className="p-1 hover:bg-red-100 rounded-lg transition"><IoClose className="w-4 h-4" /></button>
          </div>
        )}

        {/* Financial Flow Summary */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-base font-black text-gray-900">Direct MSP Payment Settlements</h3>
              <p className="text-xs text-gray-500">Audit of direct benefit transfers to farmer accounts</p>
            </div>
            <div className="text-right">
              <span className="text-xs text-gray-400 font-medium">Total Settlement Value</span>
              <p className="text-2xl font-black text-emerald-900 font-mono">
                {formatCurrency(totalPaymentValue)}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {paymentStats.map((item, idx) => (
              <div key={idx} className="bg-gray-50 p-4 rounded-xl border border-gray-200/80">
                <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                  item._id === 'paid'
                    ? 'bg-emerald-100 text-emerald-800'
                    : item._id === 'processing'
                    ? 'bg-blue-100 text-blue-800'
                    : item._id === 'failed'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-amber-100 text-amber-800'
                }`}>
                  {item._id || 'Pending'}
                </span>
                <p className="text-lg font-black text-gray-900 font-mono mt-2">
                  {formatCurrency(item.total || 0)}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">{item.count} Farmer Transactions</p>
              </div>
            ))}
            {paymentStats.length === 0 && (
              <div className="col-span-full text-center py-6 text-xs text-gray-400">
                No payment transactions recorded in this period.
              </div>
            )}
          </div>
        </div>

        {/* Daily Procurement & Booking Volume */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <h3 className="text-base font-black text-gray-900 mb-1">Daily Bookings Volume</h3>
            <p className="text-xs text-gray-500 mb-6">Volume of scheduled farmer visits per calendar day</p>

            {loading ? (
              <div className="h-48 flex items-center justify-center text-xs text-gray-400">
                Loading volume charts...
              </div>
            ) : bookingsByDay.length === 0 ? (
              <div className="h-48 flex items-center justify-center text-xs text-gray-400">
                No bookings recorded in this timeframe.
              </div>
            ) : (
              <div className="h-48 flex items-end justify-between gap-2 pt-4 px-2 border-b border-gray-100">
                {bookingsByDay.slice(-14).map((d, i) => {
                  const h = Math.max((d.total / maxDayBookings) * 100, 10);
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1.5 group">
                      <span className="text-[9px] font-bold text-gray-600 opacity-0 group-hover:opacity-100 transition">
                        {d.total}
                      </span>
                      <div className="w-full bg-gray-100 rounded-t-lg h-36 flex items-end overflow-hidden p-0.5">
                        <div
                          style={{ height: `${h}%` }}
                          className="w-full bg-primary-600 rounded-t-sm group-hover:bg-primary-700 transition"
                        ></div>
                      </div>
                      <span className="text-[9px] text-gray-400 truncate w-full text-center">
                        {d._id?.slice(5)}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Top Crops by MSP Volume */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <h3 className="text-base font-black text-gray-900 mb-1">Top Procured Commodities</h3>
            <p className="text-xs text-gray-500 mb-6">Leading grain categories by intake tonnage and disbursed MSP</p>

            <div className="space-y-4">
              {topCrops.map((c, i) => (
                <div key={i} className="bg-gray-50 p-3.5 rounded-xl border border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xs">
                      #{i + 1}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-xs">{c._id}</p>
                      <p className="text-[11px] text-gray-500">{c.quantity} Quintals Procured</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-bold text-emerald-800 text-xs">
                      {formatCurrency(c.value)}
                    </span>
                  </div>
                </div>
              ))}
              {topCrops.length === 0 && (
                <p className="text-xs text-gray-400 py-12 text-center">No crop data recorded.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AnalyticsPage;
