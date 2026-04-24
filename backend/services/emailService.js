const nodemailer = require('nodemailer');

const env = (key, fallback = '') => String(process.env[key] ?? fallback).trim();

/* ── Detectar si hay SMTP real configurado ────────────────────────── */
const hasSmtpConfig = () =>
  Boolean(
    env('SMTP_HOST') &&
      env('SMTP_PORT') &&
      env('SMTP_USER') &&
      env('SMTP_PASS') &&
      env('SMTP_FROM') &&
      env('SMTP_USER') !== 'tu_gmail@gmail.com'
  );

/* ── Transporter con SMTP real ────────────────────────────────────── */
const buildRealTransporter = () => {
  return nodemailer.createTransport({
    host: env('SMTP_HOST'),
    port: Number(env('SMTP_PORT')),
    secure: env('SMTP_SECURE', 'false').toLowerCase() === 'true',
    auth: {
      user: env('SMTP_USER'),
      pass: env('SMTP_PASS')
    },
    tls: {
      rejectUnauthorized: false
    }
  });
};

/* ── Transporter con Ethereal (test) ──────────────────────────────── */
let etherealTransporter = null;

const getEtherealTransporter = async () => {
  if (etherealTransporter) return etherealTransporter;

  const testAccount = await nodemailer.createTestAccount();

  console.log('\n╔══════════════════════════════════════════════════════════╗');
  console.log('║  📧 MODO DESARROLLO — Ethereal Email activado          ║');
  console.log('║  Los correos NO llegan a bandejas reales.              ║');
  console.log('║  Podrás ver cada email con el enlace que aparece       ║');
  console.log('║  en la consola tras cada envío.                        ║');
  console.log('╚══════════════════════════════════════════════════════════╝\n');

  etherealTransporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass
    }
  });

  return etherealTransporter;
};

/* ── Obtener transporter adecuado ─────────────────────────────────── */
const getTransporter = async () => {
  if (hasSmtpConfig()) {
    const transporter = buildRealTransporter();
    await transporter.verify();
    return { transporter, mode: 'real' };
  }

  const transporter = await getEtherealTransporter();
  return { transporter, mode: 'ethereal' };
};

/* ── Enviar correo de verificación ────────────────────────────────── */
const sendVerificationEmail = async ({ toEmail, userName, verifyUrl }) => {
  const { transporter, mode } = await getTransporter();

  const fromAddress =
    mode === 'real'
      ? env('SMTP_FROM')
      : '"NutraCore" <noreply@nutracore.dev>';

  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #111827;">
      <h2>Verifica tu cuenta de NutraCore</h2>
      <p>Hola ${userName || 'usuario'},</p>
      <p>Gracias por registrarte. Pulsa el siguiente botón para verificar tu correo:</p>
      <p>
        <a href="${verifyUrl}" style="display:inline-block;padding:10px 16px;background:#C41D63;color:#fff;text-decoration:none;border-radius:6px;">
          Verificar correo
        </a>
      </p>
      <p>Si no solicitaste esta cuenta, puedes ignorar este mensaje.</p>
      <p>Este enlace caduca en 24 horas.</p>
    </div>
  `;

  const info = await transporter.sendMail({
    from: fromAddress,
    to: toEmail,
    subject: 'Verifica tu cuenta de NutraCore',
    text: `Hola ${userName || ''}, verifica tu cuenta aquí: ${verifyUrl}`,
    html
  });

  /* Si es Ethereal, mostrar enlace para ver el email en el navegador */
  if (mode === 'ethereal') {
    const previewUrl = nodemailer.getTestMessageUrl(info);
    console.log('\n╔══════════════════════════════════════════════════════════╗');
    console.log('║  ✉️  CORREO DE VERIFICACIÓN ENVIADO (Ethereal)          ║');
    console.log('╠══════════════════════════════════════════════════════════╣');
    console.log(`║  Para: ${toEmail}`);
    console.log('║                                                          ║');
    console.log('║  👉 Abre este enlace en tu navegador para ver el email:  ║');
    console.log(`║  ${previewUrl}`);
    console.log('║                                                          ║');
    console.log('║  Dentro del email, haz clic en "Verificar correo"        ║');
    console.log('║  para activar tu cuenta.                                 ║');
    console.log('╚══════════════════════════════════════════════════════════╝\n');
  } else {
    console.log(`✅ Correo de verificación enviado a: ${toEmail}`);
  }
};

module.exports = {
  sendVerificationEmail
};
