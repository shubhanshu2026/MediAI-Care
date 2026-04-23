import { Star, MapPin, Briefcase, Banknote } from 'lucide-react'; 
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';

interface DoctorCardProps {
  id: string;
  name: string;
  specialization: string;
  experience: number;
  hospital: string;
  fee: number;
  rating: number;
}

export function DoctorCard({ id, name, specialization, experience, hospital, fee, rating }: DoctorCardProps) {
  return (
    <div className="group rounded-2xl border border-border bg-card p-6 shadow-sm transition-all hover:shadow-md hover:border-primary/50">
      <div className="flex items-start gap-4">
        {/* Avatar with dynamic initials */}
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-lg font-black text-primary shadow-inner">
          {name.split(' ').map(n => n[0]).join('').slice(0, 2)}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-foreground text-lg group-hover:text-primary transition-colors">{name}</h3>
            <div className="flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-md">
               <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
               <span className="text-xs font-bold text-amber-700">{rating}</span>
            </div>
          </div>

          <Badge variant="secondary" className="mt-1 bg-muted text-muted-foreground border-0 font-bold text-[10px] uppercase tracking-wider">
            {specialization}
          </Badge>

          <div className="mt-4 grid grid-cols-2 gap-y-2 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5"><Briefcase className="h-3.5 w-3.5 text-primary/60" />{experience} Years Exp.</span>
            <span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-primary/60" />{hospital}</span>
            
            {/* Updated Fee Section: Explicitly mention Clinic Pay */}
            <span className="flex items-center gap-1.5 font-bold text-foreground col-span-2">
              <Banknote className="h-4 w-4 text-emerald-500" />
              ₹{fee} <span className="text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full uppercase ml-1">Pay at Clinic</span>
            </span>
          </div>
        </div>
      </div>

      <div className="mt-6 flex gap-3">
        <Link to={`/book-appointment?doctor=${id}`} className="flex-1">
          <Button className="w-full font-bold h-11 bg-primary text-primary-foreground hover:opacity-90 shadow-lg shadow-primary/20" size="sm">
            Book Appointment
          </Button>
        </Link>
        <Button variant="outline" size="sm" className="font-bold h-11">Profile</Button>
      </div>
    </div>
  );
}