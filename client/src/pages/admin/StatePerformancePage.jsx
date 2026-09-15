import { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Landmark, Building2, Users, Scale, IndianRupee, TrendingUp,
  Award, CheckCircle2, AlertTriangle, Phone, Mail, ChevronRight,
  Download, Search, ShieldCheck
} from 'lucide-react';
import AdminLayout from '../../layouts/AdminLayout';
import { formatCurrency } from '../../utils/constants';

const STATES_DATA = [
  {
    code: 'PB',
    name: 'Punjab',
    nodalDept: 'Department of Food, Civil Supplies & Consumer Affairs',
    officer: 'SPO-PUN-001 (Sh. Sukhdev Singh, IAS)',
    phone: '+91 172 2740201',
    districtsCount: 23,
    centresCount: 18,
    farmersCount: 6420,
    targetMT: 35000,
    procuredMT: 28450,
    payoutCr: 64.72,
    payoutSettledPct: 96.4,
    status: 'High Performing',
    trend: '+12.4%',
    primaryCrops: ['Wheat', 'Paddy'],
  },
  {
    code: 'HR',
    name: 'Haryana',
    nodalDept: 'Haryana State Cooperative Supply & Marketing Fed (HAFED)',
    officer: 'SPO-HRY-001 (Smt. Anita Sharma, IAS)',
    phone: '+91 172 2584102',
    districtsCount: 22,
    centresCount: 14,
    farmersCount: 4890,
    targetMT: 28000,
    procuredMT: 22100,
    payoutCr: 50.27,
    payoutSettledPct: 94.8,
    status: 'On Track',
    trend: '+8.6%',
    primaryCrops: ['Wheat', 'Mustard', 'Paddy'],
  },
  {
    code: 'MP',
    name: 'Madhya Pradesh',
    nodalDept: 'MP State Civil Supplies Corporation Ltd.',
    officer: 'SPO-MP-001 (Sh. Rajesh Verma, IAS)',
    phone: '+91 755 2551020',
    districtsCount: 52,
    centresCount: 22,
    farmersCount: 7150,
    targetMT: 42000,
    procuredMT: 31200,
    payoutCr: 70.98,
    payoutSettledPct: 91.2,
    status: 'High Volume',
    trend: '+15.1%',
    primaryCrops: ['Wheat', 'Gram', 'Mustard'],
  },
  {
    code: 'UP',
    name: 'Uttar Pradesh',
    nodalDept: 'Food & Essential Commodities Department',
    officer: 'SPO-UP-001 (Sh. Arvind Yadav, IAS)',
    phone: '+91 522 2238011',
    districtsCount: 75,
    centresCount: 26,
    farmersCount: 8940,
    targetMT: 50000,
    procuredMT: 36800,
    payoutCr: 83.72,
    payoutSettledPct: 90.5,
    status: 'On Track',
    trend: '+9.4%',
    primaryCrops: ['Wheat', 'Paddy'],
  },
  {
    code: 'RJ',
    name: 'Rajasthan',
    nodalDept: 'Rajasthan State Food & Civil Supplies Corp.',
    officer: 'SPO-RAJ-001 (Smt. Meenakshi Rathore, IAS)',
    phone: '+91 141 2227104',
    districtsCount: 33,
    centresCount: 12,
    farmersCount: 3820,
    targetMT: 20000,
    procuredMT: 14350,
    payoutCr: 32.64,
    payoutSettledPct: 88.0,
    status: 'Monitoring',
    trend: '+4.2%',
    primaryCrops: ['Mustard', 'Gram', 'Wheat'],
  },
];

const StatePerformancePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get('tab') || 'overview';
  const [searchTerm, setSearchTerm] = useState('');

  const filteredStates = STATES_DATA.filter((s) =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.officer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Breadcrumb & Header */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <span>CPO Portal</span>
              <span>/</span>
              <span className="text-blue-700 font-bold">State Administration</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 mt-1 flex items-center gap-2">
              <span>State-Wise Procurement Performance</span>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                5 States Active
              </span>
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Comparative target realization, state nodal agencies, and fund disbursement monitoring.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => window.print()}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition flex items-center gap-1.5 border border-slate-200"
            >
              <Download className="w-3.5 h-3.5" />
              <span>State League Table</span>
            </button>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
          {[
            { key: 'overview', label: 'State Overview' },
            { key: 'performance', label: 'Performance Scorecard' },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setSearchParams({ tab: tab.key })}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                currentTab === tab.key
                  ? 'bg-blue-700 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-200/70'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* State Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredStates.map((st) => {
            const pct = Math.round((st.procuredMT / st.targetMT) * 100);
            return (
              <div
                key={st.code}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 hover:border-blue-400 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-800 flex items-center justify-center font-black text-sm border border-blue-200">
                        {st.code}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-base">{st.name}</h3>
                        <p className="text-[11px] text-slate-500 truncate max-w-[190px]">{st.nodalDept}</p>
                      </div>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        st.status === 'High Performing'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : st.status === 'High Volume'
                          ? 'bg-purple-100 text-purple-800 border border-purple-200'
                          : st.status === 'On Track'
                          ? 'bg-blue-100 text-blue-800 border border-blue-200'
                          : 'bg-amber-100 text-amber-800 border border-amber-200'
                      }`}
                    >
                      {st.status}
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-900 mb-1">
                      <span>Target Realization</span>
                      <span className="text-emerald-700 font-mono">{pct}% ({st.procuredMT.toLocaleString()} MT)</span>
                    </div>
                    <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden mb-2">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-600 to-teal-500 rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-500">
                      <span>Target: {st.targetMT.toLocaleString()} MT</span>
                      <span>Trend: <strong className="text-emerald-700">{st.trend}</strong></span>
                    </div>
                  </div>

                  {/* Grid details */}
                  <div className="grid grid-cols-3 gap-2 mt-4 text-center">
                    <div className="p-2 bg-slate-50 rounded-lg">
                      <span className="text-[10px] uppercase font-bold text-slate-400">Centres</span>
                      <p className="text-sm font-bold text-slate-800 mt-0.5">{st.centresCount}</p>
                    </div>
                    <div className="p-2 bg-slate-50 rounded-lg">
                      <span className="text-[10px] uppercase font-bold text-slate-400">Farmers</span>
                      <p className="text-sm font-bold text-slate-800 mt-0.5">{st.farmersCount.toLocaleString()}</p>
                    </div>
                    <div className="p-2 bg-slate-50 rounded-lg">
                      <span className="text-[10px] uppercase font-bold text-slate-400">DBT Paid</span>
                      <p className="text-sm font-bold text-emerald-800 mt-0.5">₹{st.payoutCr}Cr</p>
                    </div>
                  </div>

                  {/* Nodal Officer info */}
                  <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-600 space-y-1">
                    <p className="font-semibold text-slate-800 truncate">Nodal: {st.officer}</p>
                    <p className="text-slate-500 flex items-center gap-1"><Phone className="w-3 h-3" /> {st.phone}</p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex flex-wrap gap-1">
                    {st.primaryCrops.map((c, i) => (
                      <span key={i} className="text-[9px] font-semibold bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded">
                        {c}
                      </span>
                    ))}
                  </div>
                  <Link
                    to={`/admin/procurement?state=${st.name}`}
                    className="text-xs font-bold text-blue-700 hover:text-blue-800 flex items-center gap-1"
                  >
                    Details <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AdminLayout>
  );
};

export default StatePerformancePage;
