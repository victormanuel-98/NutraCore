require('dotenv').config();
const { connectDB, closeDB } = require('../config/db');
const User = require('../models/User');
const { pad4 } = require('../utils/alias');

const isDryRun = process.argv.includes('--dry-run');

const run = async () => {
  await connectDB();

  const users = await User.find({}, { _id: 1, role: 1, name: 1, createdAt: 1 })
    .sort({ createdAt: 1, _id: 1 });

  const adminUsers = users.filter((user) => user.role === 'admin');
  const regularUsers = users.filter((user) => user.role !== 'admin');

  const updates = [];

  adminUsers.forEach((user, index) => {
    const nextName = `NutraAdmin${pad4(index + 1)}`;
    if (user.name !== nextName) {
      updates.push({ _id: user._id, from: user.name, to: nextName });
    }
  });

  regularUsers.forEach((user, index) => {
    const nextName = `NutraUser${pad4(index)}`;
    if (user.name !== nextName) {
      updates.push({ _id: user._id, from: user.name, to: nextName });
    }
  });

  if (updates.length === 0) {
    console.log('No hay cambios de alias pendientes.');
    await closeDB();
    return;
  }

  console.log(`Usuarios detectados: ${users.length}`);
  console.log(`Cambios de alias: ${updates.length}`);

  if (isDryRun) {
    updates.slice(0, 20).forEach((update) => {
      console.log(`${update._id}: "${update.from}" -> "${update.to}"`);
    });
    if (updates.length > 20) {
      console.log(`... y ${updates.length - 20} cambios adicionales`);
    }
    console.log('Dry run completado (sin persistir cambios).');
    await closeDB();
    return;
  }

  const bulkOps = updates.map((update) => ({
    updateOne: {
      filter: { _id: update._id },
      update: { $set: { name: update.to } }
    }
  }));

  await User.bulkWrite(bulkOps, { ordered: false });
  console.log('Alias normalizados correctamente.');
  await closeDB();
};

run()
  .then(() => process.exit(0))
  .catch(async (error) => {
    console.error('Error normalizando alias:', error.message);
    try {
      await closeDB();
    } catch {
      // ignore close error
    }
    process.exit(1);
  });

