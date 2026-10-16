import express from 'express';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { initDatabase, pool } from './config/db.js';
import { 
  helmetMiddleware, 
  corsMiddleware, 
  generalApiLimiter 
} from './middleware/security.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import admissionRoutes from './routes/admissionRoutes.js';

// Load environment configuration
dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || '5000', 10);
const isDevelopment = process.env.NODE_ENV !== 'production';

// Trust reverse proxy headers (e.g., NGINX, Cloudflare) for rate limiting & IP extraction
app.set('trust proxy', 1);

// 1. Security Headers (Helmet)
app.use(helmetMiddleware);

// 2. Strict Cross-Origin Resource Sharing (CORS)
app.use(corsMiddleware);

// 3. Global Rate Limiter
app.use('/api', generalApiLimiter);

// 4. Request Body Parsers with Strict Size Limits (prevents payload flooding attacks)
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: false, limit: '10kb' }));

// 5. HTTP Logging
app.use(morgan(isDevelopment ? 'dev' : 'combined'));

// 6. Direct Root Health Check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// 7. API Routes
app.use('/api', admissionRoutes);

// 8. 404 Not Found Handler
app.use(notFoundHandler);

// 9. Centralized Error Handler (Prevents stack trace leaks)
app.use(errorHandler);

// Server startup function
async function startServer() {
  try {
    // Initialize MySQL Database & Admissions Table
    await initDatabase();

    const server = app.listen(PORT, () => {
      console.log(`===============================================`);
      console.log(` School Admission Backend Running Successfully`);
      console.log(` Port:    http://localhost:${PORT}`);
      console.log(` Mode:    ${process.env.NODE_ENV || 'development'}`);
      console.log(` Health:  http://localhost:${PORT}/health`);
      console.log(` API:     http://localhost:${PORT}/api/admissions`);
      console.log(`===============================================`);
    });

    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`\n[Fatal Error] Port ${PORT} is already in use by another process.`);
        console.error(`To free port ${PORT}, run: fuser -k ${PORT}/tcp or lsof -ti :${PORT} | xargs kill -9\n`);
      } else {
        console.error('[Server Error]', err);
      }
      process.exit(1);
    });

    // Graceful Shutdown Handlers
    const handleShutdown = async (signal) => {
      console.log(`\n[Server] Received ${signal}. Closing HTTP server and database pool...`);
      server.close(async () => {
        try {
          await pool.end();
          console.log('[DB] MySQL pool closed successfully.');
          process.exit(0);
        } catch (dbErr) {
          console.error('[DB Error] Error during pool closure:', dbErr);
          process.exit(1);
        }
      });
    };

    process.on('SIGTERM', () => handleShutdown('SIGTERM'));
    process.on('SIGINT', () => handleShutdown('SIGINT'));

  } catch (error) {
    console.error('[Fatal Error] Unable to start server:', error);
    process.exit(1);
  }
}

startServer();

