const mongoose = require('mongoose');

const getMongoUri = () => process.env.MONGODB_URI || 'mongodb://localhost:27017/nutracore';

const connectDB = async () => {
  const uri = getMongoUri();
  await mongoose.connect(uri);
  console.log('MongoDB conectado exitosamente');
};

const closeDB = async () => {
  await mongoose.connection.close();
};

module.exports = {
  mongoose,
  connectDB,
  closeDB,
  getMongoUri
};
