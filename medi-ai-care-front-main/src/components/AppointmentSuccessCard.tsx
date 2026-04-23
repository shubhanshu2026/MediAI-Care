import { CheckCircle, Calendar, Clock, User, DollarSign, ArrowRight, Hash, ShieldCheck } from 'lucide-react';
import { Button } from './ui/button';
import { Link } from 'react-router-dom';

export const AppointmentSuccessCard = ({ appointmentId, doctorName, date, time, onBookAnother }: any) => {
  return (
    <div className="max-w-xl mx-auto rounded-3xl border bg-card p-8 shadow-2xl space-y-6 text-center">
      <div className="space-y-2">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-500 border border-emerald-100">
          <CheckCircle className="h-6 w-6" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight">Booking Confirmed!</h1>
        <p className="text-sm text-muted-foreground px-10">Your visit is scheduled and available in your portal.</p>
      </div>

      <div className="flex justify-center">
        <span className="flex items-center gap-1.5 rounded-full border border-emerald-100 bg-emerald-50/50 px-4 py-1 text-[10px] font-bold text-emerald-700 uppercase tracking-wider">
          <ShieldCheck className="h-3.5 w-3.5" /> verified medical booking
        </span>
      </div>

      {/* COMPACT TICKET */}
      <div className="rounded-2xl border bg-muted/5 overflow-hidden">
        <div className="grid grid-cols-2 gap-y-4 p-6 text-left border-b border-dashed">
          <div className="space-y-0.5">
            <p className="text-[10px] font-bold text-muted-foreground uppercase">Booking ID</p>
            <p className="text-base font-bold">#{appointmentId}</p>
          </div>
          <div className="space-y-0.5 text-right md:text-left">
            <p className="text-[10px] font-bold text-muted-foreground uppercase">Doctor</p>
            <p className="text-base font-bold">{doctorName}</p>
          </div>
          <div className="space-y-0.5">
            <p className="text-[10px] font-bold text-muted-foreground uppercase">Date</p>
            <p className="text-base font-bold">{date}</p>
          </div>
          <div className="space-y-0.5 text-right md:text-left">
            <p className="text-[10px] font-bold text-muted-foreground uppercase">Time</p>
            <p className="text-base font-bold">{time}</p>
          </div>
        </div>

        {/* COMPACT STATUS ROW */}
        <div className="p-5 flex items-center justify-between bg-white/50">
          <div className="flex items-center gap-3 rounded-lg border border-amber-100 bg-amber-50 px-4 py-2">
             <div className="h-8 w-8 rounded-md bg-amber-500 text-white flex items-center justify-center shadow-sm">
                <DollarSign className="h-4 w-4" />
             </div>
             <div className="text-left leading-tight">
                <p className="text-[9px] font-bold uppercase text-amber-700">Payment</p>
                <p className="text-sm font-bold text-amber-900">Pay at Counter</p>
             </div>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Visit Status</p>
            <p className="text-base font-bold text-emerald-600">CONFIRMED</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 pt-2">
        <Link to="/patient-dashboard" className="w-full">
          <Button className="w-full h-11 rounded-lg text-sm font-bold gap-2">
            My Dashboard <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
        <Button variant="outline" onClick={onBookAnother} className="w-full h-11 rounded-lg text-sm font-bold border-2">
          New Booking
        </Button>
      </div>
    </div>
  );
};