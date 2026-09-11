// Status badge component for all entity statuses

const colorMap = {
  blue: 'bg-blue-100 text-blue-800',
  purple: 'bg-purple-100 text-purple-800',
  amber: 'bg-amber-100 text-amber-800',
  teal: 'bg-teal-100 text-teal-800',
  orange: 'bg-orange-100 text-orange-800',
  green: 'bg-green-100 text-green-800',
  sky: 'bg-sky-100 text-sky-800',
  red: 'bg-red-100 text-red-800',
  gray: 'bg-gray-100 text-gray-600',
  yellow: 'bg-yellow-100 text-yellow-800',
};

const statusColorMap = {
  // Booking statuses
  booked: 'blue',
  arrived: 'purple',
  verification: 'amber',
  verified: 'teal',
  procurement_in_progress: 'orange',
  procurement_completed: 'green',
  payment_processing: 'sky',
  payment_completed: 'green',
  cancelled: 'red',
  // Queue statuses
  waiting: 'yellow',
  called: 'amber',
  serving: 'green',
  completed: 'gray',
  // Payment statuses
  pending: 'gray',
  processing: 'sky',
  paid: 'green',
  failed: 'red',
  // Generic
  active: 'green',
  inactive: 'red',
  available: 'green',
  full: 'red',
  closed: 'gray',
};

const statusLabelMap = {
  booked: 'Slot Booked',
  arrived: 'Arrived',
  verification: 'Verification',
  verified: 'Verified',
  procurement_in_progress: 'In Progress',
  procurement_completed: 'Completed',
  payment_processing: 'Payment Processing',
  payment_completed: 'Paid',
  cancelled: 'Cancelled',
  waiting: 'Waiting',
  called: 'Called',
  serving: '● Serving',
  completed: 'Completed',
  pending: 'Pending',
  processing: 'Processing',
  paid: 'Paid',
  failed: 'Failed',
  active: 'Active',
  inactive: 'Inactive',
  available: 'Available',
  full: 'Full',
  closed: 'Closed',
};

const Badge = ({ status, label, color, dot = false, pulse = false, className = '' }) => {
  const resolvedColor = color || colorMap[statusColorMap[status]] ? statusColorMap[status] : 'gray';
  const resolvedColorClass = colorMap[resolvedColor] || colorMap.gray;
  const displayLabel = label || statusLabelMap[status] || status;

  return (
    <span className={`badge ${resolvedColorClass} ${className} ${pulse ? 'animate-pulse' : ''}`}>
      {dot && (
        <span
          className={`w-1.5 h-1.5 rounded-full ${
            resolvedColor === 'green' ? 'bg-green-600' :
            resolvedColor === 'red' ? 'bg-red-600' :
            resolvedColor === 'blue' ? 'bg-blue-600' :
            resolvedColor === 'amber' ? 'bg-amber-600' :
            'bg-gray-400'
          }`}
        />
      )}
      {displayLabel}
    </span>
  );
};

export default Badge;
