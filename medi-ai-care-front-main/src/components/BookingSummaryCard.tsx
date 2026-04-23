import { MapPin, Stethoscope, Calendar, Clock, Banknote } from 'lucide-react'; // Swapped CreditCard for Banknote
import { Separator } from '@/components/ui/separator';

interface BookingSummaryCardProps {
  doctorName: string;
  specialization: string;
  hospital: string;
  date: string;
  time: string;
  consultationFee: number;
  bookingFee?: number;
}

export function BookingSummaryCard({
  doctorName,
  specialization,
  hospital,
  date,
  time,
  consultationFee,
  bookingFee = 0, // Defaulted to 0
}: BookingSummaryCardProps) {
  const total = consultationFee + bookingFee;

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm transition-all hover:shadow-md">
      <h3 className="text-lg font-bold text-foreground">Booking Summary</h3>

      <div className="mt-5 space-y-4">
        {/* Doctor Info */}
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-sm font-bold text-primary">
            {doctorName.split(' ').map(n => n[0]).join('').slice(0, 2)}
          </div>
          <div>
            <p className="font-bold text-foreground text-lg leading-tight">{doctorName}</p>
            <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-sm text-muted-foreground">
              <span className="flex items-center gap-1"><Stethoscope className="h-3.5 w-3.5" />{specialization}</span>
              <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{hospital}</span>
            </div>
          </div>
        </div>

        <Separator className="opacity-50" />

        {/* Date & Time */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-muted/40 p-3 border border-border/50">
            <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground"><Calendar className="h-3 w-3" />Date</span>
            <p className="mt-1 text-sm font-semibold text-foreground">{date}</p>
          </div>
          <div className="rounded-xl bg-muted/40 p-3 border border-border/50">
            <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground"><Clock className="h-3 w-3" />Time</span>
            <p className="mt-1 text-sm font-semibold text-foreground">{time}</p>
          </div>
        </div>

        <Separator className="opacity-50" />

        {/* Fee Breakdown */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Consultation Fee</span>
            <span className="font-semibold text-foreground">₹{consultationFee}</span>
          </div>

          {/* Only show Booking Fee if it's actually greater than 0 */}
          {bookingFee > 0 && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Booking Fee</span>
              <span className="font-semibold text-foreground">₹{bookingFee}</span>
            </div>
          )}

          <div className="rounded-xl bg-primary/5 p-4 mt-2 border border-primary/10">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-sm font-bold text-foreground">
                <Banknote className="h-5 w-5 text-primary" /> Pay at Clinic
              </span>
              <span className="text-xl font-black text-primary">₹{total}</span>
            </div>
            <p className="text-[10px] text-primary/70 font-bold uppercase mt-2 tracking-widest">
              Amount due at counter
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}