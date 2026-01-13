import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { API_BASE_ORIGIN, apiGet, apiPatch } from '@/lib/api';
import type { AdminTransaction } from '@/types/exam';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrency, formatDate } from '@/utils/format';

const statusFilters: Array<'ALL' | 'PENDING' | 'PAID' | 'REJECTED'> = ['PENDING', 'ALL', 'PAID', 'REJECTED'];

export function AdminMemberActivationPage() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'PAID' | 'REJECTED'>('PENDING');
  const { data, isLoading } = useQuery({
    queryKey: ['admin-transactions'],
    queryFn: () => apiGet<AdminTransaction[]>('/admin/transactions'),
  });

  const updateStatus = useMutation({
    mutationFn: (payload: { id: string; status: AdminTransaction['status'] }) =>
      apiPatch(`/admin/transactions/${payload.id}/status`, { status: payload.status }),
    onSuccess: () => {
      toast.success('Status transaksi diperbarui');
      queryClient.invalidateQueries({ queryKey: ['admin-transactions'] });
    },
    onError: () => toast.error('Gagal mengubah status'),
  });

  const transactions = useMemo(() => {
    if (!data) return [];
    if (filter === 'ALL') return data;
    return data.filter((trx) => trx.status === filter);
  }, [data, filter]);

  if (isLoading) {
    return <Skeleton className="h-96" />;
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Aktivasi Membership</h1>
          <p className="text-sm text-slate-600">Validasi bukti pembayaran member dan aktifkan paketnya.</p>
        </div>
        <div className="flex gap-2">
          {statusFilters.map((item) => (
            <Button key={item} variant={filter === item ? 'primary' : 'outline'} size="sm" onClick={() => setFilter(item)}>
              {item === 'ALL' ? 'Semua' : item}
            </Button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {transactions.map((trx) => (
          <Card key={trx.id}>
            <CardContent className="space-y-4 p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-widest text-slate-500">{trx.package.name}</p>
                  <h3 className="text-xl font-semibold text-slate-900">{trx.code}</h3>
                  <p className="text-sm text-slate-500">
                    {trx.user.name} • {trx.user.email}
                  </p>
                </div>
                <span
                  className={`rounded-full px-4 py-1 text-xs font-semibold ${
                    trx.status === 'PAID'
                      ? 'bg-emerald-50 text-emerald-600'
                      : trx.status === 'PENDING'
                      ? 'bg-amber-50 text-amber-600'
                      : 'bg-rose-50 text-rose-600'
                  }`}
                >
                  {trx.status}
                </span>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <p className="text-xs font-semibold text-slate-500">Nominal</p>
                  <p className="text-lg font-bold text-slate-900">{formatCurrency(trx.amount)}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500">Metode</p>
                  <p className="text-sm text-slate-600">{trx.method}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500">Dibuat</p>
                  <p className="text-sm text-slate-600">{formatDate(trx.createdAt)}</p>
                </div>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4 text-sm">
                <p className="font-semibold text-slate-700">Bukti Pembayaran</p>
                {trx.proofUrl ? (
                  <a
                    href={`${API_BASE_ORIGIN}${trx.proofUrl}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-brand-600 underline"
                  >
                    Lihat bukti
                  </a>
                ) : (
                  <p className="text-xs text-slate-400">Belum ada bukti yang diunggah.</p>
                )}
                {trx.description && <p className="mt-2 text-xs text-slate-500">Catatan: {trx.description}</p>}
              </div>

              <div className="flex flex-wrap gap-3">
                <Button
                  variant="primary"
                  disabled={updateStatus.isPending}
                  onClick={() => updateStatus.mutate({ id: trx.id, status: 'PAID' })}
                >
                  Tandai Lunas
                </Button>
                <Button
                  variant="outline"
                  disabled={updateStatus.isPending}
                  onClick={() => updateStatus.mutate({ id: trx.id, status: 'REJECTED' })}
                >
                  Tolak
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {transactions.length === 0 && <p className="text-sm text-slate-500">Tidak ada transaksi sesuai filter.</p>}
      </div>
    </section>
  );
}
