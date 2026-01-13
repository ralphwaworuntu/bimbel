import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/lib/api';
import { formatDate } from '@/utils/format';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { useExamControlStatus } from '@/hooks/useExamControl';

type PracticeHistoryItem = {
  id: string;
  score: number;
  createdAt: string;
  set: {
    title: string;
    subSubCategory: {
      name: string;
      subCategory: { name: string; category: { name: string } };
    };
  };
};

export function ExamPracticeHistoryPage() {
  const examStatus = useExamControlStatus();
  const examEnabled = Boolean(examStatus.data?.enabled && examStatus.data?.allowed);
  const { data, isLoading } = useQuery({
    queryKey: ['exam-practice-history'],
    queryFn: () => apiGet<PracticeHistoryItem[]>('/ujian/practice-history'),
    enabled: examEnabled,
  });

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

  return (
    <section>
      <h1 className="text-3xl font-bold text-slate-900">Riwayat Ujian Soal</h1>
      <div className="mt-6 overflow-x-auto rounded-3xl border border-slate-100 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-slate-100 text-sm">
          <thead className="bg-slate-50 text-left text-xs font-semibold uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Judul</th>
              <th className="px-4 py-3">Kategori</th>
              <th className="px-4 py-3">Tanggal</th>
              <th className="px-4 py-3">Skor</th>
              <th className="px-4 py-3">Pembahasan</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {data.map((item) => (
              <tr key={item.id}>
                <td className="px-4 py-3 font-semibold text-slate-900">{item.set.title}</td>
                <td className="px-4 py-3 text-slate-600">
                  {item.set.subSubCategory.subCategory.category.name} / {item.set.subSubCategory.subCategory.name} /{' '}
                  {item.set.subSubCategory.name}
                </td>
                <td className="px-4 py-3 text-slate-600">{formatDate(item.createdAt)}</td>
                <td className="px-4 py-3 font-bold text-brand-500">{Math.round(item.score)}%</td>
                <td className="px-4 py-3">
                  <Button asChild size="sm" variant="outline">
                    <Link to={`/app/ujian/soal/review/${item.id}`}>Lihat</Link>
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {data.length === 0 && (
          <div className="px-4 py-8 text-center text-sm text-slate-500">Belum ada riwayat ujian.</div>
        )}
      </div>
    </section>
  );
}
