import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Utensils, Calculator, Target, BookOpen, Zap, Award, Users, ArrowRight } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { getCloudinaryStaticAsset } from "../config/cloudinaryStaticAssets";

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
    return () => cancelAnimationFrame(animationFrameId);
  }, [target, duration]);

  const text = formatValue(displayValue);
  return <span className="hack-counter" data-text={text}>{text}</span>;
}

export function Home() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const heroVideos = [
    getCloudinaryStaticAsset("/images/home/zumoFresa.mp4"),
    getCloudinaryStaticAsset("/images/home/zumokiwi.mp4"),
    getCloudinaryStaticAsset("/images/home/zumos.mp4")
  ];
  const [heroVideoIndex, setHeroVideoIndex] = useState(0);
  const [isDesktop, setIsDesktop] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth >= 1024 : false
  );
  const desktopVideoRef = useRef(null);

  const currentHeroVideo = heroVideos[heroVideoIndex];

  useEffect(() => {
    const onResize = () => setIsDesktop(window.innerWidth >= 1024);
    window.addEventListener("resize", onResize, { passive: true });
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    const activeVideo = isDesktop ? desktopVideoRef.current : null;
    if (!activeVideo) return;

    activeVideo.load();
    const playPromise = activeVideo.play();
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(() => {});
    }
  }, [heroVideoIndex, isDesktop]);

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
      title: "Catálogo",
      description: "Recetas saludables con datos nutricionales claros.",
      destination: "/catalog"
    },
    {
      icon: Calculator,
      title: "Lab",
      description: "Crea platos y calcula macros en tiempo real.",
      destination: isAuthenticated ? "/lab" : "/login"
    },
    {
      icon: Target,
      title: "Objetivos",
      description: "Define metas y sigue tu progreso nutricional.",
      destination: "#como-funciona"
    },
    {
      icon: BookOpen,
      title: "Noticias",
      description: "Lee contenido útil sobre nutrición y bienestar.",
      destination: "/news"
    }
  ];

  return (
    <div className="min-h-screen overflow-x-hidden bg-gray-50">
      <section data-home-snap="true" data-home-hero="true" className="home-snap-section pt-[80px] pb-0">
        <div className="w-full">
          <div className="relative overflow-hidden border-2 border-gray-900 bg-pink-accent shadow-[10px_10px_0px_0px_#ff0a60]">
            <div className="lg:hidden">
              <div className="space-y-5 px-5 py-8 text-center text-white sm:px-8 sm:py-10">
                <h1 className="mx-auto max-w-[9ch] text-[clamp(3rem,12vw,4.25rem)] leading-[0.96]">
                  ¡Bienvenido a NutraCore!
                </h1>
                <p className="font-slogan mx-auto max-w-[28rem] text-[0.92rem] leading-[1.75] text-white/92 sm:text-[0.98rem]">
                  Redefinimos la forma en la que entiendes la nutrición. Con un enfoque basado en datos,
                  rendimiento y eficiencia, convertimos tu alimentación en un sistema optimizado para tu día a día.
                </p>
              </div>
            </div>

            <div className="hidden lg:grid lg:min-h-[calc(100svh-80px)] lg:grid-cols-[1fr_clamp(220px,14vw,320px)] xl:min-h-[calc(100svh-80px)]">
              <div className="relative flex h-full items-center overflow-hidden">
                <div className="absolute inset-0 flex justify-end">
                  {isDesktop ? (
                    <video
                      ref={desktopVideoRef}
                      className="h-full w-[75%] object-cover object-center xl:w-[70%]"
                      autoPlay
                      muted
                      playsInline
                      preload="auto"
                      poster={getCloudinaryStaticAsset("/images/home/Batido-de-frutos-rojos.jpg")}
                      onEnded={() => setHeroVideoIndex((prev) => (prev + 1) % heroVideos.length)}
                      onError={() => setHeroVideoIndex((prev) => (prev + 1) % heroVideos.length)}
                    >
                      <source src={currentHeroVideo} type="video/mp4" />
                      Tu navegador no soporta video HTML5.
                    </video>
                  ) : null}
                </div>

                <div
                  className="absolute inset-y-0 left-0 w-full bg-pink-accent shadow-[20px_0_40px_rgba(0,0,0,0.1)]"
                  style={{ clipPath: "polygon(0 0, 48% 0, 70% 100%, 0 100%)" }}
                />

                <div className="relative z-10 w-full px-4 sm:px-8 lg:px-12">
                  <div className="max-w-[650px] py-12 text-white xl:max-w-[42rem]">
                    <h1 className="mb-8 font-logo text-[clamp(3rem,4.5vw,5.5rem)] leading-[1.02] drop-shadow-lg">
                      ¡Bienvenido a
                      <br />
                      <span className="text-white">NutraCore!</span>
                    </h1>

                    <p className="mb-10 max-w-[42ch] font-slogan text-[clamp(1.2rem,1.3vw,1.6rem)] leading-relaxed text-white/95 drop-shadow-md">
                      Redefinimos la forma en la que entiendes la nutrición. Con un enfoque basado en datos,
                      rendimiento y eficiencia, convertimos tu alimentación en un sistema optimizado.
                    </p>

                    <div className="mb-14 flex flex-wrap gap-5">
                      <Link to="/register">
                        <Button
                          className="!bg-white h-16 w-[200px] rounded-none border-2 border-gray-900 text-xl font-logo text-pink-accent shadow-[6px_6px_0px_0px_rgba(0,0,0,0.25)] transition-all hover:translate-y-[-2px] hover:!bg-white/90"
                          style={{ color: "var(--pink-accent)" }}
                        >
                          ¡ÚNETE!
                        </Button>
                      </Link>
                      <Link to="/catalog">
                        <Button variant="ghost" className="h-16 w-[200px] rounded-none border-2 border-white text-xl font-logo text-white transition-all hover:translate-y-[-2px] hover:bg-white/10">
                          PLATOS
                        </Button>
                      </Link>
                    </div>

                    <div className="grid grid-cols-1 gap-6 border-t border-white/30 pt-8 sm:grid-cols-3 sm:gap-8 lg:gap-10 lg:pt-10">
                      <div className="metric-tile">
                        <p className="mb-2 text-[clamp(1.8rem,2.2vw,2.8rem)] font-bold leading-none drop-shadow-sm">
                          <AnimatedHackCounter target={500} formatValue={(value) => `${value}+`} />
                        </p>
                        <p className="font-logo text-[0.7rem] uppercase tracking-[0.2em] text-white/80">Recetas</p>
                      </div>
                      <div className="metric-tile">
                        <p className="mb-2 text-[clamp(1.8rem,2.2vw,2.8rem)] font-bold leading-none drop-shadow-sm">
                          <AnimatedHackCounter target={10} duration={1900} formatValue={(value) => `${value}K+`} />
                        </p>
                        <p className="font-logo text-[0.7rem] uppercase tracking-[0.2em] text-white/80">Usuarios</p>
                      </div>
                      <div className="metric-tile">
                        <p className="mb-2 text-[clamp(1.8rem,2.2vw,2.8rem)] font-bold leading-none drop-shadow-sm">
                          <AnimatedHackCounter target={98} duration={1800} formatValue={(value) => `${value}%`} />
                        </p>
                        <p className="font-logo text-[0.7rem] uppercase tracking-[0.2em] text-white/80">Satisfacción</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <aside className="flex h-full items-center justify-center border-l-2 border-white/35 bg-pink-accent p-6">
                <img
                  src={getCloudinaryStaticAsset("/images/logos/PanelLateral.png")}
                  alt="Panel lateral"
                  className="h-auto max-h-[90%] w-full select-none object-contain"
                />
              </aside>
            </div>
          </div>
        </div>
      </section>

      <section id="indice" data-home-snap="true" className="home-snap-section flex items-start bg-gray-50 px-4 py-5 sm:px-6 sm:py-8 lg:items-center lg:px-8">
        <div className="mx-auto max-w-7xl">
          <Card className="home-index-mobile mb-4 p-4 text-center reveal-item bg-white border-2 border-pink-accent shadow-[8px_8px_0px_0px_#ff0a60] rounded-none sm:mb-6 sm:p-5 md:p-7">
            <h2 className="mb-2 text-xl font-bold text-gray-900 sm:text-2xl lg:text-4xl">Todo lo que necesitas</h2>
            <p className="mx-auto max-w-3xl text-xs text-gray-600 sm:text-sm lg:text-lg">
              Herramientas inteligentes diseñadas para hacer tu alimentación más eficiente.
            </p>
          </Card>

          <div className="home-index-grid grid grid-cols-2 gap-3 md:grid-cols-2 lg:gap-5">
            {indexCards.map(({ icon: Icon, title, description, destination }) => (
              <button
                type="button"
                key={title}
                onClick={() => handleIndexCardClick(destination)}
                className="home-index-grid__item text-left"
              >
                <Card className="home-index-card index-card-hover h-full cursor-pointer rounded-none border-2 border-pink-accent bg-white p-3 shadow-[5px_5px_0px_0px_#ff0a60] sm:p-4 md:p-5">
                  <div className="home-index-card__icon mb-2 flex h-8 w-8 items-center justify-center border border-pink-accent/40 bg-pink-accent/10 transition-colors sm:h-9 sm:w-9">
                    <Icon className="pixel-icon h-4 w-4 text-pink-accent sm:h-[18px] sm:w-[18px]" strokeWidth={2.5} />
                  </div>
                  <h3 className="home-index-card__title mb-1 text-sm font-bold text-gray-900 transition-colors sm:text-base">{title}</h3>
                  <p className="home-index-card__description text-[0.72rem] leading-relaxed text-gray-600 transition-colors sm:text-xs">{description}</p>
                </Card>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section id="como-funciona" data-home-snap="true" className="home-snap-section bg-gray-50 px-4 py-8 sm:px-6 lg:px-8 lg:py-16">
        <div className="mx-auto max-w-7xl">
          <Card className="mb-5 p-4 text-center reveal-item bg-white border-2 border-pink-accent shadow-[8px_8px_0px_0px_#ff0a60] rounded-none sm:mb-8 sm:p-6 md:p-8">
            <h2 className="mb-2 text-xl font-bold text-gray-900 sm:text-2xl lg:text-4xl">Cómo funciona NutraCore!</h2>
            <p className="text-xs text-gray-600 sm:text-sm lg:text-xl">Solo tres pasos para transformar tu alimentación.</p>
          </Card>

          <div className="grid gap-3 md:grid-cols-3 lg:gap-8 xl:gap-12">
            {[
              {
                step: "1",
                title: "Regístrate",
                text: "Crea tu cuenta y ajusta tus objetivos."
              },
              {
                step: "2",
                title: "Explora",
                text: "Descubre recetas y usa el Lab para planificar."
              },
              {
                step: "3",
                title: "Avanza",
                text: "Sigue tu progreso y ajusta tu estrategia."
              }
            ].map((item) => (
              <Card key={item.step} className="reveal-item rounded-none border-2 border-pink-accent bg-white p-4 text-center shadow-[5px_5px_0px_0px_#ff0a60] sm:p-5 md:p-6">
                <div className="hex-step mx-auto mb-4 flex h-12 w-12 items-center justify-center bg-pink-accent sm:h-14 sm:w-14">
                  <span className="text-lg font-bold text-white sm:text-xl">{item.step}</span>
                </div>
                <h3 className="mb-2 text-base font-bold text-gray-900 sm:text-lg">{item.title}</h3>
                <p className="text-[0.76rem] leading-relaxed text-gray-600 sm:text-sm">{item.text}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section data-home-snap="true" className="home-snap-section bg-[#0f172a] px-4 py-8 sm:px-6 lg:px-8 lg:py-14">
        <div className="mx-auto max-w-7xl">
          <Card
            className="rounded-none border-2 border-pink-accent p-4 !bg-[#0f172a] shadow-[10px_10px_0px_0px_#ff0a60] sm:p-5 lg:p-7"
            style={{ backgroundColor: "#0f172a" }}
          >
            <div className="grid items-start gap-4 bg-[#0f172a] lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1fr)] lg:gap-7">
              <div className="reveal-item overflow-hidden border-2 border-white/30">
                <img
                  src={getCloudinaryStaticAsset("/images/home/hombreEnGym.jpg")}
                  alt="Entrenamiento en gimnasio"
                  className="h-[180px] w-full object-cover sm:h-[220px] lg:h-[350px] xl:h-[390px]"
                />
              </div>

              <div className="reveal-item text-white">
                <h2 className="max-w-[24ch] text-lg font-bold leading-tight sm:text-xl xl:text-[1.8rem]">Potencia tu rendimiento con nutrición optimizada</h2>

                <div className="mt-3 space-y-2">
                  {[
                    {
                      icon: Zap,
                      title: "Más Energía",
                      text: "Mantén niveles de energía constantes durante el día."
                    },
                    {
                      icon: Award,
                      title: "Mejor Rendimiento",
                      text: "Adapta tu alimentación a tus objetivos físicos."
                    },
                    {
                      icon: Users,
                      title: "Comunidad Activa",
                      text: "Comparte avances con una comunidad enfocada."
                    }
                  ].map(({ icon: Icon, title, text }) => (
                    <div key={title} className="rounded-none border-2 border-white/20 bg-white/5 p-3">
                      <div className="flex items-start gap-3">
                        <div className="h-fit border border-pink-accent/40 bg-pink-accent/20 p-2">
                          <Icon className="pixel-icon h-4 w-4 text-pink-accent sm:h-5 sm:w-5" />
                        </div>
                        <div>
                          <h3 className="mb-0.5 text-sm font-bold sm:text-base">{title}</h3>
                          <p className="text-[0.78rem] leading-relaxed text-gray-300 sm:text-[0.88rem]">{text}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4">
                  <Link to="/register">
                    <Button className="rounded-none border-2 border-pink-accent bg-pink-accent px-5 py-3 text-sm text-white hover:bg-pink-accent/90 sm:px-6 sm:py-3.5 sm:text-base">
                      Únete Ahora Gratis
                      <ArrowRight className="ml-2 h-4 w-4 pixel-icon" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </section>

      <section data-home-snap="true" className="home-snap-section bg-gray-50 px-4 py-8 sm:px-6 lg:px-8 lg:py-16">
        <Card className="mx-auto max-w-4xl rounded-none border-2 border-pink-accent bg-white p-5 text-center reveal-item shadow-[10px_10px_0px_0px_#ff0a60] sm:p-7 md:p-10">
          <h2 className="mb-4 text-2xl font-bold text-gray-900 sm:text-3xl lg:text-5xl">¿Listo para transformar tu alimentación?</h2>
          <p className="mb-6 text-sm leading-relaxed text-gray-600 sm:text-base lg:text-xl">
            Únete a NutraCore hoy y comienza tu viaje hacia una nutrición inteligente y un estilo de vida más saludable.
          </p>
          <div className="flex flex-col justify-center gap-3 sm:flex-row sm:gap-4">
            <Link to="/register">
              <Button
                size="lg"
                className="!bg-pink-accent w-full rounded-none border-2 !border-pink-accent px-8 py-5 text-base !text-white hover:!bg-pink-accent/90 sm:w-auto sm:px-10 sm:py-6 sm:text-lg"
                style={{ backgroundColor: "var(--pink-accent)", color: "#ffffff" }}
              >
                Comenzar Gratis
              </Button>
            </Link>
            <Link to="/lab">
              <Button
                size="lg"
                variant="outline"
                className="w-full rounded-none border-2 border-gray-900 px-8 py-5 text-base hover:border-pink-accent hover:bg-pink-50 sm:w-auto sm:px-10 sm:py-6 sm:text-lg"
              >
                Probar NutraCore Lab
              </Button>
            </Link>
          </div>
        </Card>
      </section>
    </div>
  );
}
