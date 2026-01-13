import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/lib/api';
import { getAssetUrl } from '@/lib/media';
import type { PracticeCategory } from '@/types/exam';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useExamControlStatus } from '@/hooks/useExamControl';

export function ExamPracticeSubSubCategoriesPage() {
  const navigate = useNavigate();
  const { categorySlug, subCategoryId } = useParams<{ categorySlug: string; subCategoryId: string }>();
  const examStatus = useExamControlStatus();
  const examEnabled = Boolean(examStatus.data?.enabled && examStatus.data?.allowed);
  const { data: categories, isLoading } = useQuery({
    queryKey: ['exam-practice-categories'],
    queryFn: () => apiGet<PracticeCategory[]>('/ujian/practice/categories'),
    enabled: examEnabled,
  });

  const { category, subCategory } = useMemo(() => {
    const selectedCategory = categories?.find((item) => item.slug === categorySlug) ?? null;
    const selectedSubCategory = selectedCategory?.subCategories.find((sub) => sub.id === subCategoryId) ?? null;
    return { category: selectedCategory, subCategory: selectedSubCategory };
  }, [categories, categorySlug, subCategoryId]);

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

  if (isLoading || !categories) {
    return <Skeleton className="h-72" />;
  }

  if (!category || !subCategory) {
    return (
      <section className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-sm text-slate-500">
        Sub kategori tidak ditemukan.
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Sub Sub Kategori Ujian</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">{subCategory.name}</h1>
          <p className="mt-2 text-sm text-slate-600">Pilih sub sub kategori untuk melihat paket soal.</p>
        </div>
        <Button variant="outline" onClick={() => navigate(`/app/ujian/soal/kategori/${category.slug}`)}>
          Kembali
        </Button>
      </div>
      {subCategory.subSubs.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-sm text-slate-500">
          Sub sub kategori belum tersedia.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {subCategory.subSubs.map((subSub) => {
            const cover = getAssetUrl(subSub.imageUrl) || getAssetUrl(subCategory.imageUrl) || '/Alumni.png';
            return (
              <Card key={subSub.id} className="overflow-hidden">
                <CardContent className="p-0">
                  <img src={cover} alt={subSub.name} className="h-36 w-full object-cover" loading="lazy" />
                  <div className="space-y-2 p-4">
                    <h3 className="text-lg font-semibold text-slate-900">{subSub.name}</h3>
                    <p className="text-sm text-slate-600">{subSub.sets.length} paket latihan.</p>
                    <Button
                      className="w-full"
                      onClick={() =>
                        navigate(`/app/ujian/soal/kategori/${category.slug}/sub/${subCategory.id}/subsub/${subSub.id}`)
                      }
                    >
                      Lihat Paket Soal
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
