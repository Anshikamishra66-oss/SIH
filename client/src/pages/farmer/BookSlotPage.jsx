import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MapPin, Calendar, Clock, Package, CheckCircle, ArrowRight, ArrowLeft,
  Building2, ChevronDown, Wheat, AlertCircle, Info
} from 'lucide-react';
import { FaCheck } from 'react-icons/fa';
import { centreService, cropService, bookingService } from '../../services';
import { formatTime, formatCurrency, extractError } from '../../utils/constants';
import FarmerLayout from '../../layouts/FarmerLayout';
import Button from '../../components/common/Button';
import Input, { Select } from '../../components/common/Input';
import { Spinner } from '../../components/common/Spinner';
import toast from 'react-hot-toast';

const STEPS = ['Select Crop', 'Choose Centre', 'Pick Slot', 'Confirm'];

const BookSlotPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);

  // Data
  const [crops, setCrops] = useState([]);
  const [centres, setCentres] = useState([]);
  const [slots, setSlots] = useState([]);

  // Loading states
  const [loadingCrops, setLoadingCrops] = useState(true);
  const [loadingCentres, setLoadingCentres] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [selectedCrop, setSelectedCrop] = useState(null);
  const [quantity, setQuantity] = useState('');
  const [selectedCentre, setSelectedCentre] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState(null);

  // Validation
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchCrops = async () => {
      try {
        const res = await cropService.getCrops();
        setCrops(res.data.data.crops);
      } catch { toast.error('Could not load crops. Please refresh.'); }
      finally { setLoadingCrops(false); }
    };
    fetchCrops();
  }, []);

  useEffect(() => {
    if (step === 1) {
      const fetchCentres = async () => {
        setLoadingCentres(true);
        try {
          const res = await centreService.getCentres();
          setCentres(res.data.data.centres);
        } catch { toast.error('Could not load centres.'); }
        finally { setLoadingCentres(false); }
      };
      fetchCentres();
    }
  }, [step]);

  useEffect(() => {
    if (step === 2 && selectedCentre && selectedDate) {
      fetchSlots();
    }
  }, [step, selectedCentre, selectedDate]);

  const fetchSlots = async () => {
    setLoadingSlots(true);
    setSlots([]);
    setSelectedSlot(null);
    try {
      const res = await centreService.getCentreSlots(selectedCentre._id, selectedDate);
      setSlots(res.data.data.slots);
    } catch { toast.error('Could not load slots.'); }
    finally { setLoadingSlots(false); }
  };

  const goNext = () => {
    const errs = {};
    if (step === 0) {
      if (!selectedCrop) errs.crop = 'Please select a crop';
      if (!quantity || isNaN(quantity) || Number(quantity) <= 0) errs.quantity = 'Enter a valid quantity';
    } else if (step === 1) {
      if (!selectedCentre) errs.centre = 'Please select a centre';
    } else if (step === 2) {
      if (!selectedDate) errs.date = 'Please select a date';
      if (!selectedSlot) errs.slot = 'Please select a time slot';
    }

    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setStep((s) => s + 1);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const res = await bookingService.createBooking({
        slotId: selectedSlot._id,
        cropId: selectedCrop._id,
        cropName: selectedCrop.name,
        quantity: Number(quantity),
        unit: 'quintal',
      });
      toast.success('Booking confirmed! Your token has been generated.');
      navigate(`/farmer/bookings/${res.data.data.booking._id}`);
    } catch (err) {
      toast.error(extractError(err));
    } finally {
      setSubmitting(false);
    }
  };

  // Generate next 14 days for date picker
  const availableDates = Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return d.toISOString().split('T')[0];
  });

  const estimatedAmount = selectedCrop && quantity
    ? selectedCrop.mspPrice * Number(quantity)
    : null;

  return (
    <FarmerLayout>
      <div className="max-w-2xl mx-auto">
        <div className="page-header">
          <h1 className="page-title">Book a Procurement Slot</h1>
          <p className="page-subtitle">Complete the steps below to reserve your slot</p>
        </div>

        {/* Step progress */}
        <div className="flex items-center gap-1 mb-8">
          {STEPS.map((label, i) => (
            <div key={i} className="flex items-center flex-1">
              <div
                className={`flex-1 flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all
                  ${i < step ? 'bg-primary-100 text-primary-700' : ''}
                  ${i === step ? 'bg-primary-600 text-white' : ''}
                  ${i > step ? 'bg-gray-100 text-gray-400' : ''}
                `}
              >
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0
                  ${i < step ? 'bg-primary-600 text-white' : ''}
                  ${i === step ? 'bg-white text-primary-600' : ''}
                  ${i > step ? 'bg-gray-300 text-gray-500' : ''}
                `}>
                  {i < step ? <FaCheck className="w-2.5 h-2.5" /> : i + 1}
                </span>
                <span className="hidden sm:block">{label}</span>
              </div>
              {i < STEPS.length - 1 && <div className="w-2" />}
            </div>
          ))}
        </div>

        <div className="card p-6">
          {/* STEP 0: Select crop + quantity */}
          {step === 0 && (
            <div className="space-y-5">
              <h2 className="text-base font-semibold text-gray-900">What crop are you bringing?</h2>

              {loadingCrops ? (
                <div className="flex justify-center py-8"><Spinner /></div>
              ) : (
                <>
                  <div>
                    <p className="label">Select Crop <span className="text-red-500">*</span></p>
                    <div className="grid grid-cols-2 gap-3">
                      {crops.map((crop) => (
                        <button
                          key={crop._id}
                          type="button"
                          onClick={() => { setSelectedCrop(crop); setErrors({ ...errors, crop: '' }); }}
                          className={`p-4 rounded-xl border-2 text-left transition-all
                            ${selectedCrop?._id === crop._id
                              ? 'border-primary-500 bg-primary-50'
                              : 'border-gray-200 hover:border-gray-300 bg-white'
                            }`}
                        >
                          <p className="font-semibold text-gray-900 text-sm">{crop.name}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{crop.nameHindi}</p>
                          <p className="text-xs text-primary-600 font-medium mt-1">
                            MSP: {formatCurrency(crop.mspPrice)}/{crop.unit}
                          </p>
                        </button>
                      ))}
                    </div>
                    {errors.crop && <p className="error-text mt-2 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.crop}</p>}
                  </div>

                  <Input
                    id="quantity"
                    label="Quantity (quintals)"
                    type="number"
                    placeholder="e.g., 50"
                    value={quantity}
                    onChange={(e) => { setQuantity(e.target.value); setErrors({ ...errors, quantity: '' }); }}
                    error={errors.quantity}
                    required
                    min="0.1"
                    step="0.1"
                    hint="Enter the approximate quantity you plan to sell"
                  />

                  {estimatedAmount && (
                    <div className="p-4 bg-primary-50 rounded-xl border border-primary-100">
                      <div className="flex items-center gap-2 text-primary-700">
                        <Info className="w-4 h-4 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium">Estimated Procurement Value</p>
                          <p className="text-xl font-bold">{formatCurrency(estimatedAmount)}</p>
                          <p className="text-xs text-primary-500 mt-0.5">
                            Based on MSP of {formatCurrency(selectedCrop.mspPrice)}/{selectedCrop.unit}.
                            Final amount calculated at procurement centre.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* STEP 1: Select centre */}
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-base font-semibold text-gray-900">Choose a Procurement Centre</h2>
              <p className="text-sm text-gray-500">Showing centres available in your district</p>

              {loadingCentres ? (
                <div className="flex justify-center py-8"><Spinner /></div>
              ) : centres.length === 0 ? (
                <div className="text-center py-8 text-gray-500 text-sm">
                  <Building2 className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                  No centres available in your area. Contact your district office.
                </div>
              ) : (
                <div className="space-y-3">
                  {centres.map((centre) => (
                    <button
                      key={centre._id}
                      type="button"
                      onClick={() => { setSelectedCentre(centre); setErrors({ ...errors, centre: '' }); }}
                      className={`w-full p-4 rounded-xl border-2 text-left transition-all
                        ${selectedCentre?._id === centre._id
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200 hover:border-gray-300'
                        }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900">{centre.name}</p>
                          <div className="flex items-center gap-1 text-gray-500 text-xs mt-1">
                            <MapPin className="w-3 h-3" />
                            {centre.address}
                          </div>
                          <div className="flex flex-wrap gap-2 mt-2">
                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                              Capacity: {centre.dailyCapacity}/day
                            </span>
                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                              Hours: {centre.operatingHours?.start} – {centre.operatingHours?.end}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {centre.availableCrops?.slice(0, 4).map((c) => (
                              <span key={c._id} className="text-xs bg-primary-50 text-primary-700 px-1.5 py-0.5 rounded">
                                {c.name}
                              </span>
                            ))}
                          </div>
                        </div>
                        {selectedCentre?._id === centre._id && (
                          <CheckCircle className="w-5 h-5 text-primary-600 flex-shrink-0" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
              {errors.centre && <p className="error-text flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.centre}</p>}
            </div>
          )}

          {/* STEP 2: Select date & slot */}
          {step === 2 && (
            <div className="space-y-5">
              <h2 className="text-base font-semibold text-gray-900">Choose Date & Time Slot</h2>

              <div>
                <p className="label">Select Date <span className="text-red-500">*</span></p>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {availableDates.map((date) => {
                    const d = new Date(date);
                    const isToday = date === new Date().toISOString().split('T')[0];
                    return (
                      <button
                        key={date}
                        type="button"
                        onClick={() => { setSelectedDate(date); setErrors({ ...errors, date: '' }); }}
                        className={`p-2.5 rounded-xl border-2 text-center transition-all
                          ${selectedDate === date
                            ? 'border-primary-500 bg-primary-50'
                            : 'border-gray-200 hover:border-gray-300'
                          }`}
                      >
                        <p className="text-xs font-medium text-gray-500">
                          {d.toLocaleDateString('en-IN', { weekday: 'short' })}
                        </p>
                        <p className="text-lg font-bold text-gray-900">
                          {d.getDate()}
                        </p>
                        <p className="text-xs text-gray-500">
                          {d.toLocaleDateString('en-IN', { month: 'short' })}
                        </p>
                        {isToday && <p className="text-xs text-primary-600 font-semibold">Today</p>}
                      </button>
                    );
                  })}
                </div>
                {errors.date && <p className="error-text mt-2 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.date}</p>}
              </div>

              {selectedDate && (
                <div>
                  <p className="label">Select Time Slot <span className="text-red-500">*</span></p>
                  {loadingSlots ? (
                    <div className="flex justify-center py-6"><Spinner /></div>
                  ) : slots.length === 0 ? (
                    <div className="text-center py-6 text-sm text-gray-500 bg-gray-50 rounded-xl">
                      No slots available for this date. Please select another date.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {slots.map((slot) => {
                        const isFull = slot.status === 'full' || slot.booked >= slot.capacity;
                        const available = slot.capacity - slot.booked;
                        return (
                          <button
                            key={slot._id}
                            type="button"
                            disabled={isFull}
                            onClick={() => { if (!isFull) { setSelectedSlot(slot); setErrors({ ...errors, slot: '' }); } }}
                            className={`w-full p-4 rounded-xl border-2 flex items-center justify-between transition-all
                              ${isFull ? 'border-gray-100 bg-gray-50 opacity-60 cursor-not-allowed' : ''}
                              ${!isFull && selectedSlot?._id === slot._id ? 'border-primary-500 bg-primary-50' : ''}
                              ${!isFull && selectedSlot?._id !== slot._id ? 'border-gray-200 hover:border-gray-300' : ''}
                            `}
                          >
                            <div className="text-left">
                              <p className="font-semibold text-gray-900">
                                {formatTime(slot.startTime)} – {formatTime(slot.endTime)}
                              </p>
                              <p className={`text-xs mt-0.5 ${isFull ? 'text-red-500' : 'text-green-600'} font-medium`}>
                                {isFull ? 'FULL' : `${available} spots available`}
                              </p>
                            </div>
                            <div className="text-right">
                              {/* Capacity bar */}
                              <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${isFull ? 'bg-red-400' : 'bg-primary-500'}`}
                                  style={{ width: `${Math.min(100, (slot.booked / slot.capacity) * 100)}%` }}
                                />
                              </div>
                              <p className="text-xs text-gray-400 mt-0.5">{slot.booked}/{slot.capacity}</p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                  {errors.slot && <p className="error-text mt-2 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.slot}</p>}
                </div>
              )}
            </div>
          )}

          {/* STEP 3: Confirm */}
          {step === 3 && (
            <div className="space-y-5">
              <h2 className="text-base font-semibold text-gray-900">Confirm Your Booking</h2>

              <div className="bg-primary-50 rounded-xl p-5 border border-primary-100">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-xs text-gray-500">Crop</p>
                    <p className="font-semibold text-gray-900 mt-0.5">{selectedCrop?.name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Quantity</p>
                    <p className="font-semibold text-gray-900 mt-0.5">{quantity} quintal</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Centre</p>
                    <p className="font-semibold text-gray-900 mt-0.5">{selectedCentre?.name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Date</p>
                    <p className="font-semibold text-gray-900 mt-0.5">
                      {selectedDate ? new Date(selectedDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }) : '—'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Time Slot</p>
                    <p className="font-semibold text-gray-900 mt-0.5">
                      {selectedSlot ? `${formatTime(selectedSlot.startTime)} – ${formatTime(selectedSlot.endTime)}` : '—'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Est. Value</p>
                    <p className="font-semibold text-primary-700 mt-0.5">{formatCurrency(estimatedAmount)}</p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
                <p className="text-xs text-amber-700">
                  <strong>Note:</strong> This is an estimated value based on current MSP.
                  Final procurement amount will be determined at the centre after quality grading.
                </p>
              </div>

              <div className="p-4 bg-gray-50 rounded-xl text-xs text-gray-600 space-y-2">
                <p className="flex items-center gap-2">
                  <FaCheck className="text-emerald-600 w-3 h-3 flex-shrink-0" />
                  <span>A unique token number will be assigned to you</span>
                </p>
                <p className="flex items-center gap-2">
                  <FaCheck className="text-emerald-600 w-3 h-3 flex-shrink-0" />
                  <span>You can track your position in the live queue</span>
                </p>
                <p className="flex items-center gap-2">
                  <FaCheck className="text-emerald-600 w-3 h-3 flex-shrink-0" />
                  <span>You will be notified when your turn approaches</span>
                </p>
                <p className="flex items-center gap-2">
                  <FaCheck className="text-emerald-600 w-3 h-3 flex-shrink-0" />
                  <span>Arrive 10–15 minutes before your slot time</span>
                </p>
              </div>
            </div>
          )}

          {/* Navigation buttons */}
          <div className={`flex gap-3 mt-6 ${step > 0 ? 'justify-between' : 'justify-end'}`}>
            {step > 0 && (
              <Button
                type="button"
                variant="secondary"
                onClick={() => setStep((s) => s - 1)}
                leftIcon={<ArrowLeft className="w-4 h-4" />}
              >
                Back
              </Button>
            )}
            {step < 3 ? (
              <Button
                type="button"
                variant="primary"
                onClick={goNext}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Continue
              </Button>
            ) : (
              <Button
                type="button"
                variant="primary"
                loading={submitting}
                onClick={handleSubmit}
                size="lg"
                rightIcon={<CheckCircle className="w-4 h-4" />}
              >
                Confirm Booking
              </Button>
            )}
          </div>
        </div>
      </div>
    </FarmerLayout>
  );
};

export default BookSlotPage;
