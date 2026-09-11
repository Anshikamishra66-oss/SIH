import { useState, useEffect, useCallback } from 'react';
import {
  Search, Filter, Calendar, CheckCircle2, Clock, Phone, MapPin,
  RefreshCw, ArrowRight, UserCheck, ChevronLeft, ChevronRight
} from 'lucide-react';
import { IoClose } from 'react-icons/io5';
import OfficerLayout from '../../layouts/OfficerLayout';
import { officerService, queueService } from '../../services';
import {
  formatDate, formatTime, formatCurrency, extractError,
  BOOKING_STATUS_COLORS, BOOKING_STATUS_LABELS
} from '../../utils/constants';

const OfficerBookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 15, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [activeBooking, setActiveBooking] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [msg, setMsg] = useState('');

  const fetchBookings = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const res = await officerService.getBookings({
        date: selectedDate,
        status: statusFilter || undefined,
        search: search || undefined,
        page,
        limit: pagination.limit,
      });
      setBookings(res.data.data.bookings || []);
      setPagination(res.data.data.pagination || { page, limit: 15, total: 0 });
      setError('');
    } catch (err) {
      setError(extractError(err));
    } finally {
      setLoading(false);
    }
  }, [selectedDate, statusFilter, search, pagination.limit]);

  useEffect(() => {
    fetchBookings(1);
  }, [fetchBookings]);

  const handleMarkArrived = async (token, centreId) => {
    setActionLoading(true);
    try {
      await queueService.markArrived(token, centreId);
      setMsg(`Farmer with token ${token} marked as arrived.`);
      setTimeout(() => setMsg(''), 3500);
      fetchBookings(pagination.page);
      if (activeBooking) setActiveBooking(null);
    } catch (err) {
      setError(extractError(err));
    } finally {
      setActionLoading(false);
    }
  };

  const totalPages = Math.ceil((pagination.total || 0) / pagination.limit) || 1;

  return (
    <OfficerLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-black text-gray-900">Procurement Centre Bookings</h1>
            <p className="text-xs text-gray-500">Manage daily schedules, verify arriving farmers, and monitor progress</p>
          </div>
          <button
            onClick={() => fetchBookings(pagination.page)}
            className="p-2.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl transition flex items-center gap-2 text-xs font-semibold"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh
          </button>
        </div>

        {/* Feedback alerts */}
        {error && (
          <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex justify-between items-center">
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

        {/* Search and Filters Bar */}
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search token, name, or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-gray-300 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>

          <div className="relative">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 focus:outline-none focus:ring-1 focus:ring-primary-500 font-medium"
            />
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 focus:outline-none focus:ring-1 focus:ring-primary-500 font-medium"
            >
              <option value="">All Statuses</option>
              <option value="booked">Booked (Upcoming)</option>
              <option value="arrived">Arrived at Mandi</option>
              <option value="verification">In Verification</option>
              <option value="procurement_completed">Procured / Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Bookings Table */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-gray-500">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-primary-600" />
              <p className="text-xs">Loading bookings data...</p>
            </div>
          ) : bookings.length === 0 ? (
            <div className="p-12 text-center text-gray-400">
              <Calendar className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm font-semibold">No bookings found for selected criteria.</p>
              <p className="text-xs text-gray-500 mt-1">Try changing the date or clearing filters.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50/80 border-b border-gray-200 text-gray-600 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Token & ID</th>
                    <th className="py-3 px-4">Farmer Details</th>
                    <th className="py-3 px-4">Crop & Quantity</th>
                    <th className="py-3 px-4">Slot Time</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {bookings.map((b) => (
                    <tr key={b._id} className="hover:bg-gray-50/60 transition">
                      <td className="py-3.5 px-4 font-mono">
                        <span className="font-bold text-primary-700 text-sm">{b.token}</span>
                        <p className="text-[10px] text-gray-400">{b.bookingId}</p>
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="font-semibold text-gray-900">{b.farmerId?.name}</p>
                        <p className="text-[10px] text-gray-500 flex items-center gap-1">
                          <Phone className="w-2.5 h-2.5" /> {b.farmerId?.mobile}
                        </p>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-gray-800">{b.cropName}</span>
                        <span className="text-gray-500 ml-1">({b.quantity} {b.unit})</span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-gray-700">
                        {formatTime(b.slotStartTime)} - {formatTime(b.slotEndTime)}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] bg-${
                            BOOKING_STATUS_COLORS[b.status] || 'gray'
                          }-100 text-${BOOKING_STATUS_COLORS[b.status] || 'gray'}-800`}
                        >
                          {BOOKING_STATUS_LABELS[b.status] || b.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-2">
                        {b.status === 'booked' && (
                          <button
                            onClick={() => handleMarkArrived(b.token, b.centreId)}
                            disabled={actionLoading}
                            className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-bold text-[11px] shadow-sm transition"
                          >
                            Mark Arrived
                          </button>
                        )}
                        <button
                          onClick={() => setActiveBooking(b)}
                          className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium text-[11px] transition"
                        >
                          Details
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
            <span>
              Showing {bookings.length} of {pagination.total} records
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => fetchBookings(pagination.page - 1)}
                disabled={pagination.page <= 1}
                className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-2 font-semibold text-gray-700">
                {pagination.page} / {totalPages}
              </span>
              <button
                onClick={() => fetchBookings(pagination.page + 1)}
                disabled={pagination.page >= totalPages}
                className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 disabled:opacity-40"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Booking Details Modal */}
        {activeBooking && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-200">
              <div className="flex justify-between items-start border-b border-gray-100 pb-3">
                <div>
                  <span className="text-xs font-mono font-bold text-primary-700">{activeBooking.token}</span>
                  <h3 className="text-lg font-black text-gray-900 mt-0.5">Booking Details</h3>
                </div>
                <button
                  onClick={() => setActiveBooking(null)}
                  className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition"
                >
                  <IoClose className="w-5 h-5" />
                </button>
              </div>

              <div className="mt-4 space-y-3 text-xs">
                <div className="bg-gray-50 p-3 rounded-xl">
                  <p className="font-bold text-gray-900">{activeBooking.farmerId?.name}</p>
                  <p className="text-gray-600">Mobile: {activeBooking.farmerId?.mobile}</p>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-gray-50 p-2.5 rounded-xl">
                    <span className="text-gray-500">Crop:</span>
                    <p className="font-bold text-gray-900">{activeBooking.cropName}</p>
                  </div>
                  <div className="bg-gray-50 p-2.5 rounded-xl">
                    <span className="text-gray-500">Quantity:</span>
                    <p className="font-bold text-gray-900">{activeBooking.quantity} {activeBooking.unit}</p>
                  </div>
                </div>

                <div className="bg-gray-50 p-2.5 rounded-xl">
                  <span className="text-gray-500">Slot Schedule:</span>
                  <p className="font-bold text-gray-900">
                    {formatDate(activeBooking.bookingDate)} ({formatTime(activeBooking.slotStartTime)} - {formatTime(activeBooking.slotEndTime)})
                  </p>
                </div>

                <div className="bg-gray-50 p-2.5 rounded-xl">
                  <span className="text-gray-500">Current Status:</span>
                  <p className="font-bold text-primary-700 uppercase">{activeBooking.status}</p>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-2">
                {activeBooking.status === 'booked' && (
                  <button
                    onClick={() => handleMarkArrived(activeBooking.token, activeBooking.centreId)}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs transition"
                  >
                    Check-in (Mark Arrived)
                  </button>
                )}
                <button
                  onClick={() => setActiveBooking(null)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl text-xs transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </OfficerLayout>
  );
};

export default OfficerBookingsPage;
