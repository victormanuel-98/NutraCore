import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import { Home, Search } from "lucide-react";

export function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-white flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="mb-8">
          <h1 className="font-logo text-8xl text-pink-accent mb-4">404</h1>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Pgina no encontrada
          </h2>
          <p className="text-gray-600 text-lg">
            Lo sentimos, la pgina qué buscas no existe o ha sido movida.
          </p>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
          <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-10 h-10 text-gray-400" />
          </div>
          
          <p className="text-gray-600 mb-6">
            Quizás estabas buscando alguna de estas páginas
          </p>

          <div className="space-y-3">
            <Link to="/" className="block">
              <Button className="w-full bg-pink-accent hover:bg-pink-accent/90 text-white">
                <Home className="w-4 h-4 mr-2" />
                Volver al Inicio
              </Button>
            </Link>
            
            <Link to="/catalog" className="block">
              <Button variant="outline" className="w-full">
                Explorar Catálogo
              </Button>
            </Link>

            <Link to="/lab" className="block">
              <Button variant="outline" className="w-full">
                NutraCore Lab
              </Button>
            </Link>
          </div>
        </div>

        <p className="text-sm text-gray-500 mt-6">
          Si crees qué está es un error, por favor{" "}
          <a href="#" className="text-pink-accent hover:underline">
            contctanos
          </a>
        </p>
      </div>
    </div>
  );
}



