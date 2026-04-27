export function CookiesPolicyPage() {
  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-14 px-4 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-4xl rounded-2xl border border-slate-200 bg-white p-6 sm:p-10 shadow-sm">
        <h1 className="font-navbar text-4xl text-slate-900">Política de Cookies</h1>
        <p className="mt-3 text-sm text-slate-500">Última actualización: 27 de abril de 2026</p>

        <div className="mt-8 space-y-6 text-slate-700">
          <section>
            <h2 className="text-xl font-semibold text-slate-900">1. Qué son las cookies</h2>
            <p className="mt-2 leading-relaxed">
              Las cookies son pequeños archivos que se almacenan en tu dispositivo para recordar información de tu navegación.
              En NutraCore se usan para mejorar rendimiento, seguridad y personalización.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900">2. Tipos de cookies</h2>
            <ul className="mt-2 list-disc pl-6 leading-relaxed">
              <li>Necesarias: permiten el funcionamiento básico del sitio.</li>
              <li>Analíticas: ayudan a entender el uso de la plataforma.</li>
              <li>Personalización: guardan preferencias de experiencia.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900">3. Gestión del consentimiento</h2>
            <p className="mt-2 leading-relaxed">
              Puedes aceptar, rechazar o configurar cookies opcionales desde el banner de cookies. También puedes cambiar
              tu elección borrando el almacenamiento local del navegador o desde futuras opciones de configuración.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
