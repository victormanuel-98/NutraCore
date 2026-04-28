import { useState } from "react";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Clock, TrendingUp, BookOpen, Search, Calendar, ArrowRight, ImageOff } from "lucide-react";

const newsArticles = [
  {
    id: 1,
    title: "Los mejores alimentos para mejorar tu rendimiento deportivo",
    excerpt:
      "Descubre qué nutrientes necesitas antes y después del entrenamiento para maximizar tus resultados y recuperación muscular.",
    category: "Fitness",
    image: "/images/news/news-1.jpg",
    date: "15 Abril 2026",
    readTime: 5,
    isFeatured: true,
  },
  {
    id: 2,
    title: "Guía completa de macronutrientes: proteínas, carbohidratos y grasas",
    excerpt:
      "Entiende cómo funcionan los macronutrientes y cómo equilibrarlos según tus objetivos de salud y composición corporal.",
    category: "Nutrición",
    image: "/images/news/news-2.jpg",
    date: "14 Abril 2026",
    readTime: 8,
    isFeatured: true,
  },
  {
    id: 3,
    title: "5 mitos sobre la nutrición que debes dejar de creer",
    excerpt:
      "Separamos la ciencia de los mitos más comunes en el mundo de la nutrición y la pérdida de peso.",
    category: "Bienestar",
    image: "/images/news/news-3.jpg",
    date: "13 Abril 2026",
    readTime: 6,
    isFeatured: false,
  },
  {
    id: 4,
    title: "Cómo planificar tus comidas para toda la semana",
    excerpt:
      "Estrategias prácticas para organizar tu alimentación semanal, ahorrar tiempo y mantener hábitos saludables.",
    category: "Planificación",
    image: "/images/news/news-4.jpg",
    date: "12 Abril 2026",
    readTime: 7,
    isFeatured: false,
  },
  {
    id: 5,
    title: "Superalimentos: ¿realmente valen la pena?",
    excerpt:
      "Analizamos los llamados superalimentos y su verdadero impacto en tu salud basándonos en evidencia científica.",
    category: "Nutrición",
    image: "/images/news/news-5.jpg",
    date: "11 Abril 2026",
    readTime: 5,
    isFeatured: false,
  },
  {
    id: 6,
    title: "Hidratación: la clave olvidada del rendimiento",
    excerpt:
      "Por qué el agua es esencial para tu salud y rendimiento, y cómo asegurarte de estar correctamente hidratado.",
    category: "Bienestar",
    image: "/images/news/news-6.jpg",
    date: "10 Abril 2026",
    readTime: 4,
    isFeatured: false,
  },
];

const categories = ["Todos", "Nutrición", "Fitness", "Bienestar", "Planificación"];

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
            <h1 className="text-4xl text-gray-900 mb-3">Noticias y Articulos</h1>
            <p className="text-gray-600">
              Las ultimas novedades sobre nutricion, fitness y bienestar respaldadas por evidencia cientifica.
            </p>
          </Card>

          <Card className="p-5 bg-white border-2 border-pink-accent shadow-[6px_6px_0px_0px_#ff0a60] rounded-none space-y-4">
            <div className="relative max-w-xl">
              <Search className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Buscar articulos..."
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
                <h2 className="text-2xl font-bold text-gray-900">Articulos Destacados</h2>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {featuredArticles.map((article) => (
                  <Card
                    key={article.id}
                    className="overflow-hidden group bg-white border-2 border-gray-200 rounded-none shadow-[4px_4px_0px_0px_#d1d5db] hover:shadow-[8px_8px_0px_0px_#ff0a60] hover:border-pink-accent transition-all"
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

                        <Button variant="ghost" className="text-pink-accent hover:text-pink-accent/80 hover:bg-pink-50 rounded-none">
                          Leer mas
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
                <h2 className="text-2xl font-bold text-gray-900">Todos los Articulos</h2>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {regularArticles.map((article) => (
                  <Card
                    key={article.id}
                    className="overflow-hidden group bg-white border-2 border-gray-200 rounded-none shadow-[4px_4px_0px_0px_#d1d5db] hover:shadow-[8px_8px_0px_0px_#ff0a60] hover:border-pink-accent transition-all"
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
              <h3 className="text-xl font-bold text-gray-900 mb-2">No se encontraron articulos</h3>
              <p className="text-gray-600 mb-6">Intenta con otros terminos de busqueda o cambia la categoria.</p>
              <Button
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("Todos");
                }}
                className="bg-pink-accent hover:bg-pink-accent/90 text-white rounded-none"
              >
                Ver todos los articulos
              </Button>
            </Card>
          )}

          <Card className="mt-16 p-8 bg-white border-2 border-pink-accent shadow-[8px_8px_0px_0px_#ff0a60] rounded-none">
            <div className="max-w-2xl mx-auto text-center">
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Suscribete a nuestro boletin</h3>
              <p className="text-gray-600 mb-6">
                Recibe los ultimos articulos, recetas y consejos de nutricion directamente en tu correo.
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
        </div>
      </div>
    </div>
  );
}


