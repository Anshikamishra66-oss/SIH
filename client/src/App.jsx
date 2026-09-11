import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import ProtectedRoute from './components/common/ProtectedRoute';

// Public Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

// Farmer Pages
import FarmerDashboard from './pages/farmer/FarmerDashboard';
import BookSlotPage from './pages/farmer/BookSlotPage';
import MyBookingsPage from './pages/farmer/MyBookingsPage';
import BookingDetailPage from './pages/farmer/BookingDetailPage';
import ProcurementHistoryPage from './pages/farmer/ProcurementHistoryPage';
import NotificationsPage from './pages/farmer/NotificationsPage';
import ProfilePage from './pages/farmer/ProfilePage';

// Officer Pages
import OfficerDashboard from './pages/officer/OfficerDashboard';
import OfficerBookingsPage from './pages/officer/OfficerBookingsPage';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import FarmerManagementPage from './pages/admin/FarmerManagementPage';
import OfficerManagementPage from './pages/admin/OfficerManagementPage';
import CentreManagementPage from './pages/admin/CentreManagementPage';
import BookingManagementPage from './pages/admin/BookingManagementPage';
import CropManagementPage from './pages/admin/CropManagementPage';
import AnalyticsPage from './pages/admin/AnalyticsPage';

// 404 Page
const NotFoundPage = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
    <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-gray-200 text-center shadow-sm">
      <div className="w-16 h-16 bg-primary-100 text-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl font-black">
        404
      </div>
      <h1 className="text-2xl font-black text-gray-900">Page Not Found</h1>
      <p className="text-sm text-gray-500 mt-2">
        The page you requested does not exist or has been moved.
      </p>
      <div className="mt-6">
        <Link
          to="/"
          className="inline-block px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-sm font-bold shadow-md transition"
        >
          Return Home
        </Link>
      </div>
    </div>
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SocketProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Farmer Protected Routes */}
            <Route
              path="/farmer/dashboard"
              element={
                <ProtectedRoute allowedRoles={['farmer']}>
                  <FarmerDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/farmer/book-slot"
              element={
                <ProtectedRoute allowedRoles={['farmer']}>
                  <BookSlotPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/farmer/book"
              element={
                <ProtectedRoute allowedRoles={['farmer']}>
                  <BookSlotPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/farmer/bookings"
              element={
                <ProtectedRoute allowedRoles={['farmer']}>
                  <MyBookingsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/farmer/bookings/:id"
              element={
                <ProtectedRoute allowedRoles={['farmer']}>
                  <BookingDetailPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/farmer/history"
              element={
                <ProtectedRoute allowedRoles={['farmer']}>
                  <ProcurementHistoryPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/farmer/notifications"
              element={
                <ProtectedRoute allowedRoles={['farmer']}>
                  <NotificationsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/farmer/profile"
              element={
                <ProtectedRoute allowedRoles={['farmer']}>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />

            {/* Officer Protected Routes */}
            <Route
              path="/officer/dashboard"
              element={
                <ProtectedRoute allowedRoles={['officer']}>
                  <OfficerDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/officer/bookings"
              element={
                <ProtectedRoute allowedRoles={['officer']}>
                  <OfficerBookingsPage />
                </ProtectedRoute>
              }
            />

            {/* Admin Protected Routes */}
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/farmers"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <FarmerManagementPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/officers"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <OfficerManagementPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/centres"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <CentreManagementPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/bookings"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <BookingManagementPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/crops"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <CropManagementPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/analytics"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AnalyticsPage />
                </ProtectedRoute>
              }
            />

            {/* 404 Catch All */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </SocketProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
