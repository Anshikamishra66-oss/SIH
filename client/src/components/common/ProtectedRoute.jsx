import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { PageLoader } from './Spinner';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (loading) return <PageLoader />;

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    // Redirect to appropriate dashboard based on user role
    const adminTiers = ['central_admin', 'state_officer', 'district_officer', 'admin'];
    const officerTiers = ['centre_head', 'procurement_officer', 'quality_staff', 'data_staff', 'gate_staff', 'officer'];

    if (user?.role === 'farmer') {
      return <Navigate to="/farmer/dashboard" replace />;
    }
    if (adminTiers.includes(user?.role)) {
      return <Navigate to="/admin/dashboard" replace />;
    }
    if (officerTiers.includes(user?.role)) {
      return <Navigate to="/officer/dashboard" replace />;
    }
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
