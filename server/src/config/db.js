const mongoose = require('mongoose');
const seedInitialData = require('./seedData');

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
    if (!mongoUri) {
      console.warn('ℹ️ Neither MONGODB_URI nor MONGO_URI configured in server/.env');
      return;
    }
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    await seedInitialData();
  } catch (error) {
    console.error(`⚠️ MongoDB Connection Error: ${error.message}`);
    console.warn('ℹ️ Please ensure MongoDB is running or configure MONGODB_URI in server/.env');
  }
};

module.exports = connectDB;
