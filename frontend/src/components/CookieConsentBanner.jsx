import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

const STORAGE_KEY = 'nutracore_cookie_preferences_v1';

const DEFAULT_PREFERENCES = {
  necessary: true,
  analytics: false,
  personalization: false
};

function readStoredPreferences() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (typeof parsed !== 'object' || !parsed) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function CookieConsentBanner() {
  const [visible, setVisible] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [personalization, setPersonalization] = useState(false);

  useEffect(() => {
    const saved = readStoredPreferences();
    if (!saved) {
      setVisible(true);
      return;
    }
    setAnalytics(Boolean(saved.analytics));
    setPersonalization(Boolean(saved.personalization));
  }, []);

  const currentPreferences = useMemo(
    () => ({
      ...DEFAULT_PREFERENCES,
      analytics,
      personalization,
      updatedAt: new Date().toISOString()
    }),
    [analytics, personalization]
  );

  const persistPreferences = (nextPreferences) => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextPreferences));
    } catch {
      // Ignore write failures (private mode or blocked storage).
    }
    setVisible(false);
    setShowConfig(false);
  };

  const handleAcceptAll = () => {
    persistPreferences({
      ...DEFAULT_PREFERENCES,
      analytics: true,
      personalization: true,
      updatedAt: new Date().toISOString()
    });
  };

  const handleRejectOptional = () => {
    persistPreferences({
      ...DEFAULT_PREFERENCES,
      analytics: false,
      personalization: false,
      updatedAt: new Date().toISOString()
    });
  };

  const handleSaveCustom = () => {
    persistPreferences(currentPreferences);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-3 left-3 z-[140] w-[min(360px,calc(100vw-1.25rem))]">
      <div className="rounded-lg border-2 border-[#ff0a60] bg-white shadow-[0_8px_18px_rgba(2,8,23,0.14)]">
        <div className="p-2 sm:p-2.5">
          <h3 className="font-navbar text-[1rem] leading-none text-slate-900">Cookies</h3>

          <p className="mt-1 text-[10px] leading-3.5 text-slate-800">
            <span className="block">Usamos cookies necesarias y opcionales para análisis y personalización.</span>
            <span className="block">Puedes aceptar, rechazar o configurar tus preferencias.</span>
          </p>

          <p className="mt-0.5 text-[10px] text-slate-800">
            <Link to="/cookies" className="text-pink-accent hover:underline">
              Cookies
            </Link>{' '}
            y{' '}
            <Link to="/privacy" className="text-pink-accent hover:underline">
              Privacidad
            </Link>
          </p>

          <div className="mt-1.5 flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={handleRejectOptional}
              className="rounded-md border border-slate-300 px-2 py-0.5 text-[10px] font-medium text-slate-800 transition-colors hover:bg-slate-50"
            >
              Rechazar
            </button>
            <button
              type="button"
              onClick={() => setShowConfig((prev) => !prev)}
              className="rounded-md border border-slate-300 px-2 py-0.5 text-[10px] font-medium text-slate-800 transition-colors hover:bg-slate-50"
            >
              {showConfig ? 'Ocultar' : 'Configurar'}
            </button>
            <button
              type="button"
              onClick={handleAcceptAll}
              className="rounded-md bg-pink-accent px-2 py-0.5 text-[10px] font-semibold text-white transition-colors hover:bg-pink-accent/90"
            >
              Aceptar
            </button>
          </div>

          {showConfig ? (
            <div className="mt-2.5 rounded-lg border border-slate-200 bg-slate-50 p-2">
              <div className="space-y-2 text-[10px] text-slate-800">
                <label className="flex items-start gap-2">
                  <input type="checkbox" checked disabled className="mt-0.5 h-3.5 w-3.5 rounded border-slate-300" />
                  <span>
                    <strong>Necesarias:</strong> siempre activas.
                  </span>
                </label>

                <label className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    checked={analytics}
                    onChange={(event) => setAnalytics(event.target.checked)}
                    className="mt-0.5 h-3.5 w-3.5 rounded border-slate-300"
                  />
                  <span>
                    <strong>Analíticas:</strong> mejora de uso.
                  </span>
                </label>

                <label className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    checked={personalization}
                    onChange={(event) => setPersonalization(event.target.checked)}
                    className="mt-0.5 h-3.5 w-3.5 rounded border-slate-300"
                  />
                  <span>
                    <strong>Personalización:</strong> guarda preferencias.
                  </span>
                </label>
              </div>

              <div className="mt-2">
                <button
                  type="button"
                  onClick={handleSaveCustom}
                  className="rounded-md bg-slate-900 px-2 py-1 text-[10px] font-semibold text-white transition-colors hover:bg-slate-800"
                >
                  Guardar
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
