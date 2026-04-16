import { useState } from "react";
import { Navbar } from "./Navbar";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { 
  Clock, 
  TrendingUp, 
  BookOpen,
  Search,
  Calendar,
  ArrowRight
} from "lucide-react";

// Mock data de noticias
const newsArticles = [
  {
    id: 1,
    title: "Los mejores alimentos para mejorar tu rendimiento deportivo",
    excerpt: "Descubre qué nutrientes necesitas antes y después del entrenamiento para maximizar tus resultados y recuperación muscular.",
    category: "Fitness",
    image: "https://images.unsplash.com/photo-1635367216109-aa3353c0c22e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmaXRuZXNzJTIwd2VsbG5lc3MlMjBsaWZlc3R5bGV8ZW58MXx8fHwxNzc2MjUyNDI2fDA&ixlib=rb-4.1.0&q=80&w=1080",
    date: "15 Abril 2026",
    readTime: 5,
    isFeatured: true,
  },
  {
    id: 2,
    title: "Guía completa de macronutrientes: proteínas, carbohidratos y grasas",
    excerpt: "Entiende cómo funcionan los macronutrientes y cómo equilibrarlos según tus objetivos de salud y composición corporal.",
    category: "Nutrición",
    image: "https://images.unsplash.com/photo-1773858440555-d616b2d95717?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoZWFsdGh5JTIwbGlmZXN0eWxlJTIwZGlldCUyMHRyZW5kc3xlbnwxfHx8fDE3NzYyNTI0MjZ8MA&ixlib=rb-4.1.0&q=80&w=1080",
    date: "14 Abril 2026",
    readTime: 8,
    isFeatured: true,
  },
  {
    id: 3,
    title: "5 mitos sobre la nutrición que debes dejar de creer",
    excerpt: "Separamos la ciencia de los mitos más comunes en el mundo de la nutrición y la pérdida de peso.",
    category: "Bienestar",
    image: "https://images.unsplash.com/photo-1638328740227-1c4b1627614d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoZWFsdGh5JTIwZm9vZCUyMG51dHJpdGlvbiUyMGNvbG9yZnVsfGVufDF8fHx8MTc3NjI0MjYzN3ww&ixlib=rb-4.1.0&q=80&w=1080",
    date: "13 Abril 2026",
    readTime: 6,
    isFeatured: false,
  },
  {
    id: 4,
    title: "Cómo planificar tus comidas para toda la semana",
    excerpt: "Estrategias prácticas para organizar tu alimentación semanal, ahorrar tiempo y mantener hábitos saludables.",
    category: "Planificación",
    image: "https://images.unsplash.com/photo-1757332051150-a5b3c4510af8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmcmVzaCUyMHZlZ2V0YWJsZXMlMjBoZWFsdGh5JTIwZWF0aW5nfGVufDF8fHx8MTc3NjE4OTA0MXww&ixlib=rb-4.1.0&q=80&w=1080",
    date: "12 Abril 2026",
    readTime: 7,
    isFeatured: false,
  },
  {
    id: 5,
    title: "Superalimentos: ¿Realmente valen la pena?",
    excerpt: "Analizamos los llamados 'superalimentos' y su verdadero impacto en tu salud basándonos en evidencia científica.",
    category: "Nutrición",
    image: "https://images.unsplash.com/photo-1610450620997-6921021865da?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzbW9vdGhpZSUyMGJvd2wlMjBiZXJyaWVzJTIwYnJlYWtmYXN0fGVufDF8fHx8MTc3NjI1MjMxMXww&ixlib=rb-4.1.0&q=80&w=1080",
    date: "11 Abril 2026",
    readTime: 5,
    isFeatured: false,
  },
  {
    id: 6,
    title: "Hidratación: La clave olvidada del rendimiento",
    excerpt: "Por qué el agua es esencial para tu salud y rendimiento, y cómo asegurarte de estar correctamente hidratado.",
    category: "Bienestar",
    image: "https://images.unsplash.com/photo-1666979290238-2d862b573345?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmaXRuZXNzJTIwd29ya291dCUyMGd5bSUyMGVuZXJneXxlbnwxfHx8fDE3NzYyNTIyMDV8MA&ixlib=rb-4.1.0&q=80&w=1080",
    date: "10 Abril 2026",
    readTime: 4,
    isFeatured: false,
  },
];

const categories = ["Todos", "Nutrición", "Fitness", "Bienestar", "Planificación"];

export function News() {
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredArticles = newsArticles.filter(article => {
    const matchesCategory = selectedCategory === "Todos" || article.category === selectedCategory;
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const featuredArticles = filteredArticles.filter(a => a.isFeatured);
  const regularArticles = filteredArticles.filter(a => !a.isFeatured);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Noticias y Artículos
            </h1>
            <p className="text-lg text-gray-600">
              Las últimas novedades sobre nutrición, fitness y bienestar respaldadas por evidencia científica
            </p>
          </div>

          {/* Search and Filters */}
          <div className="mb-8 space-y-4">
            {/* Search */}
            <div className="relative max-w-xl">
              <Search className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Buscar artículos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-12"
              />
            </div>

            {/* Category Filters */}
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Badge
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  className={`cursor-pointer px-4 py-2 text-sm transition-colors ${
                    selectedCategory === category
                      ? "bg-pink-accent hover:bg-pink-accent/90 text-white"
                      : "hover:bg-gray-100"
                  }`}
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </Badge>
              ))}
            </div>
          </div>

          {/* Featured Articles */}
          {featuredArticles.length > 0 && (
            <div className="mb-12">
              <div className="flex items-center gap-2 mb-6">
                <TrendingUp className="w-5 h-5 text-pink-accent" />
                <h2 className="text-2xl font-bold text-gray-900">
                  Artículos Destacados
                </h2>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                {featuredArticles.map((article) => (
                  <Card key={article.id} className="overflow-hidden hover:shadow-xl transition-shadow group">
                    <div className="relative h-64 overflow-hidden">
                      <img 
                        src={article.image} 
                        alt={article.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                      <Badge className="absolute top-4 left-4 bg-pink-accent text-white">
                        {article.category}
                      </Badge>
                    </div>
                    
                    <div className="p-6 space-y-4">
                      <h3 className="text-2xl font-bold text-gray-900 group-hover:text-pink-accent transition-colors">
                        {article.title}
                      </h3>
                      
                      <p className="text-gray-600 leading-relaxed">
                        {article.excerpt}
                      </p>

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
                          className="text-pink-accent hover:text-pink-accent/80 hover:bg-pink-50"
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

          {/* Regular Articles */}
          {regularArticles.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-6">
                <BookOpen className="w-5 h-5 text-pink-accent" />
                <h2 className="text-2xl font-bold text-gray-900">
                  Todos los Artículos
                </h2>
              </div>
              
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {regularArticles.map((article) => (
                  <Card key={article.id} className="overflow-hidden hover:shadow-lg transition-shadow group">
                    <div className="relative h-48 overflow-hidden">
                      <img 
                        src={article.image} 
                        alt={article.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <Badge className="absolute top-4 left-4 bg-white/90 text-gray-900 hover:bg-white">
                        {article.category}
                      </Badge>
                    </div>
                    
                    <div className="p-6 space-y-3">
                      <h3 className="text-lg font-bold text-gray-900 group-hover:text-pink-accent transition-colors line-clamp-2">
                        {article.title}
                      </h3>
                      
                      <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">
                        {article.excerpt}
                      </p>

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
                          className="text-pink-accent hover:text-pink-accent/80 hover:bg-pink-50"
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

          {/* Empty State */}
          {filteredArticles.length === 0 && (
            <div className="text-center py-16">
              <div className="bg-gray-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                No se encontraron artículos
              </h3>
              <p className="text-gray-600 mb-6">
                Intenta con otros términos de búsqueda o cambia la categoría
              </p>
              <Button 
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("Todos");
                }}
                className="bg-pink-accent hover:bg-pink-accent/90 text-white"
              >
                Ver todos los artículos
              </Button>
            </div>
          )}

          {/* Newsletter Section */}
          <div className="mt-16 bg-gradient-to-br from-pink-50 to-white p-8 rounded-2xl border border-pink-100">
            <div className="max-w-2xl mx-auto text-center">
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Suscríbete a nuestro boletín
              </h3>
              <p className="text-gray-600 mb-6">
                Recibe los últimos artículos, recetas y consejos de nutrición directamente en tu correo
              </p>
              <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                <Input 
                  type="email" 
                  placeholder="tu@email.com"
                  className="flex-1"
                />
                <Button className="bg-pink-accent hover:bg-pink-accent/90 text-white">
                  Suscribirse
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
