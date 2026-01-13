import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/lib/api';
import type { ProfileContent } from '@/types/content';
import { Skeleton } from '@/components/ui/skeleton';

export function ProfilePage() {
  const { data, isLoading } = useQuery({ queryKey: ['profile-content'], queryFn: () => apiGet<ProfileContent>('/landing/profile') });

  if (isLoading || !data) {
    return <Skeleton className="h-96" />;
  }

  return (
    <article className="space-y-6">
      <header className="rounded-3xl bg-brand-500 p-8 text-white">
        <p className="text-sm uppercase tracking-[0.4em]">Profil Kami</p>
        <h1 className="mt-4 text-4xl font-bold">{data.title}</h1>
      </header>
      <section className="rounded-3xl border border-slate-100 bg-white p-8 shadow-sm">
        <p className="text-lg leading-relaxed text-slate-600 whitespace-pre-line">{data.body}</p>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {data.highlights.map((highlight) => (
            <div key={highlight} className="rounded-2xl border border-slate-100 bg-slate-50 p-5">
              <p className="text-sm font-semibold text-slate-900">{highlight}</p>
            </div>
          ))}
        </div>
      </section>
    </article>
  );
}
