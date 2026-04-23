import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { PlusCircle, Trash2, CheckCircle, Loader2, FileText, Pill, UserSearch, Upload } from 'lucide-react';
import { createPrescription, uploadPrescription, Medicine } from '@/api/prescriptionApi';
import { getDoctorAppointments, Appointment } from '@/api/appointmentApi';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

type Mode = 'text' | 'file';

export default function CreatePrescriptionPage() {
  const { user } = useAuth();

  // ── Form state ─────────────────────────────────────────────────────────
  const [mode, setMode]           = useState<Mode>('text');
  const [patientId, setPatientId] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [medicines, setMedicines] = useState<Medicine[]>([{ name: '', dosage: '', instructions: '' }]);
  const [file, setFile]           = useState<File | null>(null);
  const [saving, setSaving]       = useState(false);

  // ── Load approved appointments so doctor can pick patient from list ────
  const [appointments, setAppointments]   = useState<Appointment[]>([]);
  const [loadingAppts, setLoadingAppts]   = useState(true);

  useEffect(() => {
    // FIX: Use doctorId (doctors.id) not id (users.id) — same as DoctorDashboard fix
    const effectiveDoctorId = user?.doctorId || user?.id;
    if (!effectiveDoctorId) return;
    getDoctorAppointments(effectiveDoctorId)
      .then(({ data }) => {
        const approved = (Array.isArray(data) ? data : [])
          .filter(a => a.status?.toUpperCase() === 'APPROVED');
        setAppointments(approved);
      })
      .catch(() => {})
      .finally(() => setLoadingAppts(false));
  }, [user?.id]);

  // ── Medicine list helpers ──────────────────────────────────────────────
  const addMedicine    = () => setMedicines(prev => [...prev, { name: '', dosage: '', instructions: '' }]);
  const removeMedicine = (i: number) => setMedicines(prev => prev.filter((_, idx) => idx !== i));
  const updateMedicine = (i: number, field: keyof Medicine, value: string) =>
    setMedicines(prev => prev.map((m, idx) => idx === i ? { ...m, [field]: value } : m));

  // ── Submit ─────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!patientId.trim() || !user?.id) {
      toast.error('Please provide a Patient ID.');
      return;
    }

    // FIX: Use doctorId (doctors.id) for prescription so it links correctly to appointments
    const effectiveDoctorId = user?.doctorId || user?.id;

    setSaving(true);
    try {
      if (mode === 'file') {
        if (!file) { toast.error('Please select a file to upload.'); return; }
        const fd = new FormData();
        fd.append('doctorId',  String(effectiveDoctorId));
        fd.append('patientId', patientId.trim());
        fd.append('diagnosis', diagnosis);
        fd.append('file', file);
        await uploadPrescription(fd);
      } else {
        if (medicines.some(m => !m.name.trim())) {
          toast.error('Please fill in all medicine names.');
          return;
        }
        await createPrescription({
          doctorId:  effectiveDoctorId,
          patientId: patientId.trim(),
          diagnosis,
          medicines,
        });
      }

      toast.success('Prescription issued successfully!');
      setPatientId('');
      setDiagnosis('');
      setMedicines([{ name: '', dosage: '', instructions: '' }]);
      setFile(null);
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to save prescription.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-8 animate-in fade-in duration-700 pb-12">

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b pb-8">
        <div>
          <p className="text-xs uppercase tracking-widest text-primary font-bold flex items-center gap-1 mb-2">
            <FileText className="h-3 w-3" /> Clinical Documentation
          </p>
          <h1 className="text-3xl font-bold">Issue Digital Prescription</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Generate a structured medication plan for your patient.
          </p>
        </div>
        <div className="hidden md:flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Pill className="h-10 w-10" />
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-12">

        {/* ── Left: Patient Info ──────────────────────────────────────── */}
        <div className="lg:col-span-4 space-y-6">
          <div className="rounded-2xl border bg-card p-6 shadow-sm space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <UserSearch className="h-4 w-4" /> Patient Details
            </h2>

            {/* Quick-pick from approved appointments */}
            {!loadingAppts && appointments.length > 0 && (
              <div className="space-y-2">
                <Label className="text-xs font-bold">Select from Approved Appointments</Label>
                <select
                  className="w-full rounded-md border border-input bg-muted/30 px-3 py-2 text-sm"
                  onChange={e => setPatientId(e.target.value)}
                  defaultValue=""
                >
                  <option value="" disabled>Pick a patient…</option>
                  {appointments.map(a => (
                    // FIX: Use patientId (numeric) as the value so PrescriptionController
                    //      can look up the patient correctly. Show name+email for readability.
                    <option key={a.id} value={String(a.patientId ?? '')}>
                      {a.patientName || a.patientEmail} — {a.appointmentDate} {a.timeSlot}
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-muted-foreground">
                  or type the numeric Patient ID below:
                </p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="patient-id" className="text-xs font-bold">
                Patient ID <span className="text-destructive">*</span>
              </Label>
              <Input
                id="patient-id"
                placeholder="Numeric user ID, e.g. 12"
                value={patientId}
                onChange={e => setPatientId(e.target.value)}
                className="bg-muted/30 border-muted"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="diagnosis" className="text-xs font-bold">Clinical Diagnosis</Label>
              <Textarea
                id="diagnosis"
                placeholder="Describe the primary condition…"
                className="min-h-[90px] bg-muted/30 border-muted resize-none"
                value={diagnosis}
                onChange={e => setDiagnosis(e.target.value)}
              />
            </div>
          </div>

          {/* Mode toggle */}
          <div className="rounded-2xl border bg-card p-5 space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Prescription Format
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setMode('text')}
                className={`rounded-xl py-2.5 text-xs font-bold transition-colors border ${
                  mode === 'text' ? 'bg-primary text-primary-foreground border-primary' : 'border-border hover:border-primary'
                }`}
              >
                📝 Text / Medicines
              </button>
              <button
                onClick={() => setMode('file')}
                className={`rounded-xl py-2.5 text-xs font-bold transition-colors border ${
                  mode === 'file' ? 'bg-primary text-primary-foreground border-primary' : 'border-border hover:border-primary'
                }`}
              >
                📎 File Upload
              </button>
            </div>
          </div>
        </div>

        {/* ── Right: Medications / File ────────────────────────────────── */}
        <div className="lg:col-span-8 space-y-6">

          {mode === 'text' ? (
            <>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <Pill className="h-5 w-5 text-primary" /> Medications
                </h3>
                <Button variant="outline" size="sm" onClick={addMedicine} className="gap-2 border-primary text-primary">
                  <PlusCircle className="h-4 w-4" /> Add
                </Button>
              </div>

              <div className="space-y-4">
                {medicines.map((med, i) => (
                  <div key={i} className="group rounded-2xl border bg-card p-6 shadow-sm hover:border-primary/40 transition-all relative">
                    <div className="flex items-center justify-between mb-4">
                      <span className="bg-muted text-muted-foreground text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                        Item #{i + 1}
                      </span>
                      {medicines.length > 1 && (
                        <Button
                          variant="ghost" size="icon"
                          onClick={() => removeMedicine(i)}
                          className="h-7 w-7 text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label className="text-xs font-bold text-muted-foreground">Medicine Name</Label>
                        <Input placeholder="e.g. Amoxicillin" value={med.name}
                          onChange={e => updateMedicine(i, 'name', e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs font-bold text-muted-foreground">Dosage</Label>
                        <Input placeholder="e.g. 500mg" value={med.dosage}
                          onChange={e => updateMedicine(i, 'dosage', e.target.value)} />
                      </div>
                    </div>
                    <div className="mt-4 space-y-2">
                      <Label className="text-xs font-bold text-muted-foreground">Instructions</Label>
                      <Input placeholder="e.g. Twice daily after meals for 7 days" value={med.instructions}
                        onChange={e => updateMedicine(i, 'instructions', e.target.value)} />
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="rounded-2xl border-2 border-dashed bg-muted/5 p-12 flex flex-col items-center gap-4">
              <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                <Upload className="h-7 w-7" />
              </div>
              <div className="text-center">
                <p className="font-semibold text-sm">Upload Prescription File</p>
                <p className="text-xs text-muted-foreground mt-1">PDF, PNG, JPG — max 10 MB</p>
              </div>
              <input
                type="file"
                accept=".pdf,.png,.jpg,.jpeg"
                className="hidden"
                id="rx-file"
                onChange={e => setFile(e.target.files?.[0] ?? null)}
              />
              <label htmlFor="rx-file">
                <Button variant="outline" size="sm" asChild>
                  <span>Choose File</span>
                </Button>
              </label>
              {file && (
                <p className="text-xs text-emerald-600 font-semibold">✓ {file.name}</p>
              )}
            </div>
          )}

          <Button
            className="w-full h-14 font-bold text-lg shadow-lg transition-transform active:scale-[0.98]"
            onClick={handleSave}
            disabled={saving}
          >
            {saving
              ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Issuing…</>
              : <><CheckCircle className="mr-2 h-5 w-5" /> Issue Digital Prescription</>
            }
          </Button>
        </div>
      </div>
    </div>
  );
}
