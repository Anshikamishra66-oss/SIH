import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Phone, Lock, Wheat, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { extractError } from '../../utils/constants';
import toast from 'react-hot-toast';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';

const LoginPage = () => {
  const [form, setForm] = useState({ mobile: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname;

  const validate = () => {
    const errs = {};
    if (!/^[6-9]\d{9}$/.test(form.mobile)) {
      errs.mobile = 'Enter a valid 10-digit mobile number';
    }
    if (!form.password) errs.password = 'Password is required';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setLoading(true);
    try {
      const user = await login(form.mobile, form.password);
      toast.success(`Welcome back, ${user.name.split(' ')[0]}!`);

      // Redirect to role-specific dashboard
      if (from) {
        navigate(from, { replace: true });
      } else {
        const redirectMap = { farmer: '/farmer/dashboard', officer: '/officer/dashboard', admin: '/admin/dashboard' };
        navigate(redirectMap[user.role] || '/');
      }
    } catch (err) {
      toast.error(extractError(err));
      setErrors({});
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-earth-50 flex">
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary-700 text-white flex-col justify-between p-12">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <Wheat className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="font-bold text-lg leading-tight">Kisan Procurement</p>
            <p className="text-primary-200 text-sm">Connect</p>
          </div>
        </div>

        <div>
          <h1 className="text-4xl font-bold leading-tight mb-6">
            Procurement without<br />the long wait.
          </h1>
          <p className="text-primary-200 text-lg leading-relaxed mb-8">
            Book your slot. Know your turn.<br />
            Track your procurement. Track your payment.
          </p>

          <div className="space-y-4">
            {[
              { num: '01', text: 'Register & add crop details' },
              { num: '02', text: 'Book a slot at your centre' },
              { num: '03', text: 'Track your live queue position' },
              { num: '04', text: 'Receive payment — digitally tracked' },
            ].map((step) => (
              <div key={step.num} className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-sm font-bold flex-shrink-0">
                  {step.num}
                </div>
                <p className="text-primary-100">{step.text}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="text-primary-300 text-sm">
          Government of India — Digital Agriculture Initiative
        </p>
      </div>

      {/* Right panel — login form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <Wheat className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-gray-900">Kisan Connect</span>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Login to your account</h2>
            <p className="text-gray-500 text-sm mt-1">Enter your registered mobile number and password</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <Input
              id="mobile"
              label="Mobile Number"
              type="tel"
              placeholder="Enter 10-digit mobile number"
              value={form.mobile}
              onChange={(e) => { setForm({ ...form, mobile: e.target.value }); setErrors({ ...errors, mobile: '' }); }}
              error={errors.mobile}
              required
              leftIcon={<Phone className="w-4 h-4" />}
              maxLength={10}
              inputMode="numeric"
              pattern="[6-9][0-9]{9}"
              autoComplete="tel"
            />

            <Input
              id="password"
              label="Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              value={form.password}
              onChange={(e) => { setForm({ ...form, password: e.target.value }); setErrors({ ...errors, password: '' }); }}
              error={errors.password}
              required
              leftIcon={<Lock className="w-4 h-4" />}
              rightIcon={
                <button type="button" onClick={() => setShowPassword(!showPassword)} aria-label="Toggle password">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              }
              autoComplete="current-password"
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
              className="w-full"
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Login
            </Button>
          </form>

          <p className="text-center text-sm text-gray-600 mt-6">
            New farmer?{' '}
            <Link to="/register" className="text-primary-600 font-semibold hover:underline">
              Register here
            </Link>
          </p>

          {/* Demo credentials */}
          <div className="mt-8 p-4 bg-gray-50 rounded-xl border border-gray-200">
            <p className="text-xs font-semibold text-gray-600 mb-3 uppercase tracking-wider">Demo Credentials</p>
            <div className="space-y-2">
              {[
                { role: 'Farmer', mobile: '9751000001', pwd: 'Farmer@123', color: 'text-primary-600' },
                { role: 'Officer', mobile: '9810000001', pwd: 'Officer@123', color: 'text-amber-600' },
                { role: 'Admin', mobile: '9000000001', pwd: 'Admin@123', color: 'text-accent-600' },
              ].map(({ role, mobile, pwd, color }) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => setForm({ mobile, password: pwd })}
                  className="w-full text-left text-xs p-2.5 rounded-lg bg-white border border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition-all"
                >
                  <span className={`font-semibold ${color}`}>{role}</span>
                  <span className="text-gray-500 ml-2">{mobile} / {pwd}</span>
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-2">Click a row to auto-fill credentials</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
