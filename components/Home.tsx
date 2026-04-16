import { Link } from "react-router";
import { Navbar } from "./Navbar";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { 
  Utensils, 
  Calculator, 
  Target, 
  TrendingUp, 
  BookOpen, 
  Heart,
  Zap,
  Award,
  Users,
  ArrowRight
} from "lucide-react";

export function Home() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="font-logo text-5xl sm:text-6xl lg:text-7xl">
                  <span className="text-gray-900">Nutra</span>
                  <span className="text-pink-accent">Core</span>
                </h1>
                <p className="font-slogan text-xl sm:text-2xl text-gray-600 uppercase tracking-wide">
                  Nutrición Inteligente para tu Vida
                </p>
              </div>
              
              <p className="text-lg text-gray-600 leading-relaxed">
                Transforma tu alimentación con tecnología. NutraCore te ayuda a optimizar 
                tu dieta, alcanzar tus objetivos y mejorar tu rendimiento físico con 
                herramientas inteligentes y personalizadas.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/register">
                  <Button 
                    size="lg" 
                    className="bg-pink-accent hover:bg-pink-accent/90 text-white px-8 py-6 text-lg w-full sm:w-auto"
                  >
                    Comenzar Ahora
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <Link to="/catalog">
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="border-2 border-gray-900 hover:bg-gray-50 px-8 py-6 text-lg w-full sm:w-auto"
                  >
                    Explorar Catálogo
                  </Button>
                </Link>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 pt-8">
                <div className="text-center">
                  <p className="text-3xl font-bold text-pink-accent">500+</p>
                  <p className="text-sm text-gray-600 mt-1">Recetas</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-pink-accent">10K+</p>
                  <p className="text-sm text-gray-600 mt-1">Usuarios</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-pink-accent">98%</p>
                  <p className="text-sm text-gray-600 mt-1">Satisfacción</p>
                </div>
              </div>
            </div>

            {/* Right Image */}
            <div className="relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <img 
                  src="https://images.unsplash.com/photo-1638328740227-1c4b1627614d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoZWFsdGh5JTIwZm9vZCUyMG51dHJpdGlvbiUyMGNvbG9yZnVsfGVufDF8fHx8MTc3NjI0MjYzN3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                  alt="Healthy nutrition"
                  className="w-full h-[500px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              </div>
              {/* Floating Card */}
              <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-xl shadow-xl border border-gray-100">
                <div className="flex items-center gap-4">
                  <div className="bg-pink-accent/10 p-3 rounded-lg">
                    <Heart className="w-6 h-6 text-pink-accent" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Calorías Hoy</p>
                    <p className="text-2xl font-bold text-gray-900">1,847</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Todo lo que necesitas para optimizar tu nutrición
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Herramientas inteligentes diseñadas para hacer tu alimentación más eficiente
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <Card className="p-8 hover:shadow-lg transition-shadow border-2 hover:border-pink-accent/20">
              <div className="bg-pink-accent/10 w-14 h-14 rounded-lg flex items-center justify-center mb-6">
                <Utensils className="w-7 h-7 text-pink-accent" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Catálogo de Platos</h3>
              <p className="text-gray-600 leading-relaxed">
                Explora más de 500 recetas saludables con información nutricional completa 
                y detallada de cada ingrediente.
              </p>
            </Card>

            {/* Feature 2 */}
            <Card className="p-8 hover:shadow-lg transition-shadow border-2 hover:border-pink-accent/20">
              <div className="bg-pink-accent/10 w-14 h-14 rounded-lg flex items-center justify-center mb-6">
                <Calculator className="w-7 h-7 text-pink-accent" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">NutraCore Lab</h3>
              <p className="text-gray-600 leading-relaxed">
                Crea tus propias recetas y calcula automáticamente calorías, macros y 
                micronutrientes en tiempo real.
              </p>
            </Card>

            {/* Feature 3 */}
            <Card className="p-8 hover:shadow-lg transition-shadow border-2 hover:border-pink-accent/20">
              <div className="bg-pink-accent/10 w-14 h-14 rounded-lg flex items-center justify-center mb-6">
                <Target className="w-7 h-7 text-pink-accent" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Objetivos Personalizados</h3>
              <p className="text-gray-600 leading-relaxed">
                Define y alcanza tus metas nutricionales con seguimiento personalizado 
                y recomendaciones adaptadas a ti.
              </p>
            </Card>

            {/* Feature 4 */}
            <Card className="p-8 hover:shadow-lg transition-shadow border-2 hover:border-pink-accent/20">
              <div className="bg-pink-accent/10 w-14 h-14 rounded-lg flex items-center justify-center mb-6">
                <TrendingUp className="w-7 h-7 text-pink-accent" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Análisis y Estadísticas</h3>
              <p className="text-gray-600 leading-relaxed">
                Visualiza tu progreso con gráficos interactivos y estadísticas detalladas 
                de tu alimentación diaria.
              </p>
            </Card>

            {/* Feature 5 */}
            <Card className="p-8 hover:shadow-lg transition-shadow border-2 hover:border-pink-accent/20">
              <div className="bg-pink-accent/10 w-14 h-14 rounded-lg flex items-center justify-center mb-6">
                <BookOpen className="w-7 h-7 text-pink-accent" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Contenido Educativo</h3>
              <p className="text-gray-600 leading-relaxed">
                Accede a artículos, noticias y guías sobre nutrición, fitness y bienestar 
                respaldados por evidencia científica.
              </p>
            </Card>

            {/* Feature 6 */}
            <Card className="p-8 hover:shadow-lg transition-shadow border-2 hover:border-pink-accent/20">
              <div className="bg-pink-accent/10 w-14 h-14 rounded-lg flex items-center justify-center mb-6">
                <Heart className="w-7 h-7 text-pink-accent" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Sistema de Favoritos</h3>
              <p className="text-gray-600 leading-relaxed">
                Guarda tus recetas favoritas y crea colecciones personalizadas para 
                acceder rápidamente a tus platos preferidos.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Cómo funciona NutraCore
            </h2>
            <p className="text-xl text-gray-600">
              Solo tres pasos para transformar tu alimentación
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            {/* Step 1 */}
            <div className="text-center">
              <div className="bg-pink-accent w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-white text-2xl font-bold">1</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Regístrate Gratis</h3>
              <p className="text-gray-600 leading-relaxed">
                Crea tu cuenta en segundos y configura tu perfil con tus objetivos 
                y preferencias nutricionales.
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="bg-pink-accent w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-white text-2xl font-bold">2</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Explora y Planifica</h3>
              <p className="text-gray-600 leading-relaxed">
                Descubre recetas, crea tus propios platos en el Lab y planifica tu 
                alimentación semanal.
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="bg-pink-accent w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-white text-2xl font-bold">3</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Alcanza tus Metas</h3>
              <p className="text-gray-600 leading-relaxed">
                Sigue tu progreso, ajusta tu plan y logra tus objetivos con el 
                soporte de nuestra plataforma.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Image */}
            <div className="rounded-2xl overflow-hidden shadow-2xl">
              <img 
                src="https://images.unsplash.com/photo-1666979290238-2d862b573345?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmaXRuZXNzJTIwd29ya291dCUyMGd5bSUyMGVuZXJneXxlbnwxfHx8fDE3NzYyNTIyMDV8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                alt="Fitness and energy"
                className="w-full h-[500px] object-cover"
              />
            </div>

            {/* Content */}
            <div className="space-y-8 text-white">
              <h2 className="text-4xl font-bold">
                Potencia tu rendimiento con nutrición optimizada
              </h2>
              
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="bg-pink-accent/20 p-3 rounded-lg h-fit">
                    <Zap className="w-6 h-6 text-pink-accent" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">Más Energía</h3>
                    <p className="text-gray-300">
                      Optimiza tu alimentación para mantener niveles de energía constantes 
                      durante todo el día.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="bg-pink-accent/20 p-3 rounded-lg h-fit">
                    <Award className="w-6 h-6 text-pink-accent" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">Mejor Rendimiento</h3>
                    <p className="text-gray-300">
                      Alcanza tus objetivos deportivos con planes nutricionales diseñados 
                      para tu actividad física.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="bg-pink-accent/20 p-3 rounded-lg h-fit">
                    <Users className="w-6 h-6 text-pink-accent" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">Comunidad Activa</h3>
                    <p className="text-gray-300">
                      Únete a miles de usuarios que ya están transformando su vida con 
                      NutraCore.
                    </p>
                  </div>
                </div>
              </div>

              <Link to="/register">
                <Button 
                  size="lg" 
                  className="bg-pink-accent hover:bg-pink-accent/90 text-white px-8 py-6 text-lg"
                >
                  Únete Ahora Gratis
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-pink-50 to-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
            ¿Listo para transformar tu alimentación?
          </h2>
          <p className="text-xl text-gray-600 mb-10 leading-relaxed">
            Únete a NutraCore hoy y comienza tu viaje hacia una nutrición inteligente 
            y un estilo de vida más saludable.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register">
              <Button 
                size="lg" 
                className="bg-pink-accent hover:bg-pink-accent/90 text-white px-10 py-6 text-lg w-full sm:w-auto"
              >
                Comenzar Gratis
              </Button>
            </Link>
            <Link to="/lab">
              <Button 
                size="lg" 
                variant="outline" 
                className="border-2 border-gray-900 hover:bg-gray-50 px-10 py-6 text-lg w-full sm:w-auto"
              >
                Probar NutraCore Lab
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-logo text-2xl text-pink-accent mb-4">NutraCore</h3>
              <p className="text-gray-400 text-sm">
                Nutrición inteligente para optimizar tu vida.
              </p>
            </div>
            
            <div>
              <h4 className="font-bold mb-4">Plataforma</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link to="/catalog" className="hover:text-pink-accent transition-colors">Catálogo</Link></li>
                <li><Link to="/lab" className="hover:text-pink-accent transition-colors">NutraCore Lab</Link></li>
                <li><Link to="/news" className="hover:text-pink-accent transition-colors">Noticias</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4">Cuenta</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link to="/register" className="hover:text-pink-accent transition-colors">Registrarse</Link></li>
                <li><Link to="/login" className="hover:text-pink-accent transition-colors">Iniciar Sesión</Link></li>
                <li><Link to="/profile" className="hover:text-pink-accent transition-colors">Perfil</Link></li>
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
            <p>© 2026 NutraCore. Todos los derechos reservados. Proyecto TFG Educativo.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
