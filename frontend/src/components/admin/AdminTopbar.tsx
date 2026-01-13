import { LogOut, LayoutDashboard, Menu } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { parseNameInitials } from '@/utils/format';

type AdminTopbarProps = {
  onOpenMobileNav?: () => void;
};

export function AdminTopbar({ onOpenMobileNav }: AdminTopbarProps) {
  const { user, logout } = useAuth();

  return (
    <div className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="flex items-center justify-between px-4 py-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            className="h-10 w-10 rounded-2xl p-0 lg:hidden"
            onClick={onOpenMobileNav}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <img
            src="/Logo_tactical.png"
            alt="Tactical Education"
            className="h-10 w-10 rounded-2xl object-cover"
          />
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-slate-500">Admin Panel</p>
            <h1 className="text-lg font-semibold text-slate-900">Mengelola Tactical Education</h1>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" className="hidden md:flex" asChild>
            <Link to="/app">
              <LayoutDashboard className="mr-2 h-4 w-4" /> Member Area
            </Link>
          </Button>
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-sm font-bold text-slate-600">
            {parseNameInitials(user?.name)}
          </div>
          <Button variant="ghost" size="sm" onClick={logout}>
            <LogOut className="mr-2 h-4 w-4" /> Keluar
          </Button>
        </div>
      </div>
    </div>
  );
}
