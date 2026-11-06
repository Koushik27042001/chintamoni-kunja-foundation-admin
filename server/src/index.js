const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/items', require('./routes/itemRoutes'));
app.use('/api/contact', require('./routes/contactRoutes'));
app.use('/api/members', require('./routes/memberRoutes'));
app.use('/api/donations', require('./routes/donationRoutes'));
app.use('/api/agents', require('./routes/agentRoutes'));
app.use('/api/events', require('./routes/eventRoutes'));
app.use('/api/blogs', require('./routes/blogRoutes'));
app.use('/api/gallery', require('./routes/galleryRoutes'));

// Health check route
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    database: require('mongoose').connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Sample root route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Chintamoni Kunja API' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
