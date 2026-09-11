import { useState, useEffect } from 'react';
import {
  UserCog, Plus, Search, Shield, Building2, Phone, Mail, CheckCircle2,
  RefreshCw, Lock, BadgeCheck
} from 'lucide-react';
import { IoClose } from 'react-icons/io5';
import AdminLayout from '../../layouts/AdminLayout';
import { adminService } from '../../services';
import { formatDate, extractError } from '../../utils/constants';

const OfficerManagementPage = () => {
  const [officers, setOfficers] = useState([]);
  const [centres, setCentres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');
  const [search, setSearch] = useState('');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    email: '',
    password: '',
    centreId: '',
    employeeId: '',
    designation: 'Procurement Officer',
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [officersRes, centresRes] = await Promise.all([
        adminService.getOfficers(),
        adminService.getCentres(),
      ]);
      setOfficers(officersRes.data.data.officers || []);
      setCentres(centresRes.data.data.centres || []);
      setError('');
    } catch (err) {
      setError(extractError(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateOfficer = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await adminService.createOfficer(formData);
      setMsg(`Procurement Officer "${formData.name}" created successfully.`);
      setTimeout(() => setMsg(''), 4000);
      setModalOpen(false);
      setFormData({
        name: '',
        mobile: '',
        email: '',
        password: '',
        centreId: '',
        employeeId: '',
        designation: 'Procurement Officer',
      });
      fetchData();
    } catch (err) {
      setError(extractError(err));
    } finally {
      setSubmitting(false);
    }
  };

  const filteredOfficers = officers.filter(({ user, profile }) => {
    if (!search) return true;
    const term = search.toLowerCase();
    return (
      user.name?.toLowerCase().includes(term) ||
      user.mobile?.includes(term) ||
      profile?.centreId?.name?.toLowerCase().includes(term) ||
      profile?.employeeId?.toLowerCase().includes(term)
    );
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-black text-gray-900">Procurement Officers</h1>
            <p className="text-xs text-gray-500">Mandi field personnel assigned to queue management and quality grading</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchData}
              className="p-2.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl transition flex items-center gap-2 text-xs font-semibold"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Refresh
            </button>
            <button
              onClick={() => setModalOpen(true)}
              className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-bold shadow-md transition flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              Add Officer
            </button>
          </div>
        </div>

        {/* Feedback alerts */}
        {error && (
          <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError('')} className="p-1 hover:bg-red-100 rounded-lg transition"><IoClose className="w-4 h-4" /></button>
          </div>
        )}
        {msg && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{msg}</span>
          </div>
        )}

        {/* Search */}
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search officer name, mobile, centre, or employee ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-gray-300 focus:outline-none focus:ring-1 focus:ring-primary-500 font-medium"
            />
          </div>
        </div>

        {/* Officers Table */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-gray-500">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-primary-600" />
              <p className="text-xs">Loading officer records...</p>
            </div>
          ) : filteredOfficers.length === 0 ? (
            <div className="p-12 text-center text-gray-400">
              <UserCog className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm font-semibold">No procurement officers found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50/80 border-b border-gray-200 text-gray-600 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Officer Name</th>
                    <th className="py-3 px-4">Designation & Emp ID</th>
                    <th className="py-3 px-4">Assigned Mandi Centre</th>
                    <th className="py-3 px-4">Contact Information</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredOfficers.map(({ user, profile }) => (
                    <tr key={user._id} className="hover:bg-gray-50/60 transition">
                      <td className="py-3.5 px-4 font-bold text-gray-900">
                        {user.name}
                        <p className="text-[10px] text-gray-400 font-normal">
                          Added {formatDate(user.createdAt)}
                        </p>
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="font-semibold text-gray-800">{profile?.designation || 'Procurement Officer'}</p>
                        <p className="text-[10px] text-primary-700 font-mono">
                          ID: {profile?.employeeId || 'GOV-PROC-01'}
                        </p>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 text-gray-800 font-medium">
                          <Building2 className="w-3.5 h-3.5 text-gray-400" />
                          <span>{profile?.centreId?.name || 'Unassigned Centre'}</span>
                        </div>
                        <p className="text-[10px] text-gray-500 pl-5">
                          {profile?.centreId?.district || ''}
                        </p>
                      </td>
                      <td className="py-3.5 px-4 space-y-0.5">
                        <p className="text-gray-700 font-mono flex items-center gap-1">
                          <Phone className="w-3 h-3 text-gray-400" /> {user.mobile}
                        </p>
                        {user.email && (
                          <p className="text-[10px] text-gray-500 flex items-center gap-1">
                            <Mail className="w-2.5 h-2.5 text-gray-400" /> {user.email}
                          </p>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-0.5 rounded-full font-bold text-[10px] bg-emerald-100 text-emerald-800 flex items-center gap-1 w-fit">
                          <BadgeCheck className="w-3 h-3" /> Active Duty
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Add Officer Modal */}
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-200">
              <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                <h3 className="text-lg font-black text-gray-900">Add Procurement Officer</h3>
                <button onClick={() => setModalOpen(false)} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition"><IoClose className="w-5 h-5" /></button>
              </div>

              <form onSubmit={handleCreateOfficer} className="mt-4 space-y-3 text-xs">
                <div>
                  <label className="font-bold text-gray-700">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Suresh Verma"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="mt-1 w-full p-2 rounded-lg border border-gray-300 focus:ring-primary-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-gray-700">Mobile (10 digits)</label>
                    <input
                      type="tel"
                      required
                      placeholder="9876543210"
                      pattern="[0-9]{10}"
                      value={formData.mobile}
                      onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                      className="mt-1 w-full p-2 rounded-lg border border-gray-300"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-gray-700">Employee ID</label>
                    <input
                      type="text"
                      required
                      placeholder="GOV-PROC-102"
                      value={formData.employeeId}
                      onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                      className="mt-1 w-full p-2 rounded-lg border border-gray-300 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-gray-700">Official Email</label>
                  <input
                    type="email"
                    placeholder="officer@kisanprocure.gov.in"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="mt-1 w-full p-2 rounded-lg border border-gray-300"
                  />
                </div>

                <div>
                  <label className="font-bold text-gray-700">Login Password</label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    placeholder="Minimum 6 characters"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="mt-1 w-full p-2 rounded-lg border border-gray-300"
                  />
                </div>

                <div>
                  <label className="font-bold text-gray-700">Assigned Procurement Centre</label>
                  <select
                    required
                    value={formData.centreId}
                    onChange={(e) => setFormData({ ...formData, centreId: e.target.value })}
                    className="mt-1 w-full p-2 rounded-lg border border-gray-300 font-medium"
                  >
                    <option value="">Select Mandi Centre...</option>
                    {centres.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name} ({c.address?.district || ''})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold shadow-md transition disabled:opacity-50"
                  >
                    {submitting ? 'Creating...' : 'Register Officer'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default OfficerManagementPage;
