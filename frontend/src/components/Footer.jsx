import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <h3 className="font-logo text-4xl text-white leading-none">NutraCore!</h3>
            </div>
            <p className="text-gray-400 text-sm">
              Nutrición inteligente para optimizar tu vida.
            </p>
          </div>

          <div>
            <h4 className="font-bold mb-4">Plataforma</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <Link to="/catalog" className="hover:text-pink-accent transition-colors">
                  Catálogo
                </Link>
              </li>
              <li>
                <Link to="/lab" className="hover:text-pink-accent transition-colors">
                  NutraCore Lab
                </Link>
              </li>
              <li>
                <Link to="/news" className="hover:text-pink-accent transition-colors">
                  Noticias
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4">Cuenta</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <Link to="/register" className="hover:text-pink-accent transition-colors">
                  Registrarse
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-pink-accent transition-colors">
                  Iniciar Sesión
                </Link>
              </li>
              <li>
                <Link to="/profile" className="hover:text-pink-accent transition-colors">
                  Perfil
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="#" className="hover:text-pink-accent transition-colors">Privacidad</a></li>
              <li><a href="#" className="hover:text-pink-accent transition-colors">Términos</a></li>
              <li><a href="#" className="hover:text-pink-accent transition-colors">Cookies</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8 text-center text-sm text-gray-400">
          <p>© 2026 NutraCore. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
