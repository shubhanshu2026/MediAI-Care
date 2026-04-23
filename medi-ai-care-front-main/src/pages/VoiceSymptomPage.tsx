import { useState, useRef, useEffect } from 'react';
import {
  Mic, MicOff, Send, RotateCcw, AlertCircle,
  CheckCircle2, Loader2, Activity, Brain, Stethoscope
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { voicePredict, VoicePredictResponse } from '@/api/voicePredictApi';

// ✅ FIX: Define all SpeechRecognition types manually.
// TypeScript's lib.dom.d.ts doesn't include SpeechRecognition as a
// constructable global, so `typeof SpeechRecognition` causes ts(2552).
interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  length: number;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionResultList {
  length: number;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

interface ISpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
}

interface ISpeechRecognitionConstructor {
  new(): ISpeechRecognition;
}

// ✅ FIX: Augment Window with the correct constructor type (not `typeof SpeechRecognition`)
declare global {
  interface Window {
    SpeechRecognition: ISpeechRecognitionConstructor;
    webkitSpeechRecognition: ISpeechRecognitionConstructor;
  }
}

type RecordingState = 'idle' | 'listening' | 'analyzing' | 'done' | 'error';

export default function VoiceSymptomPage() {
  const [recordingState, setRecordingState] = useState<RecordingState>('idle');
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [result, setResult] = useState<VoicePredictResponse | null>(null);
  const [isSupported, setIsSupported] = useState(true);

  // ✅ FIX: Use our custom ISpeechRecognition interface instead of built-in SpeechRecognition
  const recognitionRef = useRef<ISpeechRecognition | null>(null);

  useEffect(() => {
    const SpeechRecognitionAPI: ISpeechRecognitionConstructor | undefined =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognitionAPI) {
      setIsSupported(false);
      return;
    }

    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalText = '';
      let interimText = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const res = event.results[i];
        if (res.isFinal) {
          finalText += res[0].transcript + ' ';
        } else {
          interimText += res[0].transcript;
        }
      }

      if (finalText) {
        setTranscript((prev) => (prev + ' ' + finalText).trim());
      }
      setInterimTranscript(interimText);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('Speech recognition error:', event.error);
      if (event.error === 'not-allowed') {
        toast.error('Microphone access denied. Please allow mic access and try again.');
      } else if (event.error !== 'aborted') {
        toast.error('Speech recognition error. Please try again.');
      }
      setRecordingState('idle');
      setInterimTranscript('');
    };

    recognition.onend = () => {
      setInterimTranscript('');
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.abort();
    };
  }, []);

  const startListening = () => {
    if (!recognitionRef.current) return;
    setRecordingState('listening');
    setResult(null);
    recognitionRef.current.start();
    toast.info('Listening... describe your symptoms');
  };

  const stopListening = () => {
    if (!recognitionRef.current) return;
    recognitionRef.current.stop();
    setInterimTranscript('');
    setRecordingState('idle');
  };

  const handleAnalyze = async () => {
    const textToAnalyze = transcript.trim();
    if (!textToAnalyze) {
      toast.warning('Please speak or type your symptoms first.');
      return;
    }

    setRecordingState('analyzing');
    setResult(null);

    try {
      const response = await voicePredict(textToAnalyze);
      setResult(response.data);
      setRecordingState('done');

      if (response.data.error) {
        toast.warning(response.data.error);
      } else {
        toast.success('Analysis complete!');
      }
    } catch (err) {
      console.error(err);
      toast.error('Could not reach the prediction service. Ensure both Spring Boot and Python Flask are running.');
      setRecordingState('error');
    }
  };

  const handleReset = () => {
    if (recognitionRef.current) recognitionRef.current.abort();
    setTranscript('');
    setInterimTranscript('');
    setResult(null);
    setRecordingState('idle');
  };

  const isListening = recordingState === 'listening';
  const isAnalyzing = recordingState === 'analyzing';
  const displayText = transcript + (interimTranscript ? ' ' + interimTranscript : '');

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-10">
      {/* Header */}
      <div className="relative overflow-hidden rounded-[32px] bg-primary px-8 py-12 text-primary-foreground shadow-2xl">
        <div className="absolute inset-0 opacity-10">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute bottom-0 bg-white rounded-full"
              style={{
                left: `${i * 5 + 1}%`,
                width: '3px',
                height: `${Math.sin(i * 0.8) * 40 + 50}%`,
                opacity: 0.4 + (i % 3) * 0.2,
              }}
            />
          ))}
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-10 w-10 rounded-2xl bg-white/20 flex items-center justify-center">
              <Mic className="h-5 w-5" />
            </div>
            <span className="text-sm font-bold tracking-widest opacity-80 uppercase">AI Voice Diagnosis</span>
          </div>
          <h1 className="text-4xl font-black">Speak Your Symptoms</h1>
          <p className="mt-2 opacity-80 font-medium max-w-lg">
            Press the microphone, describe how you feel, and our AI will analyze your symptoms in real time.
          </p>
        </div>
      </div>

      {/* Browser support warning */}
      {!isSupported && (
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <p className="text-sm font-medium">
            Your browser doesn't support the Web Speech API. Voice input is unavailable — please use Chrome or Edge.
            You can still type your symptoms manually below.
          </p>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Left: Voice Input Panel */}
        <div className="lg:col-span-3 space-y-4">
          <div className="rounded-[24px] border bg-white p-6 space-y-5 shadow-sm">
            <h2 className="font-black text-slate-800 flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" />
              Voice Input
            </h2>

            {/* Big Mic Button */}
            <div className="flex flex-col items-center gap-4 py-6">
              <button
                onClick={isListening ? stopListening : startListening}
                disabled={!isSupported || isAnalyzing}
                className={`
                  relative h-28 w-28 rounded-full flex items-center justify-center
                  transition-all duration-300 shadow-lg focus:outline-none
                  focus:ring-4 focus:ring-primary/30 disabled:opacity-40
                  ${isListening ? 'bg-red-500 hover:bg-red-600 scale-110' : 'bg-primary hover:bg-primary/90'}
                `}
              >
                {isListening && (
                  <>
                    <span className="absolute inset-0 rounded-full bg-red-400 animate-ping opacity-40" />
                    <span className="absolute inset-[-8px] rounded-full border-2 border-red-300 animate-pulse opacity-50" />
                  </>
                )}
                {isListening
                  ? <MicOff className="h-10 w-10 text-white relative z-10" />
                  : <Mic className="h-10 w-10 text-white relative z-10" />
                }
              </button>

              <p className={`text-sm font-bold tracking-wide transition-colors ${isListening ? 'text-red-500 animate-pulse' : 'text-slate-400'}`}>
                {isListening ? '🔴 Listening... tap to stop' : isSupported ? 'Tap to start speaking' : 'Voice unavailable'}
              </p>
            </div>

            {/* Transcript Display */}
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest">
                Transcript / Manual Input
              </label>
              <Textarea
                value={displayText}
                onChange={(e) => setTranscript(e.target.value)}
                placeholder="Your symptoms will appear here as you speak... or type them manually e.g. 'I have fever, headache, and feel dizzy'"
                className="min-h-[140px] rounded-2xl text-sm font-medium resize-none border-slate-200 focus:border-primary"
                disabled={isListening || isAnalyzing}
              />
              {interimTranscript && (
                <p className="text-xs text-slate-400 italic pl-1">Hearing: "{interimTranscript}"</p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                onClick={handleAnalyze}
                disabled={!transcript.trim() || isListening || isAnalyzing}
                className="flex-1 h-12 rounded-2xl font-bold"
              >
                {isAnalyzing
                  ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing symptoms...</>
                  : <><Send className="mr-2 h-4 w-4" /> Analyze Symptoms</>
                }
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={handleReset}
                disabled={isAnalyzing}
                className="h-12 w-12 rounded-2xl"
                title="Reset"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Tips */}
          <div className="rounded-[20px] bg-slate-50 border p-5">
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Tips for better results</p>
            <ul className="space-y-1.5 text-sm text-slate-500 font-medium">
              <li>🗣️ Speak clearly: <em>"I have a headache and high fever"</em></li>
              <li>📋 Mention multiple symptoms separated by "and"</li>
              <li>✏️ You can edit the transcript before analyzing</li>
              <li>🔄 Reset and try again if recognition is off</li>
            </ul>
          </div>
        </div>

        {/* Right: Results Panel */}
        <div className="lg:col-span-2">
          <div className="sticky top-24 rounded-[24px] border bg-slate-50/60 p-6 min-h-[520px] space-y-6">
            <h2 className="font-black text-slate-800 flex items-center gap-2">
              <Brain className="h-4 w-4 text-primary" />
              AI Results
            </h2>

            {recordingState === 'idle' && !result && (
              <div className="flex flex-col items-center justify-center py-16 text-center opacity-30">
                <Stethoscope className="h-14 w-14 mb-3" />
                <p className="text-sm font-bold">Results will appear here</p>
              </div>
            )}

            {isAnalyzing && (
              <div className="flex flex-col items-center justify-center py-16 gap-4">
                <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
                  <Loader2 className="h-7 w-7 text-primary animate-spin" />
                </div>
                <p className="text-sm font-bold text-slate-500 animate-pulse">Analyzing symptoms...</p>
              </div>
            )}

            {recordingState === 'error' && (
              <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
                <AlertCircle className="h-10 w-10 text-red-400" />
                <p className="text-sm font-bold text-red-500">Analysis failed</p>
                <p className="text-xs text-slate-400">
                  Make sure Spring Boot (port 8080) and Python Flask (port 5000) are both running.
                </p>
              </div>
            )}

            {result && recordingState === 'done' && (
              <div className="space-y-5 animate-in slide-in-from-bottom-4">
                {result.symptoms && result.symptoms.length > 0 && (
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                      Detected Symptoms ({result.symptoms.length})
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {result.symptoms.map((s) => (
                        <span
                          key={s}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-[11px] font-bold"
                        >
                          <CheckCircle2 className="h-3 w-3" />
                          {s.replace(/_/g, ' ')}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {result.error && (
                  <div className="flex items-start gap-3 p-4 rounded-2xl bg-amber-50 border border-amber-100 text-amber-800">
                    <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                    <p className="text-xs font-medium">{result.error}</p>
                  </div>
                )}

                {result.predictions && result.predictions.length > 0 && (
                  <div className="space-y-3">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      Disease Predictions
                    </p>
                    {result.predictions.map((pred, idx) => (
                      <div key={idx} className="bg-white rounded-2xl border p-4 shadow-sm space-y-3">
                        <div className="flex items-center justify-between">
                          <h3 className="font-black text-slate-800">{pred.disease}</h3>
                          <span className="text-xs font-black text-primary bg-primary/10 px-2.5 py-1 rounded-full">
                            {pred.confidence}
                          </span>
                        </div>
                        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full transition-all duration-700"
                            style={{ width: pred.confidence }}
                          />
                        </div>
                        <p className="text-[11px] text-slate-500 font-medium">{pred.reason}</p>
                      </div>
                    ))}
                    <p className="text-[10px] text-slate-400 font-medium pt-1 text-center">
                      ⚕️ This is AI-assisted analysis. Always consult a qualified doctor.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
