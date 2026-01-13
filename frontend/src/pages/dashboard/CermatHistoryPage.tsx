import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/lib/api';
import { formatDate } from '@/utils/format';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { useMembershipStatus } from '@/hooks/useMembershipStatus';
import { MembershipRequired } from '@/components/dashboard/MembershipRequired';

type CermatMode = 'NUMBER' | 'LETTER';

type CermatHistoryItem = {
  id: string;
  mode: CermatMode;
  sessionIndex: number;
  totalQuestions: number;
  correctCount: number;
  score: number | null;
  finishedAt?: string | null;
  createdAt: string;
};

const MODE_LABELS: Record<CermatMode, string> = {
  NUMBER: 'Tes Kecermatan Angka Hilang',
  LETTER: 'Tes Kecermatan Huruf Hilang',
};

export function CermatHistoryPage() {
  const membership = useMembershipStatus();
  const [activeMode, setActiveMode] = useState<CermatMode>('NUMBER');
  const { data, isLoading } = useQuery({
    queryKey: ['cermat-history'],
    queryFn: () => apiGet<CermatHistoryItem[]>('/exams/cermat/history'),
    enabled: Boolean(membership.data?.isActive),
  });

  const filtered = useMemo(() => (data ?? []).filter((item) => item.mode === activeMode), [activeMode, data]);

  if (membership.isLoading) {
    return <Skeleton className="h-72" />;
  }

  if (!membership.data?.isActive) {
    return <MembershipRequired status={membership.data} />;
  }

  if (membership.data?.allowCermat === false) {
    return (
      <section className="rounded-3xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-800">
        Paket membership kamu tidak mencakup akses tes kecermatan. Hubungi admin untuk upgrade paket.
      </section>
    );
  }

  if (isLoading || !data) {
    return <Skeleton className="h-72" />;
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Riwayat Tes Kecermatan</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">Rekap Sesi Kecermatan</h1>
          <p className="mt-2 text-sm text-slate-600">Lihat skor dan jumlah jawaban benar untuk setiap sesi.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {(['NUMBER', 'LETTER'] as CermatMode[]).map((mode) => (
            <Button
              key={mode}
              variant={activeMode === mode ? 'primary' : 'outline'}
              onClick={() => setActiveMode(mode)}
            >
              {mode === 'NUMBER' ? 'Angka Hilang' : 'Huruf Hilang'}
            </Button>
          ))}
        </div>
      </div>

      <div className="rounded-3xl border border-slate-100 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-5 py-4">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">{MODE_LABELS[activeMode]}</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100 text-sm">
            <thead className="bg-slate-50 text-left text-xs font-semibold uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Sesi</th>
                <th className="px-4 py-3">Tanggal</th>
                <th className="px-4 py-3">Skor</th>
                <th className="px-4 py-3">Jawaban Benar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map((item) => (
                <tr key={item.id}>
                  <td className="px-4 py-3 font-semibold text-slate-900">Sesi {item.sessionIndex}</td>
                  <td className="px-4 py-3 text-slate-600">{formatDate(item.finishedAt ?? item.createdAt)}</td>
                  <td className="px-4 py-3 font-bold text-brand-500">{Math.round(item.score ?? 0)}%</td>
                  <td className="px-4 py-3 text-slate-600">
                    {item.correctCount}/{item.totalQuestions}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="px-4 py-8 text-center text-sm text-slate-500">Belum ada riwayat untuk kategori ini.</div>
          )}
        </div>
      </div>
    </section>
  );
}
