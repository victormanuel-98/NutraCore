import { useMemo, useState } from 'react';
import { MessageCircle, SendHorizontal, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getRecipes } from '../services/recipeService';
import { getNews } from '../services/newsService';

const GAIUS_AVATAR_URL =
  import.meta.env.VITE_GAIUS_AVATAR_URL ||
  'https://res.cloudinary.com/do8tro4tx/image/upload/v1/nutracore/gaius-avatar';

const FORBIDDEN_WORDS = [
  'puta', 'puto', 'mierda', 'joder', 'gilipollas', 'cabron', 'cabrón', 'coño', 'hostia', 'pendejo'
];

const PURPOSE_KEYWORDS = [
  'receta', 'recetas', 'plato', 'platos', 'ingrediente', 'ingredientes', 'nutricion', 'nutrición',
  'calorias', 'calorías', 'macros', 'proteina', 'proteína', 'carbohidratos', 'grasas', 'noticia',
  'noticias', 'articulo', 'artículo', 'catalogo', 'catálogo', 'lab', 'nutracore', 'perfil', 'objetivo'
];

const RECIPE_HINTS = ['receta', 'recetas', 'plato', 'platos', 'ingrediente', 'ingredientes', 'calorias', 'calorías', 'macros'];
const NEWS_HINTS = ['noticia', 'noticias', 'articulo', 'artículo', 'actualidad', 'tendencia'];
const NAV_HINTS = ['catalogo', 'catálogo', 'lab', 'perfil', 'login', 'registro', 'dashboard'];

const normalize = (value) =>
  String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();

const includesAny = (text, terms) => terms.some((term) => text.includes(normalize(term)));

const findRecipeMatches = (recipes, query) => {
  const queryTerms = normalize(query)
    .split(/\s+/)
    .filter((term) => term.length > 2);

  if (!queryTerms.length) return recipes.slice(0, 3);

  const scored = recipes
    .map((recipe) => {
      const haystack = normalize(`${recipe.title} ${(recipe.tags || []).join(' ')} ${(recipe.description || '')}`);
      const score = queryTerms.reduce((acc, term) => (haystack.includes(term) ? acc + 1 : acc), 0);
      return { recipe, score };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((item) => item.recipe);

  return scored;
};

export function GaiusChatbox() {
  const { isAuthenticated, token } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [avatarError, setAvatarError] = useState(false);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'assistant',
      text: 'Soy GAIUS. Te ayudo con recetas, noticias y navegación dentro de NutraCore.'
    }
  ]);

  const blockedReason = useMemo(() => {
    if (isAuthenticated) return '';
    return 'Inicia sesión o regístrate para activar el chat de GAIUS.';
  }, [isAuthenticated]);

  const appendMessage = (role, text) => {
    setMessages((prev) => [...prev, { id: `${Date.now()}-${Math.random()}`, role, text }]);
  };

  const buildAssistantReply = async (rawQuestion) => {
    const question = normalize(rawQuestion);

    if (includesAny(question, FORBIDDEN_WORDS)) {
      return 'No puedo procesar lenguaje ofensivo. Reformula tu consulta con un tono respetuoso.';
    }

    if (!includesAny(question, PURPOSE_KEYWORDS)) {
      return 'Solo puedo ayudar con recetas, noticias y funciones de NutraCore. Prueba con "recetas con proteína" o "noticias de nutrición".';
    }

    if (includesAny(question, NAV_HINTS)) {
      return 'Puedes usar Catálogo para buscar recetas, Lab para crear las tuyas, News para artículos y Perfil para ver tu actividad.';
    }

    if (includesAny(question, RECIPE_HINTS)) {
      try {
        const response = await getRecipes({ page: 1, limit: 12 }, token || undefined);
        const recipes = Array.isArray(response?.data) ? response.data : [];
        const matches = findRecipeMatches(recipes, question);

        if (!matches.length) {
          return 'No encontré coincidencias exactas ahora mismo. Ve a Catálogo y usa filtros de categoría, dificultad o macros.';
        }

        const lines = matches
          .map((recipe) => `- ${recipe.title} (${recipe.nutrition?.calories || 0} kcal)`)
          .join('\n');

        return `Encontré estas recetas relacionadas:\n${lines}\nSi quieres, te ayudo a afinar por calorías o macronutrientes.`;
      } catch {
        return 'Ahora mismo no pude consultar recetas. Inténtalo de nuevo en unos segundos.';
      }
    }

    if (includesAny(question, NEWS_HINTS)) {
      try {
        const response = await getNews({ page: 1, limit: 5 });
        const articles = response?.data?.news || [];

        if (!articles.length) {
          return 'No hay noticias disponibles en este momento.';
        }

        const related = articles
          .filter((article) => {
            const base = normalize(`${article.title} ${article.category} ${(article.tags || []).join(' ')}`);
            return question.split(/\s+/).some((term) => term.length > 3 && base.includes(term));
          })
          .slice(0, 3);

        const selected = related.length ? related : articles.slice(0, 3);
        const lines = selected.map((article) => `- ${article.title}`).join('\n');

        return `Estas noticias te pueden interesar:\n${lines}\nPuedes abrir la sección News para leerlas completas.`;
      } catch {
        return 'No pude cargar noticias ahora mismo. Vuelve a intentarlo en un momento.';
      }
    }

    return 'Puedo ayudarte con recetas, noticias y navegación de NutraCore. Dime qué buscas y lo enfocamos.';
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const question = input.trim();
    if (!question || isLoading || !isAuthenticated) return;

    appendMessage('user', question);
    setInput('');
    setIsLoading(true);

    try {
      const answer = await buildAssistantReply(question);
      appendMessage('assistant', answer);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="gaius-chatbox" aria-live="polite">
      {isOpen ? (
        <section className="gaius-window" aria-label="Chat de GAIUS">
          <header className="gaius-header">
            <div className="gaius-avatar-wrap">
              {!avatarError ? (
                <img
                  src={GAIUS_AVATAR_URL}
                  alt="Avatar de GAIUS"
                  className="gaius-avatar"
                  onError={() => setAvatarError(true)}
                />
              ) : (
                <div className="gaius-avatar-fallback" aria-label="Avatar GAIUS">
                  G
                </div>
              )}
            </div>
            <div>
              <p className="gaius-title">GAIUS</p>
              <p className="gaius-subtitle">Asistente NutraCore</p>
            </div>
          </header>

          <div className="gaius-messages">
            {messages.map((message) => (
              <div key={message.id} className={`gaius-bubble ${message.role === 'assistant' ? 'gaius-bubble-bot' : 'gaius-bubble-user'}`}>
                {message.text}
              </div>
            ))}
            {!isAuthenticated ? (
              <div className="gaius-lock-hint">
                <Lock size={15} />
                <span>{blockedReason}</span>
              </div>
            ) : null}
          </div>

          <form className="gaius-input-row" onSubmit={handleSubmit}>
            <input
              type="text"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder={isAuthenticated ? 'Escribe tu consulta...' : 'Chat bloqueado para usuarios no registrados'}
              className="gaius-input"
              disabled={!isAuthenticated || isLoading}
              maxLength={240}
            />
            <button type="submit" className="gaius-send" disabled={!isAuthenticated || isLoading || !input.trim()} aria-label="Enviar mensaje">
              <SendHorizontal size={16} />
            </button>
          </form>
        </section>
      ) : null}

      <button
        type="button"
        className="gaius-trigger"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label={isOpen ? 'Cerrar chat GAIUS' : 'Abrir chat GAIUS'}
      >
        <MessageCircle size={20} />
      </button>
    </div>
  );
}

