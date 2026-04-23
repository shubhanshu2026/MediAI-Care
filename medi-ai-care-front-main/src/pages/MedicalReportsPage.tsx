import { useState, useEffect } from 'react';
import { FileText, Trash2, Loader2, Plus, Brain, Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import apiClient from '@/api/axiosConfig'; // ✅ FIX: use apiClient (sends JWT token) instead of raw axios

interface Report {
  id: number;
  fileName: string;
  aiObservation: string;
  uploadDate: string;
}

export default function MedicalReportsPage() {
  const userString = localStorage.getItem('mediai_user');
  const user = userString ? JSON.parse(userString) : null;

  const [reports, setReports] = useState<Report[]>([]);
  const [search, setSearch] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<{ text: string; status: 'normal' | 'warning' } | null>(null);
  const [activeReportId, setActiveReportId] = useState<number | null>(null);

  const fetchReports = async () => {
    if (!user?.email) return;
    setLoading(true);
    try {
      // ✅ FIX: apiClient automatically attaches the Bearer JWT token from localStorage
      const response = await apiClient.get(`/api/reports/patient/${user.email}`);
      setReports(response.data);
    } catch (err) {
      toast.error('Could not sync with Medical Vault. Please login again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReports(); }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user?.email) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('email', user.email);

    setIsUploading(true);
    try {
      // ✅ FIX: apiClient with multipart override — still sends JWT token
      await apiClient.post('/api/reports/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Document secured in Medical Vault');
      fetchReports();
    } catch (err) {
      console.error(err);
      toast.error('Upload failed. Check backend console.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteReport = async (id: number) => {
    try {
      await apiClient.delete(`/api/reports/${id}`);
      toast.success('Report removed from vault.');
      setReports((prev) => prev.filter((r) => r.id !== id));
      if (activeReportId === id) {
        setActiveReportId(null);
        setAnalysisResult(null);
      }
    } catch {
      toast.error('Failed to delete report.');
    }
  };

  const handleAIAnalyze = (report: Report) => {
    setIsAnalyzing(true);
    setActiveReportId(report.id);
    setAnalysisResult(null);

    setTimeout(() => {
      setIsAnalyzing(false);
      const isWarning = report.aiObservation.includes('⚠️') || report.aiObservation.includes('High');
      setAnalysisResult({
        text: report.aiObservation,
        status: isWarning ? 'warning' : 'normal',
      });
      toast.info('AI Insights Loaded');
    }, 1500);
  };

  const filteredReports = reports.filter((r) =>
    r.fileName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-10">
      {/* Header */}
      <div className="relative overflow-hidden rounded-[32px] bg-primary px-8 py-12 text-primary-foreground shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black">Health Vault</h1>
            <p className="mt-2 opacity-90 font-medium">Secured medical data &amp; AI interpretation.</p>
          </div>
          <div className="flex items-center gap-4">
            <input type="file" id="file-upload" className="hidden" onChange={handleFileUpload} />
            <label htmlFor="file-upload">
              <Button asChild size="lg" className="bg-white text-primary hover:bg-slate-50 font-bold cursor-pointer h-14 px-8">
                <span>
                  {isUploading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Plus className="mr-2 h-5 w-5" />}
                  Upload Report
                </span>
              </Button>
            </label>
          </div>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-12">
        <div className="lg:col-span-7 space-y-6">
          <Input
            placeholder="Search your vault..."
            className="h-12 rounded-2xl bg-white"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="space-y-3">
            {loading ? (
              <Loader2 className="h-10 w-10 animate-spin mx-auto opacity-10" />
            ) : filteredReports.length === 0 ? (
              <p className="text-center text-slate-400 py-12 font-medium">No reports found in your vault.</p>
            ) : (
              filteredReports.map((report) => (
                <div
                  key={report.id}
                  className={`p-4 rounded-2xl border flex items-center justify-between transition-all ${
                    activeReportId === report.id ? 'border-primary bg-primary/5' : 'bg-white'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm">{report.fileName}</h3>
                      <p className="text-[10px] text-slate-400 font-bold">
                        DATE: {new Date(report.uploadDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant={activeReportId === report.id ? 'default' : 'outline'}
                      className="rounded-xl font-bold text-[10px] uppercase"
                      onClick={() => handleAIAnalyze(report)}
                    >
                      <Brain className="h-3.5 w-3.5 mr-2" /> Analyze
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-xl text-slate-400 hover:text-red-500"
                      onClick={() => handleDeleteReport(report.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Panel */}
        <div className="lg:col-span-5">
          <div className="sticky top-24 rounded-[32px] border bg-slate-50/50 p-8 min-h-[480px]">
            <h2 className="font-black text-primary text-sm tracking-widest flex items-center gap-2">
              <Sparkles className="h-4 w-4" /> AI INTERPRETATION
            </h2>

            {isAnalyzing ? (
              <div className="py-24 text-center">
                <Loader2 className="mx-auto h-10 w-10 animate-spin text-primary/40" />
              </div>
            ) : analysisResult ? (
              <div className="mt-8 space-y-6 animate-in slide-in-from-bottom-4">
                <div className="bg-white rounded-2xl p-6 shadow-sm border font-medium text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                  {analysisResult.text}
                </div>
                <div
                  className={`flex items-center gap-3 p-4 rounded-2xl border ${
                    analysisResult.status === 'warning'
                      ? 'bg-amber-50 text-amber-700 border-amber-100'
                      : 'bg-emerald-50 text-emerald-700 border-emerald-100'
                  }`}
                >
                  {analysisResult.status === 'warning' ? (
                    <AlertCircle className="h-5 w-5" />
                  ) : (
                    <CheckCircle2 className="h-5 w-5" />
                  )}
                  <p className="text-[10px] font-black uppercase">
                    {analysisResult.status === 'warning' ? 'Attention Required' : 'Normal Baseline'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="py-24 text-center opacity-20">
                <Brain className="h-12 w-12 mx-auto" />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
