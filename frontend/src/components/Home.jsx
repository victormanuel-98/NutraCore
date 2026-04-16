import { Link } from "react-router-dom";
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
  ArrowRight,
} from "lucide-react";

export function Home() {
  return (
    <div className="min-h-screen bg-white">`r`n
      <section className="pt-20 pb-0">
        <div className="w-full">
          <div className="relative bg-pink-accent border-t border-white/40 overflow-hidden">
            <div className="lg:hidden">
              <div className="p-8 text-white space-y-6">
                <h1 className="text-5xl leading-none">
                  <span className="block">¡Bienvenido</span>
                  <span className="block">a NutraCore!</span>
                </h1>
                <p className="font-slogan text-base leading-relaxed text-white/90">
                  Redefinimos la forma en la que entiendes la nutrición. Con un enfoque basado en datos,
                  rendimiento y eficiencia, convertimos tu alimentación en un sistema optimizado para tu día a día.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link to="/register">
                    <Button className="bg-white hover:bg-white/90 text-pink-accent w-full sm:w-auto">
                      ÚNETE AHORA
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </Link>
                  <Link to="/catalog">
                    <Button variant="ghost" className="border border-white/70 text-white hover:bg-white/10 w-full sm:w-auto">
                      Ver Platos
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="h-[300px]">
                <img
                  src="/images/home/Batido-de-frutos-rojos.jpg"
                  alt="Batido de frutos rojos"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            <div className="hidden lg:grid lg:grid-cols-[minmax(0,1fr)_240px] lg:h-[calc(100vh-80px)] lg:max-h-[620px]">
              <div className="relative h-full">
                <img
                  src="/images/home/Batido-de-frutos-rojos.jpg"
                  alt="Batido de frutos rojos"
                  className="absolute top-0 right-0 h-full w-[64%] object-cover object-right-bottom"
                />

                <div
                  className="absolute inset-y-0 left-0 w-[78%] bg-pink-accent"
                  style={{ clipPath: "polygon(0 0, 68% 0, 100% 100%, 0 100%)" }}
                />

                <div className="relative z-10 px-8 py-8 xl:px-10 xl:py-10 text-white max-w-[500px]">
                  <h1 className="text-4xl xl:text-5xl leading-[0.95]">
                    ¡Bienvenido
                    <br />
                    a NutraCore!
                  </h1>

                  <p className="mt-5 font-slogan text-lg xl:text-xl leading-relaxed text-white/92">
                    Redefinimos la forma en la que entiendes la nutrición. Con un enfoque basado en datos,
                    rendimiento y eficiencia, convertimos tu alimentación en un sistema optimizado para tu día a día.
                  </p>

                  <div className="mt-6 flex gap-3">
                    <Link to="/register">
                      <Button className="bg-white hover:bg-white/90 text-pink-accent px-6 py-4 text-sm">
                        ÚNETE AHORA
                        <ArrowRight className="ml-2 w-4 h-4" />
                      </Button>
                    </Link>
                    <Link to="/catalog">
                      <Button variant="ghost" className="border border-white/70 text-white hover:bg-white/10 px-6 py-4 text-sm">
                        Ver Platos
                      </Button>
                    </Link>
                  </div>

                  <div className="mt-6 grid grid-cols-3 gap-6">
                    <div>
                      <p className="text-2xl font-bold">500+</p>
                      <p className="text-sm text-white/80">Recetas</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold">10K+</p>
                      <p className="text-sm text-white/80">Usuarios</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold">98%</p>
                      <p className="text-sm text-white/80">Satisfacción</p>
                    </div>
                  </div>
                </div>
              </div>

              <aside className="bg-pink-accent border-l border-white/20 h-full flex items-center justify-center">
                <img
                  src="/images/logos/PanelLateral.png"
                  alt="Panel lateral"
                  className="w-[72%] h-auto max-h-[92%] object-contain"
                />
              </aside>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Todo lo que necesitas para optimizar tu nutrición</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Herramientas inteligentes diseñadas para hacer tu alimentación más eficiente
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="p-8 hover:shadow-lg transition-shadow border-2 hover:border-pink-accent/20">
              <div className="bg-pink-accent/10 w-14 h-14 rounded-lg flex items-center justify-center mb-6">
                <Utensils className="w-7 h-7 text-pink-accent" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Catálogo de Platos</h3>
              <p className="text-gray-600 leading-relaxed">
                Explora más de 500 recetas saludables con información nutricional completa y detallada de cada ingrediente.
              </p>
            </Card>

            <Card className="p-8 hover:shadow-lg transition-shadow border-2 hover:border-pink-accent/20">
              <div className="bg-pink-accent/10 w-14 h-14 rounded-lg flex items-center justify-center mb-6">
                <Calculator className="w-7 h-7 text-pink-accent" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">NutraCore Lab</h3>
              <p className="text-gray-600 leading-relaxed">
                Crea tus propias recetas y calcula automáticamente calorías, macros y micronutrientes en tiempo real.
              </p>
            </Card>

            <Card className="p-8 hover:shadow-lg transition-shadow border-2 hover:border-pink-accent/20">
              <div className="bg-pink-accent/10 w-14 h-14 rounded-lg flex items-center justify-center mb-6">
                <Target className="w-7 h-7 text-pink-accent" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Objetivos Personalizados</h3>
              <p className="text-gray-600 leading-relaxed">
                Define y alcanza tus metas nutricionales con seguimiento personalizado y recomendaciones adaptadas a ti.
              </p>
            </Card>

            <Card className="p-8 hover:shadow-lg transition-shadow border-2 hover:border-pink-accent/20">
              <div className="bg-pink-accent/10 w-14 h-14 rounded-lg flex items-center justify-center mb-6">
                <TrendingUp className="w-7 h-7 text-pink-accent" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Análisis y Estadísticas</h3>
              <p className="text-gray-600 leading-relaxed">
                Visualiza tu progreso con gráficos interactivos y estadísticas detalladas de tu alimentación diaria.
              </p>
            </Card>

            <Card className="p-8 hover:shadow-lg transition-shadow border-2 hover:border-pink-accent/20">
              <div className="bg-pink-accent/10 w-14 h-14 rounded-lg flex items-center justify-center mb-6">
                <BookOpen className="w-7 h-7 text-pink-accent" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Contenido Educativo</h3>
              <p className="text-gray-600 leading-relaxed">
                Accede a artículos, noticias y guías sobre nutrición, fitness y bienestar respaldados por evidencia científica.
              </p>
            </Card>

            <Card className="p-8 hover:shadow-lg transition-shadow border-2 hover:border-pink-accent/20">
              <div className="bg-pink-accent/10 w-14 h-14 rounded-lg flex items-center justify-center mb-6">
                <Heart className="w-7 h-7 text-pink-accent" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Sistema de Favoritos</h3>
              <p className="text-gray-600 leading-relaxed">
                Guarda tus recetas favoritas y crea colecciones personalizadas para acceder rápidamente a tus platos preferidos.
              </p>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Cómo funciona NutraCore</h2>
            <p className="text-xl text-gray-600">Solo tres pasos para transformar tu alimentación</p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="bg-pink-accent w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-white text-2xl font-bold">1</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Regístrate Gratis</h3>
              <p className="text-gray-600 leading-relaxed">
                Crea tu cuenta en segundos y configura tu perfil con tus objetivos y preferencias nutricionales.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-pink-accent w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-white text-2xl font-bold">2</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Explora y Planifica</h3>
              <p className="text-gray-600 leading-relaxed">
                Descubre recetas, crea tus propios platos en el Lab y planifica tu alimentación semanal.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-pink-accent w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-white text-2xl font-bold">3</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Alcanza tus Metas</h3>
              <p className="text-gray-600 leading-relaxed">
                Sigue tu progreso, ajusta tu plan y logra tus objetivos con el soporte de nuestra plataforma.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="rounded-2xl overflow-hidden shadow-2xl">
              <img
                src="/images/home/hombreEnGym.jpg"
                alt="Entrenamiento en gimnasio"
                className="w-full h-[500px] object-cover"
              />
            </div>

            <div className="space-y-8 text-white">
              <h2 className="text-4xl font-bold">Potencia tu rendimiento con nutrición optimizada</h2>

              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="bg-pink-accent/20 p-3 rounded-lg h-fit">
                    <Zap className="w-6 h-6 text-pink-accent" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">Más Energía</h3>
                    <p className="text-gray-300">
                      Optimiza tu alimentación para mantener niveles de energía constantes durante todo el día.
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
                      Alcanza tus objetivos deportivos con planes nutricionales diseñados para tu actividad física.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="bg-pink-accent/20 p-3 rounded-lg h-fit">
                    <Users className="w-6 h-6 text-pink-accent" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">Comunidad Activa</h3>
                    <p className="text-gray-300">Únete a miles de usuarios que ya están transformando su vida con NutraCore.</p>
                  </div>
                </div>
              </div>

              <Link to="/register">
                <Button size="lg" className="bg-pink-accent hover:bg-pink-accent/90 text-white px-8 py-6 text-lg">
                  Únete Ahora Gratis
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-pink-50 to-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">¿Listo para transformar tu alimentación?</h2>
          <p className="text-xl text-gray-600 mb-10 leading-relaxed">
            Únete a NutraCore hoy y comienza tu viaje hacia una nutrición inteligente y un estilo de vida más saludable.
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
    </div>
  );
}


