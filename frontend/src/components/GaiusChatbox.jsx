import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight, Lock, MessageCircle, SendHorizontal } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getRecipes } from '../services/recipeService';
import { getNews } from '../services/newsService';
import { getCloudinaryStaticAsset } from '../config/cloudinaryStaticAssets';

const GAIUS_AVATAR_URL = getCloudinaryStaticAsset('/images/logos/gaius-avatar.png');
const GAIUS_AVATAR_FALLBACK_URL = getCloudinaryStaticAsset('/images/logos/nutracoreFavicon.png');

const FORBIDDEN_WORDS = ['puta', 'puto', 'mierda', 'joder', 'gilipollas', 'cabron', 'cono', 'hostia', 'pendejo'];
const PURPOSE_KEYWORDS = [
  'receta', 'recetas', 'plato', 'platos', 'ingrediente', 'ingredientes', 'nutricion', 'calorias', 'macros',
  'proteina', 'carbohidratos', 'grasas', 'noticia', 'noticias', 'articulo', 'actualidad', 'catalogo',
  'lab', 'nutracore', 'perfil', 'objetivo', 'dashboard'
];
const RECIPE_HINTS = ['receta', 'recetas', 'plato', 'platos', 'ingrediente', 'ingredientes', 'calorias', 'macros', 'proteina'];
const NEWS_HINTS = ['noticia', 'noticias', 'articulo', 'actualidad', 'tendencia'];
const NAV_HINTS = ['catalogo', 'lab', 'perfil', 'login', 'registro', 'dashboard', 'admin'];
const GREETING_HINTS = ['hola', 'buenas', 'buenos dias', 'buenas tardes', 'buenas noches', 'hey', 'que tal'];
const THANKS_HINTS = ['gracias', 'muchas gracias', 'perfecto', 'genial'];
const AFFIRMATION_HINTS = ['si', 'vale', 'ok', 'dale', 'otra', 'otro', 'mas', 'algo mas'];
const RECIPE_FOLLOWUP_HINTS = ['alta proteina', 'bajas calorias', 'ingrediente', 'kcal', 'saludable', 'facil'];
const NEWS_FOLLOWUP_HINTS = ['mas noticias', 'otra noticia', 'mas actual', 'nutricion', 'fitness', 'bienestar'];

const normalize = (value) =>
  String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();

const includesAny = (text, terms) => terms.some((term) => text.includes(normalize(term)));

const buildMessage = ({ role, text, actions = [] }) => ({
  id: `${Date.now()}-${Math.random()}`,
  role,
  text,
  actions
});

const findRecipeMatches = (recipes, query) => {
  const queryTerms = normalize(query)
    .split(/\s+/)
    .filter((term) => term.length > 2);

  if (!queryTerms.length) return recipes.slice(0, 3);

  return recipes
    .map((recipe) => {
      const haystack = normalize(`${recipe.title} ${(recipe.tags || []).join(' ')} ${(recipe.description || '')}`);
      const score = queryTerms.reduce((acc, term) => (haystack.includes(term) ? acc + 1 : acc), 0);
      return { recipe, score };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((item) => item.recipe);
};

const findNewsMatches = (articles, query) => {
  const queryTerms = normalize(query)
    .split(/\s+/)
    .filter((term) => term.length > 2);

  if (!queryTerms.length) return articles.slice(0, 3);

  return articles
    .map((article) => {
      const haystack = normalize(`${article.title} ${article.category} ${(article.tags || []).join(' ')}`);
      const score = queryTerms.reduce((acc, term) => (haystack.includes(term) ? acc + 1 : acc), 0);
      return { article, score };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((item) => item.article);
};

export function GaiusChatbox() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, token } = useAuth();
  const messagesRef = useRef(null);
  const inputRef = useRef(null);

  const [isOpen, setIsOpen] = useState(false);
  const [conversationTopic, setConversationTopic] = useState(null);
  const [avatarSrc, setAvatarSrc] = useState(GAIUS_AVATAR_URL);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [footerOffset, setFooterOffset] = useState(0);
  const [useHeroContrast, setUseHeroContrast] = useState(false);
  const [messages, setMessages] = useState([
    buildMessage({
      role: 'assistant',
      text: 'Soy GAIUS. Te ayudo con recetas, noticias y navegación dentro de NutraCore.'
    })
  ]);

  const blockedReason = useMemo(() => {
    if (isAuthenticated) return '';
    return 'Inicia sesión o regístrate para activar el chat de GAIUS.';
  }, [isAuthenticated]);

  const scrollToBottom = (behavior = 'smooth') => {
    const container = messagesRef.current;
    if (!container) return;
    container.scrollTo({ top: container.scrollHeight, behavior });
  };

  const containScroll = (event) => {
    const node = messagesRef.current;
    if (!node) return;

    const deltaY = event.deltaY;
    const isAtTop = node.scrollTop <= 0;
    const isAtBottom = node.scrollTop + node.clientHeight >= node.scrollHeight - 1;

    if ((deltaY < 0 && isAtTop) || (deltaY > 0 && isAtBottom)) {
      event.preventDefault();
    }
  };

  const appendMessage = (message) => {
    setMessages((prev) => [...prev, { ...message, id: message.id || `${Date.now()}-${Math.random()}` }]);
  };

  const resetConversation = () => {
    setInput('');
    setIsLoading(false);
    setConversationTopic(null);
    setMessages([
      buildMessage({
        role: 'assistant',
        text: 'Soy GAIUS. Te ayudo con recetas, noticias y navegación dentro de NutraCore.'
      })
    ]);
  };

  useEffect(() => {
    if (!isAuthenticated) {
      resetConversation();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isOpen) return;
    const frame = window.requestAnimationFrame(() => scrollToBottom('smooth'));
    return () => window.cancelAnimationFrame(frame);
  }, [messages, isOpen, isLoading]);

  useEffect(() => {
    if (!isOpen || !isAuthenticated || !inputRef.current || isLoading) return;
    inputRef.current.focus({ preventScroll: true });
  }, [isOpen, isAuthenticated, isLoading, messages]);

  useEffect(() => {
    const updateFooterOffset = () => {
      const footer = document.querySelector('footer');
      if (!footer) {
        setFooterOffset(0);
        return;
      }

      const footerRect = footer.getBoundingClientRect();
      const overlap = Math.max(0, window.innerHeight - footerRect.top);
      setFooterOffset(overlap > 0 ? overlap + 16 : 0);
    };

    updateFooterOffset();
    window.addEventListener('scroll', updateFooterOffset, { passive: true });
    window.addEventListener('resize', updateFooterOffset);

    return () => {
      window.removeEventListener('scroll', updateFooterOffset);
      window.removeEventListener('resize', updateFooterOffset);
    };
  }, []);

  useEffect(() => {
    if (location.pathname !== '/') {
      setUseHeroContrast(false);
      return undefined;
    }

    const updateHeroContrast = () => {
      const hero = document.querySelector('[data-home-hero="true"]');
      if (!hero) {
        setUseHeroContrast(false);
        return;
      }

      const heroRect = hero.getBoundingClientRect();
      setUseHeroContrast(heroRect.bottom > window.innerHeight - 96);
    };

    updateHeroContrast();
    window.addEventListener('scroll', updateHeroContrast, { passive: true });
    window.addEventListener('resize', updateHeroContrast);

    return () => {
      window.removeEventListener('scroll', updateHeroContrast);
      window.removeEventListener('resize', updateHeroContrast);
    };
  }, [location.pathname]);

  const buildRecipeReply = async (rawQuestion) => {
    const response = await getRecipes({ page: 1, limit: 12 }, token || undefined);
    const recipes = Array.isArray(response?.data) ? response.data : [];
    const matches = findRecipeMatches(recipes, rawQuestion);

    if (!matches.length) {
      return {
        text: 'No encontré coincidencias claras ahora mismo. Abre Catálogo y usa filtros de categoría, dificultad o macros para afinar mejor.',
        actions: [{ label: 'Ir a Catálogo', to: '/catalog' }]
      };
    }

    const lines = matches
      .map((recipe) => `- ${recipe.title} (${recipe.nutrition?.calories || 0} kcal)`)
      .join('\n');

    return {
      text: `Te recomiendo estas recetas:\n${lines}\nSi quieres, dime si prefieres algo más proteico, ligero o por ingrediente.`,
      actions: [{ label: 'Ver Catálogo', to: '/catalog' }]
    };
  };

  const buildNewsReply = async (rawQuestion) => {
    const response = await getNews({ page: 1, limit: 6 });
    const articles = response?.data?.news || [];

    if (!articles.length) {
      return {
        text: 'No hay noticias disponibles en este momento.',
        actions: [{ label: 'Abrir Noticias', to: '/news' }]
      };
    }

    const matches = findNewsMatches(articles, rawQuestion);
    const selected = matches.length ? matches : articles.slice(0, 3);
    const lines = selected.map((article) => `- ${article.title}`).join('\n');

    return {
      text: `Estas noticias te pueden interesar:\n${lines}\nSi quieres, te saco más enfocadas en nutrición, fitness o bienestar.`,
      actions: [{ label: 'Ir a Noticias', to: '/news' }]
    };
  };

  const buildAssistantReply = async (rawQuestion) => {
    const question = normalize(rawQuestion);

    if (includesAny(question, FORBIDDEN_WORDS)) {
      return {
        text: 'No puedo procesar lenguaje ofensivo. Reformula tu consulta con un tono respetuoso.',
        topic: conversationTopic
      };
    }

    if (includesAny(question, THANKS_HINTS)) {
      return {
        text: 'De nada. Si quieres, sigo contigo con recetas, noticias o alguna sección de la plataforma.',
        topic: conversationTopic
      };
    }

    if (includesAny(question, GREETING_HINTS)) {
      return {
        text: 'Hola. Puedo recomendarte recetas, resumirte noticias o guiarte por NutraCore. Dime qué te apetece hacer.',
        topic: conversationTopic
      };
    }

    if (conversationTopic === 'recipes' && (includesAny(question, AFFIRMATION_HINTS) || includesAny(question, RECIPE_FOLLOWUP_HINTS))) {
      const recipeReply = await buildRecipeReply(rawQuestion);
      return { ...recipeReply, topic: 'recipes' };
    }

    if (conversationTopic === 'news' && (includesAny(question, AFFIRMATION_HINTS) || includesAny(question, NEWS_FOLLOWUP_HINTS))) {
      const newsReply = await buildNewsReply(rawQuestion);
      return { ...newsReply, topic: 'news' };
    }

    if (includesAny(question, NAV_HINTS)) {
      return {
        text: 'Puedes usar Catálogo para buscar recetas, Lab para crear las tuyas, Noticias para leer artículos y Perfil para revisar tu actividad.',
        topic: 'navigation',
        actions: [
          { label: 'Abrir Catálogo', to: '/catalog' },
          { label: 'Abrir Perfil', to: '/profile' }
        ]
      };
    }

    if (includesAny(question, RECIPE_HINTS) || includesAny(question, RECIPE_FOLLOWUP_HINTS)) {
      const recipeReply = await buildRecipeReply(rawQuestion);
      return { ...recipeReply, topic: 'recipes' };
    }

    if (includesAny(question, NEWS_HINTS) || includesAny(question, NEWS_FOLLOWUP_HINTS)) {
      const newsReply = await buildNewsReply(rawQuestion);
      return { ...newsReply, topic: 'news' };
    }

    if (!includesAny(question, PURPOSE_KEYWORDS)) {
      return {
        text: 'Puedo ayudarte con recetas, noticias y navegación dentro de NutraCore. Prueba con algo como "quiero recetas altas en proteína" o "dame noticias de nutrición".',
        topic: conversationTopic
      };
    }

    return {
      text: 'Entendido. Si me concretas si buscas recetas, noticias o una sección concreta de la app, te respondo mejor.',
      topic: conversationTopic
    };
  };

  const handleAction = (to) => {
    navigate(to);
    setIsOpen(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const question = input.trim();
    if (!question || isLoading || !isAuthenticated) return;

    appendMessage(buildMessage({ role: 'user', text: question }));
    setInput('');
    setIsLoading(true);
    window.requestAnimationFrame(() => scrollToBottom('smooth'));

    try {
      const reply = await buildAssistantReply(question);
      setConversationTopic(reply.topic || null);
      appendMessage(
        buildMessage({
          role: 'assistant',
          text: reply.text,
          actions: reply.actions || []
        })
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="gaius-chatbox" aria-live="polite" style={{ '--gaius-footer-offset': `${footerOffset}px` }}>
      {isOpen ? (
        <section className="gaius-window gaius-window-mobile" aria-label="Chat de GAIUS">
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
              <p className="gaius-subtitle">Básicamente, en todas partes.</p>
            </div>
          </header>

          <div
            ref={messagesRef}
            className="gaius-messages gaius-messages-mobile"
            onWheel={containScroll}
          >
            {messages.map((message) => (
              <div
                key={message.id}
                className={`gaius-message ${message.role === 'assistant' ? 'gaius-message-bot' : 'gaius-message-user'}`}
              >
                <div className={`gaius-bubble ${message.role === 'assistant' ? 'gaius-bubble-bot' : 'gaius-bubble-user'}`}>
                  {message.text}
                </div>
                {message.actions?.length ? (
                  <div className="gaius-actions">
                    {message.actions.map((action) => (
                      <button
                        key={`${message.id}-${action.to}`}
                        type="button"
                        className="gaius-action-btn"
                        onClick={() => handleAction(action.to)}
                      >
                        {action.label}
                        <ArrowRight size={14} />
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            ))}

            {isLoading ? (
              <div className="gaius-message gaius-message-bot">
                <div className="gaius-bubble gaius-bubble-bot gaius-bubble-loading">
                  GAIUS está escribiendo...
                </div>
              </div>
            ) : null}

            {!isAuthenticated ? (
              <div className="gaius-lock-hint">
                <Lock size={15} />
                <span>{blockedReason}</span>
              </div>
            ) : null}
          </div>

          <form className="gaius-input-row gaius-input-row-mobile" onSubmit={handleSubmit}>
            <textarea
              ref={inputRef}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && !event.shiftKey) {
                  event.preventDefault();
                  event.currentTarget.form?.requestSubmit();
                }
              }}
              placeholder={isAuthenticated ? 'Escribe tu consulta...' : 'Chat bloqueado para usuarios no registrados'}
              className="gaius-input"
              disabled={!isAuthenticated || isLoading}
              maxLength={240}
              rows={1}
            />
            <button type="submit" className="gaius-send" disabled={!isAuthenticated || isLoading || !input.trim()} aria-label="Enviar mensaje">
              <SendHorizontal size={16} />
            </button>
          </form>
        </section>
      ) : null}

      <button
        type="button"
        className={`gaius-trigger ${useHeroContrast ? 'gaius-trigger-hero-contrast' : ''}`}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label={isOpen ? 'Cerrar chat GAIUS' : 'Abrir chat GAIUS'}
      >
        <MessageCircle size={20} />
      </button>
    </div>
  );
}
