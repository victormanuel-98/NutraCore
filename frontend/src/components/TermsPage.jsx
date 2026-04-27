export function TermsPage() {
  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-14 px-4 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-4xl rounded-2xl border border-slate-200 bg-white p-6 sm:p-10 shadow-sm">
        <h1 className="font-navbar text-4xl text-slate-900">Términos y Condiciones</h1>
        <p className="mt-3 text-sm text-slate-500">Última actualización: 27 de abril de 2026</p>

        <div className="mt-8 space-y-6 text-slate-700">
          <section>
            <h2 className="text-xl font-semibold text-slate-900">1. Aceptación</h2>
            <p className="mt-2 leading-relaxed">
              El uso de NutraCore implica la aceptación de estos términos. Si no estás de acuerdo con alguna cláusula,
              debes dejar de utilizar la plataforma.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900">2. Uso de la plataforma</h2>
            <p className="mt-2 leading-relaxed">
              Te comprometes a utilizar el servicio de forma lícita, respetando a otros usuarios y evitando actividades
              que puedan afectar la disponibilidad, seguridad o integridad del sistema.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900">3. Cuenta de usuario</h2>
            <p className="mt-2 leading-relaxed">
              Eres responsable de mantener la confidencialidad de tus credenciales y de cualquier actividad realizada
              desde tu cuenta. Notifica de inmediato cualquier uso no autorizado.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900">4. Limitación de responsabilidad</h2>
            <p className="mt-2 leading-relaxed">
              NutraCore ofrece información y herramientas de apoyo nutricional. No sustituye asesoramiento médico
              profesional ni garantiza resultados concretos en objetivos de salud o rendimiento.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
