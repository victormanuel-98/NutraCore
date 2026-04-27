export function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-14 px-4 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-4xl rounded-2xl border border-slate-200 bg-white p-6 sm:p-10 shadow-sm">
        <h1 className="font-navbar text-4xl text-slate-900">Política de Privacidad</h1>
        <p className="mt-3 text-sm text-slate-500">Última actualización: 27 de abril de 2026</p>

        <div className="mt-8 space-y-6 text-slate-700">
          <section>
            <h2 className="text-xl font-semibold text-slate-900">1. Responsable del tratamiento</h2>
            <p className="mt-2 leading-relaxed">
              NutraCore es responsable del tratamiento de los datos personales recabados a través de la plataforma.
              Para cualquier consulta puedes escribir a <a className="text-pink-accent hover:underline" href="mailto:soporte@nutracore.app">soporte@nutracore.app</a>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900">2. Datos que recopilamos</h2>
            <p className="mt-2 leading-relaxed">
              Podemos recopilar datos de identificación (nombre, correo), datos de uso de la aplicación y preferencias de configuración
              con el fin de mejorar tu experiencia y ofrecer funcionalidades personalizadas.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900">3. Finalidad y base legal</h2>
            <p className="mt-2 leading-relaxed">
              Tratamos tus datos para prestar el servicio, gestionar tu cuenta, atender solicitudes de soporte y mejorar la plataforma.
              La base legal puede ser la ejecución del contrato, tu consentimiento y el interés legítimo en seguridad y mejora continua.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900">4. Conservación y derechos</h2>
            <p className="mt-2 leading-relaxed">
              Conservaremos los datos durante el tiempo necesario para cumplir con las finalidades descritas o con obligaciones legales.
              Puedes ejercer tus derechos de acceso, rectificación, supresión, oposición, limitación y portabilidad contactando por correo.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
