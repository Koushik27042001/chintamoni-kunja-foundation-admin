const mongoose = require('mongoose');
const seedInitialData = require('./seedData');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    await seedInitialData();
  } catch (error) {
    console.error(`⚠️ MongoDB Connection Error: ${error.message}`);
    console.warn('ℹ️ Please ensure MongoDB is running or configure MONGO_URI in server/.env');
  }
};

module.exports = connectDB;
