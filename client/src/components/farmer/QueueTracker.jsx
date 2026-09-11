import { useEffect, useState, useCallback } from 'react';
import { Users, Clock, Ticket, RefreshCw, Wifi, WifiOff } from 'lucide-react';
import { queueService } from '../../services';
import { useSocket } from '../../context/SocketContext';
import { formatWaitTime } from '../../utils/constants';
import Badge from '../common/Badge';
import { Spinner } from '../common/Spinner';

const QueueTracker = ({ centreId, token, bookingDate }) => {
  const [queueData, setQueueData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const { on, off, joinCentre, isConnected } = useSocket();

  const fetchPosition = useCallback(async () => {
    if (!centreId || !token) return;
    try {
      const res = await queueService.getMyPosition(
        centreId,
        token,
        bookingDate ? bookingDate.split('T')[0] : new Date().toISOString().split('T')[0]
      );
      setQueueData(res.data.data);
      setLastUpdated(new Date());
    } catch (err) {
      // Silently handle — may not be in queue yet
    } finally {
      setLoading(false);
    }
  }, [centreId, token, bookingDate]);

  useEffect(() => {
    fetchPosition();
    joinCentre(centreId);

    // Listen for queue updates
    const handleQueueUpdate = (data) => {
      if (data.centreId === centreId) {
        fetchPosition();
      }
    };

    on('queue:updated', handleQueueUpdate);
    on('booking:updated', fetchPosition);

    // Periodic refresh every 60s as fallback
    const interval = setInterval(fetchPosition, 60000);

    return () => {
      off('queue:updated', handleQueueUpdate);
      off('booking:updated', fetchPosition);
      clearInterval(interval);
    };
  }, [centreId, token]);

  if (loading) {
    return (
      <div className="card p-6 flex items-center justify-center min-h-32">
        <Spinner />
      </div>
    );
  }

  if (!queueData || !queueData.myEntry) {
    return (
      <div className="card p-6 text-center text-gray-500 text-sm">
        <Ticket className="w-8 h-8 mx-auto mb-2 text-gray-300" />
        Queue information will appear on your booking day.
      </div>
    );
  }

  const { farmersAhead, estimatedWaitMinutes, status, myEntry } = queueData;

  return (
    <div className="card overflow-hidden">
      {/* Header */}
      <div className="bg-primary-600 p-4 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-primary-100 text-xs font-medium uppercase tracking-wider">Your Token</p>
            <p className="text-4xl font-bold tracking-widest mt-0.5">{token}</p>
          </div>
          <div className="text-right">
            <Badge
              status={status}
              className="bg-white/20 text-white border-0 text-xs"
              label={status === 'waiting' ? 'Waiting' : status === 'serving' ? '● Your Turn!' : status}
              pulse={status === 'serving'}
            />
            <div className="flex items-center gap-1 mt-2 text-primary-200 text-xs">
              {isConnected ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
              {isConnected ? 'Live' : 'Reconnecting...'}
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 divide-x divide-y divide-gray-100">
        <div className="p-4">
          <div className="flex items-center gap-2 text-gray-500 text-xs font-medium mb-1">
            <Users className="w-3.5 h-3.5" />
            Farmers Ahead
          </div>
          <p className="text-2xl font-bold text-gray-900">{farmersAhead}</p>
        </div>
        <div className="p-4">
          <div className="flex items-center gap-2 text-gray-500 text-xs font-medium mb-1">
            <Clock className="w-3.5 h-3.5" />
            Est. Wait
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {farmersAhead === 0 ? 'Your turn!' : formatWaitTime(estimatedWaitMinutes)}
          </p>
        </div>
        <div className="p-4 col-span-2">
          <p className="text-xs text-gray-400">
            * Estimated time is approximate ({farmersAhead} × ~{Math.round(estimatedWaitMinutes / Math.max(farmersAhead, 1))} min/farmer).
            Actual wait may vary.
          </p>
        </div>
      </div>

      {/* Refresh */}
      <div className="px-4 pb-3 flex items-center justify-between">
        <p className="text-xs text-gray-400">
          {lastUpdated ? `Updated ${lastUpdated.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}` : ''}
        </p>
        <button
          onClick={fetchPosition}
          className="text-xs text-primary-600 flex items-center gap-1 hover:text-primary-700 transition-colors"
        >
          <RefreshCw className="w-3 h-3" />
          Refresh
        </button>
      </div>
    </div>
  );
};

export default QueueTracker;
