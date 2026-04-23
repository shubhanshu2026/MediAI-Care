import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle, Info } from 'lucide-react';

interface DiagnosisResultProps {
  disease: string;
  specialist: string;
  severity: 'low' | 'medium' | 'high' | string;
  description?: string; // <--- Adding the '?' makes it optional
}

export function DiagnosisResultCard({ disease, specialist, severity, description }: DiagnosisResultProps) {
  // 1. Normalize severity to lowercase to match the keys below
  const normalizedSeverity = (severity?.toLowerCase() || 'low') as 'low' | 'medium' | 'high';

  const severityConfig = {
    low: { icon: CheckCircle, color: 'bg-emerald-100 text-emerald-700', label: 'Low Severity' },
    medium: { icon: Info, color: 'bg-amber-100 text-amber-700', label: 'Medium Severity' },
    high: { icon: AlertTriangle, color: 'bg-red-100 text-red-700', label: 'High Severity' },
  };

  // 2. Fallback to 'low' if the severity string is unexpected
  const config = severityConfig[normalizedSeverity] || severityConfig.low;
  const Icon = config.icon;

  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-md animate-in fade-in duration-500">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-foreground leading-none">{disease}</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Consult a <span className="font-semibold text-primary">{specialist}</span>
          </p>
        </div>
        <Badge className={`border-0 gap-1 px-3 py-1 shrink-0 ${config.color}`}>
          <Icon className="h-3.5 w-3.5" />
          {config.label}
        </Badge>
      </div>
      <div className="mt-4 pt-4 border-t border-dashed border-muted">
        <p className="text-sm leading-relaxed text-muted-foreground italic">
          "{description}"
        </p>
      </div>
    </div>
  );
}