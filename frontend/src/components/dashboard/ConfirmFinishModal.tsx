type ConfirmFinishModalProps = {
  open: boolean;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmFinishModal({
  open,
  title,
  description,
  confirmText = 'Akhiri sekarang',
  cancelText = 'Lanjutkan',
  loading,
  onConfirm,
  onCancel,
}: ConfirmFinishModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-slate-950/70 p-4">
      <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900/90 p-6 text-white shadow-2xl">
        <h3 className="text-xl font-semibold">{title}</h3>
        <p className="mt-2 text-sm text-slate-200">{description}</p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex flex-1 items-center justify-center rounded-2xl border border-white/30 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="inline-flex flex-1 items-center justify-center rounded-2xl bg-rose-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-rose-400 disabled:cursor-not-allowed disabled:bg-rose-500/60"
          >
            {loading ? 'Mengirim...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
