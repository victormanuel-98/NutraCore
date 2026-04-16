import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from './ui/button';
import { useAuth } from '../context/AuthContext';

export function Navbar() {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);
  const { isAuthenticated, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => setHasScrolled(window.scrollY > 8);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname, location.search]);

  const navLinks = isAuthenticated
    ? [
        { name: 'Dashboard', href: '/dashboard' },
        { name: 'Catálogo', href: '/catalog' },
        { name: 'NutraCore Lab', href: '/lab' },
        { name: 'Noticias', href: '/news' },
        { name: 'Perfil', href: '/profile' }
      ]
    : [
        { name: 'Inicio', href: '/' },
        { name: 'Catálogo', href: '/catalog' },
        { name: 'NutraCore Lab', href: '/lab' },
        { name: 'Noticias', href: '/news' }
      ];

  const navClasses = hasScrolled
    ? 'fixed top-0 left-0 right-0 z-50 bg-white text-pink-accent border-b border-pink-accent/20 shadow-sm'
    : 'fixed top-0 left-0 right-0 z-50 bg-pink-accent text-white border-b border-white/20';

  const linkActiveClasses = hasScrolled
    ? 'text-pink-accent font-semibold underline underline-offset-8'
    : 'text-white font-semibold underline underline-offset-8';

  const linkIdleClasses = hasScrolled ? 'text-pink-accent/90 hover:text-pink-accent' : 'text-white/90 hover:text-white';

  const loginButtonClasses = hasScrolled
    ? 'text-pink-accent hover:text-pink-accent hover:bg-pink-accent/10'
    : 'text-white hover:text-white hover:bg-white/10';

  const registerButtonClasses = hasScrolled
    ? 'bg-pink-accent hover:bg-pink-accent/90 text-white'
    : 'bg-white hover:bg-white/90 text-pink-accent';

  const mobileMenuClasses = hasScrolled
    ? 'md:hidden bg-white border-t border-pink-accent/20'
    : 'md:hidden bg-pink-accent border-t border-white/20';

  const mobileIconColor = hasScrolled ? 'text-pink-accent' : 'text-white';

  return (
    <nav className={navClasses}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <Link to="/" className="flex items-center leading-none">
            <span className="font-logo text-3xl md:text-4xl tracking-tight">NutraCore!</span>
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={`font-navbar transition-colors ${location.pathname === link.href ? linkActiveClasses : linkIdleClasses}`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center space-x-4">
            {!isAuthenticated ? (
              <>
                <Link to="/login">
                  <Button variant="ghost" className={loginButtonClasses}>
                    Iniciar Sesión
                  </Button>
                </Link>
                <Link to="/register">
                  <Button className={registerButtonClasses}>Registrarse</Button>
                </Link>
              </>
            ) : (
              <Button variant="ghost" className={loginButtonClasses} onClick={logout}>
                Cerrar sesión
              </Button>
            )}
          </div>

          <button className="md:hidden p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className={`w-6 h-6 ${mobileIconColor}`} /> : <Menu className={`w-6 h-6 ${mobileIconColor}`} />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className={mobileMenuClasses}>
          <div className="px-4 py-4 space-y-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={`block py-2 font-navbar ${
                  location.pathname === link.href
                    ? hasScrolled
                      ? 'text-pink-accent font-semibold'
                      : 'text-white font-semibold'
                    : hasScrolled
                    ? 'text-pink-accent/90'
                    : 'text-white/90'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.name}
              </Link>
            ))}
            <div className={`pt-4 space-y-2 ${hasScrolled ? 'border-t border-pink-accent/20' : 'border-t border-white/20'}`}>
              {!isAuthenticated ? (
                <>
                  <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="ghost" className={`w-full ${loginButtonClasses}`}>
                      Iniciar Sesión
                    </Button>
                  </Link>
                  <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                    <Button className={`w-full ${registerButtonClasses}`}>Registrarse</Button>
                  </Link>
                </>
              ) : (
                <Button
                  variant="ghost"
                  className={`w-full ${loginButtonClasses}`}
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                >
                  Cerrar sesión
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
