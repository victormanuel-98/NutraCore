const nodemailer = require('nodemailer');

const env = (key, fallback = '') => String(process.env[key] ?? fallback).trim();
const envBool = (key, fallback = 'false') => env(key, fallback).toLowerCase() === 'true';

const mapSmtpError = (error) => {
  const raw = String(error?.message || '').toLowerCase();
  const code = String(error?.code || '').toUpperCase();

  if (raw.includes('self-signed certificate') || raw.includes('certificate chain') || code === 'SELF_SIGNED_CERT_IN_CHAIN') {
    return new Error(
      'No se pudo enviar el correo de verificación por un certificado SSL del servidor de correo. Contacta con soporte.'
    );
  }

  if (raw.includes('certificate has expired') || code === 'CERT_HAS_EXPIRED') {
    return new Error('No se pudo enviar el correo de verificación porque el certificado SSL del correo ha expirado.');
  }

  if (raw.includes('invalid login') || raw.includes('auth') || code === 'EAUTH') {
    return new Error('No se pudo enviar el correo de verificación. Revisa las credenciales SMTP.');
  }

  if (raw.includes('getaddrinfo') || code === 'ENOTFOUND') {
    return new Error('No se pudo conectar al servidor de correo. Revisa la configuración SMTP.');
  }

  return new Error('No se pudo enviar el correo de verificación en este momento.');
};

const hasSmtpConfig = () =>
  Boolean(
    env('SMTP_HOST') &&
      env('SMTP_PORT') &&
      env('SMTP_USER') &&
      env('SMTP_PASS') &&
      env('SMTP_FROM') &&
      env('SMTP_USER') !== 'tu_gmail@gmail.com'
  );

const buildRealTransporter = () => {
  const secure = envBool('SMTP_SECURE', 'false');
  const rejectUnauthorized = envBool('SMTP_TLS_REJECT_UNAUTHORIZED', 'true');

  return nodemailer.createTransport({
    host: env('SMTP_HOST'),
    port: Number(env('SMTP_PORT')),
    secure,
    auth: {
      user: env('SMTP_USER'),
      pass: env('SMTP_PASS')
    },
    tls: {
      rejectUnauthorized
    }
  });
};

let etherealTransporter = null;

const getEtherealTransporter = async () => {
  if (etherealTransporter) return etherealTransporter;

  const testAccount = await nodemailer.createTestAccount();
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

const getTransporter = async () => {
  if (hasSmtpConfig()) {
    try {
      const transporter = buildRealTransporter();
      await transporter.verify();
      return { transporter, mode: 'real' };
    } catch (error) {
      throw mapSmtpError(error);
    }
  }

  const transporter = await getEtherealTransporter();
  return { transporter, mode: 'ethereal' };
};

const sendVerificationEmail = async ({ toEmail, userName, verifyUrl }) => {
  let transporter;
  let mode;

  try {
    const resolved = await getTransporter();
    transporter = resolved.transporter;
    mode = resolved.mode;
  } catch (error) {
    throw mapSmtpError(error);
  }

  const fromAddress = mode === 'real' ? env('SMTP_FROM') : '"NutraCore" <noreply@nutracore.dev>';

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

  try {
    const info = await transporter.sendMail({
      from: fromAddress,
      to: toEmail,
      subject: 'Verifica tu cuenta de NutraCore',
      text: `Hola ${userName || ''}, verifica tu cuenta aquí: ${verifyUrl}`,
      html
    });

    if (mode === 'ethereal') {
      const previewUrl = nodemailer.getTestMessageUrl(info);
      if (previewUrl) {
        console.log(`Vista previa del correo (Ethereal): ${previewUrl}`);
      }
    }
  } catch (error) {
    throw mapSmtpError(error);
  }
};

module.exports = {
  sendVerificationEmail
};
