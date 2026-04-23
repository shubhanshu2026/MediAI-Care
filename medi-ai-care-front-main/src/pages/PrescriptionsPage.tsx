import { useState, useEffect } from 'react';
import { getPatientPrescriptions, parseMedicines, Prescription } from '@/api/prescriptionApi';
import { useAuth } from '@/hooks/useAuth';
import { Loader2, Pill, Clock, FileText, Search, ShieldCheck, ExternalLink } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export default function PrescriptionsPage() {
  const { user } = useAuth();
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading]             = useState(true);
  const [search, setSearch]               = useState('');

  useEffect(() => {
    // KEY FIX: use user.id (numeric) not user.email
    if (!user?.id) { setLoading(false); return; }
    const load = async () => {
      try {
        const { data } = await getPatientPrescriptions(user.id);
        setPrescriptions(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
        toast.error('Failed to load prescriptions.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user?.id]);

  // Aggregate all medicines for the active schedule sidebar
  const allMedicines = prescriptions.flatMap(p => parseMedicines(p.medicines));

  const filtered = prescriptions.filter(p => {
    const doctor = p.doctorName ?? '';
    const id     = String(p.id ?? '');
    const diag   = p.diagnosis ?? '';
    const q      = search.toLowerCase();
    return doctor.toLowerCase().includes(q) || id.includes(q) || diag.toLowerCase().includes(q);
  });

  const formatDate = (raw?: string) =>
    raw ? new Date(raw).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-10">

      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-900 px-8 py-10 text-white shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-md space-y-2">
            <h1 className="text-3xl font-bold md:text-4xl tracking-tight">Prescription Vault</h1>
            <p className="text-slate-400 text-sm leading-relaxed">
              Your verified digital prescriptions issued by Medi-AI partner doctors.
            </p>
          </div>
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 border border-white/10">
            <ShieldCheck className="h-8 w-8 text-primary" />
          </div>
        </div>
        <Pill className="absolute -right-12 -bottom-12 h-64 w-64 rotate-12 text-white/5 opacity-20" />
      </div>

      <div className="grid gap-8 lg:grid-cols-12">

        {/* ── Active Schedule sidebar ──────────────────────────────────── */}
        <div className="lg:col-span-4 space-y-6">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" /> Active Schedule
          </h2>

          <div className="space-y-3">
            {allMedicines.length === 0 ? (
              <div className="rounded-2xl border border-dashed p-10 text-center flex flex-col items-center gap-2">
                <Pill className="h-8 w-8 text-muted-foreground/20" />
                <p className="text-xs text-muted-foreground">No active medications.</p>
              </div>
            ) : (
              allMedicines.slice(0, 6).map((med, idx) => (
                <div key={idx} className="flex items-center gap-4 rounded-xl border bg-card p-4 shadow-sm group hover:border-primary/30 transition-colors">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <Pill className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-sm truncate">{med.name}</p>
                    <p className="text-[10px] text-muted-foreground truncate uppercase font-bold tracking-tight">
                      {med.dosage} · {med.instructions}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="rounded-2xl bg-primary/5 p-5 border border-primary/10">
            <p className="text-xs font-bold text-primary flex items-center gap-2 mb-2">
              <FileText className="h-3 w-3" /> Pharmacist Tip
            </p>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Always follow dosage instructions from your doctor. Present these digital records at any verified pharmacy for fulfillment.
            </p>
          </div>
        </div>

        {/* ── Prescription History ──────────────────────────────────────── */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <h2 className="text-xl font-bold">History</h2>
            <div className="relative w-full max-w-[240px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by doctor, diagnosis…"
                className="pl-10 h-10 bg-muted/20 border-none focus-visible:ring-primary"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Loader2 className="h-10 w-10 animate-spin text-primary/40" />
              <p className="text-xs text-muted-foreground animate-pulse">Loading records…</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 rounded-3xl border-2 border-dashed bg-muted/5 gap-3">
              <FileText className="h-10 w-10 text-muted-foreground/20" />
              <p className="text-sm text-muted-foreground">No prescriptions found.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filtered.map(p => {
                const meds = parseMedicines(p.medicines);
                // Detect if medicines field is actually a file URL
                const isFileUrl = p.medicines?.startsWith('/uploads/');

                return (
                  <div key={p.id} className="rounded-2xl border bg-card p-6 shadow-sm hover:border-primary/20 transition-all space-y-4">
                    {/* Header row */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <p className="font-bold text-sm">
                          Dr. {p.doctorName ?? 'Medical Specialist'}
                        </p>
                        {p.diagnosis && (
                          <p className="text-xs text-muted-foreground">{p.diagnosis}</p>
                        )}
                        <p className="text-[10px] text-muted-foreground">
                          Issued: {formatDate(p.issuedDate)}
                        </p>
                      </div>
                      <span className="shrink-0 bg-primary/10 text-primary text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide">
                        Rx #{p.id}
                      </span>
                    </div>

                    {/* Medicines or file link */}
                    {isFileUrl ? (
                      <a
                        href={`http://localhost:8080${p.medicines}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 text-primary text-xs font-semibold hover:underline"
                      >
                        <ExternalLink className="h-3 w-3" /> View Uploaded Prescription
                      </a>
                    ) : meds.length > 0 ? (
                      <div className="grid gap-2 sm:grid-cols-2">
                        {meds.map((m, idx) => (
                          <div key={idx} className="flex items-center gap-3 rounded-lg bg-muted/30 px-3 py-2">
                            <Pill className="h-3.5 w-3.5 shrink-0 text-primary" />
                            <div className="min-w-0">
                              <p className="text-xs font-bold truncate">{m.name}</p>
                              <p className="text-[10px] text-muted-foreground truncate">
                                {m.dosage} · {m.instructions}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
