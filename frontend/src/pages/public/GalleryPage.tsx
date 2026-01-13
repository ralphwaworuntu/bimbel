import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';

type GalleryResponse = {
  alumni: Array<{ id: string; title: string; imageUrl: string }>;
  activities: Array<{ id: string; title: string; imageUrl: string }>;
};

export function GalleryPage() {
  const { data, isLoading } = useQuery({ queryKey: ['gallery'], queryFn: () => apiGet<GalleryResponse>('/landing/gallery') });

  if (isLoading || !data) {
    return <Skeleton className="h-96" />;
  }

  return (
    <section className="space-y-10">
      <div>
        <h1 className="text-4xl font-bold text-slate-900">Foto Alumni</h1>
        <p className="mt-2 text-slate-600">Perayaan kelulusan dan momen kebersamaan para pejuang Tactical Education.</p>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {data.alumni.map((item) => (
            <figure key={item.id} className="overflow-hidden rounded-3xl border border-slate-100">
              <img src={item.imageUrl} alt={item.title} className="h-60 w-full object-cover" loading="lazy" />
              <figcaption className="p-4 text-sm font-semibold text-slate-700">{item.title}</figcaption>
            </figure>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-3xl font-bold text-slate-900">Kegiatan Bimbel</h2>
        <p className="mt-2 text-slate-600">Bootcamp offline, kelas intensif, hingga sesi mentoring privat.</p>
        <div className="mt-6 grid gap-4 md:grid-cols-4">
          {data.activities.map((item) => (
            <figure key={item.id} className="overflow-hidden rounded-3xl border border-slate-100">
              <img src={item.imageUrl} alt={item.title} className="h-44 w-full object-cover" loading="lazy" />
              <figcaption className="p-3 text-xs text-slate-600">{item.title}</figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
