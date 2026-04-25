import React, { useEffect } from 'react';
import { LogOut, X } from 'lucide-react';
import { Button } from './ui/button';

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
        className="absolute inset-0 bg-black/40 backdrop-blur-[6px] transition-opacity duration-300 animate-in fade-in"
        onClick={onClose}
      />
      
      {/* Modal Card */}
      <div className="relative w-full max-w-sm bg-white border-2 border-pink-accent shadow-[8px_8px_0px_0px_#ff0a60] transform transition-all duration-300 animate-in zoom-in-95 slide-in-from-bottom-4">
        {/* Header Decor */}
        <div className="absolute top-0 left-0 w-full h-1 bg-pink-accent overflow-hidden">
          <div className="w-1/2 h-full bg-white/40 animate-pulse" />
        </div>

        <button 
          onClick={onClose}
          className="absolute top-3 right-3 text-pink-accent/60 hover:text-pink-accent transition-colors p-1"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-pink-accent/10 mb-6 relative">
             <div className="absolute inset-0 rounded-full border-2 border-pink-accent/20 animate-ping" style={{ animationDuration: '3s' }} />
             <LogOut className="w-8 h-8 text-pink-accent" />
          </div>

          <h3 className="font-logo text-2xl text-pink-accent mb-3 tracking-tight">
            ¿Ya te vas?
          </h3>
          
          <p className="font-slogan text-lg text-gray-600 mb-8 leading-relaxed">
            Tu progreso de hoy está a salvo. ¡Esperamos volver a verte pronto!
          </p>

          <div className="flex flex-col gap-3">
            <Button 
              className="bg-pink-accent hover:bg-pink-accent/90 text-white font-logo text-lg py-6 h-auto shadow-[4px_4px_0px_0px_#00000010]"
              onClick={onConfirm}
            >
              Cerrar Sesión
            </Button>
            <Button 
              variant="ghost" 
              className="text-pink-accent hover:bg-pink-accent/5 font-logo text-lg py-6 h-auto"
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
