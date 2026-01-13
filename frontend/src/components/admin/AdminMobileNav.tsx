import { X } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { adminMenu } from '@/constants/navigation';
import { Button } from '@/components/ui/button';
import { cn } from '@/utils/cn';

type AdminMobileNavProps = {
  open: boolean;
  onClose: () => void;
};

export function AdminMobileNav({ open, onClose }: AdminMobileNavProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm lg:hidden">
      <div className="ml-auto flex h-full w-80 flex-col bg-white p-6 shadow-2xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-slate-500">Admin</p>
            <h2 className="text-lg font-semibold text-slate-900">Navigasi</h2>
          </div>
          <Button variant="ghost" size="sm" className="h-10 w-10 rounded-2xl p-0" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        <div className="flex-1 space-y-6 overflow-y-auto">
          {adminMenu.map((section) => (
            <div key={section.title}>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{section.title}</p>
              <div className="mt-3 space-y-1">
                {section.items.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.exact}
                    className={({ isActive }) =>
                      cn(
                        'block rounded-2xl px-3 py-2 text-sm font-medium text-slate-600',
                        isActive ? 'bg-slate-900 text-white' : 'hover:bg-slate-50',
                      )
                    }
                    onClick={onClose}
                  >
                    {item.label}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
