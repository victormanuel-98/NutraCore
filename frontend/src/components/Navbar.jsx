import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Sun, Moon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from './ui/button';
import { useAuth } from '../context/AuthContext';
import { LogoutModal } from './LogoutModal';
import { useNotification } from '../context/NotificationContext';
import { useTheme } from '../context/ThemeContext';

export function Navbar() {
  const { showNotification } = useNotification();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const { isAuthenticated, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();

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
      <div className="w-full px-4 sm:px-8 lg:px-12">
        <div className="grid grid-cols-[1fr_auto_1fr] items-center h-20 gap-4">
          {/* Lado Izquierdo: Logo */}
          <div className="flex justify-start">
            <Link to="/" className="flex items-center leading-none">
              <span className="font-logo text-3xl md:text-[2.7rem] tracking-tight whitespace-nowrap">NutraCore!</span>
            </Link>
          </div>

          {/* Centro: Navegación */}
          <div className="hidden md:flex justify-center items-center">
            <div className="flex items-center space-x-8 lg:space-x-12">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className={`font-navbar text-lg whitespace-nowrap transition-colors ${location.pathname === link.href ? linkActiveClasses : linkIdleClasses}`}
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Lado Derecho: Botones y Menú Móvil */}
          <div className="flex justify-end items-center">
            <div className="hidden md:flex items-center space-x-6 whitespace-nowrap">
              {!isAuthenticated ? (
                <>
                  <Link to="/login">
                    <Button variant="ghost" className={`${loginButtonClasses} text-lg px-4`}>
                      Iniciar Sesión
                    </Button>
                  </Link>
                  <Link to="/register">
                    <Button className={`${registerButtonClasses} px-8 h-12 text-lg`}>Registrarse</Button>
                  </Link>
                </>
              ) : (
                <Button variant="ghost" className={`${loginButtonClasses} text-lg px-4`} onClick={() => setIsLogoutModalOpen(true)}>
                  Cerrar sesión
                </Button>
              )}
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className={`${loginButtonClasses} ml-4 hidden md:flex`}
              aria-label="Cambiar tema"
            >
              {isDark ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
            </Button>

            <div className="md:hidden flex items-center">
              <button className="p-2 mr-1" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                {mobileMenuOpen ? <X className={`w-6 h-6 ${mobileIconColor}`} /> : <Menu className={`w-6 h-6 ${mobileIconColor}`} />}
              </button>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className={loginButtonClasses}
                aria-label="Cambiar tema"
              >
                {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className={`${mobileMenuClasses} mobile-menu-animate`}>
          <div className="px-4 py-4 space-y-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={`block py-2 font-navbar text-base ${
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
                    setIsLogoutModalOpen(true);
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

      <LogoutModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={() => {
          logout();
          setIsLogoutModalOpen(false);
          showNotification('Sesión cerrada correctamente', 'info');
        }}
      />
    </nav>
  );
}
