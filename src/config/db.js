const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    throw new Error('MONGO_URI is not set in environment');
  }

  mongoose.set('strictQuery', true);
  await mongoose.connect(uri);
  console.log('✅ MongoDB connected');
};

module.exports = connectDB;

