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
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 modal-overlay-enter"
        onClick={onClose}
      />
      
      {/* Modal Card */}
      <div className="relative w-full max-w-sm bg-white border-2 border-pink-accent shadow-[8px_8px_0px_0px_#ff0a60] modal-content-enter">
        {/* Header Decor */}
        <div className="absolute top-0 left-0 w-full h-1 bg-pink-accent overflow-hidden">
          <div className="w-1/2 h-full bg-white/40 animate-pulse" />
        </div>

        <button 
          onClick={onClose}
          className="absolute top-3 right-3 hover:scale-110 transition-transform p-2 group"
        >
          <PixelX size={16} className="text-pink-accent group-hover:text-pink-accent/80" />
        </button>

        <div className="p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-pink-accent/10 mb-6 relative group">
             {/* Hexagon background */}
             <div 
              className="absolute inset-0 bg-pink-accent/40 transition-transform duration-500 group-hover:rotate-90" 
              style={{ clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)' }}
             />
             <div 
              className="absolute inset-0 border-2 border-pink-accent/60 animate-ping opacity-60" 
              style={{ clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)', animationDuration: '3s' }} 
             />
             <LogOut className="w-7 h-7 text-pink-accent relative z-10 transition-transform group-hover:scale-110" />
          </div>

          <h3 className="font-logo text-3xl text-pink-accent mb-3 tracking-tight">
            ¿Ya te vas?
          </h3>
          
          <p className="font-slogan text-lg text-gray-600 mb-8 leading-relaxed">
            Tu progreso de hoy está a salvo. ¡Esperamos volver a verte pronto!
          </p>

          <div className="flex flex-col gap-3">
            <Button 
              className="bg-pink-accent hover:bg-pink-accent/90 text-white font-logo text-lg py-6 h-auto shadow-[4px_4px_0px_0px_#00000010] transition-all hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_#00000015] active:translate-y-0"
              onClick={onConfirm}
            >
              Cerrar Sesión
            </Button>
            <Button 
              variant="ghost" 
              className="text-pink-accent hover:bg-pink-accent/5 font-logo text-lg py-6 h-auto transition-all hover:scale-105 active:scale-95"
              onClick={onClose}
            >
              Cancelar
            </Button>
          </div>
        </div>

        {/* Footer Glitch Decor */}
        <div className="absolute bottom-0 right-0 w-12 h-1 bg-pink-accent" />
        <div className="absolute bottom-0 right-0 w-1 h-8 bg-pink-accent" />
      </div>
    </div>
  );
}
