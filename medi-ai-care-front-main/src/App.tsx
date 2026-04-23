import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";

// Components
import ProtectedRoute from './components/ProtectedRoute';
import { DashboardLayout } from './components/DashboardLayout';

// Public Pages
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import NotFound from "./pages/NotFound";
import AIDiagnosisPage from "./pages/AIDiagnosisPage";

// Patient Pages
import PatientDashboard from "./pages/PatientDashboard";
import DoctorSearchPage from "./pages/DoctorSearchPage";
import BookAppointmentPage from "./pages/BookAppointmentPage";
import PrescriptionsPage from "./pages/PrescriptionsPage";
import MedicalReportsPage from "./pages/MedicalReportsPage";
import VoiceSymptomPage from './pages/VoiceSymptomPage';

// Doctor Pages
import DoctorDashboard from "./pages/DoctorDashboard";
import DoctorAppointmentsPage from './pages/DoctorAppointmentsPage';
import CreatePrescriptionPage from "./pages/CreatePrescriptionPage";

// Shared
import ChatPage from '@/pages/ChatPage';

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />

        <BrowserRouter>
          <Routes>

            {/* ───────── PUBLIC ───────── */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/diagnosis" element={<AIDiagnosisPage />} />

            {/* ───────── DOCTOR ───────── */}
            <Route element={<ProtectedRoute allowedRole="doctor" />}>
              <Route element={<DashboardLayout role="doctor" />}>

                <Route path="/doctor/dashboard"           element={<DoctorDashboard />} />
                <Route path="/doctor/appointments"        element={<DoctorAppointmentsPage />} />
                <Route path="/doctor/create-prescription" element={<CreatePrescriptionPage />} />

                {/*
                  FIX: These sidebar links existed but had no routes — caused
                  blank pages or 404. Redirecting to closest working page until
                  dedicated pages are built.
                */}
                <Route path="/doctor/prescriptions" element={<Navigate to="/doctor/create-prescription" replace />} />
                <Route path="/doctor/slots"         element={<Navigate to="/doctor/dashboard" replace />} />
                <Route path="/doctor/profile"       element={<Navigate to="/doctor/dashboard" replace />} />

                {/* Default doctor redirect */}
                <Route path="/doctor" element={<Navigate to="/doctor/dashboard" replace />} />

              </Route>
            </Route>

            {/* ───────── PATIENT ───────── */}
            <Route element={<ProtectedRoute allowedRole="patient" />}>
              <Route element={<DashboardLayout role="patient" />}>

                <Route path="/patient-dashboard" element={<PatientDashboard />} />
                <Route path="/doctors"           element={<DoctorSearchPage />} />
                <Route path="/book-appointment"  element={<BookAppointmentPage />} />
                <Route path="/prescriptions"     element={<PrescriptionsPage />} />
                <Route path="/reports"           element={<MedicalReportsPage />} />
                <Route path="/voice-predict"     element={<VoiceSymptomPage />} />

                {/* Default patient redirect */}
                <Route path="/dashboard" element={<Navigate to="/patient-dashboard" replace />} />

              </Route>
            </Route>

            {/* ───────── SHARED (CHAT) ───────── */}
            {/*
              Chat is accessible to both doctors and patients.
              No allowedRole = authenticated user of any role can access.
            */}
            <Route element={<ProtectedRoute />}>
              <Route element={<DashboardLayout />}>
                <Route path="/chat" element={<ChatPage />} />
              </Route>
            </Route>

            {/* ───────── ERROR ───────── */}
            <Route path="/unauthorized" element={
              <div className="flex min-h-screen items-center justify-center flex-col gap-4">
                <h1 className="text-4xl font-bold">403</h1>
                <p className="text-muted-foreground">You don't have permission to view this page.</p>
                <a href="/login" className="text-primary underline text-sm">Go to Login</a>
              </div>
            } />
            <Route path="*" element={<NotFound />} />

          </Routes>
        </BrowserRouter>

      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
