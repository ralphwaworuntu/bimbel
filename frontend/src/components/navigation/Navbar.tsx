import { useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { publicNavLinks } from '@/constants/navigation';
import { Button } from '@/components/ui/button';
import { cn } from '@/utils/cn';
import { useAuth } from '@/hooks/useAuth';

export function Navbar() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const { isAuthenticated } = useAuth();

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/70 border-b border-slate-100">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link to="/" className="flex items-center gap-3">
          <img src="/Logo_tactical.png" alt="Tactical Education" className="h-10 w-auto object-contain" loading="lazy" />
          <div className="leading-tight">
            <p className="text-base font-semibold text-slate-900">TACTICAL EDUCATION</p>
            <p className="text-xs font-normal text-slate-500">Bimbel & Tryout Center</p>
          </div>
        </Link>

        <nav className="hidden gap-6 text-sm font-medium text-slate-600 md:flex">
          {publicNavLinks.map((link) => (
            <NavLink
              key={link.href}
              to={link.href}
              className={({ isActive }) =>
                cn(
                  'transition-colors hover:text-brand-500',
                  (isActive || pathname === link.href) && 'text-brand-600',
                )
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {isAuthenticated ? (
            <Button variant="outline" asChild>
              <Link to="/app">Buka Dashboard</Link>
            </Button>
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link to="/auth/login">Login</Link>
              </Button>
              <Button asChild>
                <Link to="/auth/register">Daftar</Link>
              </Button>
            </>
          )}
        </div>

        <button className="md:hidden" onClick={() => setOpen((prev) => !prev)}>
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-slate-100 bg-white px-4 pb-4 md:hidden">
          <nav className="flex flex-col gap-3 py-4 text-sm font-semibold text-slate-700">
            {publicNavLinks.map((link) => (
              <NavLink
                key={link.href}
                to={link.href}
                onClick={() => setOpen(false)}
                className={({ isActive }) => cn('rounded-2xl px-3 py-2 hover:bg-slate-50', isActive && 'bg-slate-100 text-brand-600')}
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
          <div className="flex flex-col gap-3">
            {isAuthenticated ? (
              <Button asChild>
                <Link to="/app" onClick={() => setOpen(false)}>
                  Buka Dashboard
                </Link>
              </Button>
            ) : (
              <>
                <Button variant="outline" asChild>
                  <Link to="/auth/login" onClick={() => setOpen(false)}>
                    Login
                  </Link>
                </Button>
                <Button asChild>
                  <Link to="/auth/register" onClick={() => setOpen(false)}>
                    Daftar
                  </Link>
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
