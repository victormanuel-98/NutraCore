import { useEffect, useMemo, useRef, useState } from 'react';
import { MessageCircle, SendHorizontal, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getRecipes } from '../services/recipeService';
import { getNews } from '../services/newsService';

const GAIUS_AVATAR_URL = '/images/logos/gaius-avatar.png';
const GAIUS_AVATAR_FALLBACK_URL = '/images/logos/nutracoreFavicon.png';

const FORBIDDEN_WORDS = [
  'puta', 'puto', 'mierda', 'joder', 'gilipollas', 'cabron', 'cabron', 'coño', 'hostia', 'pendejo'
];

const PURPOSE_KEYWORDS = [
  'receta', 'recetas', 'plato', 'platos', 'ingrediente', 'ingredientes', 'nutricion', 'nutricion',
  'calorias', 'calorias', 'macros', 'proteina', 'proteina', 'carbohidratos', 'grasas', 'noticia',
  'noticias', 'articulo', 'articulo', 'catalogo', 'catalogo', 'lab', 'nutracore', 'perfil', 'objetivo'
];

const RECIPE_HINTS = ['receta', 'recetas', 'plato', 'platos', 'ingrediente', 'ingredientes', 'calorias', 'macros'];
const NEWS_HINTS = ['noticia', 'noticias', 'articulo', 'actualidad', 'tendencia'];
const NAV_HINTS = ['catalogo', 'lab', 'perfil', 'login', 'registro', 'dashboard'];
const GREETING_HINTS = ['hola', 'buenas', 'buenos dias', 'buenas tardes', 'buenas noches', 'hey', 'que tal'];
const RECIPE_FOLLOWUP_HINTS = ['proteina', 'proteinas', 'carbohidratos', 'grasas', 'kcal', 'calorias', 'saludable'];

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
  const messagesRef = useRef(null);
  const inputRef = useRef(null);

  const [isOpen, setIsOpen] = useState(false);
  const [autoScrollEnabled, setAutoScrollEnabled] = useState(true);
  const [lastIntent, setLastIntent] = useState(null);
  const [avatarSrc, setAvatarSrc] = useState(GAIUS_AVATAR_URL);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'assistant',
      text: 'Soy GAIUS. Te ayudo con recetas, noticias y navegacion dentro de NutraCore.'
    }
  ]);

  const blockedReason = useMemo(() => {
    if (isAuthenticated) return '';
    return 'Inicia sesion o registrate para activar el chat de GAIUS.';
  }, [isAuthenticated]);

  const appendMessage = (role, text) => {
    setMessages((prev) => [...prev, { id: `${Date.now()}-${Math.random()}`, role, text }]);
  };

  const resetConversation = () => {
    setInput('');
    setIsLoading(false);
    setLastIntent(null);
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        text: 'Soy GAIUS. Te ayudo con recetas, noticias y navegacion dentro de NutraCore.'
      }
    ]);
  };

  useEffect(() => {
    if (!isAuthenticated) {
      resetConversation();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isOpen || !autoScrollEnabled) return;
    const container = messagesRef.current;
    if (!container) return;
    container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
  }, [messages, isOpen, autoScrollEnabled]);

  useEffect(() => {
    if (!isOpen || !isAuthenticated) return;
    if (!inputRef.current || isLoading) return;
    inputRef.current.focus({ preventScroll: true });
  }, [isOpen, isAuthenticated, isLoading, messages]);

  const buildAssistantReply = async (rawQuestion) => {
    const question = normalize(rawQuestion);

    if (includesAny(question, FORBIDDEN_WORDS)) {
      return 'No puedo procesar lenguaje ofensivo. Reformula tu consulta con un tono respetuoso.';
    }

    if (includesAny(question, GREETING_HINTS)) {
      return 'Hola. Si quieres, te recomiendo recetas por proteina/calorias o te busco noticias por tema.';
    }

    if (!includesAny(question, PURPOSE_KEYWORDS) && lastIntent === 'recipes' && includesAny(question, RECIPE_FOLLOWUP_HINTS)) {
      setLastIntent('recipes');
      return 'Perfecto, seguimos con recetas. Dime si quieres alta proteina, bajas calorias o por ingrediente.';
    }

    if (!includesAny(question, PURPOSE_KEYWORDS)) {
      return 'Solo puedo ayudar con recetas, noticias y funciones de NutraCore. Prueba con "recetas con proteina" o "noticias de nutricion".';
    }

    if (includesAny(question, NAV_HINTS)) {
      setLastIntent('nav');
      return 'Puedes usar Catalogo para buscar recetas, Lab para crear las tuyas, News para articulos y Perfil para ver tu actividad.';
    }

    if (includesAny(question, RECIPE_HINTS) || includesAny(question, RECIPE_FOLLOWUP_HINTS)) {
      setLastIntent('recipes');
      try {
        const response = await getRecipes({ page: 1, limit: 12 }, token || undefined);
        const recipes = Array.isArray(response?.data) ? response.data : [];
        const matches = findRecipeMatches(recipes, question);

        if (!matches.length) {
          return 'No encontre coincidencias exactas ahora mismo. Ve a Catalogo y usa filtros de categoria, dificultad o macros.';
        }

        const lines = matches
          .map((recipe) => `- ${recipe.title} (${recipe.nutrition?.calories || 0} kcal)`)
          .join('\n');

        return `Encontre estas recetas relacionadas:\n${lines}\nSi quieres, te ayudo a afinar por calorias o macronutrientes.`;
      } catch {
        return 'Ahora mismo no pude consultar recetas. Intentalo de nuevo en unos segundos.';
      }
    }

    if (includesAny(question, NEWS_HINTS)) {
      setLastIntent('news');
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

        return `Estas noticias te pueden interesar:\n${lines}\nPuedes abrir la seccion News para leerlas completas.`;
      } catch {
        return 'No pude cargar noticias ahora mismo. Vuelve a intentarlo en un momento.';
      }
    }

    return 'Puedo ayudarte con recetas, noticias y navegacion de NutraCore. Dime que buscas y lo enfocamos.';
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
              <img
                src={avatarSrc}
                alt="Avatar de GAIUS"
                className="gaius-avatar"
                onError={() => {
                  if (avatarSrc !== GAIUS_AVATAR_FALLBACK_URL) {
                    setAvatarSrc(GAIUS_AVATAR_FALLBACK_URL);
                  }
                }}
              />
            </div>
            <div>
              <p className="gaius-title">GAIUS</p>
              <p className="gaius-subtitle">Básicamente, En todas partes</p>
            </div>
          </header>

          <div
            ref={messagesRef}
            className="gaius-messages"
            onScroll={() => {
              const node = messagesRef.current;
              if (!node) return;
              const nearBottom = node.scrollHeight - node.scrollTop - node.clientHeight < 24;
              setAutoScrollEnabled(nearBottom);
            }}
          >
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

          {!autoScrollEnabled ? (
            <button
              type="button"
              className="gaius-scroll-bottom"
              onClick={() => {
                setAutoScrollEnabled(true);
                const node = messagesRef.current;
                if (!node) return;
                node.scrollTo({ top: node.scrollHeight, behavior: 'smooth' });
              }}
            >
              Ir al último mensaje
            </button>
          ) : null}

          <form className="gaius-input-row" onSubmit={handleSubmit}>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(event) => {
                setInput(event.target.value);
                if (autoScrollEnabled) {
                  const node = messagesRef.current;
                  if (node) {
                    node.scrollTo({ top: node.scrollHeight, behavior: 'smooth' });
                  }
                }
              }}
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
