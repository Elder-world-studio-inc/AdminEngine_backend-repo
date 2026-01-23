const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const nexusRoutes = require('./routes/nexus');
const omnivaelRoutes = require('./routes/omnivael');
const adcamRoutes = require('./routes/adcam');
const initDB = require('./db-init');

dotenv.config();

const path = require('path');
const app = express();
const port = process.env.PORT || 4000;

// Initialize Database Migration
initDB().catch(err => {
  console.error('❌ Database initialization failed:', err);
  console.log('🚀 Starting server anyway...');
});

app.use(cors());
app.use(express.json());

// Request Logging Middleware
app.use((req, res, next) => {
  console.log(`[Request] ${req.method} ${req.url}`);
  next();
});

// Serve Static Frontend Files - DISABLED for Pure API Mode
// app.use(express.static(path.join(__dirname, '../public')));

// Slot 4: Shared API Hub
app.use('/api/auth', authRoutes);

// Slot 5: Admin Tools
app.use('/api/admin', adminRoutes);

// Slot 1: Nexus
app.use('/api/nexus', nexusRoutes);

// Slot 3: Omnivael
app.use('/api/omnivael', omnivaelRoutes);

// Skry Ad Cam
app.use('/api/adcam', adcamRoutes);

// Health Check Route
app.get('/', (req, res) => {
  res.json({ status: 'online', message: 'Elder Ecosystem API' });
});

// Catch-all 404
app.use((req, res) => {
  res.status(404).json({ message: 'Endpoint not found' });
});

const server = app.listen(port, '0.0.0.0', () => {
  console.log(`✅ Server is running on http://localhost:${port}`);
  console.log(`📡 Server bound to 0.0.0.0:${port}`);
});

// Handle server errors
server.on('error', (err) => {
  console.error('❌ Server error:', err);
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Port ${port} is already in use`);
  }
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Promise Rejection:', err);
  console.error('Stack:', err.stack);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  console.error('Stack:', err.stack);
  process.exit(1);
});
