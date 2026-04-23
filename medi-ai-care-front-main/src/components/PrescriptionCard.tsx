import { Pill } from 'lucide-react';

interface PrescriptionCardProps {
  doctor: string;
  date: string;
  medicines: { name: string; dosage: string; instructions: string }[];
}

export function PrescriptionCard({ doctor, date, medicines }: PrescriptionCardProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-card">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-foreground">{doctor}</h4>
        <span className="text-sm text-muted-foreground">{date}</span>
      </div>
      <div className="mt-4 space-y-3">
        {medicines.map((med, i) => (
          <div key={i} className="flex items-start gap-3 rounded-lg bg-muted/50 p-3">
            <Pill className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <div>
              <p className="text-sm font-medium text-foreground">{med.name} — {med.dosage}</p>
              <p className="text-xs text-muted-foreground">{med.instructions}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
