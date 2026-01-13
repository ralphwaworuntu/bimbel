import { NavLink } from 'react-router-dom';
import { adminMenu } from '@/constants/navigation';
import { cn } from '@/utils/cn';
import { useAuth } from '@/hooks/useAuth';

export function AdminSidebar() {
  const { user } = useAuth();

  return (
    <aside className="hidden w-72 flex-col border-r border-slate-200 bg-white px-4 py-8 lg:flex">
      <div className="flex items-center gap-3">
        <div className="rounded-2xl bg-slate-900 px-3 py-2 text-sm font-semibold text-white">Admin</div>
        <div>
          <p className="text-sm font-semibold text-slate-900">{user?.name ?? 'Administrator'}</p>
          <p className="text-xs text-slate-500">Kelola Tactical Education</p>
        </div>
      </div>

      <div className="mt-6 space-y-6">
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
                      'flex items-center justify-between rounded-2xl px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50',
                      isActive && 'bg-slate-900 text-white shadow-md',
                    )
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}
