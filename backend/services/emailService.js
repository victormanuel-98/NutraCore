const nodemailer = require('nodemailer');

const hasSmtpConfig = () =>
  Boolean(
    process.env.SMTP_HOST &&
      process.env.SMTP_PORT &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASS &&
      process.env.SMTP_FROM
  );

const buildTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: String(process.env.SMTP_SECURE || 'false') === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
};

const sendVerificationEmail = async ({ toEmail, userName, verifyUrl }) => {
  if (!hasSmtpConfig()) {
    throw new Error(
      'Falta configuración SMTP. Define SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS y SMTP_FROM en backend/.env'
    );
  }

  const transporter = buildTransporter();
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

  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: toEmail,
    subject: 'Verifica tu cuenta de NutraCore',
    text: `Hola ${userName || ''}, verifica tu cuenta aquí: ${verifyUrl}`,
    html
  });
};

module.exports = {
  sendVerificationEmail
};

