import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Phone, Lock, User, MapPin, CreditCard, Wheat, ArrowRight, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { extractError } from '../../utils/constants';
import toast from 'react-hot-toast';
import Button from '../../components/common/Button';
import Input, { Select } from '../../components/common/Input';

import { INDIAN_STATES, STATE_DISTRICTS } from '../../utils/locations';

const RegisterPage = () => {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: '', mobile: '', email: '', password: '', confirmPassword: '',
    state: '', district: '', village: '', address: '', farmerIdNumber: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const { register } = useAuth();
  const navigate = useNavigate();

  const update = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const validateStep1 = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Full name is required';
    if (!/^[6-9]\d{9}$/.test(form.mobile)) errs.mobile = 'Enter a valid 10-digit mobile number';
    if (!form.password || form.password.length < 6) errs.password = 'Password must be at least 6 characters';
    if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match';
    return errs;
  };

  const validateStep2 = () => {
    const errs = {};
    if (!form.state) errs.state = 'State is required';
    if (!form.district.trim()) errs.district = 'District is required';
    return errs;
  };

  const handleNext = () => {
    const errs = validateStep1();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validateStep2();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    try {
      const user = await register({
        name: form.name,
        mobile: form.mobile,
        email: form.email || undefined,
        password: form.password,
        state: form.state,
        district: form.district,
        village: form.village,
        address: form.address,
        farmerIdNumber: form.farmerIdNumber || undefined,
      });
      toast.success('Registration successful! Welcome to Kisan Connect.');
      navigate('/farmer/dashboard');
    } catch (err) {
      toast.error(extractError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-earth-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-primary-600 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Wheat className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Create Farmer Account</h1>
          <p className="text-gray-500 text-sm mt-1">Register to book procurement slots digitally</p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[1, 2].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all
                  ${step >= s ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-400'}`}
              >
                {s}
              </div>
              {s < 2 && <div className={`w-12 h-0.5 ${step > s ? 'bg-primary-600' : 'bg-gray-200'}`} />}
            </div>
          ))}
        </div>
        <div className="flex justify-center gap-16 -mt-4 mb-6">
          <p className={`text-xs ${step >= 1 ? 'text-primary-600 font-medium' : 'text-gray-400'}`}>Account Details</p>
          <p className={`text-xs ${step >= 2 ? 'text-primary-600 font-medium' : 'text-gray-400'}`}>Location Info</p>
        </div>

        <div className="card p-6">
          <form onSubmit={step === 2 ? handleSubmit : (e) => { e.preventDefault(); handleNext(); }}>
            {step === 1 ? (
              <div className="space-y-4">
                <Input
                  id="name" label="Full Name" placeholder="e.g., Rajveer Singh"
                  value={form.name} onChange={(e) => update('name', e.target.value)}
                  error={errors.name} required
                  leftIcon={<User className="w-4 h-4" />}
                  autoComplete="name"
                />
                <Input
                  id="mobile" label="Mobile Number" type="tel" placeholder="10-digit mobile number"
                  value={form.mobile} onChange={(e) => update('mobile', e.target.value)}
                  error={errors.mobile} required
                  leftIcon={<Phone className="w-4 h-4" />}
                  maxLength={10} inputMode="numeric" autoComplete="tel"
                />
                <Input
                  id="email" label="Email Address (Optional)" type="email" placeholder="your@email.com"
                  value={form.email} onChange={(e) => update('email', e.target.value)}
                  error={errors.email} autoComplete="email"
                />
                <Input
                  id="password" label="Password" type={showPassword ? 'text' : 'password'}
                  placeholder="Minimum 6 characters"
                  value={form.password} onChange={(e) => update('password', e.target.value)}
                  error={errors.password} required
                  leftIcon={<Lock className="w-4 h-4" />}
                  rightIcon={
                    <button type="button" onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  }
                  autoComplete="new-password"
                />
                <Input
                  id="confirmPassword" label="Confirm Password" type="password" placeholder="Re-enter password"
                  value={form.confirmPassword} onChange={(e) => update('confirmPassword', e.target.value)}
                  error={errors.confirmPassword} required
                  leftIcon={<Lock className="w-4 h-4" />}
                  autoComplete="new-password"
                />
                <Button type="submit" variant="primary" size="lg" className="w-full"
                  rightIcon={<ArrowRight className="w-4 h-4" />}>
                  Continue
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <Select
                  id="state" label="State" value={form.state}
                  onChange={(e) => {
                    update('state', e.target.value);
                    update('district', ''); // reset district when state changes
                  }}
                  error={errors.state} required
                >
                  <option value="">Select your state</option>
                  {INDIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                </Select>
                <Select
                  id="district" label="District"
                  value={form.district} onChange={(e) => update('district', e.target.value)}
                  error={errors.district} required
                  disabled={!form.state}
                >
                  <option value="">Select your district</option>
                  {(STATE_DISTRICTS[form.state] || []).map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </Select>
                <Input
                  id="village" label="Village / Town (Optional)" placeholder="e.g., Doraha"
                  value={form.village} onChange={(e) => update('village', e.target.value)}
                  leftIcon={<MapPin className="w-4 h-4" />}
                />
                <Input
                  id="farmerIdNumber" label="Farmer ID / Kisan Card Number (Optional)"
                  placeholder="e.g., FMR-PB-001"
                  value={form.farmerIdNumber} onChange={(e) => update('farmerIdNumber', e.target.value)}
                  leftIcon={<CreditCard className="w-4 h-4" />}
                  hint="Your state-issued farmer registration number, if available"
                />
                <Input
                  id="address" label="Full Address (Optional)" placeholder="House No., Street, Area"
                  value={form.address} onChange={(e) => update('address', e.target.value)}
                />

                <div className="flex gap-3 pt-2">
                  <Button type="button" variant="secondary" onClick={() => setStep(1)}
                    leftIcon={<ArrowLeft className="w-4 h-4" />} className="flex-1">
                    Back
                  </Button>
                  <Button type="submit" variant="primary" loading={loading} className="flex-1">
                    Create Account
                  </Button>
                </div>
              </div>
            )}
          </form>
        </div>

        <p className="text-center text-sm text-gray-600 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-primary-600 font-semibold hover:underline">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
