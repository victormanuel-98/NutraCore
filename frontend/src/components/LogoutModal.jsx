import React, { useEffect } from 'react';
import { LogOut } from 'lucide-react';
import { Button } from './ui/button';

const PixelX = ({ size = 20, className }) => (
  <svg width={size} height={size} viewBox="0 0 8 8" fill="currentColor" className={className}>
    <path d="M0 0h1v1H0V0zm1 1h1v1H1V1zm1 1h1v1H2V2zm1 1h1v1H3V3zm1 1h1v1H4V4zm1 1h1v1H5V5zm1 1h1v1H6V6zm1 1h1v1H7V7zM0 7h1v1H0V7zm1-1h1v1H1V6zm1-1h1v1H2V5zm1-1h1v1H3V4zm2-2h1v1H5V2zm1-1h1v1H6V1zm1-1h1v1H7V0z" />
  </svg>
);

export function LogoutModal({ isOpen, onClose, onConfirm }) {
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : 'unset';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 recipe-modal-overlay modal-overlay-enter" onClick={onClose} />

      <div className="relative w-full max-w-sm bg-white border-2 border-pink-accent shadow-[8px_8px_0px_0px_#ff0a60] modal-content-enter">
        <div className="absolute top-0 left-0 h-1 w-full overflow-hidden bg-pink-accent">
          <div className="h-full w-1/2 animate-pulse bg-white/40" />
        </div>

        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 p-2 transition-transform hover:scale-110 group"
          aria-label="Cerrar ventana"
        >
          <PixelX size={16} className="text-pink-accent group-hover:text-pink-accent/80" />
        </button>

        <div className="p-8 text-center">
          <div className="relative mb-6 inline-flex h-16 w-16 items-center justify-center bg-pink-accent/10 group">
            <div
              className="absolute inset-0 bg-pink-accent/40 transition-transform duration-500 group-hover:rotate-90"
              style={{ clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)' }}
            />
            <div
              className="absolute inset-0 animate-ping border-2 border-pink-accent/60 opacity-60"
              style={{ clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)', animationDuration: '3s' }}
            />
            <LogOut className="relative z-10 h-7 w-7 text-pink-accent transition-transform group-hover:scale-110" />
          </div>

          <h3 className="mb-3 font-logo text-3xl tracking-tight text-pink-accent">¿Ya te vas?</h3>

          <p className="mb-8 font-slogan text-lg leading-relaxed text-gray-600">
            Tu progreso de hoy está a salvo. ¡Esperamos volver a verte pronto!
          </p>

          <div className="flex flex-col gap-3">
            <Button
              className="h-auto bg-pink-accent py-6 text-lg text-white font-logo shadow-[4px_4px_0px_0px_#00000010] transition-all hover:-translate-y-1 hover:bg-[#d60a56] hover:shadow-[6px_6px_0px_0px_#00000015] active:translate-y-0"
              onClick={onConfirm}
            >
              Cerrar sesión
            </Button>
            <Button
              variant="ghost"
              className="h-auto py-6 text-lg text-pink-accent font-logo transition-all hover:scale-105 hover:bg-pink-accent/5 active:scale-95"
              onClick={onClose}
            >
              Cancelar
            </Button>
          </div>
        </div>

        <div className="absolute bottom-0 right-0 h-1 w-12 bg-pink-accent" />
        <div className="absolute bottom-0 right-0 h-8 w-1 bg-pink-accent" />
      </div>
    </div>
  );
}
