import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';
import type { PackageOption } from '@/types/landing';
import { LandingSectionManager, type LandingItem, type LandingResourceConfig } from '@/components/admin/LandingSectionManager';

type LandingAnnouncement = {
  id: string;
  title: string;
  body: string;
  publishedAt: string;
  imageUrl?: string | null;
  targetAll?: boolean;
  targetPackageIds?: string[];
};

type LandingOverview = {
  announcements: LandingAnnouncement[];
};

const announcementSection: LandingResourceConfig = {
  key: 'announcements',
  title: 'Pengumuman',
  endpoint: 'announcements',
  primaryField: 'title',
  fields: [
    { name: 'title', label: 'Judul' },
    { name: 'body', label: 'Konten', type: 'textarea' },
    { name: 'targetAll', label: 'Kirim ke semua member', type: 'boolean', defaultValue: 1 },
    { name: 'targetPackageIds', label: 'Target paket membership', type: 'packages' },
  ],
  uploadField: {
    name: 'image',
    label: 'Gambar Pengumuman (Opsional)',
    previewKey: 'imageUrl',
    helper: 'Gunakan JPG/PNG/WEBP maksimal 4MB.',
    accept: 'image/*',
  },
};

export function AdminAnnouncementsPage() {
  const { data, isLoading } = useQuery({ queryKey: ['admin-landing'], queryFn: () => apiGet<LandingOverview>('/admin/landing') });
  const { data: packages } = useQuery({ queryKey: ['admin-packages'], queryFn: () => apiGet<PackageOption[]>('/admin/packages') });

  if (isLoading || !data) {
    return <Skeleton className="h-80" />;
  }

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Pengumuman</h1>
        <p className="mt-2 text-sm text-slate-500">Kelola pengumuman yang tampil di area member.</p>
      </div>
      <LandingSectionManager
        config={announcementSection}
        items={data.announcements as LandingItem[]}
        packageOptions={packages ?? []}
      />
    </section>
  );
}
