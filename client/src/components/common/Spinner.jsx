import { Loader2 } from 'lucide-react';

export const Spinner = ({ size = 'md', className = '' }) => {
  const sizeClass = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-8 h-8', xl: 'w-12 h-12' }[size];
  return <Loader2 className={`animate-spin text-primary-600 ${sizeClass} ${className}`} />;
};

export const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center">
      <Spinner size="xl" className="mx-auto mb-4" />
      <p className="text-sm text-gray-500">Loading...</p>
    </div>
  </div>
);

export const CardSkeleton = ({ rows = 3 }) => (
  <div className="card p-5 animate-pulse">
    <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="space-y-2 mb-3">
        <div className="h-3 bg-gray-200 rounded w-full"></div>
        <div className="h-3 bg-gray-200 rounded w-5/6"></div>
      </div>
    ))}
  </div>
);

export const TableSkeleton = ({ rows = 5, cols = 5 }) => (
  <div className="table-container animate-pulse">
    <table className="table">
      <thead className="table-head">
        <tr>
          {Array.from({ length: cols }).map((_, i) => (
            <th key={i} className="table-th">
              <div className="h-3 bg-gray-300 rounded w-16"></div>
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {Array.from({ length: rows }).map((_, i) => (
          <tr key={i} className="border-b border-gray-100">
            {Array.from({ length: cols }).map((_, j) => (
              <td key={j} className="table-td">
                <div className="h-3 bg-gray-200 rounded w-full"></div>
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export const StatCardSkeleton = () => (
  <div className="stat-card animate-pulse">
    <div className="flex justify-between items-start">
      <div className="space-y-2 flex-1">
        <div className="h-3 bg-gray-200 rounded w-24"></div>
        <div className="h-8 bg-gray-200 rounded w-16"></div>
      </div>
      <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
    </div>
  </div>
);

export default Spinner;
