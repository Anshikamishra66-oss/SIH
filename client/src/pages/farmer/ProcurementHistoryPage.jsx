import { useState, useEffect } from 'react';
import { History, Package } from 'lucide-react';
import { farmerService } from '../../services';
import { formatDate, formatTime, formatCurrency, extractError } from '../../utils/constants';
import FarmerLayout from '../../layouts/FarmerLayout';
import Badge from '../../components/common/Badge';
import { TableSkeleton } from '../../components/common/Spinner';
import EmptyState from '../../components/common/EmptyState';
import toast from 'react-hot-toast';

const ProcurementHistoryPage = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      try {
        const res = await farmerService.getHistory({ page, limit: 10 });
        setHistory(res.data.data.history);
        setPagination(res.data.data.pagination);
      } catch (err) {
        toast.error(extractError(err));
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [page]);

  return (
    <FarmerLayout>
      <div className="page-header">
        <h1 className="page-title">Procurement History</h1>
        <p className="page-subtitle">Your complete procurement and payment records</p>
      </div>

      {loading ? (
        <TableSkeleton rows={5} cols={6} />
      ) : history.length === 0 ? (
        <EmptyState
          icon={History}
          title="No procurement history"
          description="Your completed procurement records will appear here."
          className="card"
        />
      ) : (
        <>
          <div className="table-container">
            <table className="table">
              <thead className="table-head">
                <tr>
                  <th className="table-th">Date</th>
                  <th className="table-th">Crop</th>
                  <th className="table-th">Centre</th>
                  <th className="table-th">Amount</th>
                  <th className="table-th">Status</th>
                  <th className="table-th">Payment</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {history.map(({ booking, procurement, payment }) => (
                  <tr key={booking._id} className="table-tr">
                    <td className="table-td">
                      <p className="text-sm font-medium">{formatDate(booking.bookingDate)}</p>
                      <p className="text-xs text-gray-400">{booking.token}</p>
                    </td>
                    <td className="table-td">
                      <p className="text-sm font-medium">{booking.cropName}</p>
                      <p className="text-xs text-gray-400">{booking.quantity} {booking.unit}</p>
                    </td>
                    <td className="table-td">
                      <p className="text-sm">{booking.centreId?.name || '—'}</p>
                      <p className="text-xs text-gray-400">{booking.centreId?.district}</p>
                    </td>
                    <td className="table-td">
                      <p className="text-sm font-bold text-gray-900">
                        {procurement?.totalAmount ? formatCurrency(procurement.totalAmount) : '—'}
                      </p>
                      {procurement?.grade && (
                        <span className="text-xs text-gray-400">Grade: {procurement.grade}</span>
                      )}
                    </td>
                    <td className="table-td">
                      <Badge status={booking.status} />
                    </td>
                    <td className="table-td">
                      {payment ? (
                        <div>
                          <Badge status={payment.status} />
                          {payment.isDemoPayment && (
                            <p className="text-xs text-amber-600 mt-0.5">Demo</p>
                          )}
                        </div>
                      ) : <span className="text-gray-300 text-sm">—</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {pagination.pages > 1 && (
            <div className="flex justify-between mt-4">
              <p className="text-sm text-gray-500">
                {pagination.total} records total
              </p>
              <div className="flex gap-2">
                <button className="btn-secondary btn-sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Previous</button>
                <button className="btn-secondary btn-sm" disabled={page >= pagination.pages} onClick={() => setPage(p => p + 1)}>Next</button>
              </div>
            </div>
          )}
        </>
      )}
    </FarmerLayout>
  );
};

export default ProcurementHistoryPage;
