import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, ClipboardList, LogOut, Menu, X, Wheat, Shield, Users
} from 'lucide-react';
import { useAuth, CREATOR_ROLES } from '../context/AuthContext';

const OfficerLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, roleLabel, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { to: '/officer/dashboard', icon: LayoutDashboard, label: 'Dashboard & Queue' },
    { to: '/officer/bookings', icon: ClipboardList, label: "Today's Bookings" },
    // Show staff management for Centre Heads and higher
    ...(CREATOR_ROLES.includes(user?.role) || user?.level <= 4
      ? [{ to: '/officer/staff', icon: Users, label: 'Staff Management' }]
      : []),
  ];

  const Sidebar = () => (
    <div className="flex flex-col h-full">
      <div className="p-5 border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
            <Wheat className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900">Kisan Connect</p>
            <p className="text-xs text-primary-600 font-medium flex items-center gap-1">
              <Shield className="w-3 h-3" /> Officer Portal
            </p>
          </div>
        </div>
      </div>

      <div className="px-4 py-3 mx-3 mt-3 bg-amber-50 rounded-lg border border-amber-100">
        <div className="flex items-center justify-between">
          <p className="text-xs text-amber-800 font-bold uppercase tracking-wider">{roleLabel || 'Officer'}</p>
          {user?.employeeId && (
            <span className="text-[10px] font-mono bg-amber-200 text-amber-900 px-1.5 py-0.5 rounded font-bold">
              {user.employeeId}
            </span>
          )}
        </div>
        <p className="text-sm font-semibold text-gray-900 truncate mt-0.5">{user?.name}</p>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              isActive
                ? 'flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg bg-primary-50 text-primary-700'
                : 'flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-all'
            }
          >
            <Icon className="w-5 h-5 flex-shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="px-3 pb-4 border-t border-gray-100 pt-3">
        <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2.5 w-full text-sm font-medium rounded-lg text-red-600 hover:bg-red-50 transition-all">
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-white border-r border-gray-200 z-30">
        <Sidebar />
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-72 bg-white shadow-xl">
            <div className="absolute top-3 right-3">
              <button onClick={() => setSidebarOpen(false)} className="p-1.5 rounded-lg hover:bg-gray-100">
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            <Sidebar />
          </aside>
        </div>
      )}

      <main className="flex-1 lg:pl-64">
        <div className="lg:hidden sticky top-0 z-20 bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3">
          <button onClick={() => setSidebarOpen(true)} className="p-1.5 rounded-lg hover:bg-gray-100">
            <Menu className="w-5 h-5 text-gray-600" />
          </button>
          <span className="text-sm font-bold text-gray-900">Officer Portal</span>
        </div>
        <div className="p-4 md:p-6 max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
};

export default OfficerLayout;
