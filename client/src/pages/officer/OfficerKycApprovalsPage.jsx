import { useState, useEffect } from 'react';
import {
  UserCheck, ShieldCheck, CheckCircle2, XCircle, Clock, Search,
  Filter, Building, CreditCard, RefreshCw, FileText, Check, X, Info
} from 'lucide-react';
import OfficerLayout from '../../layouts/OfficerLayout';
import { officerService } from '../../services';
import { extractError } from '../../utils/constants';
import Button from '../../components/common/Button';
import toast from 'react-hot-toast';

const OfficerKycApprovalsPage = () => {
  const [profiles, setProfiles] = useState([]);
  const [jurisdiction, setJurisdiction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Pending');
  const [searchTerm, setSearchTerm] = useState('');

  // Action Modal State
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [actionType, setActionType] = useState(null); // 'approve' | 'reject'
  const [remarks, setRemarks] = useState('');
  const [submittingAction, setSubmittingAction] = useState(false);

  const fetchKycApprovals = async () => {
    try {
      setLoading(true);
      const res = await officerService.getKycApprovals({
        status: activeTab,
        search: searchTerm,
      });
      setProfiles(res.data?.data?.profiles || []);
      if (res.data?.data?.jurisdiction) {
        setJurisdiction(res.data.data.jurisdiction);
      }
    } catch (err) {
      toast.error(extractError(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKycApprovals();
  }, [activeTab]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchKycApprovals();
  };

  const handleOpenActionModal = (profile, type) => {
    setSelectedProfile(profile);
    setActionType(type);
    setRemarks(type === 'approve' ? 'Approved by Officer' : '');
  };

  const getJurisdictionLabel = () => {
    if (!jurisdiction) return 'Procurement Officer Portal';
    const { role, state, district } = jurisdiction;
    if (role === 'central_admin') return 'Central Admin • All India Scope';
    if (role === 'state_officer') return `State Procurement Nodal • State: ${state || 'All'}`;
    if (role === 'district_officer') return `District Procurement Officer • District: ${district || 'N/A'}, ${state || ''}`;
    return `Procurement Officer • Mandi Jurisdiction (${district || 'Local'})`;
  };

  const handleConfirmAction = async () => {
    if (!selectedProfile || !actionType) return;
    if (actionType === 'reject' && !remarks.trim()) {
      toast.error('Please specify a rejection reason for the farmer.');
      return;
    }

    setSubmittingAction(true);
    try {
      const res = await officerService.updateKycApproval(selectedProfile._id, {
        action: actionType,
        remarks: remarks.trim(),
      });
      toast.success(res.data?.message || `Farmer KYC ${actionType === 'approve' ? 'Approved' : 'Rejected'}!`);
      setSelectedProfile(null);
      setActionType(null);
      setRemarks('');
      await fetchKycApprovals();
    } catch (err) {
      toast.error(extractError(err));
    } finally {
      setSubmittingAction(false);
    }
  };

  return (
    <OfficerLayout>
      <div className="max-w-6xl mx-auto space-y-6 pb-12">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-widest text-amber-800 bg-amber-100 border border-amber-200 px-2.5 py-0.5 rounded-full">
                {getJurisdictionLabel()}
              </span>
              <span className="text-xs text-gray-500">• Ministry of Agriculture</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mt-1">Farmer KYC Approval Portal</h1>
            <p className="text-gray-500 text-sm">
              Review & Approve Aadhaar e-KYC, Bank Seeding & Kisan ID applications within your jurisdiction before slot booking activation
            </p>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={fetchKycApprovals}
            loading={loading}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Refresh List
          </Button>
        </div>

        {/* Tab Filters & Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
            {['Pending', 'Verified', 'Rejected', 'all'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                  activeTab === tab
                    ? 'bg-primary-600 text-white shadow-sm'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                {tab === 'Pending' ? 'Pending Approval ⏳' : tab === 'Verified' ? 'Approved (Verified) ✓' : tab === 'Rejected' ? 'Rejected ✗' : 'All Applications'}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-72">
            <input
              type="text"
              placeholder="Search by Name, Mobile, Kisan ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3.5 py-2 pl-9 text-xs border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 font-medium"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          </form>
        </div>

        {/* Informational Guidance Alert */}
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl text-xs text-blue-900 flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Government Procurement Protocol Notice</p>
            <p className="mt-0.5 text-blue-800">
              Farmers cannot book procurement slots until their KYC application is approved by the District Procurement Officer.
              Once approved, slot booking is automatically unlocked and an SMS notification is sent to the farmer.
            </p>
          </div>
        </div>

        {/* Applications List */}
        {loading ? (
          <div className="p-12 text-center text-gray-500 bg-white rounded-2xl border border-gray-200 shadow-sm">
            <RefreshCw className="w-8 h-8 text-primary-600 animate-spin mx-auto mb-2" />
            <p className="text-sm font-semibold">Loading KYC Applications...</p>
          </div>
        ) : profiles.length === 0 ? (
          <div className="p-12 text-center text-gray-500 bg-white rounded-2xl border border-gray-200 shadow-sm space-y-2">
            <CheckCircle2 className="w-12 h-12 text-gray-300 mx-auto" />
            <h3 className="text-base font-bold text-gray-900">No {activeTab} KYC Applications Found</h3>
            <p className="text-xs text-gray-500">
              {activeTab === 'Pending'
                ? 'All submitted farmer KYC applications for your district have been reviewed!'
                : 'No matching records found for the selected filter.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {profiles.map((p) => {
              const user = p.userId || {};
              const isPending = p.kycStatus === 'Pending';
              const isVerified = p.kycStatus === 'Verified';
              const isRejected = p.kycStatus === 'Rejected';

              return (
                <div
                  key={p._id}
                  className="card p-5 bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition space-y-4"
                >
                  {/* Top Bar: Farmer Info & Status Badge */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary-100 text-primary-800 flex items-center justify-center font-bold text-sm">
                        {String(user.name || 'F').charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-gray-900 text-base">{user.name || 'Farmer'}</h3>
                          <span className="text-xs font-semibold text-gray-500">+91 {user.mobile}</span>
                        </div>
                        <p className="text-xs text-gray-500">
                          Location: <span className="font-medium text-gray-800">{user.district || p.district}, {user.state || p.state}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {isVerified ? (
                        <span className="px-3 py-1 bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Approved &amp; Active ✓
                        </span>
                      ) : isRejected ? (
                        <span className="px-3 py-1 bg-red-100 text-red-800 border border-red-300 rounded-xl text-xs font-bold flex items-center gap-1">
                          <XCircle className="w-4 h-4 text-red-600" /> KYC Rejected ✗
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-amber-100 text-amber-800 border border-amber-300 rounded-xl text-xs font-bold flex items-center gap-1">
                          <Clock className="w-4 h-4 text-amber-600 animate-pulse" /> Pending Officer Approval
                        </span>
                      )}
                    </div>
                  </div>

                  {/* KYC Data Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs bg-gray-50/80 p-3.5 rounded-xl border border-gray-200/80">
                    {/* Aadhaar Details */}
                    <div className="space-y-1">
                      <span className="font-bold text-gray-700 flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Aadhaar e-KYC Data:
                      </span>
                      <p className="text-gray-900">Masked: <strong className="font-mono">{p.aadhaarNumber || 'XXXX-XXXX-XXXX'}</strong></p>
                      <p className="text-gray-600">Aadhaar Name: <span className="font-semibold text-gray-900">{p.aadhaarDetails?.name || user.name}</span></p>
                    </div>

                    {/* Bank & NPCI Seeding */}
                    <div className="space-y-1">
                      <span className="font-bold text-gray-700 flex items-center gap-1">
                        <CreditCard className="w-3.5 h-3.5 text-primary-600" /> Bank &amp; NPCI Seeding:
                      </span>
                      <p className="text-emerald-800 font-bold">
                        Aadhaar Seeding: {p.aadhaarSeedingStatus || 'Seeded'} ({p.bankDetails?.bankName || 'State Bank of India'})
                      </p>
                      <p className="text-emerald-700 font-semibold">
                        NPCI DBT Status: {p.npciStatus || 'Active / DBT Enabled'} ✓
                      </p>
                    </div>

                    {/* Kisan ID & Land Registry */}
                    <div className="space-y-1">
                      <span className="font-bold text-gray-700 flex items-center gap-1">
                        <FileText className="w-3.5 h-3.5 text-amber-600" /> Farmer Registry Record:
                      </span>
                      <p className="text-gray-900">Kisan ID: <strong className="font-mono text-primary-700">{p.kisanId || p.farmerIdNumber || 'N/A'}</strong></p>
                      <p className="text-gray-600">Land Holding: <span className="font-medium text-gray-900">{p.kisanDetails?.landHolding || '4.25 Acres (Verified)'}</span></p>
                    </div>
                  </div>

                  {/* Remarks if any */}
                  {p.kycRemarks && (
                    <div className="p-2.5 bg-gray-100 rounded-lg text-xs text-gray-700 border border-gray-200">
                      <strong>Officer Remarks:</strong> {p.kycRemarks}
                    </div>
                  )}

                  {/* Actions for Officer */}
                  {isPending && (
                    <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-100">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenActionModal(p, 'reject')}
                        className="text-red-700 hover:bg-red-50 border-red-200 text-xs font-bold"
                        leftIcon={<X className="w-3.5 h-3.5" />}
                      >
                        Reject Application
                      </Button>
                      <Button
                        type="button"
                        variant="primary"
                        size="sm"
                        onClick={() => handleOpenActionModal(p, 'approve')}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm"
                        leftIcon={<Check className="w-3.5 h-3.5" />}
                      >
                        Approve Farmer KYC &amp; Unlock Slot Booking
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Approval / Rejection Modal */}
        {selectedProfile && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white max-w-md w-full rounded-3xl p-6 shadow-2xl border border-gray-100 space-y-4 animate-scaleUp">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
                  {actionType === 'approve' ? (
                    <>
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" /> Approve Farmer KYC
                    </>
                  ) : (
                    <>
                      <XCircle className="w-5 h-5 text-red-600" /> Reject Farmer KYC
                    </>
                  )}
                </h3>
                <button
                  type="button"
                  onClick={() => setSelectedProfile(null)}
                  className="text-gray-400 hover:text-gray-600 p-1 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="text-xs text-gray-600 space-y-1">
                <p>Farmer: <strong className="text-gray-900">{selectedProfile.userId?.name}</strong> (+91 {selectedProfile.userId?.mobile})</p>
                <p>Kisan ID: <strong className="font-mono text-gray-900">{selectedProfile.kisanId}</strong></p>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Officer Remarks / Sign-off Note {actionType === 'reject' && <span className="text-red-500">*</span>}:
                </label>
                <textarea
                  rows={3}
                  placeholder={
                    actionType === 'approve'
                      ? 'Approved by District Procurement Officer. Verified against land registry and UIDAI.'
                      : 'Please specify exact rejection reason...'
                  }
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedProfile(null)}
                  className="flex-1 py-2.5 border border-gray-300 hover:bg-gray-100 text-gray-700 rounded-xl font-medium text-xs transition"
                >
                  Cancel
                </button>
                <Button
                  type="button"
                  variant="primary"
                  loading={submittingAction}
                  onClick={handleConfirmAction}
                  className={`flex-1 text-xs font-bold ${
                    actionType === 'approve' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  {actionType === 'approve' ? 'Confirm Approval ✓' : 'Confirm Rejection ✗'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </OfficerLayout>
  );
};

export default OfficerKycApprovalsPage;
