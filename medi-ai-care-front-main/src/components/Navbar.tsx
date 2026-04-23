import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Menu, X, Heart, LogOut, LayoutDashboard, Stethoscope } from 'lucide-react';

// 'Home' and 'AI Diagnosis' are public. 'Find Doctors' is now removed from here 
// and moved inside the auth check below.
const publicLinks = [
  { label: 'Home', path: '/' },
  { label: 'AI Diagnosis', path: '/diagnosis' },
];

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // 1. Get auth state from localStorage
  const token = localStorage.getItem('mediai_token');
  const userString = localStorage.getItem('mediai_user');
  const user = userString ? JSON.parse(userString) : null;

  // 2. Handle Logout
  const handleLogout = () => {
    localStorage.removeItem('mediai_token');
    localStorage.removeItem('mediai_user');
    setMobileOpen(false);
    navigate('/login');
  };

  // Determine dashboard path based on role
  // FIX: role is stored lowercase ('doctor'/'patient') from LoginPage — was checking uppercase 'DOCTOR'
  //      Also fixed: doctor dashboard path is '/doctor/dashboard', not '/doctor-dashboard'
  const dashboardPath = user?.role?.toLowerCase() === 'doctor' ? '/doctor/dashboard' : '/patient-dashboard';

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-xl">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-primary text-white">
            <Heart className="h-5 w-5" />
          </div>
          <span className="text-xl font-bold text-foreground">
            Medi<span className="text-primary">AI</span> Care
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-1 md:flex">
          {/* Public Links: Always Visible */}
          {publicLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                location.pathname === link.path
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              {link.label}
            </Link>
          ))}

          {/* Protected Links: Only visible if token exists */}
          {token && (
            <>
              <Link
                to="/doctors"
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  location.pathname === '/doctors'
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                Find Doctors
              </Link>
              <Link
                to={dashboardPath}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  location.pathname === dashboardPath
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                Dashboard
              </Link>
            </>
          )}
        </div>

        {/* Desktop Auth Buttons */}
        <div className="hidden items-center gap-3 md:flex">
          {token ? (
            <div className="flex items-center gap-4">
              <div className="flex flex-col items-end border-r pr-4">
                <span className="text-xs font-bold text-foreground">{user?.fullName || 'User'}</span>
                <span className="text-[10px] font-medium uppercase text-primary">{user?.role}</span>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleLogout}
                className="gap-2 text-red-500 hover:text-red-600 hover:bg-red-50 border-red-100"
              >
                <LogOut className="h-4 w-4" />
                Log Out
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login">
                <Button variant="ghost" size="sm">Log In</Button>
              </Link>
              <Link to="/register">
                <Button size="sm" className="bg-primary text-white hover:opacity-90">
                  Sign Up
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile toggle */}
        <button className="md:hidden p-2" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-border bg-card px-4 py-4 md:hidden animate-in slide-in-from-top-2">
          {/* Public Links */}
          {publicLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setMobileOpen(false)}
              className={`block rounded-lg px-4 py-3 text-sm font-medium ${
                location.pathname === link.path ? 'bg-primary/10 text-primary' : 'text-muted-foreground'
              }`}
            >
              {link.label}
            </Link>
          ))}
          
          {/* Protected Links */}
          {token && (
            <>
              <Link
                to="/doctors"
                onClick={() => setMobileOpen(false)}
                className={`block rounded-lg px-4 py-3 text-sm font-medium ${
                  location.pathname === '/doctors' ? 'bg-primary/10 text-primary' : 'text-muted-foreground'
                }`}
              >
                Find Doctors
              </Link>
              <Link
                to={dashboardPath}
                onClick={() => setMobileOpen(false)}
                className={`block rounded-lg px-4 py-3 text-sm font-medium ${
                  location.pathname === dashboardPath ? 'bg-primary/10 text-primary' : 'text-muted-foreground'
                }`}
              >
                Dashboard
              </Link>
            </>
          )}

          <div className="mt-4 pt-4 border-t border-border">
            {token ? (
              <div className="space-y-4">
                <div className="px-4">
                  <p className="text-sm font-bold">{user?.fullName}</p>
                  <p className="text-xs text-muted-foreground uppercase">{user?.role}</p>
                </div>
                <Button 
                  variant="destructive" 
                  className="w-full gap-2" 
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4" />
                  Log Out
                </Button>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <Link to="/login" className="w-full">
                  <Button variant="outline" className="w-full" size="sm">Log In</Button>
                </Link>
                <Link to="/register" className="w-full">
                  <Button className="w-full bg-primary text-white" size="sm">Sign Up</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}