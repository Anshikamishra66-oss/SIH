import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Settings, HelpCircle, ShieldCheck, Phone, Mail, FileText,
  Download, Globe, Landmark, Bell, Save, CheckCircle2
} from 'lucide-react';
import AdminLayout from '../../layouts/AdminLayout';
import toast from 'react-hot-toast';

const SettingsHelpPage = () => {
  const location = useLocation();
  const isHelp = location.pathname.includes('help');

  const [settings, setSettings] = useState({
    nationalMoistureTolerance: 12.0,
    dailyDisbursementLimitCr: 500,
    sessionTimeoutMinutes: 30,
    emailAlertsEnabled: true,
    smsAlertsEnabled: true,
    twoFactorEnforced: true,
    targetRevisionCutoffDays: 14,
  });

  const handleSave = (e) => {
    e.preventDefault();
    toast.success('Central CPO administrative preferences saved.');
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Breadcrumb & Header */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <span>CPO Portal</span>
            <span>/</span>
            <span className="text-blue-700 font-bold">{isHelp ? 'Help & Support' : 'Central Configuration'}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 mt-1 flex items-center gap-2">
            {isHelp ? (
              <>
                <HelpCircle className="w-6 h-6 text-blue-700" />
                <span>CPO National Helpdesk &amp; Standard Operating Procedures</span>
              </>
            ) : (
              <>
                <Settings className="w-6 h-6 text-blue-700" />
                <span>Central Policy &amp; System Settings</span>
              </>
            )}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Ministry of Consumer Affairs, Food &amp; Public Distribution • Government of India
          </p>
        </div>

        {isHelp ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                <Phone className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">CPO National Executive Helpline</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Dedicated administrative hotline for State Nodal Officers and District Procurement Officers.
              </p>
              <div className="pt-2">
                <p className="text-xs font-semibold text-slate-500">Toll-Free Priority Line:</p>
                <p className="text-lg font-black text-blue-800 font-mono">1800-180-1551</p>
                <p className="text-[11px] text-slate-400 mt-0.5">09:00 AM – 06:00 PM (Monday – Saturday)</p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                <Mail className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">Official Grievance Desk</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Direct statutory communication with the Food and Public Distribution Secretariat.
              </p>
              <div className="pt-2">
                <p className="text-xs font-semibold text-slate-500">Official Correspondence:</p>
                <p className="text-sm font-bold text-slate-900 font-mono">cpo-support@nic.in</p>
                <p className="text-sm font-bold text-slate-900 font-mono">dir-procure.fc@gov.in</p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                <Landmark className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">Central CPO Headquarters</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Department of Food &amp; Public Distribution, Krishi Bhawan, Dr. Rajendra Prasad Road, New Delhi – 110001.
              </p>
              <p className="text-[11px] text-slate-500 font-medium">NIC Technical Support Wing</p>
            </div>

            {/* SOP Guides */}
            <div className="md:col-span-3 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="font-black text-slate-900 text-base mb-4 flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-700" />
                <span>Standard Operating Procedures (SOP) &amp; Gazetted Guidelines</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {[
                  'CPO Foodgrain Procurement Protocol (2026 Edition)',
                  'Direct Benefit Transfer (DBT) Reconciliation Manual',
                  'Fair Average Quality (FAQ) Moisture Guidelines',
                  'Mandi Slot & Anti-Congestion Scheduling SOP',
                  'District Nodal Officer Delegated Powers Manual',
                  'NIC Central Security & 2FA Governance Circular',
                ].map((doc, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl border border-slate-200 hover:border-blue-400 bg-slate-50/50 flex items-center justify-between gap-3 group transition"
                  >
                    <span className="text-xs font-bold text-slate-800 leading-snug">{doc}</span>
                    <Download className="w-4 h-4 text-blue-700 flex-shrink-0 group-hover:translate-y-0.5 transition-transform" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSave} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <div>
              <h3 className="text-base font-black text-slate-900">Statutory Procurement Thresholds</h3>
              <p className="text-xs text-slate-500">Configure central parameters applied across all state procurement agencies</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <label className="block font-bold text-slate-800">
                  National Moisture Rejection Ceiling (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={settings.nationalMoistureTolerance}
                  onChange={(e) => setSettings({ ...settings, nationalMoistureTolerance: Number(e.target.value) })}
                  className="w-full p-2 bg-white rounded-lg border border-slate-300 font-mono font-bold"
                />
                <span className="text-[11px] text-slate-500">Standard FAQ limit for Rabi/Kharif intake</span>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <label className="block font-bold text-slate-800">
                  Daily Direct Benefit Transfer Cap (₹ Crores)
                </label>
                <input
                  type="number"
                  value={settings.dailyDisbursementLimitCr}
                  onChange={(e) => setSettings({ ...settings, dailyDisbursementLimitCr: Number(e.target.value) })}
                  className="w-full p-2 bg-white rounded-lg border border-slate-300 font-mono font-bold"
                />
                <span className="text-[11px] text-slate-500">Maximum daily PFMS clearing authorization</span>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 flex justify-end">
              <button
                type="submit"
                className="px-6 py-2.5 bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>Save Administrative Preferences</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </AdminLayout>
  );
};

export default SettingsHelpPage;
