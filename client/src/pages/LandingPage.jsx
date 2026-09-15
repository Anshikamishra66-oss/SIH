import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import {
  Wheat, Calendar, Clock, ShieldCheck, CreditCard, Users, ArrowRight,
  CheckCircle, ChevronRight, HelpCircle, Phone, MapPin, Sparkles,
  BarChart3, Smartphone, BellRing, LogIn, UserPlus, Building2,
  Check, ExternalLink, Bot, Award, ChevronDown, ChevronUp
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Spinner } from '../components/common/Spinner';

const MSP_RATES = [
  { name: 'Wheat (गेहूं)', rate: '₹2,275', season: 'Rabi' },
  { name: 'Paddy / Rice (धान)', rate: '₹2,183', season: 'Kharif' },
  { name: 'Mustard (सरसों)', rate: '₹5,650', season: 'Rabi' },
  { name: 'Chickpea / Gram (चना)', rate: '₹5,440', season: 'Rabi' },
  { name: 'Cotton (कपास)', rate: '₹7,020', season: 'Kharif' },
  { name: 'Maize (मक्का)', rate: '₹2,090', season: 'Kharif' },
];

const FAQS = [
  {
    q: 'How does Kisan Procurement Connect work for farmers?',
    a: 'Farmers can register in under 2 minutes, select their nearest procurement centre, choose an available date and time slot, and instantly receive an official Token number with an estimated queue turn time.'
  },
  {
    q: 'Do I still need to wait in long queues at the Mandi / Centre?',
    a: 'No! With our real-time queue tracker, you can monitor the live token being served from your mobile phone and arrive right on your turn, eliminating hours of crowded waiting.'
  },
  {
    q: 'How is the MSP payment processed?',
    a: 'Once your produce is weighed, graded, and verified by the Procurement Officer, payment is directly initialized via DBT (Direct Benefit Transfer) to your registered bank account with real-time status updates.'
  },
  {
    q: 'Can I book a slot without smartphone access?',
    a: 'Yes, slots can be booked through Common Service Centres (CSC), village panchayats, or family members using your Aadhaar/Farmer ID and verified mobile number.'
  },
  {
    q: 'What documents do I need to bring to the procurement centre?',
    a: 'Bring your physical or SMS digital Token slip, Government ID (Aadhaar or Voter ID), and bank passbook/account details matching your registration.'
  }
];

const LandingPage = () => {
  const { user, isAuthenticated, loading } = useAuth();
  const [activeFaq, setActiveFaq] = useState(null);

  // If user is already authenticated, redirect to their role dashboard
  if (!loading && isAuthenticated && user) {
    const redirectMap = {
      farmer: '/farmer/dashboard',
      procurement_officer: '/officer/dashboard',
      quality_staff: '/officer/dashboard',
      data_staff: '/officer/dashboard',
      gate_staff: '/officer/dashboard',
      centre_head: '/officer/dashboard',
      district_officer: '/admin/dashboard',
      state_officer: '/admin/dashboard',
      central_admin: '/admin/dashboard',
      admin: '/admin/dashboard',
      officer: '/officer/dashboard',
    };
    const target = redirectMap[user.role] || '/farmer/dashboard';
    return <Navigate to={target} replace />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  const toggleFaq = (index) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-emerald-100 selection:text-emerald-900">
      {/* Top Tricolor Strip & Official Government Header */}
      <div className="h-1.5 w-full bg-gradient-to-r from-orange-500 via-white to-emerald-600" />
      <div className="bg-primary-950 text-primary-100 text-xs py-2 px-4 border-b border-primary-900">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-medium tracking-wide">
              National Agricultural Digital Procurement Network • Ministry of Agriculture &amp; Farmers Welfare
            </span>
          </div>
          <div className="flex items-center gap-4 text-primary-300">
            <span>Toll-Free Helpline: <strong className="text-white font-mono">1800-180-1551</strong></span>
            <span className="hidden sm:inline text-primary-700">|</span>
            <Link
              to="/login"
              className="hover:text-white transition flex items-center gap-1 font-semibold text-emerald-300"
            >
              <LogIn className="w-3.5 h-3.5" /> Portal Login
            </Link>
          </div>
        </div>
      </div>

      {/* Main Sticky Navbar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-12 h-12 bg-gradient-to-tr from-primary-700 to-emerald-500 rounded-xl flex items-center justify-center shadow-md shadow-primary-500/20 group-hover:scale-105 transition-transform">
              <Wheat className="w-7 h-7 text-white" />
            </div>
            <div>
              <span className="text-xl font-black tracking-tight text-gray-950 flex items-center gap-1.5">
                Kisan Connect
                <span className="text-[10px] uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold border border-emerald-200">
                  Govt of India
                </span>
              </span>
              <p className="text-xs text-gray-500 font-medium">Smart Mandi Slot &amp; Queue Management</p>
            </div>
          </Link>

          {/* Nav links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-gray-600">
            <a href="#how-it-works" className="hover:text-primary-600 transition">How It Works</a>
            <a href="#msp-rates" className="hover:text-primary-600 transition">MSP Rates</a>
            <a href="#features" className="hover:text-primary-600 transition">Features</a>
            <a href="#benefits" className="hover:text-primary-600 transition">Benefits</a>
            <a href="#faq" className="hover:text-primary-600 transition">FAQ</a>
          </nav>

          {/* Clearly Visible Action Buttons */}
          <div className="flex items-center gap-3">
            {/* Primary Login Button */}
            <Link
              to="/login"
              id="landing-nav-login-btn"
              className="px-5 py-2.5 text-sm font-bold text-gray-800 bg-gray-100 hover:bg-gray-200 hover:text-primary-700 rounded-xl transition-all border border-gray-200 flex items-center gap-1.5 shadow-sm active:scale-95"
            >
              <LogIn className="w-4 h-4 text-primary-600" />
              <span>Login</span>
            </Link>

            {/* Register / Book Slot CTA */}
            <Link
              to="/register"
              id="landing-nav-register-btn"
              className="px-5 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-primary-600 to-emerald-600 hover:from-primary-700 hover:to-emerald-700 rounded-xl shadow-md shadow-primary-600/25 transition-all transform active:scale-95 flex items-center gap-1.5"
            >
              <span>Register / Book</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-16 lg:pb-24 bg-gradient-to-b from-primary-50/60 via-white to-gray-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-3xl mx-auto">
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-6 shadow-sm">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              Official National Digital MSP Procurement Portal
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-gray-950 tracking-tight leading-[1.15]">
              Smarter Mandi Slots.{' '}
              <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-primary-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent">
                Zero Waiting Lines.
              </span>{' '}
              Guaranteed MSP.
            </h1>

            {/* Subtitle */}
            <p className="mt-6 text-base sm:text-lg text-gray-600 leading-relaxed max-w-2xl mx-auto">
              Eliminate overcrowded mandis and endless queues. Book your scheduled procurement slot,
              track live token calling from your mobile, and receive direct MSP payments transparently into your bank account.
            </p>

            {/* Primary Action Buttons */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/login"
                id="hero-login-btn"
                className="w-full sm:w-auto px-8 py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl font-bold shadow-lg shadow-primary-600/30 transition-all transform hover:-translate-y-0.5 active:scale-95 flex items-center justify-center gap-2.5 text-base"
              >
                <LogIn className="w-5 h-5" />
                <span>Login to Portal</span>
              </Link>
              <Link
                to="/register"
                id="hero-register-btn"
                className="w-full sm:w-auto px-8 py-4 bg-white hover:bg-gray-50 text-gray-900 border-2 border-primary-200 hover:border-primary-400 rounded-2xl font-bold shadow-sm transition-all transform hover:-translate-y-0.5 active:scale-95 flex items-center justify-center gap-2 text-base"
              >
                <UserPlus className="w-5 h-5 text-primary-600" />
                <span>New Farmer Registration</span>
              </Link>
            </div>

            {/* Quick Dual-Portal Selector Cards */}
            <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
              {/* Farmer Portal Card */}
              <div className="p-5 rounded-2xl bg-white border-2 border-emerald-200 shadow-md hover:shadow-lg transition-all relative overflow-hidden group">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                      <Wheat className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-base">Farmer Portal</h3>
                      <p className="text-xs text-emerald-700 font-medium">Mobile Number &amp; OTP Login</p>
                    </div>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Farmers
                  </span>
                </div>
                <p className="text-xs text-gray-600 mt-3 leading-relaxed">
                  Book your procurement slot, view your unique queue token, inspect live queue status, and track DBT bank payment.
                </p>
                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-xs text-gray-500">Instant Access via OTP</span>
                  <Link
                    to="/login"
                    className="text-xs font-bold text-primary-600 hover:text-primary-700 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform"
                  >
                    Farmer Login <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              {/* Officer Portal Card */}
              <div className="p-5 rounded-2xl bg-white border-2 border-blue-200 shadow-md hover:shadow-lg transition-all relative overflow-hidden group">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-base">Officer &amp; Staff Portal</h3>
                      <p className="text-xs text-blue-700 font-medium">Employee ID &amp; Password Login</p>
                    </div>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                    Mandi Officers
                  </span>
                </div>
                <p className="text-xs text-gray-600 mt-3 leading-relaxed">
                  Manage digital queue counters, verify arriving farmers, record weight &amp; moisture grading, and process DBT releases.
                </p>
                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-xs text-gray-500">Centres, Districts &amp; Admins</span>
                  <Link
                    to="/login"
                    className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform"
                  >
                    Officer Login <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Quick trust metrics */}
            <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 pt-8 border-t border-gray-200">
              <div className="p-3 bg-white/60 rounded-xl border border-gray-100">
                <p className="text-2xl sm:text-3xl font-extrabold text-primary-700">100%</p>
                <p className="text-xs text-gray-500 font-medium mt-0.5">Direct Bank MSP Transfer</p>
              </div>
              <div className="p-3 bg-white/60 rounded-xl border border-gray-100">
                <p className="text-2xl sm:text-3xl font-extrabold text-emerald-700">Zero</p>
                <p className="text-xs text-gray-500 font-medium mt-0.5">Overcrowding &amp; Queues</p>
              </div>
              <div className="p-3 bg-white/60 rounded-xl border border-gray-100">
                <p className="text-2xl sm:text-3xl font-extrabold text-teal-700">Live</p>
                <p className="text-xs text-gray-500 font-medium mt-0.5">Real-Time Token Calling</p>
              </div>
              <div className="p-3 bg-white/60 rounded-xl border border-gray-100">
                <p className="text-2xl sm:text-3xl font-extrabold text-blue-700">24/7</p>
                <p className="text-xs text-gray-500 font-medium mt-0.5">Smart Slot Reservation</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Live MSP Rates Ticker Banner */}
      <section id="msp-rates" className="py-8 bg-gradient-to-r from-emerald-800 via-primary-900 to-teal-900 text-white shadow-inner">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-300" />
              <h2 className="text-sm sm:text-base font-bold tracking-wide uppercase text-emerald-200">
                Official Government Minimum Support Price (MSP) Rates
              </h2>
            </div>
            <span className="text-xs text-emerald-300 bg-white/10 px-3 py-1 rounded-full">
              Standardized Rate Per Quintal (100 Kg)
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {MSP_RATES.map((crop, i) => (
              <div key={i} className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/15 text-center">
                <p className="text-xs font-semibold text-emerald-100 truncate">{crop.name}</p>
                <p className="text-xl font-extrabold text-white mt-1 font-mono">{crop.rate}</p>
                <p className="text-[10px] text-emerald-300 uppercase tracking-wider mt-0.5">{crop.season} Season</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works (4-Step Lifecycle) */}
      <section id="how-it-works" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-primary-600 bg-primary-50 px-3 py-1 rounded-full">
              Transparent 4-Step Process
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mt-3">
              How Kisan Procurement Connect Works
            </h2>
            <p className="text-gray-500 mt-3 text-sm sm:text-base">
              Designed for ease of use by every farmer, eliminating wait times and ensuring transparent payouts.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                step: '01',
                title: 'Choose Mandi / Centre',
                desc: 'Select your local procurement centre with active capacity and operating hours.',
                icon: MapPin,
                color: 'bg-emerald-600',
              },
              {
                step: '02',
                title: 'Select Crop & Quantity',
                desc: 'Choose your crop to see real-time MSP calculation and enter your produce quantity in quintals.',
                icon: Wheat,
                color: 'bg-primary-600',
              },
              {
                step: '03',
                title: 'Pick Date & Time Slot',
                desc: 'Select from available 1-hour time slots across the next 14 days to avoid crowded rushes.',
                icon: Calendar,
                color: 'bg-amber-600',
              },
              {
                step: '04',
                title: 'Token Slip & Direct Pay',
                desc: 'Receive your unique queue token. Track live turn calling and receive payment via direct bank transfer.',
                icon: CreditCard,
                color: 'bg-blue-600',
              },
            ].map((card, i) => (
              <div
                key={i}
                className="bg-gray-50 rounded-2xl p-6 border border-gray-200/90 hover:shadow-md hover:border-primary-300 transition-all relative group"
              >
                <div className={`w-12 h-12 ${card.color} text-white rounded-xl flex items-center justify-center font-bold text-lg mb-4 shadow-md`}>
                  <card.icon className="w-6 h-6" />
                </div>
                <span className="text-2xl font-black text-gray-300 group-hover:text-primary-400 transition-colors">
                  Step {card.step}
                </span>
                <h3 className="text-base font-bold text-gray-900 mt-2">{card.title}</h3>
                <p className="text-xs sm:text-sm text-gray-600 mt-2 leading-relaxed">{card.desc}</p>
              </div>
            ))}
          </div>

          {/* Call to action within how it works */}
          <div className="mt-12 text-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold shadow-md transition-all active:scale-95 text-sm"
            >
              <LogIn className="w-4 h-4" />
              <span>Login to Book Your Slot</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Key Platform Features */}
      <section id="features" className="py-20 bg-gray-50 border-y border-gray-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-primary-600 bg-primary-50 px-3 py-1 rounded-full">
              Next-Gen Technology
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mt-3">
              Features Built for Farmers and Mandis
            </h2>
            <p className="text-gray-500 mt-3 text-sm sm:text-base">
              Bringing technology directly to the grassroots to safeguard farmers&apos; livelihood.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:border-primary-400 transition-all">
              <div className="w-10 h-10 rounded-xl bg-primary-100 text-primary-700 flex items-center justify-center mb-4">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-gray-900">Live Token Queue Tracking</h3>
              <p className="text-xs sm:text-sm text-gray-600 mt-2 leading-relaxed">
                Watch real-time queue position on your dashboard. Know exactly how many farmers are ahead and the estimated wait time.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:border-primary-400 transition-all">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-4">
                <Bot className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-gray-900">Kisan AI Assistant</h3>
              <p className="text-xs sm:text-sm text-gray-600 mt-2 leading-relaxed">
                24/7 intelligent Sahayak powered by Google Gemini. Ask any question in Hindi or English about MSP rates, documents, and slot policies.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:border-primary-400 transition-all">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center mb-4">
                <CreditCard className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-gray-900">Direct Bank Transfer (DBT)</h3>
              <p className="text-xs sm:text-sm text-gray-600 mt-2 leading-relaxed">
                Full transparency with direct transfer to your Aadhaar-linked bank account. Track sanction, UTR number, and payment confirmation.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:border-primary-400 transition-all">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mb-4">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-gray-900">Verified Quality &amp; Moisture Check</h3>
              <p className="text-xs sm:text-sm text-gray-600 mt-2 leading-relaxed">
                Standardized weighing and digital quality assessment slips prevent deduction disputes and protect farmer value.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:border-primary-400 transition-all">
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center mb-4">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-gray-900">Officer Counter Workflows</h3>
              <p className="text-xs sm:text-sm text-gray-600 mt-2 leading-relaxed">
                Integrated counters for Gate Entry, Quality Inspection, Weighment, and Procurement Approval ensure swift processing.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:border-primary-400 transition-all">
              <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center mb-4">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-gray-900">State &amp; District Analytics</h3>
              <p className="text-xs sm:text-sm text-gray-600 mt-2 leading-relaxed">
                Real-time visibility for district and state nodal officers to balance mandi load, prevent congestion, and manage storage.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-primary-600 bg-primary-50 px-3 py-1 rounded-full">
                Why It Matters
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mt-3">
                Transforming the Mandi Experience for Every Kisan
              </h2>
              <p className="text-gray-600 mt-4 leading-relaxed text-sm sm:text-base">
                Traditional procurement often forces farmers to wait for days outside mandis with their loaded tractor-trolleys,
                risking produce damage from rain, distress selling, and extreme fatigue. Kisan Connect changes this permanently.
              </p>

              <div className="mt-8 space-y-4">
                {[
                  'Guaranteed entry time with digital token slips — no unauthorized queue jumping.',
                  'Zero middleman deduction — receive full declared MSP directly into your bank account.',
                  'Real-time SMS updates and WhatsApp notifications for each procurement milestone.',
                  'Government inspection accountability with digital records saved securely.',
                ].map((point, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                    <p className="text-sm text-gray-700 font-medium">{point}</p>
                  </div>
                ))}
              </div>

              <div className="mt-8 flex items-center gap-4">
                <Link
                  to="/login"
                  className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold shadow-md transition-all active:scale-95 text-sm flex items-center gap-2"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Access Farmer Portal</span>
                </Link>
                <Link
                  to="/register"
                  className="px-6 py-3 border border-gray-300 hover:border-gray-400 text-gray-800 rounded-xl font-bold transition-all text-sm"
                >
                  Register Now
                </Link>
              </div>
            </div>

            {/* Visual Box */}
            <div className="bg-gradient-to-br from-primary-900 via-primary-950 to-emerald-950 p-8 sm:p-10 rounded-3xl text-white shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 -mr-12 -mt-12 w-48 h-48 bg-emerald-500/20 rounded-full blur-3xl" />
              <div className="relative z-10 space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-emerald-300 text-xs font-semibold">
                  <ShieldCheck className="w-4 h-4" /> Direct Government Guarantee
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold leading-tight">
                  Kisan Call Centre &amp; Grievance Redressal
                </h3>
                <p className="text-primary-200 text-xs sm:text-sm leading-relaxed">
                  Have an urgent question regarding your slot, moisture assessment, or payment status?
                  Call our toll-free farmer helpline 24 hours a day.
                </p>

                <div className="p-4 bg-white/10 rounded-2xl border border-white/15">
                  <p className="text-xs text-primary-300">National Kisan Helpline</p>
                  <p className="text-2xl font-black text-white font-mono mt-1">1800-180-1551</p>
                  <p className="text-[11px] text-emerald-300 mt-1">Free call from all mobile operators across India</p>
                </div>

                <div className="flex items-center gap-4 pt-2">
                  <Link
                    to="/login"
                    className="w-full text-center py-3 bg-white text-primary-900 rounded-xl font-bold text-sm hover:bg-emerald-50 transition-all shadow-md"
                  >
                    Login to System
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 bg-gray-50 border-t border-gray-200/80">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-primary-600 bg-primary-50 px-3 py-1 rounded-full">
              Frequently Asked Questions
            </span>
            <h2 className="text-3xl font-black text-gray-900 mt-3">
              Answers to Common Questions
            </h2>
          </div>

          <div className="space-y-3">
            {FAQS.map((faq, idx) => {
              const isOpen = activeFaq === idx;
              return (
                <div
                  key={idx}
                  className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm transition-all"
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(idx)}
                    className="w-full px-6 py-4.5 text-left flex items-center justify-between gap-4 hover:bg-gray-50/50 transition-colors"
                  >
                    <span className="font-bold text-gray-900 text-sm sm:text-base">{faq.q}</span>
                    {isOpen ? (
                      <ChevronUp className="w-5 h-5 text-primary-600 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    )}
                  </button>
                  {isOpen && (
                    <div className="px-6 pb-5 pt-1 text-xs sm:text-sm text-gray-600 border-t border-gray-100 leading-relaxed animate-fadeIn">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="py-16 bg-gradient-to-r from-primary-700 via-emerald-700 to-teal-700 text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-black">
            Ready to Schedule Your Produce Procurement?
          </h2>
          <p className="mt-3 text-primary-100 text-sm sm:text-base max-w-xl mx-auto">
            Experience smooth, dignified, and guaranteed mandi procurement with Kisan Procurement Connect.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/login"
              id="footer-cta-login-btn"
              className="w-full sm:w-auto px-8 py-3.5 bg-white text-primary-800 hover:bg-primary-50 rounded-xl font-bold shadow-lg transition-all active:scale-95 text-base flex items-center justify-center gap-2"
            >
              <LogIn className="w-5 h-5" />
              <span>Login to Portal</span>
            </Link>
            <Link
              to="/register"
              id="footer-cta-register-btn"
              className="w-full sm:w-auto px-8 py-3.5 bg-primary-900/40 hover:bg-primary-900/60 text-white border border-white/30 rounded-xl font-bold shadow-sm transition-all active:scale-95 text-base flex items-center justify-center gap-2"
            >
              <UserPlus className="w-5 h-5" />
              <span>Register as New Farmer</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Official Footer */}
      <footer className="bg-gray-950 text-gray-400 text-xs py-12 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8 pb-8 border-b border-gray-800">
            <div className="md:col-span-1">
              <div className="flex items-center gap-2 text-white font-bold text-base mb-2">
                <Wheat className="w-5 h-5 text-emerald-400" />
                <span>Kisan Connect</span>
              </div>
              <p className="text-gray-500 leading-relaxed">
                National Digital Agriculture Initiative ensuring guaranteed MSP, automated slot booking, and queue management.
              </p>
            </div>
            <div>
              <p className="text-white font-bold mb-3 uppercase tracking-wider text-[11px]">Quick Links</p>
              <ul className="space-y-2">
                <li><Link to="/login" className="hover:text-white transition">Login to Portal</Link></li>
                <li><Link to="/register" className="hover:text-white transition">Farmer Registration</Link></li>
                <li><a href="#msp-rates" className="hover:text-white transition">2026 MSP Rates</a></li>
                <li><a href="#how-it-works" className="hover:text-white transition">How It Works</a></li>
              </ul>
            </div>
            <div>
              <p className="text-white font-bold mb-3 uppercase tracking-wider text-[11px]">Portals</p>
              <ul className="space-y-2">
                <li><Link to="/login" className="hover:text-white transition">Farmer Slot Booking</Link></li>
                <li><Link to="/login" className="hover:text-white transition">Officer Counter Portal</Link></li>
                <li><Link to="/login" className="hover:text-white transition">Admin &amp; Analytics Dashboard</Link></li>
                <li><Link to="/login" className="hover:text-white transition">DBT Payment Tracking</Link></li>
              </ul>
            </div>
            <div>
              <p className="text-white font-bold mb-3 uppercase tracking-wider text-[11px]">Government Helpline</p>
              <p className="text-gray-300 font-medium">Toll-Free Kisan Call Centre:</p>
              <p className="text-white font-bold font-mono text-base mt-1">1800-180-1551</p>
              <p className="text-gray-500 mt-2">Department of Agriculture &amp; Farmers Welfare, Krishi Bhawan, New Delhi.</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-gray-500">
            <p>© 2026 Kisan Procurement Connect • Government of India. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <Link to="/login" className="hover:text-gray-300 transition">Privacy Policy</Link>
              <span>•</span>
              <Link to="/login" className="hover:text-gray-300 transition">Terms of Service</Link>
              <span>•</span>
              <Link to="/login" className="hover:text-gray-300 transition">Portal Login</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
