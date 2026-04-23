import { Calendar, Clock, Banknote, Video, FileDown, ShieldCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface AppointmentCardProps {
  id: string;
  doctor: string;
  specialization: string;
  date: string;
  time: string;
  status: 'upcoming' | 'completed' | 'cancelled';
}

export function AppointmentCard({ id, doctor, specialization, date, time, status }: AppointmentCardProps) {
  const statusStyles = {
    upcoming: 'bg-primary/10 text-primary',
    completed: 'bg-emerald-500/10 text-emerald-600',
    cancelled: 'bg-destructive/10 text-destructive',
  };

  // 1. VIDEO CALL LOGIC: Only show "Join" if it's an upcoming appointment for TODAY
  const appointmentDate = new Date(date).toDateString();
  const today = new Date().toDateString();
  const isAvailableNow = status === 'upcoming' && appointmentDate === today;

  const handleJoinMeeting = () => {
    // Unique room name for Jitsi using the appointment ID
    const roomName = `MediAI-Room-${id}`;
    window.open(`https://meet.jit.si/${roomName}`, '_blank');
    toast.success("Connecting to secure medical server...");
  };

  // 2. PRESCRIPTION LOGIC: Download if completed
  const handleDownloadPrescription = () => {
    toast.info("Generating secure PDF prescription...");
    // Logic: In a real app, this would call your Spring Boot /api/prescriptions/{id}
    window.open(`http://localhost:8080/api/prescriptions/download/${id}`, '_blank');
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm transition-all hover:shadow-md hover:border-primary/20">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <h4 className="font-bold text-foreground text-lg leading-tight">{doctor}</h4>
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{specialization}</p>
        </div>
        <Badge className={`border-0 px-3 py-1 text-[10px] font-bold uppercase tracking-tighter shadow-none ${statusStyles[status]}`}>
          {status}
        </Badge>
      </div>

      <div className="mt-4 flex flex-wrap gap-4 text-xs font-bold text-slate-500">
        <span className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
          <Calendar className="h-3.5 w-3.5 text-primary" /> {date}
        </span>
        <span className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
          <Clock className="h-3.5 w-3.5 text-primary" /> {time}
        </span>
      </div>

      {/* DYNAMIC ACTION FOOTER */}
      <div className="mt-5 pt-4 border-t border-dashed border-border/60">
        {status === 'upcoming' ? (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-amber-600 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-100">
              <Banknote className="h-4 w-4" />
              <span className="text-[10px] font-black uppercase tracking-widest">Pay at Clinic</span>
            </div>
            
            {/* Show Video Join only on the day of appointment */}
            {isAvailableNow && (
              <Button 
                onClick={handleJoinMeeting}
                size="sm" 
                className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-9 px-4 rounded-xl shadow-lg shadow-emerald-200 gap-2"
              >
                <Video className="h-4 w-4" /> Join Call
              </Button>
            )}
          </div>
        ) : status === 'completed' ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-emerald-600 font-bold text-[10px] uppercase tracking-widest">
              <ShieldCheck className="h-4 w-4" /> Verified Visit
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleDownloadPrescription}
              className="font-bold h-9 border-2 rounded-xl gap-2 hover:bg-primary/5"
            >
              <FileDown className="h-4 w-4" /> Prescription
            </Button>
          </div>
        ) : (
          <p className="text-[10px] font-bold text-slate-400 uppercase italic">Appointment was cancelled</p>
        )}
      </div>
    </div>
  );
}