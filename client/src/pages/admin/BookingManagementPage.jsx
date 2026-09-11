import { useState, useEffect, useCallback } from 'react';
import {
  ClipboardList, Search, Filter, Calendar, Download, RefreshCw,
  Phone, Building2, ChevronLeft, ChevronRight, CheckCircle2
} from 'lucide-react';
import { IoClose } from 'react-icons/io5';
import AdminLayout from '../../layouts/AdminLayout';
import { adminService } from '../../services';
import {
  formatDate, formatTime, formatCurrency, extractError,
  BOOKING_STATUS_COLORS, BOOKING_STATUS_LABELS
} from '../../utils/constants';

const BookingManagementPage = () => {
  const [bookings, setBookings] = useState([]);
  const [centres, setCentres] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 15, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeBooking, setActiveBooking] = useState(null);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [centreFilter, setCentreFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  const fetchBookings = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const res = await adminService.getAllBookings({
        page,
        limit: pagination.limit,
        status: statusFilter || undefined,
        centreId: centreFilter || undefined,
        date: dateFilter || undefined,
        search: search || undefined,
      });
      setBookings(res.data.data.bookings || []);
      setPagination(res.data.data.pagination || { page, limit: 15, total: 0 });
      setError('');
    } catch (err) {
      setError(extractError(err));
    } finally {
      setLoading(false);
    }
  }, [statusFilter, centreFilter, dateFilter, search, pagination.limit]);

  useEffect(() => {
    adminService.getCentres().then((res) => {
      setCentres(res.data.data.centres || []);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    fetchBookings(1);
  }, [fetchBookings]);

  const handleExportCSV = () => {
    if (!bookings.length) return;
    const headers = ['Token', 'Booking ID', 'Farmer Name', 'Mobile', 'Mandi Centre', 'Crop', 'Quantity', 'Unit', 'Date', 'Slot Time', 'Status'];
    const rows = bookings.map((b) => [
      b.token,
      b.bookingId,
      `"${b.farmerId?.name || ''}"`,
      b.farmerId?.mobile || '',
      `"${b.centreId?.name || ''}"`,
      b.cropName,
      b.quantity,
      b.unit,
      formatDate(b.bookingDate),
      `"${b.slotStartTime} - ${b.slotEndTime}"`,
      b.status,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `kisan_bookings_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totalPages = Math.ceil((pagination.total || 0) / pagination.limit) || 1;

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-black text-gray-900">Mandi Slot Bookings</h1>
            <p className="text-xs text-gray-500">Cross-district schedule monitoring, grain deliveries, and token records</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => fetchBookings(pagination.page)}
              className="p-2.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl transition flex items-center gap-2 text-xs font-semibold"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Refresh
            </button>
            <button
              onClick={handleExportCSV}
              className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-bold shadow-md transition flex items-center gap-1.5"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
          </div>
        </div>

        {error && (
          <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError('')} className="p-1 hover:bg-red-100 rounded-lg transition"><IoClose className="w-4 h-4" /></button>
          </div>
        )}

        {/* Filter Controls */}
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search token or farmer..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-gray-300 focus:outline-none focus:ring-1 focus:ring-primary-500 font-medium"
            />
          </div>

          <div>
            <select
              value={centreFilter}
              onChange={(e) => setCentreFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 focus:outline-none focus:ring-1 focus:ring-primary-500 font-medium"
            >
              <option value="">All Mandi Centres</option>
              {centres.map((c) => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 focus:outline-none focus:ring-1 focus:ring-primary-500 font-medium"
            >
              <option value="">All Statuses</option>
              <option value="booked">Booked</option>
              <option value="arrived">Arrived</option>
              <option value="verification">Verification</option>
              <option value="procurement_completed">Procurement Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 focus:outline-none focus:ring-1 focus:ring-primary-500 font-medium"
            />
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
              <ClipboardList className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm font-semibold">No bookings found matching selected filters.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50/80 border-b border-gray-200 text-gray-600 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Token</th>
                    <th className="py-3 px-4">Farmer Details</th>
                    <th className="py-3 px-4">Mandi Centre</th>
                    <th className="py-3 px-4">Crop & Qty</th>
                    <th className="py-3 px-4">Date & Slot</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">View</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {bookings.map((b) => (
                    <tr key={b._id} className="hover:bg-gray-50/60 transition">
                      <td className="py-3.5 px-4 font-mono font-bold text-primary-700">
                        {b.token}
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="font-semibold text-gray-900">{b.farmerId?.name || 'Farmer'}</p>
                        <p className="text-[10px] text-gray-400">{b.farmerId?.mobile}</p>
                      </td>
                      <td className="py-3.5 px-4 text-gray-700">
                        {b.centreId?.name}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-gray-800">
                        {b.cropName} ({b.quantity} {b.unit})
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="font-semibold text-gray-800">{formatDate(b.bookingDate)}</p>
                        <p className="text-[10px] text-gray-500 font-mono">
                          {formatTime(b.slotStartTime)} - {formatTime(b.slotEndTime)}
                        </p>
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
                      <td className="py-3.5 px-4 text-right">
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
            <span>Showing {bookings.length} of {pagination.total} bookings</span>
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

        {/* Details Modal */}
        {activeBooking && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-200">
              <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                <h3 className="text-lg font-black text-gray-900">Booking Summary</h3>
                <button onClick={() => setActiveBooking(null)} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition"><IoClose className="w-5 h-5" /></button>
              </div>

              <div className="mt-4 space-y-2 text-xs">
                <div className="bg-gray-50 p-3 rounded-xl flex justify-between items-center">
                  <span className="text-gray-500">Token Number</span>
                  <span className="font-mono font-bold text-base text-primary-700">{activeBooking.token}</span>
                </div>
                <div className="bg-gray-50 p-3 rounded-xl">
                  <span className="text-gray-500">Farmer</span>
                  <p className="font-bold text-gray-900">{activeBooking.farmerId?.name}</p>
                  <p className="text-gray-500">{activeBooking.farmerId?.mobile}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-xl">
                  <span className="text-gray-500">Mandi Centre</span>
                  <p className="font-bold text-gray-900">{activeBooking.centreId?.name}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-xl flex justify-between">
                  <span className="text-gray-500">Commodity</span>
                  <span className="font-bold text-gray-900">{activeBooking.cropName} ({activeBooking.quantity} {activeBooking.unit})</span>
                </div>
                <div className="bg-gray-50 p-3 rounded-xl flex justify-between">
                  <span className="text-gray-500">Status</span>
                  <span className="font-bold text-primary-700 uppercase">{activeBooking.status}</span>
                </div>
              </div>

              <div className="mt-5 flex justify-end">
                <button
                  onClick={() => setActiveBooking(null)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl text-xs"
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

export default BookingManagementPage;
