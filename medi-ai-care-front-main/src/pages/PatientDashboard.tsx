import { useState, useEffect } from 'react';
import { AppointmentCard } from '@/components/AppointmentCard';
import { Brain, Calendar, Upload, FileText, User, Activity, Loader2, ArrowRight, TrendingUp, LogOut } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, AreaChart, Area } from 'recharts';
// FIX 1: Removed raw `axios` import — was calling the API without an auth token,
//         which caused the 403 "Database connection failed" error on the patient side.
//         The doctor dashboard never had this bug because it used apiClient (axiosConfig)
//         which automatically attaches the Bearer token via the request interceptor.
//         Now using the shared apiClient through appointmentApi, same as the doctor side.
import { getPatientAppointments, Appointment } from '@/api/appointmentApi';

const quickActions = [
  { label: 'AI Diagnosis', icon: Brain, path: '/diagnosis', color: 'bg-primary/10 text-primary' },
  { label: 'Book Visit', icon: Calendar, path: '/book-appointment', color: 'bg-emerald-500/10 text-emerald-600' },
  { label: 'Reports', icon: Upload, path: '/reports', color: 'bg-amber-500/10 text-amber-600' },
  { label: 'Prescriptions', icon: FileText, path: '/prescriptions', color: 'bg-blue-500/10 text-blue-600' },
];

const healthData = [
  { month: 'Oct', score: 65 }, { month: 'Nov', score: 72 }, { month: 'Dec', score: 68 },
  { month: 'Jan', score: 85 }, { month: 'Feb', score: 82 }, { month: 'Mar', score: 90 },
];

export default function PatientDashboard() {
  const navigate = useNavigate();
  const userString = localStorage.getItem('mediai_user');
  const user = userString ? JSON.parse(userString) : null;

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // FIX 2: Replaced raw axios.get() with getPatientAppointments() from appointmentApi.
    //         appointmentApi uses axiosConfig (apiClient) which attaches the JWT token
    //         from localStorage automatically via the request interceptor.
    //         Without the token, Spring Security rejects the request with 403 — which
    //         the frontend was incorrectly showing as "Database connection failed".
    const fetchAppointments = async () => {
      if (!user?.email) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const { data } = await getPatientAppointments(user.email);

        // Sort: closest date first
        const sorted = (Array.isArray(data) ? data : []).sort((a, b) =>
          new Date(a.appointmentDate).getTime() - new Date(b.appointmentDate).getTime()
        );
        setAppointments(sorted);
      } catch (err: any) {
        console.error('Appointments fetch error:', err);
        // FIX 3: Show accurate error messages instead of always saying "Database connection failed".
        //         401 = token expired (redirect to login), 403 = auth problem, 5xx = server/DB issue.
        if (err.response?.status === 401) {
          toast.error('Session expired. Please log in again.');
          navigate('/login');
        } else if (err.response?.status === 403) {
          toast.error('Access denied. Please log in again.');
          navigate('/login');
        } else if (err.response?.status >= 500) {
          toast.error('Server error. Please try again later.');
        } else if (!err.response) {
          toast.error('Cannot reach the server. Is the backend running?');
        } else {
          toast.error('Failed to load appointments.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [user?.email]);

  const handleLogout = () => {
    localStorage.removeItem('mediai_user');
    localStorage.removeItem('mediai_token');
    toast.success('Logged out safely');
    navigate('/login');
  };

  const today = new Date().toISOString().split('T')[0];
  const upcoming = appointments.filter((a) => a.appointmentDate >= today);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      
      {/* Welcome Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-primary to-primary/80 p-8 text-primary-foreground shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md">
              <User className="h-8 w-8 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold md:text-3xl">
                  Hello, {user?.fullName || user?.username || 'Patient'}
                </h1>
                <button onClick={handleLogout} className="p-1 hover:bg-white/20 rounded-full transition-colors" title="Logout">
                  <LogOut className="h-4 w-4 opacity-70" />
                </button>
              </div>
              <p className="text-white/80 mt-1">Profile: {user?.email}</p>
            </div>
          </div>
          
          <div className="flex gap-4">
            <div className="rounded-xl bg-white/10 p-4 backdrop-blur-sm min-w-[100px] text-center border border-white/10">
              <p className="text-2xl font-bold">{upcoming.length}</p>
              <p className="text-[10px] uppercase tracking-wider opacity-70">Upcoming</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Health Trend Chart */}
        <div className="lg:col-span-2 rounded-2xl border bg-card p-6 shadow-sm">
          <h3 className="text-lg font-bold flex items-center gap-2 mb-6">
            <TrendingUp className="h-5 w-5 text-primary" /> Wellness Index Trend
          </h3>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={healthData}>
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} />
                <YAxis hide domain={[0, 100]} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="score" 
                  stroke="hsl(var(--primary))" 
                  fillOpacity={1} 
                  fill="url(#colorScore)" 
                  strokeWidth={3} 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="lg:col-span-1 flex flex-col gap-4">
          <h3 className="font-bold text-sm uppercase tracking-widest text-muted-foreground">Quick Actions</h3>
          <div className="grid grid-cols-1 gap-3">
            {quickActions.map((action) => (
              <Link key={action.path} to={action.path}>
                <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 hover:border-primary hover:shadow-md transition-all">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${action.color}`}>
                    <action.icon className="h-5 w-5" />
                  </div>
                  <span className="text-sm font-semibold">{action.label}</span>
                  <ArrowRight className="h-4 w-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Appointment List Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" /> Upcoming Visits
          </h2>
          <Link to="/book-appointment" className="text-xs font-bold text-primary hover:underline">New Booking</Link>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 border border-dashed rounded-2xl bg-muted/5">
            <Loader2 className="animate-spin h-8 w-8 text-primary/30 mb-2" />
            <p className="text-xs text-muted-foreground">Loading appointments...</p>
          </div>
        ) : (
          <div className="space-y-3">
            {upcoming.length === 0 ? (
              <div className="text-center py-12 border border-dashed rounded-2xl bg-muted/10">
                <p className="text-sm text-muted-foreground">No upcoming appointments for {user?.email}.</p>
                <Link to="/book-appointment">
                  <Button variant="outline" size="sm" className="mt-4">Book Now</Button>
                </Link>
              </div>
            ) : (
              upcoming.map((a) => (
                <AppointmentCard
                  key={a.id}
                  id={a.id.toString()}
                  doctor={a.doctorName}
                  specialization={a.doctorSpecialization ?? 'Medical Specialist'}
                  date={a.appointmentDate}
                  time={a.timeSlot}
                  status={
                    a.status?.toUpperCase() === 'COMPLETED' ? 'completed'
                    : a.status?.toUpperCase() === 'REJECTED'  ? 'cancelled'
                    : 'upcoming'
                  }
                />
              ))
            )}
          </div>
        )}
      </section>
    </div>
  );
}
