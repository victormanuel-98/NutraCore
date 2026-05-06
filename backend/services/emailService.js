const nodemailer = require('nodemailer');
const { Resend } = require('resend');

const env = (key, fallback = '') => String(process.env[key] ?? fallback).trim();

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

const mapResendError = (error) => {
  const raw = String(error?.message || '').toLowerCase();

  if (raw.includes('api key') || raw.includes('unauthorized') || raw.includes('forbidden')) {
    return new Error('No se pudo enviar el correo de verificación. Revisa RESEND_API_KEY.');
  }

  if (raw.includes('domain') || raw.includes('sender') || raw.includes('from')) {
    return new Error('No se pudo enviar el correo de verificación. Revisa RESEND_FROM y la verificación del dominio en Resend.');
  }

  return new Error('No se pudo enviar el correo de verificación en este momento.');
};

const hasResendConfig = () => Boolean(env('RESEND_API_KEY') && env('RESEND_FROM'));

const hasSmtpConfig = () =>
  Boolean(
    env('SMTP_HOST') &&
    env('SMTP_PORT') &&
    env('SMTP_USER') &&
    env('SMTP_PASS') &&
    env('SMTP_FROM') &&
    env('SMTP_USER') !== 'tu_gmail@gmail.com'
  );

const buildRealTransporter = () =>
  nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: env('SMTP_USER'),
      pass: env('SMTP_PASS')
    }
  });

let etherealTransporter = null;
let resendClient = null;

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
    const transporter = buildRealTransporter();
    await transporter.verify();
    return { transporter, mode: 'real' };
  }

  const transporter = await getEtherealTransporter();
  return { transporter, mode: 'ethereal' };
};

const getResendClient = () => {
  if (!resendClient) {
    resendClient = new Resend(env('RESEND_API_KEY'));
  }

  return resendClient;
};

const buildEmailBodies = ({ userName, verifyUrl }) => {
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

  const text = `Hola ${userName || ''}, verifica tu cuenta aquí: ${verifyUrl}`;

  return { html, text };
};

const sendViaResend = async ({ toEmail, userName, verifyUrl }) => {
  const client = getResendClient();
  const { html, text } = buildEmailBodies({ userName, verifyUrl });

  const { error } = await client.emails.send({
    from: env('RESEND_FROM'),
    to: toEmail,
    subject: 'Verifica tu cuenta de NutraCore',
    html,
    text
  });

  if (error) {
    throw new Error(error.message || 'Error de Resend');
  }
};

const sendViaSmtpOrEthereal = async ({ toEmail, userName, verifyUrl }) => {
  const { transporter, mode } = await getTransporter();
  const { html, text } = buildEmailBodies({ userName, verifyUrl });
  const fromAddress = mode === 'real' ? env('SMTP_FROM') : '"NutraCore" <noreply@nutracore.dev>';

  const info = await transporter.sendMail({
    from: fromAddress,
    to: toEmail,
    subject: 'Verifica tu cuenta de NutraCore',
    text,
    html
  });

  if (mode === 'ethereal') {
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log(`Vista previa del correo (Ethereal): ${previewUrl}`);
    }
  }
};

const sendVerificationEmail = async ({ toEmail, userName, verifyUrl }) => {
  if (hasResendConfig()) {
    try {
      await sendViaResend({ toEmail, userName, verifyUrl });
      return;
    } catch (error) {
      throw mapResendError(error);
    }
  }

  try {
    await sendViaSmtpOrEthereal({ toEmail, userName, verifyUrl });
  } catch (error) {
    throw mapSmtpError(error);
  }
};

module.exports = {
  sendVerificationEmail
};
