import { useEffect, useState } from "react";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Clock, TrendingUp, BookOpen, Search, Calendar, ArrowRight, ImageOff } from "lucide-react";
import { getCloudinaryStaticAsset } from "../config/cloudinaryStaticAssets";

const newsArticles = [
  {
    id: 1,
    title: "Estas son las verduras que no pueden faltar en tu lista de la compra este mes",
    excerpt:
      "Las verduras de temporada no solo son más económicas y sostenibles, también aportan vitaminas, fibra y nutrientes esenciales para mantener una alimentación equilibrada. Descubre cuáles no deberían faltar en tu cocina esta primavera.",
    category: "Alimentación saludable",
    image: getCloudinaryStaticAsset("/images/news/news-1.jpg"),
    date: "8 de mayo de 2026",
    readTime: 4,
    isFeatured: true,
    intro:
      "Las verduras no deben reservarse únicamente para momentos puntuales o dietas específicas. Los expertos insisten en que forman parte esencial de una alimentación saludable y equilibrada, por lo que deberían estar presentes cada día en nuestras comidas y cenas, e incluso en desayunos o tentempiés.",
    sections: [
      {
        heading: "Contexto de temporada",
        paragraphs: [
          "Con la llegada de la primavera, abril y mayo traen una gran variedad de verduras de temporada que destacan por su sabor, frescura y beneficios nutricionales.",
          "Además, apostar por productos de temporada y de proximidad también ayuda a reducir el impacto ambiental y favorece la economía local.",
          "Según explica Patricia L. Vilca Salazar, dietista-nutricionista del Grupo de Trabajo de Dietoterapia de la Sociedad Española para el Estudio de la Obesidad (Seedo), lo importante es incorporar frutas y verduras de forma **habitual** y no solo cuando estamos a dieta."
        ]
      },
      {
        heading: "¿Por qué consumir verduras a diario?",
        paragraphs: [
          "Las verduras aportan nutrientes esenciales como **vitaminas**, **minerales**, **fibra** y compuestos antioxidantes que ayudan a mantener el organismo en buen estado.",
          "Su consumo habitual se relaciona con beneficios como:"
        ],
        bullets: [
          "Reducción del riesgo de enfermedades cardiovasculares.",
          "Mejora del tránsito intestinal y prevención del estreñimiento.",
          "Ayuda en el control del peso y la obesidad.",
          "Posible efecto protector frente a algunos tipos de cáncer."
        ]
      },
      {
        heading: "Verduras de temporada en abril y mayo",
        paragraphs: ["Durante estas semanas es posible encontrar en el mercado verduras **frescas** y llenas de nutrientes como:"],
        bullets: [
          "Espárragos",
          "Guisantes",
          "Berenjena",
          "Alcachofas",
          "Puerro",
          "Judías verdes",
          "Habas",
          "Pepino",
          "Acelga",
          "Espinaca",
          "Endivia",
          "Zanahoria",
          "Remolacha",
          "Lechuga",
          "Brócoli",
          "Coliflor",
          "Col",
          "Rábano"
        ]
      },
      {
        heading: "Beneficios de algunas verduras destacadas",
        bullets: [
          "Espárragos, alcachofas, guisantes y habas: ricos en fibra, folatos y compuestos prebióticos que favorecen la salud digestiva y metabólica.",
          "Brócoli, coliflor y col: contienen glucosinolatos y compuestos sulfurados con potencial protector frente a ciertos tipos de cáncer.",
          "Pepino y endivia: destacan por su elevado contenido en agua y minerales.",
          "Zanahoria y remolacha: la zanahoria aporta betacarotenos y vitamina A, mientras que la remolacha contiene nitratos beneficiosos para la salud vascular.",
          "Verduras de hoja verde: espinacas, acelgas y lechuga son fuente de vitamina K y folato, importantes para la salud ósea y celular."
        ]
      },
      {
        heading: "Ideas para incluir más verduras en tu dieta",
        paragraphs: [
          "La primavera es una época ideal para preparar ensaladas frescas, sopas frías y platos ligeros.",
          "Los expertos recomiendan combinar hojas verdes con frutas de temporada como fresas o frambuesas, añadiendo también aguacate o legumbres para conseguir platos más completos y nutritivos.",
          "Además de verduras y frutas, una alimentación equilibrada debe incluir legumbres, cereales integrales y proteínas magras como pescado, ave o conejo."
        ]
      }
    ],
    sourceLabel: "CuidatePlus (Marca)",
    sourceUrl:
      "https://cuidateplus.marca.com/alimentacion/nutricion/2026/04/26/son-verduras-faltar-lista-compra-mes-185000.html"
  },
  {
    id: 2,
    title: "Estas son las frutas de temporada que han llegado en abril",
    excerpt:
      "La primavera trae nuevas frutas de temporada llenas de sabor, vitaminas y nutrientes esenciales. Descubre cuáles son las mejores opciones de abril y qué beneficios aportan a tu salud.",
    category: "Nutrición",
    image: getCloudinaryStaticAsset("/images/news/news-2.jpg"),
    date: "8 de mayo de 2026",
    readTime: 4,
    isFeatured: true,
    intro:
      "Con la llegada de la primavera, los mercados comienzan a llenarse de nuevas frutas de temporada que destacan por su sabor, frescura y valor nutricional. Elegir frutas propias de cada estación no solo mejora la calidad de la alimentación, también favorece un consumo más sostenible y respetuoso con el medio ambiente.",
    sections: [
      {
        heading: "Contexto y recomendaciones",
        paragraphs: [
          "La Agencia Española de Seguridad Alimentaria y Nutrición (Aesan) recuerda que consumir productos de temporada significa apostar por alimentos con mejor sabor, mayor calidad nutricional y menor impacto ambiental.",
          "Los expertos recomiendan tomar al menos tres piezas de fruta al día y variar las opciones para conseguir una alimentación equilibrada y rica en nutrientes.",
          "Además, dentro de la dieta mediterránea, la fruta se considera uno de los postres más saludables gracias a su capacidad para aportar saciedad y reducir el deseo de consumir dulces."
        ]
      },
      {
        heading: "Frutas de temporada en abril",
        paragraphs: ["Estas son algunas de las frutas protagonistas durante el mes de abril:"],
        bullets: [
          "Aguacate",
          "Frambuesa",
          "Fresa",
          "Kiwi",
          "Limón",
          "Naranja",
          "Níspero",
          "Plátano"
        ]
      },
      {
        heading: "Aguacate",
        paragraphs: [
          "Aunque muchas personas lo consideran una verdura, el aguacate es realmente una fruta. Destaca por su contenido en grasas saludables monoinsaturadas, similares a las del aceite de oliva virgen extra.",
          "Además, aporta vitamina C, vitamina E, vitamina B6, ácido fólico, fibra y minerales como potasio y magnesio, convirtiéndose en un alimento muy completo para incluir en desayunos, ensaladas o tostadas."
        ]
      },
      {
        heading: "Frambuesa",
        paragraphs: [
          "La frambuesa es una fruta rica en vitamina C y antioxidantes. Una sola porción puede aportar hasta el 80% de la cantidad diaria recomendada de esta vitamina.",
          "También contiene fibra, folatos y compuestos fenólicos, además de tener un índice glucémico bajo, lo que la convierte en una opción saludable para todo tipo de dietas."
        ]
      },
      {
        heading: "Fresa",
        paragraphs: [
          "Abril es uno de los mejores meses para disfrutar de las fresas en su punto óptimo. A pesar de su pequeño tamaño, destacan por su alto contenido en vitamina C, incluso superior al de algunas naranjas.",
          "Son bajas en calorías y contienen ácidos orgánicos como el cítrico, málico y oxálico, además de pequeñas cantidades de ácido salicílico."
        ]
      },
      {
        heading: "Kiwi",
        paragraphs: [
          "El kiwi es conocido por favorecer el tránsito intestinal gracias a su contenido en fibra. También destaca por su elevada cantidad de vitamina C y vitamina K.",
          "Además, los expertos señalan que consumirlo con piel aumenta aún más el aporte de fibra, antioxidantes y polifenoles."
        ]
      },
      {
        heading: "Níspero",
        paragraphs: [
          "El níspero marca el inicio de la temporada de frutas con hueso. Se caracteriza por ser una de las frutas con mayor contenido en fibra y por aportar potasio, un mineral importante para el funcionamiento muscular y nervioso."
        ]
      },
      {
        heading: "Naranja",
        paragraphs: [
          "La naranja encara el final de su temporada, aunque sigue siendo una excelente fuente de vitamina C. También aporta flavonoides, folatos y ácidos orgánicos beneficiosos para el organismo."
        ]
      },
      {
        heading: "Plátano",
        paragraphs: [
          "El plátano sigue siendo una de las frutas más consumidas gracias a su practicidad y valor energético. Contiene potasio, vitamina C, fósforo y triptófano, además de ser rico en hidratos de carbono, lo que lo convierte en una opción ideal para deportistas o para comenzar el día con energía."
        ]
      }
    ],
    sourceLabel: "AESAN y Fundación Española de Nutrición (FEN)",
    sourceUrl: "https://www.aesan.gob.es"
  },
  {
    id: 3,
    title: "5 mitos sobre la nutrición que debes dejar de creer",
    excerpt:
      "Separamos la ciencia de los mitos más comunes en el mundo de la nutrición y la pérdida de peso.",
    category: "Bienestar",
    image: getCloudinaryStaticAsset("/images/news/news-3.jpg"),
    date: "13 de abril de 2026",
    readTime: 6,
    isFeatured: false
  },
  {
    id: 4,
    title: "Cómo planificar tus comidas para toda la semana",
    excerpt:
      "Estrategias prácticas para organizar tu alimentación semanal, ahorrar tiempo y mantener hábitos saludables.",
    category: "Planificación",
    image: getCloudinaryStaticAsset("/images/news/news-4.jpg"),
    date: "12 de abril de 2026",
    readTime: 7,
    isFeatured: false
  },
  {
    id: 5,
    title: "Superalimentos: ¿realmente valen la pena?",
    excerpt:
      "Analizamos los llamados superalimentos y su verdadero impacto en tu salud basándonos en evidencia científica.",
    category: "Nutrición",
    image: getCloudinaryStaticAsset("/images/news/news-5.jpg"),
    date: "11 de abril de 2026",
    readTime: 5,
    isFeatured: false
  },
  {
    id: 6,
    title: "Hidratación: la clave olvidada del rendimiento",
    excerpt:
      "Por qué el agua es esencial para tu salud y rendimiento, y cómo asegurarte de estar correctamente hidratado.",
    category: "Bienestar",
    image: getCloudinaryStaticAsset("/images/news/news-6.jpg"),
    date: "10 de abril de 2026",
    readTime: 4,
    isFeatured: false
  }
];

const categories = ["Todos", "Alimentación saludable", "Nutrición", "Fitness", "Bienestar", "Planificación"];

const PixelX = ({ size = 18, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 8 8" fill="currentColor" className={className} aria-hidden="true">
    <path d="M0 0h1v1H0V0zm1 1h1v1H1V1zm1 1h1v1H2V2zm1 1h1v1H3V3zm1 1h1v1H4V4zm1 1h1v1H5V5zm1 1h1v1H6V6zm1 1h1v1H7V7zM0 7h1v1H0V7zm1-1h1v1H1V6zm1-1h1v1H2V5zm1-1h1v1H3V4zm2-2h1v1H5V2zm1-1h1v1H6V1zm1-1h1v1H7V0z" />
  </svg>
);

function NewsImage({ src, alt, featured = false }) {
  const [imageError, setImageError] = useState(false);

  if (imageError) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-100 via-slate-50 to-white text-slate-500">
        <div className="flex flex-col items-center gap-2 text-center">
          <ImageOff className="h-8 w-8" aria-hidden="true" />
          <span className={`font-medium ${featured ? "text-base" : "text-sm"}`}>Imagen no disponible</span>
        </div>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      decoding="async"
      onError={() => setImageError(true)}
      className="h-full w-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
    />
  );
}

export function News() {
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedArticle, setSelectedArticle] = useState(null);

  useEffect(() => {
    if (!selectedArticle) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setSelectedArticle(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedArticle]);

  const openArticle = (article) => {
    setSelectedArticle(article);
  };

  const renderFormattedText = (text) => {
    if (!text) return null;
    const parts = String(text).split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong key={`strong-${index}`} className="font-bold text-gray-900">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return <span key={`text-${index}`}>{part}</span>;
    });
  };

  const filteredArticles = newsArticles.filter((article) => {
    const matchesCategory = selectedCategory === "Todos" || article.category === selectedCategory;
    const matchesSearch =
      article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const featuredArticles = filteredArticles.filter((a) => a.isFeatured);
  const regularArticles = filteredArticles.filter((a) => !a.isFeatured);

  return (
    <div className="min-h-screen bg-gray-50 dark-pink-fields">
      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <Card className="p-6 md:p-8 bg-white border-2 border-pink-accent shadow-[8px_8px_0px_0px_#ff0a60] rounded-none">
            <h1 className="text-4xl text-gray-900 mb-3">Noticias y Artículos</h1>
            <p className="text-gray-600">
              Las últimas novedades sobre nutrición, fitness y bienestar respaldadas por evidencia científica.
            </p>
          </Card>

          <Card className="p-5 bg-white border-2 border-pink-accent shadow-[6px_6px_0px_0px_#ff0a60] rounded-none space-y-4">
            <div className="relative max-w-xl">
              <Search className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Buscar artículos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-12 border-2 border-gray-300 rounded-none focus-visible:border-pink-accent bg-white"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Badge
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  className={`cursor-pointer px-4 py-2 text-sm transition-colors rounded-none border-2 ${
                    selectedCategory === category
                      ? "bg-pink-accent border-pink-accent hover:bg-pink-accent/90 text-white"
                      : "border-gray-900 text-gray-900 hover:bg-pink-50 hover:border-pink-accent hover:text-pink-accent"
                  }`}
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </Badge>
              ))}
            </div>
          </Card>

          {featuredArticles.length > 0 && (
            <div className="mb-12">
              <div className="flex items-center gap-2 mb-6">
                <TrendingUp className="w-5 h-5 text-pink-accent" />
                <h2 className="text-2xl font-bold text-gray-900">Artículos destacados</h2>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {featuredArticles.map((article) => (
                  <Card
                    key={article.id}
                    data-news-card
                    className="overflow-hidden group bg-white border-2 border-gray-200 rounded-none shadow-[4px_4px_0px_0px_#d1d5db] hover:shadow-[8px_8px_0px_0px_#ff0a60] hover:border-pink-accent transition-all"
                    role="button"
                    tabIndex={0}
                    onClick={() => openArticle(article)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        openArticle(article);
                      }
                    }}
                  >
                    <div className="relative overflow-hidden aspect-[16/10] sm:aspect-[3/2] lg:aspect-[16/9]">
                      <NewsImage src={article.image} alt={article.title} featured />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                      <Badge className="absolute top-4 left-4 bg-pink-accent text-white rounded-none">{article.category}</Badge>
                    </div>

                    <div className="p-6 space-y-4">
                      <h3 className="text-2xl font-bold text-gray-900 group-hover:text-pink-accent transition-colors">
                        {article.title}
                      </h3>

                      <p className="text-gray-600 leading-relaxed">{article.excerpt}</p>

                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>{article.date}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>{article.readTime} min</span>
                          </div>
                        </div>

                        <Button
                          variant="ghost"
                          className="text-pink-accent hover:text-pink-accent/80 hover:bg-pink-50 rounded-none"
                          onClick={(event) => {
                            event.stopPropagation();
                            openArticle(article);
                          }}
                        >
                          Leer más
                          <ArrowRight className="w-4 h-4 ml-1" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {regularArticles.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-6">
                <BookOpen className="w-5 h-5 text-pink-accent" />
                <h2 className="text-2xl font-bold text-gray-900">Todos los artículos</h2>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {regularArticles.map((article) => (
                  <Card
                    key={article.id}
                    data-news-card
                    className="overflow-hidden group bg-white border-2 border-gray-200 rounded-none shadow-[4px_4px_0px_0px_#d1d5db] hover:shadow-[8px_8px_0px_0px_#ff0a60] hover:border-pink-accent transition-all"
                    role="button"
                    tabIndex={0}
                    onClick={() => openArticle(article)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        openArticle(article);
                      }
                    }}
                  >
                    <div className="relative overflow-hidden aspect-[4/3] sm:aspect-[3/2] lg:aspect-[16/10]">
                      <NewsImage src={article.image} alt={article.title} />
                      <Badge className="absolute top-4 left-4 bg-white text-gray-900 hover:bg-white rounded-none border border-gray-200">
                        {article.category}
                      </Badge>
                    </div>

                    <div className="p-6 space-y-3">
                      <h3 className="text-lg font-bold text-gray-900 group-hover:text-pink-accent transition-colors line-clamp-2">
                        {article.title}
                      </h3>

                      <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">{article.excerpt}</p>

                      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                        <div className="flex items-center gap-3 text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            <span>{article.date}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>{article.readTime} min</span>
                          </div>
                        </div>

                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-pink-accent hover:text-pink-accent/80 hover:bg-pink-50 rounded-none"
                          onClick={(event) => {
                            event.stopPropagation();
                            openArticle(article);
                          }}
                        >
                          Leer
                          <ArrowRight className="w-3 h-3 ml-1" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {filteredArticles.length === 0 && (
            <Card className="text-center py-16 bg-white border-2 border-pink-accent shadow-[6px_6px_0px_0px_#ff0a60] rounded-none">
              <div className="bg-gray-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-300">
                <Search className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No se encontraron artículos</h3>
              <p className="text-gray-600 mb-6">Intenta con otros términos de búsqueda o cambia la categoría.</p>
              <Button
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("Todos");
                }}
                className="bg-pink-accent hover:bg-pink-accent/90 text-white rounded-none"
              >
                Ver todos los artículos
              </Button>
            </Card>
          )}

          <Card className="mt-16 p-8 bg-white border-2 border-pink-accent shadow-[8px_8px_0px_0px_#ff0a60] rounded-none">
            <div className="max-w-2xl mx-auto text-center">
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Suscríbete a nuestro boletín</h3>
              <p className="text-gray-600 mb-6">
                Recibe los últimos artículos, recetas y consejos de nutrición directamente en tu correo.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                <Input
                  type="email"
                  placeholder="tu@email.com"
                  className="flex-1 border-2 border-gray-300 rounded-none focus-visible:border-pink-accent bg-white"
                />
                <Button className="bg-pink-accent hover:bg-pink-accent/90 text-white rounded-none">Suscribirse</Button>
              </div>
            </div>
          </Card>

          {selectedArticle && (
            <div
              className="fixed inset-0 z-[90] flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/40 modal-overlay-enter"
              onClick={() => setSelectedArticle(null)}
            >
              <Card
                key={selectedArticle.id}
                className="w-full max-w-4xl h-[calc(100vh-1.5rem)] sm:h-[calc(100vh-2rem)] md:h-[calc(100vh-3rem)] max-h-[calc(100vh-1.5rem)] sm:max-h-[calc(100vh-2rem)] md:max-h-[calc(100vh-3rem)] overflow-y-auto bg-white border-2 border-pink-accent shadow-[10px_10px_0px_0px_#ff0a60] rounded-none modal-content-enter relative"
                onClick={(event) => event.stopPropagation()}
              >
                <div className="relative">
                  <div className="aspect-[16/8] overflow-hidden border-b-2 border-pink-accent/40">
                    <NewsImage src={selectedArticle.image} alt={selectedArticle.title} featured />
                  </div>
                  <button
                    type="button"
                    aria-label="Cerrar artículo"
                    onClick={() => setSelectedArticle(null)}
                    className="absolute top-3 right-3 h-11 w-11 border-2 border-pink-accent/40 bg-white/95 text-pink-accent hover:bg-pink-50 hover:border-pink-accent transition-all duration-200 flex items-center justify-center rounded-full group hover:scale-105"
                  >
                    <PixelX size={18} className="text-pink-accent pixel-icon group-hover:text-pink-accent" />
                  </button>
                </div>

                <div className="p-6 md:p-8 space-y-6">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge className="bg-pink-accent text-white rounded-none">{selectedArticle.category}</Badge>
                    <span className="text-sm text-gray-500 inline-flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {selectedArticle.date}
                    </span>
                    <span className="text-sm text-gray-500 inline-flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {selectedArticle.readTime} min
                    </span>
                  </div>

                  <h3 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight">{selectedArticle.title}</h3>

                  <div className="space-y-5 text-gray-700 leading-relaxed">
                    <p className="text-base md:text-lg text-gray-800">{renderFormattedText(selectedArticle.excerpt)}</p>

                    {selectedArticle.intro ? (
                      <Card className="p-4 border border-pink-accent/25 rounded-none bg-gray-50 shadow-[4px_4px_0px_0px_#ffe2ef]">
                        <p>{renderFormattedText(selectedArticle.intro)}</p>
                      </Card>
                    ) : null}

                    {Array.isArray(selectedArticle.sections) && selectedArticle.sections.length > 0 ? (
                      <div className="space-y-4">
                        {selectedArticle.sections.map((section, sectionIndex) => (
                          <Card key={`${selectedArticle.id}-section-${sectionIndex}`} className="p-0 border border-gray-200 rounded-none overflow-hidden">
                            <div className="grid grid-cols-[6px_1fr]">
                              <div className="bg-pink-accent" />
                              <div className="p-4 bg-white">
                            {section.heading ? (
                              <h4 className="text-lg font-bold text-gray-900 mb-3 pb-2 border-b border-pink-accent/25">{section.heading}</h4>
                            ) : null}
                            {Array.isArray(section.paragraphs)
                              ? section.paragraphs.map((paragraph, paragraphIndex) => (
                                  <p key={`${selectedArticle.id}-section-${sectionIndex}-paragraph-${paragraphIndex}`} className="mb-2 last:mb-0">
                                    {renderFormattedText(paragraph)}
                                  </p>
                                ))
                              : null}
                            {Array.isArray(section.bullets) && section.bullets.length > 0 ? (
                              <ul className="list-disc pl-5 space-y-1 marker:text-pink-accent">
                                {section.bullets.map((item, itemIndex) => (
                                  <li key={`${selectedArticle.id}-section-${sectionIndex}-bullet-${itemIndex}`}>{renderFormattedText(item)}</li>
                                ))}
                              </ul>
                            ) : null}
                          </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    ) : Array.isArray(selectedArticle.content) && selectedArticle.content.length > 0 ? (
                      selectedArticle.content.map((paragraph, index) => (
                        <p key={`${selectedArticle.id}-paragraph-${index}`}>{paragraph}</p>
                      ))
                    ) : (
                      <p>Artículo en actualización.</p>
                    )}

                    {selectedArticle.sourceUrl ? (
                      <div className="pt-2 border-t border-gray-200">
                        <p className="text-sm text-gray-500">
                          Fuente:{" "}
                          <a
                            href={selectedArticle.sourceUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-pink-accent hover:underline"
                          >
                            {selectedArticle.sourceLabel || "Enlace externo"}
                          </a>
                        </p>
                      </div>
                    ) : null}
                  </div>
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

