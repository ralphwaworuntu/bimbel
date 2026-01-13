import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import type { Location } from 'react-router-dom';
import { toast } from 'sonner';
import { AxiosError } from 'axios';
import { apiPost } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import type { AuthUser } from '@/store/auth';
import type { ApiResponse } from '@/types/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useContactConfig } from '@/hooks/useContactConfig';

const loginSchema = z.object({
  email: z.string().email('Email tidak valid'),
  password: z.string().min(8, 'Minimal 8 karakter'),
});

type LoginValues = z.infer<typeof loginSchema>;

export function LoginPage() {
  const form = useForm<LoginValues>({ resolver: zodResolver(loginSchema) });
  const navigate = useNavigate();
  const location = useLocation();
  const { setSession } = useAuth();
  const [forgotOpen, setForgotOpen] = useState(false);
  const { data: contact } = useContactConfig();
  const whatsappNumber = contact?.whatsappConsult ?? contact?.whatsappPrimary ?? '6281234567890';
  const whatsappHref = `https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}`;

  const mutation = useMutation({
    mutationFn: (values: LoginValues) => apiPost<{ user: AuthUser; accessToken: string; refreshToken: string }>('/auth/login', values),
    onSuccess: (payload) => {
      setSession(payload);
      toast.success('Login berhasil, selamat datang kembali!');
      const defaultPath = payload.user.role === 'ADMIN' ? '/admin' : '/app';
      const redirectTo = (location.state as { from?: Location })?.from?.pathname || defaultPath;
      navigate(redirectTo, { replace: true });
    },
    onError: (error) => {
      const axiosError = error as AxiosError<ApiResponse<unknown> & { details?: { code?: string; email?: string } }>;
      const code = axiosError.response?.data?.details?.code;
      if (code === 'EMAIL_NOT_VERIFIED') {
        const targetEmail = axiosError.response?.data?.details?.email || form.getValues('email');
        toast.error('Email belum diverifikasi. Silakan cek inbox Anda.');
        navigate('/auth/verify', { state: { email: targetEmail } });
        return;
      }
      if (code === 'ACCOUNT_DISABLED') {
        toast.error('Akun Anda dinonaktifkan. Hubungi admin untuk mengaktifkannya kembali.');
        return;
      }
      toast.error('Gagal login, periksa kembali data Anda.');
    },
  });

  return (
    <div className="space-y-6">
      <button type="button" onClick={() => navigate('/')} className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900">
        <ArrowLeft className="h-4 w-4" /> Kembali ke Beranda
      </button>
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Masuk ke Dashboard</h2>
        <p className="mt-2 text-sm text-slate-500">Gunakan email dan password yang telah terdaftar.</p>
      </div>
      <form className="space-y-4" onSubmit={form.handleSubmit((values) => mutation.mutate(values))}>
        <div>
          <Input placeholder="Email" type="email" {...form.register('email')} />
          {form.formState.errors.email && <p className="mt-1 text-xs text-red-500">{form.formState.errors.email.message}</p>}
        </div>
        <div>
          <Input placeholder="Password" type="password" {...form.register('password')} />
          {form.formState.errors.password && <p className="mt-1 text-xs text-red-500">{form.formState.errors.password.message}</p>}
        </div>
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setForgotOpen((prev) => !prev)}
            className="text-xs font-semibold text-brand-600 hover:text-brand-700"
          >
            Lupa password?
          </button>
        </div>
        {forgotOpen && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-800">
            <p className="font-semibold">Silahkan Konfirmasi ke Admin.</p>
            <p className="mt-2">
              Admin akan mengirimkan password baru kamu. Setelah itu, silahkan ubah password di pengaturan akun bagian kanan atas dashboard.
            </p>
            <a href={whatsappHref} target="_blank" rel="noreferrer" className="mt-3 inline-flex font-semibold text-amber-900 underline">
              Hubungi Admin via WhatsApp
            </a>
          </div>
        )}
        <Button type="submit" className="w-full" disabled={mutation.isPending}>
          {mutation.isPending ? 'Memproses...' : 'Masuk'}
        </Button>
      </form>
      <p className="text-center text-sm text-slate-500">
        Belum punya akun?{' '}
        <Link to="/auth/register" className="font-semibold text-brand-600">
          Daftar sekarang
        </Link>
      </p>
    </div>
  );
}
