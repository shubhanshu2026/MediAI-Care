import { createContext, useContext, useState, ReactNode } from 'react';

interface User {
  id: string;
  doctorId?: string;   // FIX: doctors.id for doctor accounts — different from users.id.
                       //      Appointments are stored with doctorId from the doctors table,
                       //      so doctor appointment queries must use this, not id.
  fullName: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  setAuth: () => {},
  logout: () => {},
  isAuthenticated: false,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('mediai_user');
    return stored ? JSON.parse(stored) : null;
  });
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem('mediai_token')
  );

  const setAuth = (user: User, token: string) => {
    setUser(user);
    setToken(token);
    localStorage.setItem('mediai_user', JSON.stringify(user));
    localStorage.setItem('mediai_token', token);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('mediai_user');
    localStorage.removeItem('mediai_token');
  };

  return (
    <AuthContext.Provider value={{ user, token, setAuth, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
