require('dotenv').config();
const User = require('./models/User');
const { connectDB, closeDB } = require('./config/db');

const MONGODB_URI = process.env.MONGODB_URI;
const ADMIN_NAME = process.env.ADMIN_NAME;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

const fail = (message) => {
  console.error(`❌ ${message}`);
  process.exit(1);
};

if (!MONGODB_URI) fail('Falta MONGODB_URI en el entorno.');
if (!ADMIN_NAME) fail('Falta ADMIN_NAME en el entorno.');
if (!ADMIN_EMAIL) fail('Falta ADMIN_EMAIL en el entorno.');
if (!ADMIN_PASSWORD) fail('Falta ADMIN_PASSWORD en el entorno.');
if (ADMIN_PASSWORD.length < 8) fail('ADMIN_PASSWORD debe tener al menos 8 caracteres.');

const run = async () => {
  await connectDB();

  const existing = await User.findOne({ email: ADMIN_EMAIL.toLowerCase() });

  if (existing) {
    existing.role = 'admin';
    existing.isActive = true;
    existing.isEmailVerified = true;
    existing.emailVerificationToken = null;
    existing.emailVerificationExpires = null;
    existing.name = ADMIN_NAME;
    await existing.save();
    console.log(`✅ Usuario existente actualizado a admin: ${existing.email}`);
  } else {
    const admin = await User.create({
      name: ADMIN_NAME,
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      role: 'admin',
      isActive: true,
      isEmailVerified: true
    });
    console.log(`✅ Usuario admin creado: ${admin.email}`);
  }

  await closeDB();
};

run()
  .then(() => {
    console.log('🎉 Proceso finalizado.');
    process.exit(0);
  })
  .catch(async (error) => {
    console.error('❌ Error creando admin:', error.message);
    try {
      await closeDB();
    } catch {
      // ignore
    }
    process.exit(1);
  });
