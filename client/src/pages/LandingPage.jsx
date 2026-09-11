import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Wheat, Calendar, Clock, ShieldCheck, CreditCard, Users, ArrowRight,
  CheckCircle, ChevronRight, HelpCircle, Phone, MapPin, Sparkles,
  BarChart3, Smartphone, BellRing
} from 'lucide-react';

const LandingPage = () => {
  const [activeFaq, setActiveFaq] = useState(null);

  const faqs = [
    {
      q: 'How does Kisan Procurement Connect work for farmers?',
      a: 'Farmers can register in under 2 minutes, select their nearest procurement centre, choose an available date and time slot, and instantly receive a digital Token number with an estimated queue turn time.'
    },
    {
      q: 'Do I still need to wait in long lines at the Mandi / Centre?',
      a: 'No! With our real-time queue tracker, you can monitor the live token being served from your mobile phone and arrive right on your turn, eliminating hours of crowded waiting.'
    },
    {
      q: 'How is the MSP payment processed?',
      a: 'Once your produce is weighed, graded, and accepted by the Procurement Officer, payment is directly initialized via DBT (Direct Benefit Transfer) to your registered bank account with real-time status updates.'
    },
    {
      q: 'Can I book a slot on someone else’s behalf or without smartphone access?',
      a: 'Yes, slots can be booked through Common Service Centres (CSC) or family members using your Aadhaar/Farmer ID and verified mobile number.'
    },
    {
      q: 'What documents do I need to bring to the centre?',
      a: 'Bring your physical or SMS digital Token, Government ID (Aadhaar/Voter Card), and bank passbook/account details matching your registration.'
    }
  ];

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans">
      {/* Top Govt Bar */}
      <div className="bg-primary-900 text-primary-100 text-xs py-2 px-4 border-b border-primary-800">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>National Agricultural Digital Procurement Network • Government of India</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-primary-200">Toll-Free Helpline: 1800-180-1551</span>
            <span className="hidden sm:inline">|</span>
            <Link to="/login" className="hover:text-white underline">Officer / Admin Portal</Link>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-tr from-primary-700 to-emerald-500 rounded-xl flex items-center justify-center shadow-md shadow-primary-500/20">
              <Wheat className="w-7 h-7 text-white" />
            </div>
            <div>
              <span className="text-xl font-black tracking-tight text-gray-950 flex items-center gap-1.5">
                Kisan Connect
                <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-semibold">Live</span>
              </span>
              <p className="text-xs text-gray-500 font-medium">Smart Agricultural Slot & Queue System</p>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
            <a href="#how-it-works" className="hover:text-primary-600 transition">How It Works</a>
            <a href="#features" className="hover:text-primary-600 transition">Features</a>
            <a href="#benefits" className="hover:text-primary-600 transition">Benefits</a>
            <a href="#faq" className="hover:text-primary-600 transition">FAQ</a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="px-4 py-2.5 text-sm font-semibold text-gray-700 hover:text-primary-600 transition"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="px-5 py-2.5 text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-xl shadow-md shadow-primary-600/25 transition transform active:scale-95 flex items-center gap-1.5"
            >
              Book Slot
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 bg-gradient-to-b from-primary-50/50 via-white to-gray-50/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs font-semibold uppercase tracking-wider mb-6">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              Direct MSP Procurement & Queue Automation
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-gray-950 tracking-tight leading-[1.15]">
              Book your slot. <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-primary-600 to-emerald-600 bg-clip-text text-transparent">
                Know your turn.
              </span>{' '}
              Track your payment.
            </h1>

            <p className="mt-6 text-lg sm:text-xl text-gray-600 leading-relaxed">
              No more endless waiting in crowded procurement centres. Book your scheduled mandi slot,
              track live queue positions on your mobile, and receive direct MSP payments transparently.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/register"
                className="w-full sm:w-auto px-8 py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold shadow-lg shadow-primary-600/30 transition transform hover:-translate-y-0.5 flex items-center justify-center gap-2 text-base"
              >
                Book Your Slot Now
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/login"
                className="w-full sm:w-auto px-8 py-4 bg-white hover:bg-gray-50 text-gray-800 border border-gray-300 rounded-xl font-bold shadow-sm transition flex items-center justify-center gap-2 text-base"
              >
                Track My Token Turn
              </Link>
            </div>

            {/* Quick trust metrics */}
            <div className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-6 pt-10 border-t border-gray-200/80">
              <div>
                <p className="text-3xl font-extrabold text-primary-700">100%</p>
                <p className="text-xs text-gray-500 font-medium mt-1">Direct Bank MSP Transfer</p>
              </div>
              <div>
                <p className="text-3xl font-extrabold text-primary-700">Zero</p>
                <p className="text-xs text-gray-500 font-medium mt-1">Overcrowding & Waiting</p>
              </div>
              <div>
                <p className="text-3xl font-extrabold text-primary-700">Live</p>
                <p className="text-xs text-gray-500 font-medium mt-1">Real-time Queue Positions</p>
              </div>
              <div>
                <p className="text-3xl font-extrabold text-primary-700">24/7</p>
                <p className="text-xs text-gray-500 font-medium mt-1">Automated Slot Allotment</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-primary-600 bg-primary-50 px-3 py-1 rounded-full">
              Simple 4-Step Process
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mt-3">
              How Kisan Procurement Connect Works
            </h2>
            <p className="text-gray-500 mt-3">
              Designed for ease of use by any farmer with or without digital experience.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
            {[
              {
                step: '01',
                title: 'Register & Select Centre',
                desc: 'Enter your name, mobile, and land/crop details to locate your closest procurement centre.',
                icon: MapPin,
                color: 'bg-emerald-500'
              },
              {
                step: '02',
                title: 'Book Your Preferred Slot',
                desc: 'Pick your preferred date and available 1-hour window. Get an instant Token & QR confirmation.',
                icon: Calendar,
                color: 'bg-primary-600'
              },
              {
                step: '03',
                title: 'Live Queue & Token Calling',
                desc: 'Watch the live counter turn on your phone. Arrive on time without hours of standing in queue.',
                icon: Clock,
                color: 'bg-amber-500'
              },
              {
                step: '04',
                title: 'Direct MSP Payment',
                desc: 'Produce is weighed, graded, and verified. Direct funds transferred immediately to your bank.',
                icon: CreditCard,
                color: 'bg-blue-600'
              }
            ].map((card, i) => (
              <div
                key={i}
                className="bg-gray-50 rounded-2xl p-6 border border-gray-200/80 hover:shadow-lg transition relative group"
              >
                <div className={`w-12 h-12 ${card.color} text-white rounded-xl flex items-center justify-center font-bold text-lg mb-5 shadow-md`}>
                  <card.icon className="w-6 h-6" />
                </div>
                <span className="text-3xl font-black text-gray-300 group-hover:text-primary-300 transition">
                  {card.step}
                </span>
                <h3 className="text-lg font-bold text-gray-900 mt-2">{card.title}</h3>
                <p className="text-sm text-gray-600 mt-2 leading-relaxed">{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Key Features */}
      <section id="features" className="py-20 bg-gray-50 border-y border-gray-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-primary-600 bg-primary-50 px-3 py-1 rounded-full">
              Enterprise Grade
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mt-3">
              Features Built for Every Stakeholder
            </h2>
            <p className="text-gray-500 mt-3">
              Empowering farmers with transparency and equipping mandi officers with efficient workflows.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-7 rounded-2xl border border-gray-200 shadow-sm hover:border-primary-300 transition">
              <div className="w-10 h-10 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center mb-4">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Real-Time Queue Tracking</h3>
              <p className="text-sm text-gray-600 mt-2">
                Live position tracker shows exactly how many farmers are ahead of you and the expected wait time.
              </p>
            </div>

            <div className="bg-white p-7 rounded-2xl border border-gray-200 shadow-sm hover:border-primary-300 transition">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
                <CreditCard className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Direct Benefit Transfer (DBT)</h3>
              <p className="text-sm text-gray-600 mt-2">
                Real-time tracking of payment sanction, processing, and UTR credit straight into your bank account.
              </p>
            </div>

            <div className="bg-white p-7 rounded-2xl border border-gray-200 shadow-sm hover:border-primary-300 transition">
              <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Transparent MSP Verification</h3>
              <p className="text-sm text-gray-600 mt-2">
                Clear weight measurement, moisture calculation, and official Grade A/B/C pricing with zero middlemen.
              </p>
            </div>

            <div className="bg-white p-7 rounded-2xl border border-gray-200 shadow-sm hover:border-primary-300 transition">
              <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
                <BellRing className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">SMS & Notification Alerts</h3>
              <p className="text-sm text-gray-600 mt-2">
                Timely reminders before your slot, alerts when your token is called, and payment receipt confirmations.
              </p>
            </div>

            <div className="bg-white p-7 rounded-2xl border border-gray-200 shadow-sm hover:border-primary-300 transition">
              <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Officer Counter Operations</h3>
              <p className="text-sm text-gray-600 mt-2">
                One-click token calling, fast check-in of arriving farmers, and instant weighing slips generation.
              </p>
            </div>

            <div className="bg-white p-7 rounded-2xl border border-gray-200 shadow-sm hover:border-primary-300 transition">
              <div className="w-10 h-10 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center mb-4">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">State & District Analytics</h3>
              <p className="text-sm text-gray-600 mt-2">
                Real-time dashboard for administrators to monitor mandi capacity, procurement volumes, and fund flow.
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
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">
                Why It Matters
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-gray-950 mt-4 leading-tight">
                Solving the Ground Realities of Agricultural Procurement
              </h2>
              <p className="mt-4 text-gray-600 leading-relaxed">
                Prior to digital slot booking, farmers would travel dozens of kilometers to mandis only to find
                overcrowded gates, days of tractor idling, spoilage risk, and opacity in token queues.
              </p>

              <div className="mt-6 space-y-4">
                {[
                  'Guaranteed slot on your chosen day with transparent capacity limits',
                  'Live token display visible on any smartphone or CSC display screen',
                  'Pre-assigned counter numbers to eliminate gate rushing',
                  'Fair weighing and immediate digital receipts for grain delivery',
                  'Automatic notification triggers when your turn is 2 tokens away'
                ].map((item, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm font-medium text-gray-700">{item}</span>
                  </div>
                ))}
              </div>

              <div className="mt-8">
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl shadow-md transition"
                >
                  Register as a Farmer
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            <div className="bg-gradient-to-br from-primary-900 to-primary-950 p-8 rounded-3xl text-white shadow-xl">
              <div className="flex items-center justify-between border-b border-primary-800/80 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-3 h-3 rounded-full bg-emerald-400 animate-ping"></div>
                  <span className="text-sm font-bold text-emerald-300">Live Mandi Simulator</span>
                </div>
                <span className="text-xs text-primary-300">Karnal Central Mandi</span>
              </div>

              <div className="mt-6 space-y-4">
                <div className="bg-primary-800/50 p-4 rounded-xl border border-primary-700/60">
                  <p className="text-xs text-primary-300 uppercase font-semibold">Active Serving Token</p>
                  <div className="flex items-baseline justify-between mt-1">
                    <span className="text-4xl font-black text-amber-400 font-mono">TK-1008</span>
                    <span className="text-xs bg-emerald-500/20 text-emerald-300 px-2 py-1 rounded">Counter 02</span>
                  </div>
                  <p className="text-xs text-primary-200 mt-2">Farmer: Rajesh Kumar • Wheat (PBW 550) • 50 Qtl</p>
                </div>

                <div className="bg-primary-800/30 p-4 rounded-xl border border-primary-700/40">
                  <div className="flex justify-between items-center text-xs text-primary-200 mb-2">
                    <span>Queue Status</span>
                    <span className="font-semibold text-white">4 Farmers Ahead</span>
                  </div>
                  <div className="w-full bg-primary-950 rounded-full h-2">
                    <div className="bg-emerald-400 h-2 rounded-full w-3/4"></div>
                  </div>
                  <p className="text-xs text-primary-300 mt-2">Est. Turn Time: 11:30 AM (~25 mins)</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Accordion */}
      <section id="faq" className="py-20 bg-gray-50 border-t border-gray-200/80">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-primary-600 bg-primary-50 px-3 py-1 rounded-full">
              Frequently Asked Questions
            </span>
            <h2 className="text-3xl font-black text-gray-900 mt-3">
              Need Help with Slot Booking?
            </h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden transition"
              >
                <button
                  onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                  className="w-full p-5 text-left flex justify-between items-center gap-4 hover:bg-gray-50/50"
                >
                  <span className="text-base font-semibold text-gray-900">{faq.q}</span>
                  <ChevronRight
                    className={`w-5 h-5 text-gray-400 transition-transform ${
                      activeFaq === idx ? 'rotate-90 text-primary-600' : ''
                    }`}
                  />
                </button>
                {activeFaq === idx && (
                  <div className="p-5 pt-0 text-sm text-gray-600 border-t border-gray-100 bg-gray-50/30">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action Bar */}
      <section className="bg-primary-700 text-white py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-black">
            Ready to book your procurement slot?
          </h2>
          <p className="text-primary-100 max-w-xl mx-auto mt-3 text-base">
            Join thousands of farmers across the country saving valuable time and effort through verified slot bookings.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Link
              to="/register"
              className="px-8 py-3.5 bg-white text-primary-700 font-bold rounded-xl shadow-lg hover:bg-primary-50 transition"
            >
              Get Started Free
            </Link>
            <Link
              to="/login"
              className="px-8 py-3.5 bg-primary-800 text-white font-bold rounded-xl border border-primary-600 hover:bg-primary-900 transition"
            >
              Farmer Login
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 text-sm py-12 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
            <div>
              <div className="flex items-center gap-2.5 text-white mb-4">
                <Wheat className="w-6 h-6 text-primary-400" />
                <span className="font-bold text-lg">Kisan Connect</span>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed">
                Empowering Indian farmers through transparent slot reservation, real-time queue visibility, and automated MSP settlements.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3 text-xs uppercase tracking-wider">Farmer Services</h4>
              <ul className="space-y-2 text-xs">
                <li><Link to="/register" className="hover:text-white">Register New Account</Link></li>
                <li><Link to="/login" className="hover:text-white">Slot Booking Portal</Link></li>
                <li><Link to="/login" className="hover:text-white">Live Queue Tracker</Link></li>
                <li><Link to="/login" className="hover:text-white">Payment Status Inquiry</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3 text-xs uppercase tracking-wider">Officials</h4>
              <ul className="space-y-2 text-xs">
                <li><Link to="/login" className="hover:text-white">Officer Counter Login</Link></li>
                <li><Link to="/login" className="hover:text-white">Admin Dashboard</Link></li>
                <li><Link to="/login" className="hover:text-white">Mandi Capacity Planning</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3 text-xs uppercase tracking-wider">Emergency Helpline</h4>
              <p className="text-xs text-gray-300">Toll Free: 1800-180-1551</p>
              <p className="text-xs text-gray-400 mt-1">Mon - Sat: 8:00 AM - 8:00 PM</p>
              <p className="text-xs text-primary-400 mt-3 font-mono">support@kisanprocure.gov.in</p>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500">
            <p>© {new Date().getFullYear()} Kisan Procurement Connect. Designed for Farmers of India.</p>
            <p className="mt-2 sm:mt-0">Ministry of Agriculture & Farmers Welfare</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
