import { useState, useEffect } from 'react';
import {
  Building2, Plus, Calendar, Clock, MapPin, Search, CheckCircle2,
  RefreshCw, Users, Settings2, Sparkles
} from 'lucide-react';
import { IoClose } from 'react-icons/io5';
import AdminLayout from '../../layouts/AdminLayout';
import { adminService, cropService } from '../../services';
import { extractError } from '../../utils/constants';
import { INDIAN_STATES, STATE_DISTRICTS } from '../../utils/locations';

const CentreManagementPage = () => {
  const [centres, setCentres] = useState([]);
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');
  const [search, setSearch] = useState('');

  // Modals
  const [addCentreOpen, setAddCentreOpen] = useState(false);
  const [slotModalOpen, setSlotModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [centreForm, setCentreForm] = useState({
    name: '',
    code: '',
    address: { line1: '', district: '', state: '', pincode: '' },
    dailyCapacity: 300,
    counters: 3,
    slotDurationMinutes: 60,
    operatingHours: { start: '09:00', end: '17:00' },
  });

  const [slotForm, setSlotForm] = useState({
    centreId: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
    slotDurationMinutes: 60,
    capacityPerSlot: 10,
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [centresRes, cropsRes] = await Promise.all([
        adminService.getCentres(),
        cropService.getCrops(),
      ]);
      setCentres(centresRes.data.data.centres || []);
      setCrops(cropsRes.data.data.crops || []);
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

  const handleCreateCentre = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await adminService.createCentre(centreForm);
      setMsg(`Procurement Centre "${centreForm.name}" created successfully.`);
      setTimeout(() => setMsg(''), 4000);
      setAddCentreOpen(false);
      setCentreForm({
        name: '',
        code: '',
        address: { line1: '', district: '', state: '', pincode: '' },
        dailyCapacity: 300,
        counters: 3,
        slotDurationMinutes: 60,
        operatingHours: { start: '09:00', end: '17:00' },
      });
      fetchData();
    } catch (err) {
      setError(extractError(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleGenerateSlots = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await adminService.generateSlots(slotForm);
      setMsg(res.data.message || 'Slots generated successfully!');
      setTimeout(() => setMsg(''), 4000);
      setSlotModalOpen(false);
    } catch (err) {
      setError(extractError(err));
    } finally {
      setSubmitting(false);
    }
  };

  const filteredCentres = centres.filter((c) => {
    if (!search) return true;
    const term = search.toLowerCase();
    return (
      c.name?.toLowerCase().includes(term) ||
      c.address?.district?.toLowerCase().includes(term) ||
      c.code?.toLowerCase().includes(term)
    );
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-black text-gray-900">Procurement Centres (Mandis)</h1>
            <p className="text-xs text-gray-500">Configure grain intake capacities, counters, and automated slot schedules</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setSlotModalOpen(true)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md transition flex items-center gap-1.5"
            >
              <Sparkles className="w-4 h-4" />
              Generate Slots
            </button>
            <button
              onClick={() => setAddCentreOpen(true)}
              className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-bold shadow-md transition flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              New Centre
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
              placeholder="Search mandi name, district, or code..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-gray-300 focus:outline-none focus:ring-1 focus:ring-primary-500 font-medium"
            />
          </div>
        </div>

        {/* Mandi Centres Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full p-12 text-center text-gray-500">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-primary-600" />
              <p className="text-xs">Loading procurement centres...</p>
            </div>
          ) : filteredCentres.length === 0 ? (
            <div className="col-span-full p-12 text-center text-gray-400">
              <Building2 className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm font-semibold">No centres found matching search.</p>
            </div>
          ) : (
            filteredCentres.map((c) => (
              <div key={c._id} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 flex flex-col justify-between hover:border-primary-300 transition">
                <div>
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-mono font-bold text-primary-700 bg-primary-50 px-2 py-0.5 rounded">
                      {c.code || 'MANDI'}
                    </span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full uppercase">
                      Operational
                    </span>
                  </div>

                  <h3 className="text-lg font-black text-gray-900 mt-2">{c.name}</h3>
                  <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                    <MapPin className="w-3 h-3 text-gray-400" />
                    {c.address?.district}, {c.address?.state}
                  </p>

                  <div className="mt-5 grid grid-cols-2 gap-3 pt-4 border-t border-gray-100 text-xs">
                    <div className="bg-gray-50 p-2.5 rounded-xl">
                      <span className="text-gray-500">Daily Capacity</span>
                      <p className="font-bold text-gray-900 mt-0.5">{c.dailyCapacity || 250} Qtl</p>
                    </div>
                    <div className="bg-gray-50 p-2.5 rounded-xl">
                      <span className="text-gray-500">Active Counters</span>
                      <p className="font-bold text-gray-900 mt-0.5">{c.counters || 2} Counters</p>
                    </div>
                  </div>

                  <div className="mt-3 text-xs text-gray-600 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-gray-400" />
                    <span>Operating Hours: {c.operatingHours?.start || '09:00'} - {c.operatingHours?.end || '17:00'}</span>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-gray-100 flex justify-between items-center">
                  <button
                    onClick={() => {
                      setSlotForm((prev) => ({ ...prev, centreId: c._id }));
                      setSlotModalOpen(true);
                    }}
                    className="w-full py-2 bg-primary-50 hover:bg-primary-100 text-primary-700 font-bold rounded-xl text-xs transition text-center"
                  >
                    Schedule & Generate Slots
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Add Centre Modal */}
        {addCentreOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-200">
              <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                <h3 className="text-lg font-black text-gray-900">Add Procurement Centre</h3>
                <button onClick={() => setAddCentreOpen(false)} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition"><IoClose className="w-5 h-5" /></button>
              </div>

              <form onSubmit={handleCreateCentre} className="mt-4 space-y-3 text-xs">
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2">
                    <label className="font-bold text-gray-700">Mandi / Centre Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Karnal Central Mandi"
                      value={centreForm.name}
                      onChange={(e) => setCentreForm({ ...centreForm, name: e.target.value })}
                      className="mt-1 w-full p-2 rounded-lg border border-gray-300"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-gray-700">Mandi Code</label>
                    <input
                      type="text"
                      required
                      placeholder="KRN-01"
                      value={centreForm.code}
                      onChange={(e) => setCentreForm({ ...centreForm, code: e.target.value.toUpperCase() })}
                      className="mt-1 w-full p-2 rounded-lg border border-gray-300 font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-gray-700">State</label>
                    <select
                      required
                      value={centreForm.address.state}
                      onChange={(e) => setCentreForm({ ...centreForm, address: { ...centreForm.address, state: e.target.value, district: '' } })}
                      className="mt-1 w-full p-2 rounded-lg border border-gray-300"
                    >
                      <option value="">Select State</option>
                      {INDIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="font-bold text-gray-700">District</label>
                    <select
                      required
                      value={centreForm.address.district}
                      onChange={(e) => setCentreForm({ ...centreForm, address: { ...centreForm.address, district: e.target.value } })}
                      className="mt-1 w-full p-2 rounded-lg border border-gray-300"
                      disabled={!centreForm.address.state}
                    >
                      <option value="">Select District</option>
                      {(STATE_DISTRICTS[centreForm.address.state] || []).map((d) => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-gray-700">Daily Capacity (Quintals)</label>
                    <input
                      type="number"
                      required
                      value={centreForm.dailyCapacity}
                      onChange={(e) => setCentreForm({ ...centreForm, dailyCapacity: parseInt(e.target.value) || 0 })}
                      className="mt-1 w-full p-2 rounded-lg border border-gray-300"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-gray-700">Operating Counters</label>
                    <input
                      type="number"
                      required
                      min={1}
                      max={10}
                      value={centreForm.counters}
                      onChange={(e) => setCentreForm({ ...centreForm, counters: parseInt(e.target.value) || 1 })}
                      className="mt-1 w-full p-2 rounded-lg border border-gray-300"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <button
                    type="button"
                    onClick={() => setAddCentreOpen(false)}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold shadow-md transition disabled:opacity-50"
                  >
                    {submitting ? 'Saving...' : 'Create Centre'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Generate Slots Modal */}
        {slotModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-200">
              <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                <h3 className="text-lg font-black text-gray-900">Bulk Slot Schedule Generator</h3>
                <button onClick={() => setSlotModalOpen(false)} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition"><IoClose className="w-5 h-5" /></button>
              </div>

              <form onSubmit={handleGenerateSlots} className="mt-4 space-y-3 text-xs">
                <div>
                  <label className="font-bold text-gray-700">Select Centre</label>
                  <select
                    required
                    value={slotForm.centreId}
                    onChange={(e) => setSlotForm({ ...slotForm, centreId: e.target.value })}
                    className="mt-1 w-full p-2 rounded-lg border border-gray-300 font-medium"
                  >
                    <option value="">Choose Mandi...</option>
                    {centres.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name} ({c.address?.district})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-gray-700">Start Date</label>
                    <input
                      type="date"
                      required
                      value={slotForm.startDate}
                      onChange={(e) => setSlotForm({ ...slotForm, startDate: e.target.value })}
                      className="mt-1 w-full p-2 rounded-lg border border-gray-300"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-gray-700">End Date</label>
                    <input
                      type="date"
                      required
                      value={slotForm.endDate}
                      onChange={(e) => setSlotForm({ ...slotForm, endDate: e.target.value })}
                      className="mt-1 w-full p-2 rounded-lg border border-gray-300"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-gray-700">Slot Duration</label>
                    <select
                      value={slotForm.slotDurationMinutes}
                      onChange={(e) => setSlotForm({ ...slotForm, slotDurationMinutes: parseInt(e.target.value) })}
                      className="mt-1 w-full p-2 rounded-lg border border-gray-300"
                    >
                      <option value={30}>30 Minutes</option>
                      <option value={60}>60 Minutes (1 Hour)</option>
                      <option value={90}>90 Minutes</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-bold text-gray-700">Capacity per Slot</label>
                    <input
                      type="number"
                      required
                      min={1}
                      max={50}
                      value={slotForm.capacityPerSlot}
                      onChange={(e) => setSlotForm({ ...slotForm, capacityPerSlot: parseInt(e.target.value) || 10 })}
                      className="mt-1 w-full p-2 rounded-lg border border-gray-300"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <button
                    type="button"
                    onClick={() => setSlotModalOpen(false)}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-md transition disabled:opacity-50"
                  >
                    {submitting ? 'Generating...' : 'Generate Slots'}
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

export default CentreManagementPage;
