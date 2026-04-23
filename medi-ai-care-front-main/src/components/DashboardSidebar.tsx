import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Brain, Search, Calendar, FileText,
  Upload, User, Stethoscope, Clock, PlusCircle, LogOut, Mic,
  MessageCircle // ✅ ADDED
} from 'lucide-react';

interface DashboardSidebarProps {
  role?: 'doctor' | 'patient';
}

const patientLinks = [
  { label: 'Dashboard',       path: '/patient-dashboard', icon: LayoutDashboard },
  { label: 'AI Diagnosis',    path: '/diagnosis',         icon: Brain           },
  { label: 'Voice Diagnosis', path: '/voice-predict',     icon: Mic             },
  { label: 'Find Doctors',    path: '/doctors',           icon: Search          },
  { label: 'Appointments',    path: '/book-appointment',  icon: Calendar        },
  { label: 'Prescriptions',   path: '/prescriptions',     icon: FileText        },
  { label: 'Medical Reports', path: '/reports',           icon: Upload          },

  // ✅ NEW CHAT LINK (PATIENT)
  { label: 'Chat', path: '/chat', icon: MessageCircle },
];

const doctorLinks = [
  { label: 'Dashboard',            path: '/doctor/dashboard',            icon: LayoutDashboard },
  { label: 'Appointments',         path: '/doctor/appointments',         icon: Calendar        },
  { label: 'Manage Slots',         path: '/doctor/slots',                icon: Clock           },
  { label: 'Prescriptions',        path: '/doctor/prescriptions',        icon: FileText        },
  { label: 'Create Prescription',  path: '/doctor/create-prescription',  icon: PlusCircle      },

  // ✅ NEW CHAT LINK (DOCTOR)
  { label: 'Chat', path: '/chat', icon: MessageCircle },
];

export function DashboardSidebar({ role: propRole }: DashboardSidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();

  const userString = localStorage.getItem('mediai_user');
  const user = userString ? JSON.parse(userString) : null;

  const role = propRole || user?.role?.toLowerCase() || 'patient';
  const links = role === 'doctor' ? doctorLinks : patientLinks;

  const handleLogout = () => {
    localStorage.removeItem('mediai_token');
    localStorage.removeItem('mediai_user');
    navigate('/login');
  };

  return (
    <aside className="hidden w-64 shrink-0 border-r border-border bg-card lg:block h-screen sticky top-0 shadow-sm">
      <div className="flex h-full flex-col">

        {/* Profile Header */}
        <div className="flex items-center gap-3 border-b border-border px-6 py-6 bg-muted/10">
          <div className="bg-primary/10 p-2.5 rounded-xl border border-primary/20 shadow-inner">
            {role === 'patient' ? (
              <User className="h-5 w-5 text-primary" />
            ) : (
              <Stethoscope className="h-5 w-5 text-primary" />
            )}
          </div>
          <div className="flex flex-col overflow-hidden">
            <span className="text-sm font-bold text-foreground truncate">
              {user?.fullName || user?.username || 'User'}
            </span>
            <div className="flex items-center gap-1.5">
              <div className={`h-1.5 w-1.5 rounded-full ${role === 'doctor' ? 'bg-blue-500' : 'bg-emerald-500'}`} />
              <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                {role} Portal
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 space-y-1.5 px-3 py-6 overflow-y-auto">
          {links.map((link) => {
            const active = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200 ${
                  active
                    ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-[1.02]'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <link.icon className={`h-4 w-4 ${active ? 'text-white' : 'text-primary/70'}`} />
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Logout Section */}
        <div className="p-4 border-t border-border">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-red-500 hover:bg-red-50 hover:text-red-600 transition-all border border-transparent hover:border-red-100"
          >
            <LogOut className="h-4 w-4" />
            Logout Session
          </button>
        </div>

      </div>
    </aside>
  );
}