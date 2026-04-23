import { useState, useEffect } from 'react';
import { getDoctorAppointments, updateAppointmentStatus, Appointment } from '@/api/appointmentApi';
import { useAuth } from '@/hooks/useAuth';
import {
  Calendar, Check, X, Loader2, Clock, User, Stethoscope,
  CheckCircle2, XCircle, AlertCircle, RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  PENDING:   { label: 'Pending',   color: 'bg-amber-100 text-amber-700 border-amber-200',   icon: AlertCircle },
  APPROVED:  { label: 'Approved',  color: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: CheckCircle2 },
  REJECTED:  { label: 'Rejected',  color: 'bg-red-100 text-red-700 border-red-200',         icon: XCircle },
  COMPLETED: { label: 'Completed', color: 'bg-blue-100 text-blue-700 border-blue-200',      icon: CheckCircle2 },
  UPCOMING:  { label: 'Upcoming',  color: 'bg-slate-100 text-slate-700 border-slate-200',   icon: Clock },
};

export default function DoctorAppointmentsPage() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('ALL');

  const load = async () => {
    // FIX: Use user.doctorId (doctors.id) not user.id (users.id).
    //      Appointments store doctorId from the doctors table; users.id is different.
    //      Without this fix, the query always returns 0 results.
    const effectiveDoctorId = user?.doctorId || user?.id;
    if (!effectiveDoctorId) return;
    try {
      setLoading(true);
      const { data } = await getDoctorAppointments(effectiveDoctorId);
      setAppointments(Array.isArray(data) ? data : []);
    } catch {
      toast.error('Failed to load appointments.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [user?.id]);

  const handleStatus = async (id: string, status: string) => {
    setUpdating(id);
    try {
      const { data } = await updateAppointmentStatus(id, status);
      setAppointments(prev => prev.map(a => a.id === id ? data : a));
      toast.success(`Appointment ${status.toLowerCase()} successfully!`);
    } catch {
      toast.error('Failed to update status.');
    } finally {
      setUpdating(null);
    }
  };

  const filtered = filter === 'ALL'
    ? appointments
    : appointments.filter(a => a.status?.toUpperCase() === filter);

  const counts = ['PENDING', 'APPROVED', 'REJECTED', 'COMPLETED'].reduce((acc, s) => {
    acc[s] = appointments.filter(a => a.status?.toUpperCase() === s).length;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">

      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 p-8 text-white shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-widest text-slate-400 font-bold mb-1">Doctor Panel</p>
            <h1 className="text-3xl font-bold">Appointment Schedule</h1>
            <p className="text-slate-400 text-sm mt-1">
              Review, approve, or reject patient bookings.
            </p>
          </div>
          <button
            onClick={load}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors text-sm font-semibold"
          >
            <RefreshCw className="h-4 w-4" /> Refresh
          </button>
        </div>
        <Stethoscope className="absolute -right-6 -bottom-6 h-40 w-40 text-white/5 rotate-12" />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {[
          { label: 'Pending',   count: counts.PENDING,   color: 'text-amber-600',   bg: 'bg-amber-50 border-amber-100' },
          { label: 'Approved',  count: counts.APPROVED,  color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-100' },
          { label: 'Rejected',  count: counts.REJECTED,  color: 'text-red-500',     bg: 'bg-red-50 border-red-100' },
          { label: 'Completed', count: counts.COMPLETED, color: 'text-blue-600',    bg: 'bg-blue-50 border-blue-100' },
        ].map(s => (
          <div key={s.label} className={`rounded-2xl border p-5 ${s.bg}`}>
            <p className={`text-3xl font-bold ${s.color}`}>{s.count}</p>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {['ALL', 'PENDING', 'APPROVED', 'REJECTED', 'COMPLETED'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide transition-colors border ${
              filter === f
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-card text-muted-foreground border-border hover:border-primary'
            }`}
          >
            {f === 'ALL' ? `All (${appointments.length})` : `${f} (${counts[f] ?? 0})`}
          </button>
        ))}
      </div>

      {/* Appointment List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="h-10 w-10 animate-spin text-primary/40" />
          <p className="text-xs text-muted-foreground">Loading appointments…</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 rounded-2xl border-2 border-dashed bg-muted/5 gap-3">
          <Calendar className="h-10 w-10 text-muted-foreground/20" />
          <p className="text-sm text-muted-foreground">No appointments found.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(appt => {
            const cfg = STATUS_CONFIG[appt.status?.toUpperCase()] ?? STATUS_CONFIG.UPCOMING;
            const Icon = cfg.icon;
            const isPending = appt.status?.toUpperCase() === 'PENDING';
            const isProcessing = updating === appt.id;

            return (
              <div
                key={appt.id}
                className="rounded-2xl border border-border bg-card p-5 shadow-sm hover:border-primary/30 transition-all"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">

                  {/* Patient Info */}
                  <div className="flex items-start gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <User className="h-5 w-5" />
                    </div>
                    <div className="space-y-1">
                      <p className="font-bold text-sm">{appt.patientEmail ?? 'Unknown Patient'}</p>
                      {appt.patientPhone && (
                        <p className="text-xs text-muted-foreground">📞 {appt.patientPhone}</p>
                      )}
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {appt.appointmentDate}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {appt.timeSlot}
                        </span>
                        {appt.amount != null && (
                          <span className="text-xs text-muted-foreground font-semibold">
                            ₹{appt.amount}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Status + Actions */}
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border ${cfg.color}`}>
                      <Icon className="h-3 w-3" />
                      {cfg.label}
                    </span>

                    {isPending && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 gap-1.5 border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                          onClick={() => handleStatus(appt.id, 'APPROVED')}
                          disabled={isProcessing}
                        >
                          {isProcessing ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 gap-1.5 border-red-300 text-red-600 hover:bg-red-50"
                          onClick={() => handleStatus(appt.id, 'REJECTED')}
                          disabled={isProcessing}
                        >
                          {isProcessing ? <Loader2 className="h-3 w-3 animate-spin" /> : <X className="h-3 w-3" />}
                          Reject
                        </Button>
                      </>
                    )}

                    {appt.status?.toUpperCase() === 'APPROVED' && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 gap-1.5 border-blue-300 text-blue-700 hover:bg-blue-50"
                        onClick={() => handleStatus(appt.id, 'COMPLETED')}
                        disabled={isProcessing}
                      >
                        {isProcessing ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle2 className="h-3 w-3" />}
                        Complete
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
