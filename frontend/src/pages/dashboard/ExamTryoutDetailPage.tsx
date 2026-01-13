import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/lib/api';
import { getAssetUrl } from '@/lib/media';
import type { Tryout } from '@/types/exam';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { useExamControlStatus } from '@/hooks/useExamControl';

function formatDateTime(value?: string | null) {
  return value ? new Date(value).toLocaleString('id-ID') : '-';
}

function getScheduleStatus(openAt?: string | null, closeAt?: string | null) {
  const now = Date.now();
  if (openAt && new Date(openAt).getTime() > now) {
    return { canStart: false, label: `Dibuka ${formatDateTime(openAt)}` };
  }
  if (closeAt && new Date(closeAt).getTime() < now) {
    return { canStart: false, label: 'Periode tryout berakhir' };
  }
  return { canStart: true, label: 'Sedang dibuka' };
}

export function ExamTryoutDetailPage() {
  const navigate = useNavigate();
  const { slug } = useParams<{ slug: string }>();
  const examStatus = useExamControlStatus();
  const examEnabled = Boolean(examStatus.data?.enabled && examStatus.data?.allowed);
  const { data, isLoading } = useQuery({
    queryKey: ['exam-tryout-detail', slug],
    queryFn: () => apiGet<Tryout>(`/ujian/tryouts/${slug}/info`),
    enabled: Boolean(slug) && examEnabled,
  });
  const returnTo = slug ? `/app/ujian/tryout/detail/${slug}` : '/app/ujian/tryout';

  const status = useMemo(() => getScheduleStatus(data?.openAt, data?.closeAt), [data?.closeAt, data?.openAt]);

  if (examStatus.isLoading) {
    return <Skeleton className="h-72" />;
  }

  if (!examEnabled) {
    return (
      <section className="rounded-3xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-800">
        Akses ujian tidak tersedia untuk akun Anda. Hubungi admin jika seharusnya mendapatkan akses.
      </section>
    );
  }

  if (isLoading || !data) {
    return <Skeleton className="h-72" />;
  }

  const infoItems = [
    { label: 'Peminatan', value: data.subCategory.category.name },
    { label: 'Kategori Mata Pelajaran', value: data.subCategory.name },
    { label: 'Judul Tryout', value: data.name },
    { label: 'Jumlah Soal', value: String(data.totalQuestions) },
    { label: 'Durasi', value: `${data.durationMinutes} menit` },
    { label: 'Waktu Akses Mulai Tryout', value: formatDateTime(data.openAt) },
    { label: 'Waktu Akses Berakhir Tryout', value: formatDateTime(data.closeAt) },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Detail Tryout Ujian</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">{data.name}</h1>
          <p className="mt-2 text-sm text-slate-600">{data.summary}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="outline" onClick={() => navigate(-1)}>
            Kembali
          </Button>
          <Button
            onClick={() => {
              if (!data) return;
              sessionStorage.setItem('exam_tryout_start_slug', data.slug);
              navigate('/app/ujian/tryout/mulai', { state: { startTryoutSlug: data.slug, returnTo } });
            }}
            disabled={!status.canStart}
          >
            {status.canStart ? 'Mulai Tryout' : status.label}
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="space-y-4 p-6">
          {getAssetUrl(data.coverImageUrl) && (
            <img
              src={getAssetUrl(data.coverImageUrl)}
              alt={data.name}
              className="h-56 w-full rounded-3xl object-cover md:h-72"
              loading="lazy"
            />
          )}
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
            <Badge variant={status.canStart ? 'brand' : 'outline'}>{status.label}</Badge>
            <span className="uppercase tracking-[0.3em]">{data.subCategory.category.name}</span>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {infoItems.map((item) => (
              <div key={item.label} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-[0.25em] text-slate-400">{item.label}</p>
                <p className="mt-2 text-sm font-semibold text-slate-900">{item.value}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
