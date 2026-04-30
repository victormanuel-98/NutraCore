const dotenv = require('dotenv');
const { connectDB, closeDB } = require('./config/db');
const { createApp } = require('./app');

dotenv.config();
const app = createApp();

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Servidor corriendo en puerto ${PORT}`);
      console.log(`http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Error conectando a MongoDB:', error.message);
    process.exit(1);
  }
};

startServer();

process.on('SIGINT', async () => {
  console.log('\nCerrando servidor...');
  await closeDB();
  console.log('MongoDB desconectado');
  process.exit(0);
});
