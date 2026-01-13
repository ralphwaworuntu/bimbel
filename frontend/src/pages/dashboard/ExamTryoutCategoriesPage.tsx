import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/lib/api';
import { getAssetUrl } from '@/lib/media';
import type { Tryout } from '@/types/exam';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useExamControlStatus } from '@/hooks/useExamControl';

export function ExamTryoutCategoriesPage() {
  const navigate = useNavigate();
  const examStatus = useExamControlStatus();
  const examEnabled = Boolean(examStatus.data?.enabled && examStatus.data?.allowed);
  const { data: tryouts, isLoading } = useQuery({
    queryKey: ['exam-tryouts'],
    queryFn: () => apiGet<Tryout[]>('/ujian/tryouts'),
    enabled: examEnabled,
  });

  const categoryGroups = useMemo(() => {
    if (!tryouts) return [];
    const map = new Map<
      string,
      {
        id: string;
        name: string;
        thumbnail?: string | null;
        subCategories: Array<{ id: string; name: string; tryouts: Tryout[] }>;
      }
    >();
    tryouts.forEach((item) => {
      const category = item.subCategory.category;
      if (!map.has(category.id)) {
        map.set(category.id, { id: category.id, name: category.name, thumbnail: category.thumbnail ?? null, subCategories: [] });
      }
      const group = map.get(category.id)!;
      let subGroup = group.subCategories.find((sub) => sub.id === item.subCategory.id);
      if (!subGroup) {
        subGroup = { id: item.subCategory.id, name: item.subCategory.name, tryouts: [] };
        group.subCategories.push(subGroup);
      }
      subGroup.tryouts.push(item);
    });
    return Array.from(map.values());
  }, [tryouts]);

  if (examStatus.isLoading) {
    return <Skeleton className="h-72" />;
  }

  if (!examEnabled) {
    return (
      <section className="rounded-3xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-800">
        Akses ujian belum diaktifkan oleh admin atau tidak tersedia untuk akunmu.
      </section>
    );
  }

  if (isLoading || !tryouts) {
    return <Skeleton className="h-72" />;
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Kategori Ujian Tryout</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">Pilih Fokus Ujian</h1>
          <p className="mt-2 text-sm text-slate-600">Masuk ke kategori untuk melihat sub kategori yang tersedia.</p>
        </div>
        <Button variant="outline" onClick={() => navigate('/app/ujian/tryout/riwayat')}>
          Lihat Riwayat Ujian
        </Button>
      </div>
      <section className="grid gap-4 md:grid-cols-2">
        <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Kuota Tryout Ujian</p>
          <h3 className="mt-2 text-3xl font-bold text-slate-900">
            {examStatus.data?.tryoutQuota === 0 || examStatus.data?.tryoutQuota === undefined
              ? 'Tidak terbatas'
              : `${Math.max(examStatus.data.tryoutQuota - examStatus.data.tryoutsUsed, 0)} kali tersisa`}
          </h3>
          {typeof examStatus.data?.tryoutQuota === 'number' && (
            <p className="text-sm text-slate-500">
              Total {examStatus.data.tryoutQuota} - Terpakai {examStatus.data.tryoutsUsed ?? 0}
            </p>
          )}
        </div>
        <div className="rounded-3xl border border-slate-100 bg-slate-50 p-5 text-sm text-slate-600">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Aturan Anti-Cheat</p>
          <ul className="mt-3 list-disc space-y-1 pl-4">
            <li>Ujian berjalan dalam mode layar penuh.</li>
            <li>Dilarang berpindah tab atau membuka aplikasi lain.</li>
            <li>Pelanggaran akan menghentikan sesi dan kuota tetap terhitung.</li>
          </ul>
        </div>
      </section>
      {categoryGroups.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-sm text-slate-500">
          Belum ada tryout yang tersedia.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {categoryGroups.map((category) => {
            const totalTryouts = category.subCategories.reduce((acc, subCategory) => acc + subCategory.tryouts.length, 0);
            const cover = getAssetUrl(category.thumbnail) || '/Alumni.png';
            return (
              <Card key={category.id} className="overflow-hidden">
                <CardContent className="p-0">
                  <img src={cover} alt={category.name} className="h-36 w-full object-cover" loading="lazy" />
                  <div className="space-y-2 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="text-lg font-semibold text-slate-900">{category.name}</h3>
                      <span className="rounded-2xl bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                        {totalTryouts} paket
                      </span>
                    </div>
                    <p className="text-sm text-slate-600">Paket ujian tryout untuk fokus {category.name}.</p>
                    <Button
                      className="w-full"
                      onClick={() => navigate(`/app/ujian/tryout/kategori/${category.id}`)}
                    >
                      Lihat Sub Kategori
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </section>
  );
}
