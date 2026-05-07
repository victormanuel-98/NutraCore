import { Link } from "react-router-dom";
import { Instagram, Mail } from "lucide-react";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-[#07132c] text-white border-t border-pink-accent/25">
      <div className="w-full px-4 sm:px-8 lg:px-12 py-12 lg:py-14">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.25fr)_repeat(3,minmax(0,1fr))]">
          <div className="space-y-5">
            <Link to="/" className="inline-flex items-center leading-none">
              <h3 className="font-logo text-3xl md:text-[2.7rem] tracking-tight whitespace-nowrap">NutraCore!</h3>
            </Link>
            <p className="max-w-[28ch] text-[0.95rem] leading-relaxed text-slate-300">
              Nutrición inteligente para optimizar tu día a día con herramientas prácticas, datos claros y decisiones más saludables.
            </p>
            <div className="flex items-center gap-3">
              <a
                href="mailto:soporte@nutracore.app"
                className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-white/15 text-slate-200 transition-all duration-200 hover:-translate-y-0.5 hover:scale-105 hover:border-pink-accent hover:bg-pink-accent/20 hover:text-white"
                aria-label="Correo de soporte"
              >
                <Mail className="h-4 w-4" />
              </a>
              <a
                href="https://www.instagram.com/nutracore2026/"
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-white/15 text-slate-200 transition-all duration-200 hover:-translate-y-0.5 hover:scale-105 hover:border-pink-accent hover:bg-pink-accent/20 hover:text-white"
                aria-label="Instagram NutraCore"
              >
                <Instagram className="h-4 w-4" />
              </a>
              <a
                href="https://x.com/nutra7029"
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-white/15 text-slate-200 transition-all duration-200 hover:-translate-y-0.5 hover:scale-105 hover:border-pink-accent hover:bg-pink-accent/20 hover:text-white"
                aria-label="X de NutraCore"
              >
                <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 fill-current">
                  <path d="M18.244 2H21l-6.02 6.88L22 22h-5.485l-4.296-6.304L6.7 22H4l6.44-7.365L2 2h5.624l3.884 5.74L18.244 2Zm-.964 18h1.527L6.789 3.895H5.15L17.28 20Z" />
                </svg>
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-navbar text-xl text-white mb-4">Plataforma</h4>
            <ul className="space-y-2.5 text-[0.95rem] text-slate-300">
              <li>
                <Link to="/" className="inline-block transition-all duration-200 hover:text-pink-accent hover:translate-x-0.5 hover:underline hover:underline-offset-4">
                  Inicio
                </Link>
              </li>
              <li>
                <Link to="/catalog" className="inline-block transition-all duration-200 hover:text-pink-accent hover:translate-x-0.5 hover:underline hover:underline-offset-4">
                  Catálogo
                </Link>
              </li>
              <li>
                <Link to="/lab" className="inline-block transition-all duration-200 hover:text-pink-accent hover:translate-x-0.5 hover:underline hover:underline-offset-4">
                  NutraCore Lab
                </Link>
              </li>
              <li>
                <Link to="/news" className="inline-block transition-all duration-200 hover:text-pink-accent hover:translate-x-0.5 hover:underline hover:underline-offset-4">
                  Noticias
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-navbar text-xl text-white mb-4">Cuenta</h4>
            <ul className="space-y-2.5 text-[0.95rem] text-slate-300">
              <li>
                <Link to="/register" className="inline-block transition-all duration-200 hover:text-pink-accent hover:translate-x-0.5 hover:underline hover:underline-offset-4">
                  Registrarse
                </Link>
              </li>
              <li>
                <Link to="/login" className="inline-block transition-all duration-200 hover:text-pink-accent hover:translate-x-0.5 hover:underline hover:underline-offset-4">
                  Iniciar sesión
                </Link>
              </li>
              <li>
                <Link to="/profile" className="inline-block transition-all duration-200 hover:text-pink-accent hover:translate-x-0.5 hover:underline hover:underline-offset-4">
                  Perfil
                </Link>
              </li>
              <li>
                <a href="mailto:soporte@nutracore.app" className="inline-block transition-all duration-200 hover:text-pink-accent hover:translate-x-0.5 hover:underline hover:underline-offset-4">
                  Soporte
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-navbar text-xl text-white mb-4">Legal</h4>
            <ul className="space-y-2.5 text-[0.95rem] text-slate-300">
              <li>
                <Link to="/privacy" className="inline-block transition-all duration-200 hover:text-pink-accent hover:translate-x-0.5 hover:underline hover:underline-offset-4">
                  Privacidad
                </Link>
              </li>
              <li>
                <Link to="/terms" className="inline-block transition-all duration-200 hover:text-pink-accent hover:translate-x-0.5 hover:underline hover:underline-offset-4">
                  Términos
                </Link>
              </li>
              <li>
                <Link to="/cookies" className="inline-block transition-all duration-200 hover:text-pink-accent hover:translate-x-0.5 hover:underline hover:underline-offset-4">
                  Cookies
                </Link>
              </li>
              <li>
                <Link to="/legal-notice" className="inline-block transition-all duration-200 hover:text-pink-accent hover:translate-x-0.5 hover:underline hover:underline-offset-4">
                  Aviso legal
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-white/10 pt-6 flex flex-col gap-2 text-center md:flex-row md:items-center md:justify-between md:text-left">
          <p className="text-sm text-slate-400">&copy; {year} NutraCore. Plataforma integral de nutrición y bienestar.</p>
          <p className="text-sm text-slate-400">Comprometidos con recomendaciones basadas en evidencia científica y resultados sostenibles.</p>
        </div>
      </div>
    </footer>
  );
}
