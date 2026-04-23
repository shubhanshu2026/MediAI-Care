import { Navigate, Outlet } from 'react-router-dom';

interface ProtectedRouteProps {
  allowedRole?: 'doctor' | 'patient';
}

/**
 * FIX: Role comparison was case-sensitive.
 *
 * The JWT server returns role as "DOCTOR" or "PATIENT" (uppercase).
 * The route config passes allowedRole as 'doctor' or 'patient' (lowercase).
 * Previous code: userRole !== allowedRole  →  "doctor" !== "DOCTOR"  →  ALWAYS redirected.
 *
 * Fix: normalise both sides to lowercase before comparing.
 */
const ProtectedRoute = ({ allowedRole }: ProtectedRouteProps) => {
  const token      = localStorage.getItem('mediai_token');
  const userString = localStorage.getItem('mediai_user');

  let user = null;
  try {
    user = userString ? JSON.parse(userString) : null;
  } catch {
    console.error('Auth Error: Could not parse stored user data.');
  }

  // 1. Not logged in → send to login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // 2. Role check (case-insensitive) → redirect if wrong role
  if (allowedRole) {
    const userRole = user?.role?.toLowerCase();           // "doctor" | "patient"
    const required = allowedRole.toLowerCase();           // always lowercase from props

    if (userRole !== required) {
      // Give the user a useful redirect instead of a blank 403
      const fallback = userRole === 'doctor' ? '/doctor/dashboard' : '/patient-dashboard';
      return <Navigate to={fallback} replace />;
    }
  }

  // 3. All checks passed
  return <Outlet />;
};

export default ProtectedRoute;
