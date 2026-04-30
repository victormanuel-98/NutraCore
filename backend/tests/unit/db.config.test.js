jest.mock('mongoose', () => ({
  connect: jest.fn().mockResolvedValue(true),
  connection: {
    close: jest.fn().mockResolvedValue(true)
  }
}));

const mongoose = require('mongoose');
const { connectDB, closeDB, getMongoUri } = require('../../config/db');

describe('config/db', () => {
  test('getMongoUri returns env uri', () => {
    process.env.MONGODB_URI = 'mongodb://example/testdb';
    expect(getMongoUri()).toBe('mongodb://example/testdb');
  });

  test('connectDB calls mongoose.connect', async () => {
    process.env.MONGODB_URI = 'mongodb://localhost:27017/testdb';
    await connectDB();
    expect(mongoose.connect).toHaveBeenCalledWith('mongodb://localhost:27017/testdb');
  });

  test('closeDB closes connection', async () => {
    await closeDB();
    expect(mongoose.connection.close).toHaveBeenCalled();
  });
});
