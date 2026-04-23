import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { 
  Brain, 
  Loader2, 
  AlertCircle, 
  Activity, 
  Info, 
  CheckCircle2, 
  ChevronRight, 
  Utensils, 
  Pill, 
  Dumbbell, 
  BookOpen,
  Plus
} from 'lucide-react';
import { diagnoseSymptoms, DiagnosisResult } from '@/api/aiApi';
import { DiagnosisResultCard } from '@/components/DiagnosisResultCard';
import { toast } from 'sonner';

// 1. Common symptoms from your Training.csv for the Quick Select feature
const commonSymptoms = [
  "Fever", "Cough", "Fatigue", "Headache", "Chest Pain", 
  "Shortness of Breath", "Nausea", "Vomiting", "Diarrhea", 
  "Itching", "Skin Rash", "Joint Pain", "Abdominal Pain"
];

export default function AIDiagnosisPage() {
  const [symptoms, setSymptoms] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<DiagnosisResult[] | null>(null);
  const [error, setError] = useState('');

  // 2. Helper to add symptoms from chips
  const addSymptom = (symptom: string) => {
    if (!symptoms.toLowerCase().includes(symptom.toLowerCase())) {
      setSymptoms(prev => prev ? `${prev}, ${symptom}` : symptom);
    }
  };

  const mapSeverity = (sev: string): "low" | "medium" | "high" => {
    const s = sev?.toLowerCase();
    if (s === 'high' || s === 'emergency' || s === 'critical') return 'high';
    if (s === 'medium' || s === 'moderate' || s === 'average') return 'medium';
    return 'low';
  };

  const handleAnalyze = async () => {
    if (!symptoms.trim() || symptoms.length < 5) {
      toast.error("Please describe your symptoms more clearly.");
      return;
    }

    setLoading(true);
    setError('');
    setResults(null);

    try {
      const { data } = await diagnoseSymptoms(symptoms);
      
      if (data.error) {
        setError(data.error);
        return;
      }

      const resultArray = Array.isArray(data) ? data : [data];
      setResults(resultArray);
      toast.success("AI Analysis Complete");
    } catch (err: any) {
      const msg = err.response?.data?.error || 'AI service could not recognize these symptoms.';
      setError(msg);
      toast.error("Analysis Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-8 p-4 animate-in fade-in duration-700">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b pb-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl flex items-center gap-3">
            <Brain className="h-10 w-10 text-primary" /> Medi-AI Health Portal
          </h1>
          <p className="text-muted-foreground text-lg">
            Advanced diagnostic insights, recovery plans, and lifestyle roadmaps.
          </p>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-12">
        {/* LEFT COLUMN: Input & Chips */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-2xl border bg-card p-6 shadow-sm sticky top-6">
            
            {/* SYMPTOM CHIPS SECTION */}
            <div className="space-y-3 mb-6">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <Plus className="h-3 w-3" /> Quick Select Symptoms
              </label>
              <div className="flex flex-wrap gap-2">
                {commonSymptoms.map((s) => (
                  <button
                    key={s}
                    onClick={() => addSymptom(s)}
                    className="px-3 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-[11px] font-medium text-primary hover:bg-primary hover:text-white transition-all active:scale-95"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <label className="flex items-center gap-2 mb-4 font-bold text-xs uppercase tracking-widest text-primary">
              <Activity className="h-4 w-4" /> Symptom Description
            </label>
            
            <Textarea
              className="min-h-[220px] text-base border-muted focus-visible:ring-primary resize-none leading-relaxed"
              placeholder="Type or click symptoms above..."
              value={symptoms}
              onChange={e => setSymptoms(e.target.value)}
            />

            <Button
              className="mt-6 w-full h-14 bg-primary hover:bg-primary/90 font-bold text-lg rounded-xl shadow-lg transition-all active:scale-[0.98]"
              onClick={handleAnalyze}
              disabled={loading}
            >
              {loading ? (
                <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Processing AI Datasets...</>
              ) : (
                "Run Analysis"
              )}
            </Button>
          </div>
        </div>

        {/* RIGHT COLUMN: Results Section */}
        <div className={`lg:col-span-7 space-y-6 transition-all duration-1000 ${
            results?.[0]?.severity?.toLowerCase() === 'high' ? 'shadow-[0_0_50px_rgba(239,68,68,0.1)] rounded-3xl' : ''
          }`}>
          
          {error && (
            <div className="rounded-2xl bg-destructive/5 border border-destructive/20 p-8 text-center animate-in zoom-in-95">
              <AlertCircle className="h-10 w-10 text-destructive mx-auto mb-4" />
              <h3 className="font-bold text-destructive mb-1">Analysis Inconclusive</h3>
              <p className="text-sm text-destructive/80 max-w-xs mx-auto">{error}</p>
            </div>
          )}

          {!results && !loading && !error && (
            <div className="flex h-[500px] flex-col items-center justify-center text-center border-2 border-dashed rounded-3xl bg-muted/5 opacity-40">
              <Brain className="h-16 w-16 mb-4 text-muted-foreground" />
              <p className="text-xl font-semibold">System Ready</p>
              <p className="text-sm max-w-[250px]">Describe your symptoms or use the Quick Select buttons to begin.</p>
            </div>
          )}

          {loading && (
            <div className="flex h-[500px] flex-col items-center justify-center space-y-4">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="text-sm animate-pulse">Consulting clinical patterns...</p>
            </div>
          )}

          {results && results.map((r, i) => (
            <div key={i} className="space-y-6 animate-in slide-in-from-right-8 duration-700">
              
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <h2 className="text-sm font-bold uppercase tracking-tighter text-muted-foreground">Match Found</h2>
              </div>
              
              <DiagnosisResultCard
                disease={r.possibleDisease}
                specialist={r.recommendedSpecialist}
                severity={mapSeverity(r.severity)}
                description={r.description}
              />

              {/* Recovery Plan (Precautions & Insights) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-6 bg-card border rounded-2xl shadow-sm">
                  <h3 className="font-bold text-sm flex items-center gap-2 mb-4 text-primary">
                    <BookOpen className="h-4 w-4" /> Medical Insights
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {r.description || "Specific insights for this condition are currently being processed."}
                  </p>
                </div>

                <div className="p-6 bg-blue-50/40 border border-blue-100 rounded-2xl">
                  <h3 className="font-bold text-sm text-blue-900 flex items-center gap-2 mb-4">
                    <Info className="h-4 w-4" /> Recommended Steps
                  </h3>
                  <ul className="space-y-2.5">
                    {Array.isArray(r.precautions) ? (
                      r.precautions.map((p, idx) => (
                        <li key={idx} className="text-[11px] text-blue-700 flex items-start gap-2 capitalize font-medium">
                          <CheckCircle2 className="h-3.5 w-3.5 mt-0.5 text-blue-400" /> {p}
                        </li>
                      ))
                    ) : (
                      <li className="text-xs text-blue-400 italic">Consult a doctor for precautions.</li>
                    )}
                  </ul>
                </div>
              </div>

              {/* Lifestyle Dashboard */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-5 bg-emerald-50/50 border border-emerald-100 rounded-2xl">
                  <div className="flex items-center gap-2 mb-3">
                    <Utensils className="h-4 w-4 text-emerald-600" />
                    <h4 className="text-[10px] font-black uppercase text-emerald-800">Diet Plan</h4>
                  </div>
                  <p className="text-[11px] text-emerald-700 font-medium leading-relaxed">{r.diet || "Maintain normal nutrition."}</p>
                </div>

                <div className="p-5 bg-indigo-50/50 border border-indigo-100 rounded-2xl">
                  <div className="flex items-center gap-2 mb-3">
                    <Pill className="h-4 w-4 text-indigo-600" />
                    <h4 className="text-[10px] font-black uppercase text-indigo-800">Medications</h4>
                  </div>
                  <p className="text-[11px] text-indigo-700 font-medium leading-relaxed">{r.medications || "Prescription required."}</p>
                </div>

                <div className="p-5 bg-orange-50/50 border border-orange-100 rounded-2xl">
                  <div className="flex items-center gap-2 mb-3">
                    <Dumbbell className="h-4 w-4 text-orange-600" />
                    <h4 className="text-[10px] font-black uppercase text-orange-800">Workout/Rest</h4>
                  </div>
                  <p className="text-[11px] text-orange-700 font-medium leading-relaxed">{r.workout || "Rest as needed."}</p>
                </div>
              </div>

              <div className="p-4 bg-amber-50/30 border border-amber-100 rounded-xl">
                <p className="text-[10px] text-amber-800 font-medium leading-snug">
                  <strong>Disclaimer:</strong> This tool is AI-driven and for informational purposes only. It is not a clinical diagnosis. Please consult a professional physician.
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}