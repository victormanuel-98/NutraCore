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
  const { isAuthenticated, logout, user } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const isAdmin = user?.role === 'admin';

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
        { name: 'Perfil', href: '/profile' },
        ...(isAdmin ? [{ name: 'Admin', href: '/admin/dashboard' }] : [])
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
    ? 'text-pink-accent hover:text-pink-accent hover:bg-pink-accent/10 active:bg-pink-accent/15'
    : 'text-white hover:text-white hover:bg-white/10 active:bg-white/15';

  const registerButtonClasses = 'hover:!opacity-100';

  const mobileMenuClasses = hasScrolled
    ? 'md:hidden bg-white border-t border-pink-accent/20'
    : 'md:hidden bg-pink-accent border-t border-white/20';

  const mobileIconColor = hasScrolled ? 'text-pink-accent' : 'text-white';

  return (
    <nav className={navClasses}>
      <div className="w-full px-3 sm:px-6 lg:px-12">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] md:grid-cols-[1fr_auto_1fr] items-center min-h-20 gap-3 sm:gap-4">
          <div className="flex justify-start">
            <Link to="/" className="flex min-w-0 items-center leading-none">
              <span className="font-logo text-[2rem] sm:text-[2.35rem] md:text-[2.7rem] tracking-tight whitespace-nowrap">NutraCore!</span>
            </Link>
          </div>

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

          <div className="flex justify-end items-center min-w-0">
            <div className="hidden md:flex items-center space-x-6 whitespace-nowrap">
              {!isAuthenticated ? (
                <>
                  <Link to="/login">
                    <Button variant="ghost" className={`${loginButtonClasses} text-lg px-4`}>
                      Iniciar sesión
                    </Button>
                  </Link>
                  <Link to="/register">
                    <Button
                      variant="ghost"
                      className={`${registerButtonClasses} px-8 h-12 text-lg font-semibold`}
                      style={{
                        backgroundColor: hasScrolled ? 'var(--pink-accent)' : '#ffffff',
                        color: hasScrolled ? '#ffffff' : 'var(--pink-accent)',
                        border: '2px solid',
                        borderColor: hasScrolled ? 'transparent' : '#ffffff',
                        boxSizing: 'border-box',
                        minWidth: '170px',
                        opacity: 1,
                        textShadow: '0 0 0 currentColor'
                      }}
                    >
                      Registrarse
                    </Button>
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

            <div className="md:hidden flex items-center justify-end w-full">
              <button
                className="p-2 shrink-0"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label={mobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
              >
                {mobileMenuOpen ? <X className={`w-6 h-6 ${mobileIconColor}`} /> : <Menu className={`w-6 h-6 ${mobileIconColor}`} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className={`${mobileMenuClasses} mobile-menu-animate`}>
          <div className="mobile-menu-panel px-4 py-4 space-y-4">
            <div className="mobile-menu-links-grid">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className={`mobile-menu-link-card ${
                    location.pathname === link.href
                      ? hasScrolled
                        ? 'mobile-menu-link-card-active-light'
                        : 'mobile-menu-link-card-active-dark'
                      : hasScrolled
                      ? 'mobile-menu-link-card-idle-light'
                      : 'mobile-menu-link-card-idle-dark'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span className="mobile-menu-link-label">{link.name}</span>
                </Link>
              ))}
            </div>
            <div className={`mobile-theme-row ${hasScrolled ? 'border-pink-accent/20' : 'border-white/20'}`}>
              <span className={hasScrolled ? 'text-pink-accent/90' : 'text-white/90'}>Modo visual</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleTheme}
                className={`mobile-theme-toggle ${loginButtonClasses}`}
                aria-label="Cambiar tema"
              >
                {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                <span>{isDark ? 'Modo claro' : 'Modo oscuro'}</span>
              </Button>
            </div>
            <div className={`pt-4 space-y-2 ${hasScrolled ? 'border-t border-pink-accent/20' : 'border-t border-white/20'}`}>
              {!isAuthenticated ? (
                <>
                  <Link className="block" to="/login" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="ghost" className={`mobile-auth-btn w-full justify-center ${loginButtonClasses}`}>
                      Iniciar sesión
                    </Button>
                  </Link>
                  <Link className="block pt-1.5" to="/register" onClick={() => setMobileMenuOpen(false)}>
                    <Button
                      variant="ghost"
                      className={`mobile-auth-btn w-full justify-center ${registerButtonClasses} font-semibold`}
                      style={{
                        backgroundColor: hasScrolled ? 'var(--pink-accent)' : '#ffffff',
                        color: hasScrolled ? '#ffffff' : 'var(--pink-accent)',
                        border: '2px solid',
                        borderColor: hasScrolled ? 'transparent' : '#ffffff',
                        boxSizing: 'border-box',
                        opacity: 1,
                        textShadow: '0 0 0 currentColor'
                      }}
                    >
                      Registrarse
                    </Button>
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
