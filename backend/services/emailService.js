const nodemailer = require('nodemailer');
const Mailjet = require('node-mailjet');

const env = (key, fallback = '') => String(process.env[key] ?? fallback).trim();
const envAny = (...keys) => {
  for (const key of keys) {
    const value = env(key);
    if (value) return value;
  }
  return '';
};
const isProduction = () => env('NODE_ENV', 'development') === 'production';

const mapSmtpError = (error) => {
  const raw = String(error?.message || '').toLowerCase();
  const code = String(error?.code || '').toUpperCase();

  if (raw.includes('self-signed certificate') || raw.includes('certificate chain') || code === 'SELF_SIGNED_CERT_IN_CHAIN') {
    return new Error('No se pudo enviar el correo de verificacion por un certificado SSL del servidor de correo.');
  }

  if (raw.includes('certificate has expired') || code === 'CERT_HAS_EXPIRED') {
    return new Error('No se pudo enviar el correo de verificacion porque el certificado SSL del correo ha expirado.');
  }

  if (raw.includes('invalid login') || raw.includes('auth') || code === 'EAUTH') {
    return new Error('No se pudo enviar el correo de verificacion. Revisa las credenciales SMTP.');
  }

  if (raw.includes('getaddrinfo') || code === 'ENOTFOUND') {
    return new Error('No se pudo conectar al servidor de correo. Revisa la configuracion SMTP.');
  }

  return new Error('No se pudo enviar el correo de verificacion en este momento.');
};

const mapMailjetError = (error) => {
  const raw = String(error?.message || '').toLowerCase();

  if (raw.includes('unauthorized') || raw.includes('authentication') || raw.includes('forbidden')) {
    return new Error(
      'No se pudo enviar el correo de verificacion. Revisa credenciales Mailjet (MJ_APIKEY_PUBLIC/MJ_APIKEY_PRIVATE o MAILJET_API_KEY/MAILJET_API_SECRET).'
    );
  }

  if (raw.includes('sender') || raw.includes('from') || raw.includes('domain')) {
    return new Error('No se pudo enviar el correo de verificacion. Revisa MAIL_FROM o SENDER_EMAIL y el dominio en Mailjet.');
  }

  return new Error(`No se pudo enviar el correo de verificacion con Mailjet (${error?.message || 'error desconocido'}).`);
};

const mailjetPublicKey = () => envAny('MJ_APIKEY_PUBLIC', 'MAILJET_API_KEY');
const mailjetPrivateKey = () => envAny('MJ_APIKEY_PRIVATE', 'MAILJET_API_SECRET');
const mailFromAddress = () => envAny('MAIL_FROM', 'SENDER_EMAIL');
const hasMailjetConfig = () => Boolean(mailjetPublicKey() && mailjetPrivateKey() && mailFromAddress());

const hasSmtpConfig = () =>
  Boolean(env('SMTP_HOST') && env('SMTP_PORT') && env('SMTP_USER') && env('SMTP_PASS') && env('SMTP_FROM'));

const buildRealTransporter = () =>
  nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: env('SMTP_USER'),
      pass: env('SMTP_PASS')
    }
  });

let etherealTransporter = null;
let mailjetClient = null;

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

  if (isProduction()) {
    throw new Error('SMTP no configurado en produccion.');
  }

  const transporter = await getEtherealTransporter();
  return { transporter, mode: 'ethereal' };
};

const getMailjetClient = () => {
  if (!mailjetClient) {
    mailjetClient = Mailjet.apiConnect(mailjetPublicKey(), mailjetPrivateKey());
  }
  return mailjetClient;
};

const parseFromAddress = () => {
  const raw = mailFromAddress();
  const match = raw.match(/^\s*(.*?)\s*<\s*([^>]+)\s*>\s*$/);

  if (match) {
    return {
      name: match[1].replace(/^"|"$/g, '').trim() || 'NutraCore',
      email: match[2].trim()
    };
  }

  return {
    name: 'NutraCore',
    email: raw
  };
};

const buildEmailBodies = ({ userName, verifyUrl }) => {
  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #111827;">
      <h2>Verifica tu cuenta de NutraCore :)</h2>
      <p>Hola ${userName || 'usuario'},</p>
      <p>Gracias por registrarte. Pulsa el siguiente boton para verificar tu correo:</p>
      <p>
        <a href="${verifyUrl}" style="display:inline-block;padding:10px 16px;background:#C41D63;color:#fff;text-decoration:none;border-radius:6px;">
          Verificar correo
        </a>
      </p>
      <p>Si no solicitaste esta cuenta, puedes ignorar este mensaje.</p>
      <p>Este enlace caduca en 24 horas.</p>
    </div>
  `;

  const text = `Hola ${userName || ''}, verifica tu cuenta aqui: ${verifyUrl}`;

  return { html, text };
};

const sendViaMailjet = async ({ toEmail, userName, verifyUrl }) => {
  const client = getMailjetClient();
  const { html, text } = buildEmailBodies({ userName, verifyUrl });
  const from = parseFromAddress();

  const response = await client
    .post('send', { version: 'v3.1' })
    .request({
      Messages: [
        {
          From: {
            Email: from.email,
            Name: from.name
          },
          To: [{ Email: toEmail, Name: userName || toEmail }],
          Subject: 'Verifica tu cuenta de NutraCore',
          TextPart: text,
          HTMLPart: html
        }
      ]
    });

  const status = response?.response?.status;
  if (status && status >= 400) {
    throw new Error(`Mailjet devolvio status ${status}`);
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
  if (hasMailjetConfig()) {
    try {
      await sendViaMailjet({ toEmail, userName, verifyUrl });
      return;
    } catch (error) {
      console.error('Error Mailjet al enviar verificacion:', error);
      throw mapMailjetError(error);
    }
  }

  try {
    await sendViaSmtpOrEthereal({ toEmail, userName, verifyUrl });
  } catch (error) {
    console.error('Error SMTP al enviar verificacion:', error);
    throw mapSmtpError(error);
  }
};

module.exports = {
  sendVerificationEmail
};
