import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, MapPin, Clock, Package, CreditCard, Phone, AlertTriangle, CheckCircle } from 'lucide-react';
import { FaBell } from 'react-icons/fa';
import { bookingService } from '../../services';
import { formatDate, formatTime, formatCurrency, extractError } from '../../utils/constants';
import FarmerLayout from '../../layouts/FarmerLayout';
import Badge from '../../components/common/Badge';
import ProcurementTimeline from '../../components/farmer/ProcurementTimeline';
import QueueTracker from '../../components/farmer/QueueTracker';
import { CardSkeleton } from '../../components/common/Spinner';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import toast from 'react-hot-toast';

const BookingDetailPage = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelModal, setCancelModal] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const fetchData = async () => {
    try {
      const res = await bookingService.getBookingById(id);
      setData(res.data.data);
    } catch (err) {
      toast.error(extractError(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [id]);

  const handleCancel = async () => {
    setCancelling(true);
    try {
      await bookingService.cancelBooking(id, { reason: 'Cancelled by farmer' });
      toast.success('Booking cancelled successfully.');
      setCancelModal(false);
      fetchData();
    } catch (err) {
      toast.error(extractError(err));
    } finally {
      setCancelling(false);
    }
  };

  if (loading) return <FarmerLayout><CardSkeleton rows={6} /></FarmerLayout>;

  const { booking, procurement, payment, queueEntry } = data || {};
  if (!booking) return <FarmerLayout><p className="text-center text-gray-500 py-12">Booking not found.</p></FarmerLayout>;

  const canCancel = !['cancelled', 'arrived', 'verification', 'verified',
    'procurement_in_progress', 'procurement_completed', 'payment_processing', 'payment_completed'].includes(booking.status);

  return (
    <FarmerLayout>
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Link to="/farmer/bookings" className="p-2 rounded-lg hover:bg-gray-100 text-gray-500">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Booking Details</h1>
            <p className="text-sm text-gray-500 font-mono">{booking.bookingId}</p>
          </div>
          <div className="ml-auto">
            <Badge status={booking.status} dot />
          </div>
        </div>

        <div className="space-y-4">
          {/* Token + Queue */}
          {['booked', 'arrived', 'verification', 'verified'].includes(booking.status) && (
            <QueueTracker
              centreId={booking.centreId?._id}
              token={booking.token}
              bookingDate={booking.bookingDate}
            />
          )}

          {/* Booking info */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-gray-900">Booking Information</h2>
              <span className="font-mono font-bold text-2xl text-primary-700">{booking.token}</span>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Centre</p>
                <div className="flex items-start gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-gray-400 flex-shrink-0 mt-0.5" />
                  <p className="font-medium text-gray-900">{booking.centreId?.name}</p>
                </div>
                <p className="text-xs text-gray-400 ml-5">{booking.centreId?.address}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Contact</p>
                <div className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-gray-400" />
                  <p className="text-gray-700">{booking.centreId?.contactPhone || 'N/A'}</p>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Date</p>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-gray-400" />
                  <p className="font-medium">{formatDate(booking.bookingDate)}</p>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Time Slot</p>
                <p className="font-medium">{formatTime(booking.slotStartTime)} – {formatTime(booking.slotEndTime)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Crop</p>
                <div className="flex items-center gap-1.5">
                  <Package className="w-3.5 h-3.5 text-gray-400" />
                  <p className="font-medium">{booking.cropName}</p>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Quantity</p>
                <p className="font-medium">{booking.quantity} {booking.unit}</p>
              </div>
            </div>

            {canCancel && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <Button variant="danger" size="sm" onClick={() => setCancelModal(true)}>
                  Cancel Booking
                </Button>
              </div>
            )}
          </div>

          {/* Procurement */}
          {procurement && (
            <div className="card p-5">
              <h2 className="text-sm font-semibold text-gray-900 mb-4">Procurement Details</h2>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Grade</p>
                  <p className="font-medium">{procurement.grade || 'Pending'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Price / Quintal</p>
                  <p className="font-medium">{procurement.pricePerUnit ? formatCurrency(procurement.pricePerUnit) : 'TBD'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Total Amount</p>
                  <p className="text-lg font-bold text-primary-700">
                    {procurement.totalAmount ? formatCurrency(procurement.totalAmount) : 'Pending'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Status</p>
                  <Badge status={procurement.status} />
                </div>
              </div>
            </div>
          )}

          {/* Payment */}
          {payment && (
            <div className={`card p-5 ${payment.status === 'paid' ? 'border-primary-200 bg-primary-50' : ''}`}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-gray-400" />
                  Payment Status
                </h2>
                <Badge status={payment.status} />
              </div>

              {payment.isDemoPayment && (
                <div className="mb-3 text-xs bg-amber-50 text-amber-700 px-3 py-2 rounded-lg border border-amber-100 flex items-center gap-2">
                  <FaBell className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                  <span>DEMO MODE — Payment data is simulated for demonstration</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Amount</p>
                  <p className="text-xl font-bold text-gray-900">{formatCurrency(payment.amount)}</p>
                </div>
                {payment.transactionId && (
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Transaction ID</p>
                    <p className="font-mono text-xs text-gray-700">{payment.transactionId}</p>
                  </div>
                )}
                {payment.referenceNo && (
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Reference No.</p>
                    <p className="font-mono text-xs text-gray-700">{payment.referenceNo}</p>
                  </div>
                )}
                {payment.paymentDate && (
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Payment Date</p>
                    <p className="text-sm">{formatDate(payment.paymentDate)}</p>
                  </div>
                )}
              </div>

              {payment.status === 'paid' && (
                <div className="mt-4 flex items-center gap-2 text-primary-600 text-sm font-medium">
                  <CheckCircle className="w-4 h-4" />
                  Payment received successfully
                </div>
              )}
            </div>
          )}

          {/* Timeline */}
          <div className="card p-5">
            <ProcurementTimeline status={booking.status} />
          </div>
        </div>
      </div>

      {/* Cancel modal */}
      <Modal
        isOpen={cancelModal}
        onClose={() => setCancelModal(false)}
        title="Cancel Booking"
        footer={
          <>
            <Button variant="secondary" onClick={() => setCancelModal(false)}>Keep Booking</Button>
            <Button variant="danger" loading={cancelling} onClick={handleCancel}>
              Yes, Cancel
            </Button>
          </>
        }
      >
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-6 h-6 text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-gray-900 font-medium">Are you sure you want to cancel this booking?</p>
            <p className="text-sm text-gray-500 mt-1">
              This will release your slot and token. This action cannot be undone.
            </p>
          </div>
        </div>
      </Modal>
    </FarmerLayout>
  );
};

export default BookingDetailPage;
