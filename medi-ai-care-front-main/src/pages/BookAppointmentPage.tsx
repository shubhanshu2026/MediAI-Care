import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { StepIndicator } from '@/components/StepIndicator';
import { AppointmentSuccessCard } from '@/components/AppointmentSuccessCard';
import {
  Loader2, Stethoscope, ChevronRight,
  Calendar as CalendarIcon, Clock, Star, MapPin
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { bookAppointment } from '@/api/appointmentApi';
import apiClient from '@/api/axiosConfig';

export default function BookAppointmentPage() {
  const userString = localStorage.getItem('mediai_user');
  // FIX: parse user safely — includes id (numeric), email, fullName
  const user = userString ? JSON.parse(userString) : null;

  const [step, setStep]               = useState(1);
  const [doctors, setDoctors]         = useState<any[]>([]);
  const [loading, setLoading]         = useState(true);
  const [booking, setBooking]         = useState(false);
  const [doctorId, setDoctorId]       = useState('');
  const [date, setDate]               = useState<Date>();
  const [slotId, setSlotId]           = useState('');
  const [appointmentId, setAppointmentId] = useState('');

  // ── Fetch doctors ─────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoading(true);
        // FIX: use apiClient (attaches JWT) instead of bare axios
        const response = await apiClient.get('/api/doctors/list');
        setDoctors(response.data);
      } catch (err) {
        toast.error('Failed to load doctors. Is the backend running?');
      } finally {
        setLoading(false);
      }
    };
    fetchDoctors();
  }, []);

  const selectedDoctor = doctors.find(d => d.id.toString() === doctorId);
  const mockSlots = [
    { id: '1', time: '09:00 AM' }, { id: '2', time: '10:30 AM' },
    { id: '3', time: '02:00 PM' }, { id: '4', time: '04:30 PM' },
  ];
  const selectedSlot = mockSlots.find(s => s.id === slotId);

  // ── Book appointment ──────────────────────────────────────────────────────
  const handleConfirmBooking = async () => {
    // Guard: need a logged-in user with an ID
    if (!user?.id || !user?.email) {
      toast.error('Please log in to book an appointment.');
      return;
    }
    if (!date || !slotId || !doctorId) {
      toast.error('Please select a date and time slot.');
      return;
    }

    setBooking(true);
    try {
      const response = await bookAppointment({
        doctorId:             Number(doctorId),
        doctorName:           selectedDoctor?.name ?? '',
        doctorSpecialization: selectedDoctor?.specialization ?? '',
        // FIX: send numeric patientId — this is the critical missing field
        //      that caused chat contacts to always be id=0 and broke linking.
        patientId:            Number(user.id),
        patientName:          user.fullName ?? user.username ?? '',
        patientEmail:         user.email,
        patientPhone:         user.phone ?? '',
        appointmentDate:      format(date, 'yyyy-MM-dd'),
        timeSlot:             selectedSlot?.time ?? '',
        amount:               selectedDoctor?.fee ?? 0,
        paymentMethod:        'PAY_AT_COUNTER',
      });

      setAppointmentId(response.data.id.toString());
      toast.success('Appointment booked successfully!');
      setStep(4);
    } catch (e: any) {
      const msg = e.response?.data?.error ?? e.response?.data ?? 'Booking failed. Please try again.';
      toast.error(typeof msg === 'string' ? msg : 'Booking failed.');
    } finally {
      setBooking(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8 animate-in fade-in duration-500">

      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-primary px-8 py-10 text-white shadow-xl">
        <div className="relative z-10 space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Book Appointment</h1>
          <p className="text-sm opacity-80 font-medium">Schedule a priority visit with our medical experts.</p>
          <div className="pt-6 max-w-sm">
            <StepIndicator steps={['Doctor', 'Slot', 'Review', 'Done']} currentStep={step} />
          </div>
        </div>
        <Stethoscope className="absolute -right-8 -bottom-8 h-48 w-48 text-white/10" />
      </div>

      {/* ── STEP 1: Doctor Grid ─────────────────────────────────────────── */}
      {step === 1 && (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {loading ? (
            <div className="col-span-full py-20 flex justify-center">
              <Loader2 className="animate-spin h-8 w-8 text-primary/30" />
            </div>
          ) : doctors.length === 0 ? (
            <div className="col-span-full py-20 text-center text-muted-foreground text-sm">
              No doctors found. Please add doctors to the database.
            </div>
          ) : (
            doctors.map(d => (
              <div
                key={d.id}
                className="group relative rounded-xl border bg-card p-5 transition-all hover:border-primary hover:shadow-md cursor-pointer"
                onClick={() => { setDoctorId(d.id.toString()); setStep(2); }}
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">{d.name}</h3>
                    <p className="text-xs font-semibold text-primary/80 uppercase tracking-wider">{d.specialization}</p>
                  </div>
                  <div className="h-8 w-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                    <Star className="h-4 w-4 fill-emerald-600" />
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-6">
                  <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-600 border border-slate-200">
                    <MapPin className="h-3 w-3" /> {d.hospital || 'Ludhiana Clinic'}
                  </span>
                </div>

                <div className="flex items-center justify-between border-t pt-4">
                  <div className="leading-tight">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Consultation</p>
                    <p className="text-xl font-black text-slate-900">₹{d.fee}</p>
                  </div>
                  <div className="text-sm font-bold text-primary flex items-center gap-0 group-hover:gap-1 transition-all">
                    Select <ChevronRight className="h-4 w-4" />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ── STEP 2: Date + Slot ─────────────────────────────────────────── */}
      {step === 2 && (
        <div className="grid gap-6 lg:grid-cols-12">
          <div className="lg:col-span-7 rounded-xl border bg-card p-6 shadow-sm">
            <h2 className="text-base font-bold mb-4 flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-primary" /> Select Date
            </h2>
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              disabled={{ before: new Date() }}
              className="mx-auto border rounded-lg"
            />
          </div>

          <div className="lg:col-span-5 rounded-xl border bg-card p-6 shadow-sm flex flex-col">
            <h2 className="text-base font-bold mb-4 flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" /> Available Slots
            </h2>
            <div className="grid grid-cols-2 gap-3 mb-6">
              {mockSlots.map(s => (
                <button
                  key={s.id}
                  onClick={() => setSlotId(s.id)}
                  className={cn(
                    'py-3.5 rounded-lg border text-xs font-bold transition-all',
                    slotId === s.id
                      ? 'bg-primary text-white border-primary shadow-md'
                      : 'hover:border-primary/50 bg-slate-50 text-slate-600'
                  )}
                >
                  {s.time}
                </button>
              ))}
            </div>
            <Button
              className="mt-auto h-12 text-sm font-bold rounded-xl"
              disabled={!date || !slotId}
              onClick={() => setStep(3)}
            >
              Continue to Review
            </Button>
            <button
              onClick={() => setStep(1)}
              className="mt-3 text-xs text-muted-foreground hover:text-primary underline"
            >
              ← Change Doctor
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 3: Review & Confirm ────────────────────────────────────── */}
      {step === 3 && selectedDoctor && date && selectedSlot && (
        <div className="max-w-2xl mx-auto space-y-6 animate-in zoom-in-95">
          <div className="rounded-xl border bg-slate-50 p-6">
            <h3 className="text-lg font-bold mb-4 border-b pb-2">Booking Summary</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase">Patient</p>
                <p className="font-bold">{user?.fullName || user?.username || user?.email}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase">Doctor</p>
                <p className="font-bold">{selectedDoctor.name}</p>
                <p className="text-xs text-muted-foreground">{selectedDoctor.specialization}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase">Schedule</p>
                <p className="font-bold">{format(date, 'PPP')}</p>
                <p className="text-xs text-muted-foreground">{selectedSlot.time}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase">Amount Due</p>
                <p className="font-bold text-emerald-600">₹{selectedDoctor.fee}</p>
                <p className="text-xs text-muted-foreground">Pay at counter</p>
              </div>
            </div>
          </div>

          <Button
            className="w-full h-14 rounded-xl text-base font-bold shadow-lg"
            onClick={handleConfirmBooking}
            disabled={booking}
          >
            {booking
              ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Booking...</>
              : 'Confirm Appointment'}
          </Button>
          <button
            onClick={() => setStep(2)}
            className="w-full text-xs font-bold text-slate-400 hover:text-primary underline"
          >
            ← Change Selections
          </button>
        </div>
      )}

      {/* ── STEP 4: Success ─────────────────────────────────────────────── */}
      {step === 4 && date && selectedSlot && (
        <AppointmentSuccessCard
          appointmentId={appointmentId}
          doctorName={selectedDoctor?.name || ''}
          date={format(date, 'PPP')}
          time={selectedSlot.time}
          onBookAnother={() => {
            setStep(1);
            setDoctorId('');
            setDate(undefined);
            setSlotId('');
          }}
        />
      )}
    </div>
  );
}
