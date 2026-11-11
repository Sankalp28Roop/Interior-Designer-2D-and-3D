import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import { initDatabase } from './config/database.js';
import authRoutes from './routes/authRoutes.js';
import projectRoutes from './routes/projectRoutes.js';
import promptRoutes from './routes/promptRoutes.js';
import generateRoutes from './routes/generateRoutes.js';
import exportRoutes from './routes/exportRoutes.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize DB schema
initDatabase();

const app = express();
const PORT = process.env.PORT || 5000;

// Security and utility middleware
app.use(helmet({
  contentSecurityPolicy: false // Allows inline Three.js scripts & CDNs in frontend
}));
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(morgan('dev'));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve static assets / frontend preview
const frontendDir = path.resolve(__dirname, '../../3D_interior/atelierai_interactive_3d_spatial_studio');
app.use('/studio', express.static(frontendDir));
app.use(express.static(path.resolve(__dirname, '../public')));

// Root Route: Redirect or display interactive studio overview
app.get('/', (req, res) => {
  res.redirect('/studio/code.html');
});

// Root Healthcheck & Welcome
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    platform: 'AtelierAI 3D Spatial Engine',
    version: '1.0.0',
    studioUrl: '/studio/code.html',
    timestamp: new Date().toISOString()
  });
});

// Mount Core API Modules
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/prompt', promptRoutes);
app.use('/api/generate', generateRoutes);
app.use('/api/export', exportRoutes);

// Global 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `Route ${req.method} ${req.originalUrl} not found.`
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({
    success: false,
    error: err.message || 'Internal Server Error'
  });
});

// Start Server only if directly executed
const isMain = process.argv[1] && process.argv[1].endsWith('server.js');
if (isMain) {
  app.listen(PORT, () => {
    console.log(`\n======================================================`);
    console.log(`✨ AtelierAI Backend Server is running on port ${PORT}`);
    console.log(`📡 Healthcheck:      http://localhost:${PORT}/api/health`);
    console.log(`🎨 Studio Frontend:  http://localhost:${PORT}/studio/code.html`);
    console.log(`🔑 Gemini Key:       Configured (${process.env.GEMINI_API_KEY ? 'Active' : 'Missing'})`);
    console.log(`======================================================\n`);
  });
}

export default app;
