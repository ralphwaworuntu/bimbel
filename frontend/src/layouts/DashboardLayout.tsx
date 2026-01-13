import { Outlet } from 'react-router-dom';
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar';
import { DashboardTopbar } from '@/components/dashboard/DashboardTopbar';
import { WelcomeModal } from '@/components/dashboard/WelcomeModal';

export function DashboardLayout() {
  return (
    <div className="min-h-screen bg-slate-50 lg:flex">
      <DashboardSidebar />
      <div className="flex flex-1 flex-col">
        <DashboardTopbar />
        <WelcomeModal />
        <main className="flex-1 px-4 py-6">
          <div className="mx-auto max-w-6xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
