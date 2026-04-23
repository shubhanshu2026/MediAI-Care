import { useState, useEffect } from 'react';
import { AppointmentCard } from '@/components/AppointmentCard';
import { getDoctorAppointments, Appointment } from '@/api/appointmentApi';
import { addSlot } from '@/api/slotApi';
import {
  Stethoscope, Calendar, User, Clock, PlusCircle,
  Loader2, BarChart3, MessageCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

export default function DoctorDashboard() {
  const userString = localStorage.getItem('mediai_user');
  const user = userString ? JSON.parse(userString) : null;

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading]           = useState(true);
  const [slotDate, setSlotDate]         = useState('');
  const [slotTime, setSlotTime]         = useState('');
  const [addingSlot, setAddingSlot]     = useState(false);

  useEffect(() => {
    // FIX: Use user.doctorId (doctors.id) not user.id (users.id).
      //      Appointments store doctorId from the doctors table; users.id is different.
      const effectiveDoctorId = user?.doctorId || user?.id;
      if (!effectiveDoctorId) { setLoading(false); return; }

    const load = async () => {
      try {
        const { data } = await getDoctorAppointments(effectiveDoctorId);
        setAppointments(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
        toast.error('Failed to load appointments.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user?.id]);

  const handleAddSlot = async () => {
    if (!slotDate || !slotTime || !user?.id) {
      toast.error('Please fill in both date and time.');
      return;
    }
    setAddingSlot(true);
    try {
      await addSlot({ doctorId: user.id, date: slotDate, time: slotTime });
      toast.success('Availability slot added successfully!');
      setSlotDate('');
      setSlotTime('');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to add slot.');
    } finally {
      setAddingSlot(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // FIX: Previous code filtered by status === 'upcoming' (lowercase) which
  //      never matched — DB stores 'PENDING', 'APPROVED', etc. (uppercase).
  //      Now we show all non-terminal appointments as "active".
  // ─────────────────────────────────────────────────────────────────────────
  const activeAppointments = appointments.filter(
    a => !['REJECTED', 'COMPLETED'].includes(a.status?.toUpperCase() ?? '')
  );
  const pendingCount  = appointments.filter(a => a.status?.toUpperCase() === 'PENDING').length;
  const approvedCount = appointments.filter(a => a.status?.toUpperCase() === 'APPROVED').length;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">

      {/* Welcome Header */}
      <div className="rounded-2xl bg-primary p-8 text-primary-foreground shadow-lg relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md">
              <Stethoscope className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold md:text-3xl">
                Welcome back, Dr. {user?.fullName || user?.username || 'Doctor'}
              </h1>
              <p className="text-white/80 mt-1">
                {pendingCount > 0
                  ? `You have ${pendingCount} pending appointment${pendingCount > 1 ? 's' : ''} to review.`
                  : `${activeAppointments.length} active appointment${activeAppointments.length !== 1 ? 's' : ''}.`}
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="rounded-xl bg-white/10 p-4 backdrop-blur-sm min-w-[100px] text-center border border-white/10">
              <p className="text-2xl font-bold">{pendingCount}</p>
              <p className="text-[10px] uppercase tracking-wider opacity-70">Pending</p>
            </div>
            <div className="rounded-xl bg-white/10 p-4 backdrop-blur-sm min-w-[100px] text-center border border-white/10">
              <p className="text-2xl font-bold">{approvedCount}</p>
              <p className="text-[10px] uppercase tracking-wider opacity-70">Approved</p>
            </div>
            <div className="rounded-xl bg-white/10 p-4 backdrop-blur-sm min-w-[100px] text-center border border-white/10">
              <p className="text-2xl font-bold">{appointments.length}</p>
              <p className="text-[10px] uppercase tracking-wider opacity-70">Total</p>
            </div>
          </div>
        </div>
        <BarChart3 className="absolute -right-8 -bottom-8 h-48 w-48 text-white/5 rotate-12" />
      </div>

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {[
          { label: 'Create Rx',    icon: PlusCircle,    path: '/doctor/create-prescription', color: 'text-blue-500'   },
          { label: 'Appointments', icon: Calendar,       path: '/doctor/appointments',         color: 'text-purple-500' },
          { label: 'Chat',         icon: MessageCircle,  path: '/chat',                        color: 'text-green-500'  },
          { label: 'Slots',        icon: Clock,          path: '/doctor/dashboard',            color: 'text-orange-500' },
        ].map(a => (
          <Link key={a.path} to={a.path} className="group">
            <div className="h-full rounded-2xl border border-border bg-card p-5 text-center transition-all hover:border-primary hover:shadow-md">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-muted group-hover:bg-primary/10 transition-colors">
                <a.icon className={`h-6 w-6 ${a.color}`} />
              </div>
              <p className="text-sm font-semibold text-foreground">{a.label}</p>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Availability Form */}
        <div className="lg:col-span-1 rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2 mb-6">
            <Clock className="h-5 w-5 text-primary" />
            Availability
          </h2>
          <div className="space-y-4">
            <div>
              <Label className="text-xs uppercase font-bold text-muted-foreground">Select Date</Label>
              <Input
                type="date"
                className="mt-1.5"
                value={slotDate}
                onChange={e => setSlotDate(e.target.value)}
              />
            </div>
            <div>
              <Label className="text-xs uppercase font-bold text-muted-foreground">Select Time</Label>
              <Input
                type="time"
                className="mt-1.5"
                value={slotTime}
                onChange={e => setSlotTime(e.target.value)}
              />
            </div>
            <Button
              className="w-full h-11 mt-2 font-semibold"
              onClick={handleAddSlot}
              disabled={addingSlot || !slotDate || !slotTime}
            >
              {addingSlot
                ? <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                : <PlusCircle className="mr-2 h-4 w-4" />}
              Publish Slot
            </Button>
          </div>
        </div>

        {/* Recent Appointments — FIX: now shows PENDING + APPROVED, not zero */}
        <div className="lg:col-span-2 rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Recent Appointments
            </h2>
            <Link to="/doctor/appointments" className="text-xs font-bold text-primary hover:underline">
              View All →
            </Link>
          </div>

          {loading ? (
            <div className="flex h-48 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary/40" />
            </div>
          ) : activeAppointments.length === 0 ? (
            <div className="flex h-48 flex-col items-center justify-center text-center space-y-2">
              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                <Calendar className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground italic">No active appointments.</p>
              <p className="text-xs text-muted-foreground">Patients who book will appear here after you approve them.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {activeAppointments.slice(0, 3).map(a => (
                <AppointmentCard
                  key={a.id}
                  id={a.id}
                  doctor={a.doctorName}
                  specialization={a.doctorSpecialization ?? ''}
                  date={a.appointmentDate}
                  time={a.timeSlot}
                  status={
                    a.status?.toUpperCase() === 'COMPLETED' ? 'completed'
                    : a.status?.toUpperCase() === 'REJECTED'  ? 'cancelled'
                    : 'upcoming'
                  }
                />
              ))}
              {activeAppointments.length > 3 && (
                <Link
                  to="/doctor/appointments"
                  className="block text-center text-xs text-primary font-semibold hover:underline pt-2"
                >
                  +{activeAppointments.length - 3} more — View All
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
