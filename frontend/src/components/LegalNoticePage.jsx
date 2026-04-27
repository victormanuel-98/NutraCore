export function LegalNoticePage() {
  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-14 px-4 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-4xl rounded-2xl border border-slate-200 bg-white p-6 sm:p-10 shadow-sm">
        <h1 className="font-navbar text-4xl text-slate-900">Aviso Legal</h1>
        <p className="mt-3 text-sm text-slate-500">Última actualización: 27 de abril de 2026</p>

        <div className="mt-8 space-y-6 text-slate-700">
          <section>
            <h2 className="text-xl font-semibold text-slate-900">1. Identificación del titular</h2>
            <p className="mt-2 leading-relaxed">
              Este sitio web es operado por NutraCore para proporcionar contenidos y herramientas de nutrición inteligente.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900">2. Propiedad intelectual</h2>
            <p className="mt-2 leading-relaxed">
              Los contenidos, diseño, marcas y elementos de la plataforma están protegidos por derechos de propiedad
              intelectual. No se permite su reproducción sin autorización expresa.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900">3. Enlaces externos</h2>
            <p className="mt-2 leading-relaxed">
              NutraCore no se responsabiliza de los contenidos de terceros enlazados desde la plataforma ni de las políticas
              aplicables en dichos sitios.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900">4. Legislación aplicable</h2>
            <p className="mt-2 leading-relaxed">
              Este aviso legal se rige por la normativa aplicable en materia digital y de protección de datos.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
