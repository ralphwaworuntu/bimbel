import { useCallback, useEffect, useRef } from 'react';

type FullscreenExamOptions = {
  active: boolean;
};

export function useFullscreenExam({ active }: FullscreenExamOptions) {
  const violationRef = useRef<((reason: string) => void) | null>(null);

  const setViolationHandler = useCallback((handler: ((reason: string) => void) | null) => {
    violationRef.current = handler;
  }, []);

  const request = useCallback(async () => {
    if (document.fullscreenElement) return;
    const element = document.documentElement;
    if (element.requestFullscreen) {
      await element.requestFullscreen();
    }
  }, []);

  const exit = useCallback(async () => {
    if (document.fullscreenElement && document.exitFullscreen) {
      await document.exitFullscreen();
    }
  }, []);

  useEffect(() => {
    if (!active) return undefined;

    const handleViolation = (reason: string) => {
      violationRef.current?.(reason);
    };

    const handleVisibility = () => {
      if (document.visibilityState === 'hidden') {
        handleViolation('Berpindah tab/ aplikasi lain');
      }
    };

    const ensureFullscreen = () => {
      if (!document.fullscreenElement) {
        handleViolation('Keluar dari layar penuh');
      }
    };

    const handleBlur = () => {
      handleViolation('Menjeda layar / membuka jendela lain');
    };

    document.addEventListener('visibilitychange', handleVisibility);
    document.addEventListener('fullscreenchange', ensureFullscreen);
    window.addEventListener('blur', handleBlur);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      document.removeEventListener('fullscreenchange', ensureFullscreen);
      window.removeEventListener('blur', handleBlur);
    };
  }, [active]);

  return { request, exit, setViolationHandler };
}
