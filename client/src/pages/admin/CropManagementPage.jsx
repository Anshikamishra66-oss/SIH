import { useState, useEffect } from 'react';
import {
  Wheat, Plus, Edit2, Search, CheckCircle2, RefreshCw, IndianRupee,
  Check, X
} from 'lucide-react';
import { IoClose } from 'react-icons/io5';
import AdminLayout from '../../layouts/AdminLayout';
import { adminService } from '../../services';
import { formatCurrency, extractError } from '../../utils/constants';

const CropManagementPage = () => {
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');
  const [search, setSearch] = useState('');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCrop, setEditingCrop] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    season: 'Rabi',
    mspPrice: 2275,
    unit: 'Quintal',
    isActive: true,
  });

  const fetchCrops = async () => {
    setLoading(true);
    try {
      const res = await adminService.getCrops();
      setCrops(res.data.data.crops || []);
      setError('');
    } catch (err) {
      setError(extractError(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCrops();
  }, []);

  const openAddModal = () => {
    setEditingCrop(null);
    setFormData({
      name: '',
      season: 'Rabi',
      mspPrice: 2275,
      unit: 'Quintal',
      isActive: true,
    });
    setModalOpen(true);
  };

  const openEditModal = (crop) => {
    setEditingCrop(crop);
    setFormData({
      name: crop.name,
      season: crop.season || 'Rabi',
      mspPrice: crop.mspPrice || 0,
      unit: crop.unit || 'Quintal',
      isActive: crop.isActive !== undefined ? crop.isActive : true,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingCrop) {
        await adminService.updateCrop(editingCrop._id, formData);
        setMsg(`Crop "${formData.name}" updated successfully.`);
      } else {
        await adminService.createCrop(formData);
        setMsg(`New crop "${formData.name}" added to MSP catalog.`);
      }
      setTimeout(() => setMsg(''), 4000);
      setModalOpen(false);
      fetchCrops();
    } catch (err) {
      setError(extractError(err));
    } finally {
      setSubmitting(false);
    }
  };

  const filteredCrops = crops.filter((c) =>
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.season?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-black text-gray-900">Minimum Support Price (MSP) Catalog</h1>
            <p className="text-xs text-gray-500">Government mandated MSP rates, notified commodities, and procurement seasons</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchCrops}
              className="p-2.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl transition flex items-center gap-2 text-xs font-semibold"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Refresh
            </button>
            <button
              onClick={openAddModal}
              className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-bold shadow-md transition flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              Add Commodity
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
              placeholder="Search commodity by name or season..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-gray-300 focus:outline-none focus:ring-1 focus:ring-primary-500 font-medium"
            />
          </div>
        </div>

        {/* Crops Table */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-gray-500">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-primary-600" />
              <p className="text-xs">Loading crop catalog...</p>
            </div>
          ) : filteredCrops.length === 0 ? (
            <div className="p-12 text-center text-gray-400">
              <Wheat className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm font-semibold">No commodities found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50/80 border-b border-gray-200 text-gray-600 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Commodity Name</th>
                    <th className="py-3 px-4">Season</th>
                    <th className="py-3 px-4">Govt MSP Rate</th>
                    <th className="py-3 px-4">Unit of Measure</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredCrops.map((c) => (
                    <tr key={c._id} className="hover:bg-gray-50/60 transition">
                      <td className="py-3.5 px-4 font-bold text-gray-900 flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
                          <Wheat className="w-3.5 h-3.5" />
                        </div>
                        {c.name}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-gray-700">
                        <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-700 text-[11px]">
                          {c.season}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-emerald-800 text-sm">
                        {formatCurrency(c.mspPrice)}
                      </td>
                      <td className="py-3.5 px-4 text-gray-600 font-medium">
                        Per {c.unit || 'Quintal'}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                          c.isActive !== false ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {c.isActive !== false ? 'Active MSP' : 'Inactive'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => openEditModal(c)}
                          className="p-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition"
                          title="Edit MSP Rate"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Add/Edit Modal */}
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-200">
              <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                <h3 className="text-lg font-black text-gray-900">
                  {editingCrop ? 'Edit MSP Rate' : 'Add New Agricultural Crop'}
                </h3>
                <button onClick={() => setModalOpen(false)} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition"><IoClose className="w-5 h-5" /></button>
              </div>

              <form onSubmit={handleSubmit} className="mt-4 space-y-3 text-xs">
                <div>
                  <label className="font-bold text-gray-700">Crop Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Wheat (Kanak)"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="mt-1 w-full p-2 rounded-lg border border-gray-300 font-medium"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-gray-700">Season</label>
                    <select
                      value={formData.season}
                      onChange={(e) => setFormData({ ...formData, season: e.target.value })}
                      className="mt-1 w-full p-2 rounded-lg border border-gray-300 font-medium"
                    >
                      <option value="Rabi">Rabi</option>
                      <option value="Kharif">Kharif</option>
                      <option value="Zaid">Zaid</option>
                      <option value="Annual">Annual / Perennial</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-bold text-gray-700">Unit</label>
                    <input
                      type="text"
                      required
                      value={formData.unit}
                      onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                      className="mt-1 w-full p-2 rounded-lg border border-gray-300 font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-gray-700">Minimum Support Price (₹ per {formData.unit})</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={formData.mspPrice}
                    onChange={(e) => setFormData({ ...formData, mspPrice: parseFloat(e.target.value) || 0 })}
                    className="mt-1 w-full p-2 rounded-lg border border-gray-300 font-mono text-sm font-bold text-emerald-800"
                  />
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="rounded text-primary-600 focus:ring-primary-500"
                  />
                  <label htmlFor="isActive" className="font-bold text-gray-700">Active for Government Procurement</label>
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
                    {submitting ? 'Saving...' : editingCrop ? 'Update MSP' : 'Add Crop'}
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

export default CropManagementPage;
