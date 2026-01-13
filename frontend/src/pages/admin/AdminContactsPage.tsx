import { useState } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { apiGet } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';

type ContactMessage = {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  message: string;
  status: string;
  createdAt: string;
};

type ContactMessageResponse = {
  items: ContactMessage[];
  total: number;
  page: number;
  limit: number;
  pages: number;
};

export function AdminContactsPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useQuery<ContactMessageResponse>({
    queryKey: ['admin-contact-messages', page],
    queryFn: () => apiGet<ContactMessageResponse>('/admin/contacts/messages', { params: { page } }),
    placeholderData: keepPreviousData,
  });

  if (isLoading || !data) {
    return <Skeleton className="h-96" />;
  }

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-slate-900">Pesan Hubungi Kami</h2>
        <p className="mt-2 text-sm text-slate-500">Pantau semua pesan yang dikirim via halaman Hubungi Kami.</p>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100 text-sm">
              <thead className="bg-slate-50 text-left text-xs font-semibold uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3">Nama</th>
                  <th className="px-4 py-3">Kontak</th>
                  <th className="px-4 py-3">Pesan</th>
                  <th className="px-4 py-3">Tanggal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {data.items.map((message) => (
                  <tr key={message.id}>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-slate-900">{message.name}</p>
                      <p className="text-[11px] uppercase tracking-wide text-slate-400">{message.status}</p>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600">
                      <p>
                        <a href={`mailto:${message.email}`} className="text-brand-600">
                          {message.email}
                        </a>
                      </p>
                      {message.phone && <p className="text-xs text-slate-500">WA: {message.phone}</p>}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600">
                      <p className="line-clamp-3 whitespace-pre-line">{message.message}</p>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500">{new Date(message.createdAt).toLocaleString('id-ID')}</td>
                  </tr>
                ))}
                {data.items.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-6 text-center text-sm text-slate-500">
                      Belum ada pesan.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between px-4 py-3 text-xs text-slate-500">
            <span>
              Halaman {data.page} dari {Math.max(data.pages, 1)} • Total {data.total} pesan
            </span>
            <div className="flex gap-2">
              <Button size="sm" variant="ghost" disabled={page <= 1} onClick={() => setPage((prev) => Math.max(prev - 1, 1))}>
                Sebelumnya
              </Button>
              <Button
                size="sm"
                variant="ghost"
                disabled={page >= data.pages}
                onClick={() => setPage((prev) => Math.min(prev + 1, data.pages))}
              >
                Selanjutnya
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
