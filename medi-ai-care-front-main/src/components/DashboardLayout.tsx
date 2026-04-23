import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { DashboardSidebar } from './DashboardSidebar';

interface DashboardLayoutProps {
  role?: 'doctor' | 'patient';
}

export function DashboardLayout({ role }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <div className="flex flex-1 overflow-hidden">
        <DashboardSidebar role={role} />

        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 bg-muted/30">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}