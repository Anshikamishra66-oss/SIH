import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar, Ticket, MapPin, Clock, Users, CreditCard, ArrowRight,
  Plus, Bell, CheckCircle, AlertCircle, Package
} from 'lucide-react';
import { FaHandPaper } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { bookingService, notificationService } from '../../services';
import { formatDate, formatTime, formatCurrency, formatWaitTime, extractError } from '../../utils/constants';
import FarmerLayout from '../../layouts/FarmerLayout';
import Badge from '../../components/common/Badge';
import QueueTracker from '../../components/farmer/QueueTracker';
import ProcurementTimeline from '../../components/farmer/ProcurementTimeline';
import { CardSkeleton, StatCardSkeleton } from '../../components/common/Spinner';
import EmptyState from '../../components/common/EmptyState';
import Button from '../../components/common/Button';
import toast from 'react-hot-toast';

const StatCard = ({ label, value, icon: Icon, color = 'primary', sub }) => (
  <div className="stat-card">
    <div className="flex items-start justify-between">
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{label}</p>
        <p className={`text-2xl font-bold mt-1 text-${color}-700`}>{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
      <div className={`w-10 h-10 bg-${color}-100 rounded-lg flex items-center justify-center flex-shrink-0 ml-3`}>
        <Icon className={`w-5 h-5 text-${color}-600`} />
      </div>
    </div>
  </div>
);

const FarmerDashboard = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeBooking, setActiveBooking] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [bookingsRes, notifRes] = await Promise.all([
          bookingService.getBookings({ limit: 5 }),
          notificationService.getNotifications({ limit: 5, unreadOnly: 'true' }),
        ]);
        const allBookings = bookingsRes.data.data.bookings;
        setBookings(allBookings);

        // Find the most recent active booking
        const active = allBookings.find((b) =>
          !['cancelled', 'payment_completed'].includes(b.status)
        );
        setActiveBooking(active || allBookings[0] || null);

        setNotifications(notifRes.data.data.notifications);
      } catch (err) {
        toast.error(extractError(err));
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const firstName = user?.name?.split(' ')[0] || 'Farmer';

  return (
    <FarmerLayout>
      {/* Welcome header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <span>Welcome, {firstName}</span>
          <FaHandPaper className="text-amber-500 w-5 h-5 inline transform rotate-12" />
        </h1>
        <p className="text-gray-500 text-sm mt-0.5">
          {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>

      {loading ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1,2,3,4].map(i => <StatCardSkeleton key={i} />)}
          </div>
          <CardSkeleton />
        </div>
      ) : !activeBooking ? (
        /* No booking state */
        <div className="space-y-4">
          <EmptyState
            icon={Calendar}
            title="No upcoming procurement bookings"
            description="Book a slot at a nearby procurement centre to get started."
            action={
              <Button variant="primary" size="lg" rightIcon={<ArrowRight className="w-4 h-4" />}>
                <Link to="/farmer/book">Book a Slot</Link>
              </Button>
            }
            className="card py-20"
          />
        </div>
      ) : (
        <div className="space-y-5">
          {/* Stats row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              label="My Token"
              value={activeBooking.token}
              icon={Ticket}
              color="primary"
              sub="Today's token"
            />
            <StatCard
              label="Booking Status"
              value={activeBooking.status.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
              icon={CheckCircle}
              color={['payment_completed', 'procurement_completed'].includes(activeBooking.status) ? 'primary' : 'amber'}
            />
            <StatCard
              label="Crop"
              value={activeBooking.cropName || 'N/A'}
              icon={Package}
              color="earth"
              sub={`${activeBooking.quantity} ${activeBooking.unit}`}
            />
            <StatCard
              label="Slot Time"
              value={formatTime(activeBooking.slotStartTime)}
              icon={Clock}
              color="accent"
              sub={formatDate(activeBooking.bookingDate)}
            />
          </div>

          {/* Main content */}
          <div className="grid lg:grid-cols-3 gap-5">
            {/* Left: booking detail */}
            <div className="lg:col-span-2 space-y-4">
              {/* Booking card */}
              <div className="card p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-base font-semibold text-gray-900">Today's Procurement</h2>
                  <Badge status={activeBooking.status} dot />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">Centre</p>
                    <div className="flex items-start gap-1.5">
                      <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                      <p className="text-sm font-medium text-gray-900">
                        {activeBooking.centreId?.name || '—'}
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">Date</p>
                    <p className="text-sm font-medium text-gray-900">
                      {formatDate(activeBooking.bookingDate)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">Time Slot</p>
                    <p className="text-sm font-medium text-gray-900">
                      {formatTime(activeBooking.slotStartTime)} – {formatTime(activeBooking.slotEndTime)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">Booking ID</p>
                    <p className="text-sm font-mono text-gray-700">{activeBooking.bookingId}</p>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100">
                  <Link
                    to={`/farmer/bookings/${activeBooking._id}`}
                    className="text-sm text-primary-600 font-medium flex items-center gap-1 hover:text-primary-700"
                  >
                    View full booking details <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              {/* Queue tracker */}
              {['booked', 'arrived', 'verification', 'verified'].includes(activeBooking.status) && (
                <QueueTracker
                  centreId={activeBooking.centreId?._id}
                  token={activeBooking.token}
                  bookingDate={activeBooking.bookingDate}
                />
              )}

              {/* Recent notifications */}
              {notifications.length > 0 && (
                <div className="card p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                      <Bell className="w-4 h-4 text-primary-600" />
                      Recent Notifications
                    </h3>
                    <Link to="/farmer/notifications" className="text-xs text-primary-600 hover:underline">
                      View all
                    </Link>
                  </div>
                  <div className="space-y-3">
                    {notifications.slice(0, 3).map((n) => (
                      <div key={n._id} className="flex gap-3 text-sm">
                        <div className="w-2 h-2 bg-primary-500 rounded-full flex-shrink-0 mt-1.5" />
                        <div>
                          <p className="font-medium text-gray-900">{n.title}</p>
                          <p className="text-gray-500 text-xs mt-0.5">{n.message}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right: progress timeline */}
            <div className="space-y-4">
              <div className="card p-5">
                <ProcurementTimeline status={activeBooking.status} />
              </div>

              {/* Quick actions */}
              <div className="card p-5">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Quick Actions</h3>
                <div className="space-y-2">
                  <Link
                    to="/farmer/book"
                    className="flex items-center justify-between p-3 rounded-lg bg-primary-50 text-primary-700 hover:bg-primary-100 transition-colors"
                  >
                    <div className="flex items-center gap-2.5 text-sm font-medium">
                      <Plus className="w-4 h-4" />
                      Book New Slot
                    </div>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link
                    to="/farmer/bookings"
                    className="flex items-center justify-between p-3 rounded-lg bg-gray-50 text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-2.5 text-sm font-medium">
                      <Calendar className="w-4 h-4" />
                      All Bookings
                    </div>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link
                    to="/farmer/history"
                    className="flex items-center justify-between p-3 rounded-lg bg-gray-50 text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-2.5 text-sm font-medium">
                      <CreditCard className="w-4 h-4" />
                      Payment History
                    </div>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </FarmerLayout>
  );
};

export default FarmerDashboard;
