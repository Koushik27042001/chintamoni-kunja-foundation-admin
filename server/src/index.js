const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

// Connect to MongoDB Atlas
connectDB();

const app = express();

// Enable trust proxy (essential for Render and reverse proxies)
app.set('trust proxy', 1);

// Security Headers (configured to allow cross-origin API and asset access)
app.use(
  helmet({
    crossOriginResourcePolicy: false,
    crossOriginEmbedderPolicy: false,
  })
);

// HTTP Response Compression
app.use(compression());

// Production CORS Configuration
const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:4173',
].filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, server-to-server)
    if (!origin) return callback(null, true);
    
    // Check if origin matches allowed list or any Vercel deployment
    const isAllowed =
      allowedOrigins.includes(origin) ||
      /\.vercel\.app$/.test(origin) ||
      /localhost/.test(origin);

    if (isAllowed) {
      callback(null, true);
    } else {
      callback(null, true); // Allow during transition to prevent blocking valid requests
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// Body Parser Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// NoSQL Injection Sanitizer Middleware (Strips $ operators and prohibited field paths)
const { noSqlSanitizer } = require('./middleware/noSqlSanitizer');
app.use(noSqlSanitizer);

// URL Sanitizer Middleware (Eliminates accidental double slashes e.g. //donations -> /donations)
app.use((req, res, next) => {
  if (req.url && req.url.includes('//')) {
    req.url = req.url.replace(/\/+/g, '/');
  }
  next();
});

// Health Check Routes (Required for Render health monitoring probes)
const handleHealthCheck = (req, res) => {
  const mongoose = require('mongoose');
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  res.status(200).json({
    status: 'healthy',
    environment: process.env.NODE_ENV || 'production',
    database: dbStatus,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
};

app.get('/health', handleHealthCheck);
app.get('/api/health', handleHealthCheck);

// Route Controllers
const authRoutes = require('./routes/authRoutes');
const itemRoutes = require('./routes/itemRoutes');
const contactRoutes = require('./routes/contactRoutes');
const memberRoutes = require('./routes/memberRoutes');
const donationRoutes = require('./routes/donationRoutes');
const agentRoutes = require('./routes/agentRoutes');
const eventRoutes = require('./routes/eventRoutes');
const blogRoutes = require('./routes/blogRoutes');
const galleryRoutes = require('./routes/galleryRoutes');
const backupRoutes = require('./routes/backupRoutes');

// Mount routes on BOTH `/api/*` and direct `/*` for bulletproof compatibility
app.use('/api/auth', authRoutes);
app.use('/auth', authRoutes);

app.use('/api/items', itemRoutes);
app.use('/items', itemRoutes);

app.use('/api/contact', contactRoutes);
app.use('/contact', contactRoutes);

app.use('/api/members', memberRoutes);
app.use('/members', memberRoutes);

app.use('/api/donations', donationRoutes);
app.use('/donations', donationRoutes);

app.use('/api/agents', agentRoutes);
app.use('/agents', agentRoutes);

app.use('/api/events', eventRoutes);
app.use('/events', eventRoutes);

app.use('/api/blogs', blogRoutes);
app.use('/blogs', blogRoutes);

app.use('/api/gallery', galleryRoutes);
app.use('/gallery', galleryRoutes);

app.use('/api/backup', backupRoutes);
app.use('/backup', backupRoutes);

// Welcome Root Route
app.get('/', (req, res) => {
  res.json({
    name: 'Sri Sri Chintamoni Kunja Foundation API',
    status: 'active',
    version: '1.0.0',
    documentation: '/api/health',
  });
});

// 404 Route Handler for undefined routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API Route not found: ${req.originalUrl}`,
  });
});

// Centralized Error Handling Middleware
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  console.error(`❌ [Error ${statusCode}]: ${err.message}`);
  
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
});

// Start Server on 0.0.0.0 (Mandatory for Render container binding)
const PORT = process.env.PORT || 5000;
const HOST = '0.0.0.0';

const server = app.listen(PORT, HOST, () => {
  console.log(`🚀 Production server running on http://${HOST}:${PORT}`);
  console.log(`🌿 Environment: ${process.env.NODE_ENV || 'production'}`);
});

// Graceful Shutdown for zero-downtime rolling deploys on Render
const handleGracefulShutdown = (signal) => {
  console.log(`\n🛑 Received ${signal}. Starting graceful shutdown...`);
  server.close(async () => {
    console.log('🔒 Closed remaining HTTP connections.');
    try {
      const mongoose = require('mongoose');
      await mongoose.connection.close(false);
      console.log('📦 Closed MongoDB connection.');
      process.exit(0);
    } catch (err) {
      console.error('Error closing database:', err.message);
      process.exit(1);
    }
  });

  // Force shutdown if connections do not close within 10s
  setTimeout(() => {
    console.error('⚠️ Forcing shutdown after timeout.');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => handleGracefulShutdown('SIGTERM'));
process.on('SIGINT', () => handleGracefulShutdown('SIGINT'));
