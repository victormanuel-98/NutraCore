import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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
import { useAuth } from "../context/AuthContext";

function AnimatedHackCounter({ target, duration = 1700, formatValue }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let animationFrameId;
    const startTime = performance.now();

    const animate = (currentTime) => {
      const progress = Math.min((currentTime - startTime) / duration, 1);
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      const baseValue = Math.floor(target * easedProgress);
      const noiseAmplitude = Math.max(1, Math.floor(target * 0.07 * (1 - progress)));
      const noise = progress < 1 ? Math.floor((Math.random() * 2 - 1) * noiseAmplitude) : 0;
      const nextValue = Math.min(target, Math.max(0, baseValue + noise));

      setDisplayValue(nextValue);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animate);
      } else {
        setDisplayValue(target);
      }
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [target, duration]);

  const text = formatValue(displayValue);

  return (
    <span className="hack-counter" data-text={text}>
      {text}
    </span>
  );
}

export function Home() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return undefined;
    if (window.innerWidth < 1024) return undefined;

    const sections = Array.from(document.querySelectorAll("[data-home-snap='true']"));
    if (!sections.length) return undefined;

    let locked = false;

    const getCurrentIndex = () => {
      const markerY = window.scrollY + window.innerHeight * 0.32;
      for (let i = 0; i < sections.length; i += 1) {
        const section = sections[i];
        const top = section.offsetTop;
        const bottom = top + section.offsetHeight;
        if (markerY >= top && markerY < bottom) return i;
      }
      return Math.max(0, sections.length - 1);
    };

    const onWheel = (event) => {
      if (locked || Math.abs(event.deltaY) < 10) return;

      const currentIndex = getCurrentIndex();
      const direction = event.deltaY > 0 ? 1 : -1;
      const nextIndex = Math.min(sections.length - 1, Math.max(0, currentIndex + direction));

      if (nextIndex === currentIndex) return;

      event.preventDefault();
      locked = true;
      sections[nextIndex].scrollIntoView({ behavior: "smooth", block: "start" });

      window.setTimeout(() => {
        locked = false;
      }, 700);
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    return () => window.removeEventListener("wheel", onWheel);
  }, []);

  const handleIndexCardClick = (destination) => {
    if (destination.startsWith("#")) {
      const targetElement = document.querySelector(destination);
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: "smooth", block: "start" });
      }
      return;
    }

    navigate(destination);
  };

  const indexCards = [
    {
      icon: Utensils,
      title: "Catálogo de Platos",
      description:
        "Explora más de 500 recetas saludables con información nutricional completa y detallada de cada ingrediente.",
      destination: "/catalog"
    },
    {
      icon: Calculator,
      title: "NutraCore Lab",
      description:
        "Crea tus propias recetas y calcula automáticamente calorías, macros y micronutrientes en tiempo real.",
      destination: isAuthenticated ? "/lab" : "/login"
    },
    {
      icon: Target,
      title: "Objetivos Personalizados",
      description:
        "Define y alcanza tus metas nutricionales con seguimiento personalizado y recomendaciones adaptadas a ti.",
      destination: "#como-funciona"
    },
    {
      icon: BookOpen,
      title: "Contenido Educativo",
      description: "Accede a artículos, noticias y guías sobre nutrición, fitness y bienestar respaldados por evidencia científica.",
      destination: "/news"
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <section data-home-snap="true" className="pt-[80px] pb-0 home-snap-section">
        <div className="w-full">
          <div className="relative bg-pink-accent border-t border-white/40 overflow-hidden">
            <div className="lg:hidden">
              <div className="p-8 text-white space-y-6">
                <h1 className="text-5xl leading-none">
                  <span className="block">¡Bienvenido a</span>
                  <span className="block">NutraCore!</span>
                </h1>
                <p className="font-slogan text-base leading-relaxed text-white/90">
                  Redefinimos la forma en la que entiendes la nutrición. Con un enfoque basado en datos,
                  rendimiento y eficiencia, convertimos tu alimentación en un sistema optimizado para tu día a día.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link to="/register">
                    <Button className="bg-white hover:bg-white/90 text-pink-accent w-full sm:w-[190px] justify-center text-center">
                      ¡ÚNETE!
                    </Button>
                  </Link>
                  <Link to="/catalog">
                    <Button variant="ghost" className="border border-white/70 text-white hover:bg-white/10 w-full sm:w-[190px] justify-center text-center">
                      PLATOS
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

            <div className="hidden lg:grid lg:grid-cols-[minmax(0,1fr)_clamp(220px,14vw,320px)] lg:min-h-[calc(100svh-80px)]">
              <div className="relative h-full">
                <img
                  src="/images/home/Batido-de-frutos-rojos.jpg"
                  alt="Batido de frutos rojos"
                  className="absolute top-0 right-0 h-full w-[63%] xl:w-[64%] 2xl:w-[66%] object-cover object-right-bottom"
                />

                <div
                  className="absolute inset-y-0 left-0 w-[79%] xl:w-[78%] bg-pink-accent"
                  style={{ clipPath: "polygon(0 0, 68% 0, 100% 100%, 0 100%)" }}
                />

                <div
                  className="relative z-10 h-full flex flex-col justify-start pt-8 pb-6 pr-10 text-white max-w-[clamp(430px,32vw,650px)]"
                  style={{ paddingLeft: "max(2rem, calc((100vw - 80rem) / 2 + 2rem))" }}
                >
                  <h1 className="text-[clamp(2.8rem,3.4vw,4.2rem)] leading-[0.9]">
                    ¡Bienvenido a
                    <br />
                    NutraCore!
                  </h1>

                  <p className="mt-4 font-slogan text-[clamp(1rem,1.05vw,1.3rem)] leading-relaxed text-white/92 max-w-[33ch]">
                    Redefinimos la forma en la que entiendes la nutrición. Con un enfoque basado en datos,
                    rendimiento y eficiencia, convertimos tu alimentación en un sistema optimizado para tu día a día.
                  </p>

                  <div className="mt-5 flex gap-3">
                    <Link to="/register">
                      <Button className="bg-white hover:bg-white/90 text-pink-accent w-[170px] px-4 py-4 text-sm justify-center text-center">
                        ¡ÚNETE!
                      </Button>
                    </Link>
                    <Link to="/catalog">
                      <Button variant="ghost" className="border border-white/70 text-white hover:bg-white/10 w-[170px] px-4 py-4 text-sm justify-center text-center">
                        PLATOS
                      </Button>
                    </Link>
                  </div>

                  <div className="mt-5 grid grid-cols-3 gap-5 max-w-[400px]">
                    <div className="metric-tile">
                      <p className="text-[clamp(1.55rem,1.7vw,2rem)] font-bold leading-none">
                        <AnimatedHackCounter target={500} formatValue={(value) => `${value}+`} />
                      </p>
                      <p className="text-sm text-white/80">Recetas</p>
                    </div>
                    <div className="metric-tile">
                      <p className="text-[clamp(1.55rem,1.7vw,2rem)] font-bold leading-none">
                        <AnimatedHackCounter target={10} duration={1900} formatValue={(value) => `${value}K+`} />
                      </p>
                      <p className="text-sm text-white/80">Usuarios</p>
                    </div>
                    <div className="metric-tile">
                      <p className="text-[clamp(1.55rem,1.7vw,2rem)] font-bold leading-none">
                        <AnimatedHackCounter target={98} duration={1800} formatValue={(value) => `${value}%`} />
                      </p>
                      <p className="text-sm text-white/80">Satisfacción</p>
                    </div>
                  </div>
                </div>
              </div>

              <aside className="bg-pink-accent border-l border-white/20 h-full flex items-center justify-center">
                <img
                  src="/images/logos/PanelLateral.png"
                  alt="Panel lateral"
                  className="w-[73.5%] h-auto max-h-[92%] object-contain"
                />
              </aside>
            </div>
          </div>
        </div>
      </section>

      <section id="indice" data-home-snap="true" className="min-h-[calc(100svh-80px)] py-10 px-4 sm:px-6 lg:px-8 bg-gray-50 home-snap-section flex items-center">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8 reveal-item">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-3">Todo lo que necesitas para optimizar tu nutrición</h2>
            <p className="text-base lg:text-lg text-gray-600 max-w-3xl mx-auto">
              Herramientas inteligentes diseñadas para hacer tu alimentación más eficiente
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-5 lg:gap-6">
            {indexCards.map(({ icon: Icon, title, description, destination }) => (
              <button
                type="button"
                key={title}
                onClick={() => handleIndexCardClick(destination)}
                className="text-left"
              >
                <Card className="p-6 border-2 border-pink-accent/15 index-card-hover cursor-pointer h-full">
                  <div className="bg-pink-accent/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4 transition-colors">
                    <Icon className="w-6 h-6 text-pink-accent pixel-icon" strokeWidth={2.7} />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2 transition-colors">{title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed transition-colors">{description}</p>
                </Card>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section id="como-funciona" data-home-snap="true" className="py-20 px-4 sm:px-6 lg:px-8 home-snap-section">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 reveal-item">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Cómo funciona NutraCore</h2>
            <p className="text-xl text-gray-600">Solo tres pasos para transformar tu alimentación</p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            {[{
              step: "1",
              title: "Regístrate Gratis",
              text: "Crea tu cuenta en segundos y configura tu perfil con tus objetivos y preferencias nutricionales."
            }, {
              step: "2",
              title: "Explora y Planifica",
              text: "Descubre recetas, crea tus propios platos en el Lab y planifica tu alimentación semanal."
            }, {
              step: "3",
              title: "Alcanza tus Metas",
              text: "Sigue tu progreso, ajusta tu plan y logra tus objetivos con el soporte de nuestra plataforma."
            }].map((item) => (
              <div key={item.step} className="text-center reveal-item">
                <div className="hex-step bg-pink-accent w-16 h-16 flex items-center justify-center mx-auto mb-6">
                  <span className="text-white text-2xl font-bold">{item.step}</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
                <p className="text-gray-600 leading-relaxed">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section data-home-snap="true" className="py-10 px-4 sm:px-6 lg:px-8 bg-gray-900 home-snap-section lg:min-h-[calc(100svh-80px)] lg:flex lg:items-center">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1fr)] gap-7 lg:gap-9 items-start">
            <div className="rounded-2xl overflow-hidden shadow-2xl reveal-item">
              <img
                src="/images/home/hombreEnGym.jpg"
                alt="Entrenamiento en gimnasio"
                className="w-full h-[360px] lg:h-[390px] xl:h-[420px] object-cover"
              />
            </div>

            <div className="text-white reveal-item">
              <h2 className="text-2xl xl:text-[1.9rem] font-bold leading-tight max-w-[18ch]">Potencia tu rendimiento con nutrición optimizada</h2>

              <div className="mt-4 space-y-2.5">
                <div className="bg-white/5 border border-white/10 rounded-xl p-3">
                  <div className="flex gap-3 items-start">
                    <div className="bg-pink-accent/20 p-2.5 rounded-md h-fit">
                      <Zap className="w-5 h-5 text-pink-accent pixel-icon" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold mb-0.5">Más Energía</h3>
                      <p className="text-gray-300 text-[0.88rem] leading-relaxed">
                        Optimiza tu alimentación para mantener niveles de energía constantes durante todo el día.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-xl p-3">
                  <div className="flex gap-3 items-start">
                    <div className="bg-pink-accent/20 p-2.5 rounded-md h-fit">
                      <Award className="w-5 h-5 text-pink-accent pixel-icon" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold mb-0.5">Mejor Rendimiento</h3>
                      <p className="text-gray-300 text-[0.88rem] leading-relaxed">
                        Alcanza tus objetivos deportivos con planes nutricionales diseñados para tu actividad física.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-xl p-3">
                  <div className="flex gap-3 items-start">
                    <div className="bg-pink-accent/20 p-2.5 rounded-md h-fit">
                      <Users className="w-5 h-5 text-pink-accent pixel-icon" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold mb-0.5">Comunidad Activa</h3>
                      <p className="text-gray-300 text-[0.88rem] leading-relaxed">Únete a miles de usuarios que ya están transformando su vida con NutraCore.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-5">
                <Link to="/register">
                  <Button className="bg-pink-accent hover:bg-pink-accent/90 text-white px-6 py-3.5 text-base">
                    Únete Ahora Gratis
                    <ArrowRight className="ml-2 w-4 h-4 pixel-icon" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section data-home-snap="true" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-pink-50 to-white home-snap-section">
        <div className="max-w-4xl mx-auto text-center reveal-item">
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
