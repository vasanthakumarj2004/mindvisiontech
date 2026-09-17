import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import { connectDatabase, disconnectDatabase } from './config/db.js';
import { env } from './config/env.js';
import { errorHandler } from './middleware/errorHandler.js';
import branchRoutes from './routes/branchRoutes.js';
import courseRoutes from './routes/courseRoutes.js';
import leadRoutes from './routes/leadRoutes.js';

const app = express();

if (env.nodeEnv === 'production') {
  app.set('trust proxy', 1);
}

app.use(helmet());

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || env.corsOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(null, false);
    },
    credentials: true
  })
);

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests from this IP, please try again after 15 minutes.' }
});
app.use('/api', apiLimiter);

app.use(express.json({ limit: '10kb' }));
app.use(morgan(env.nodeEnv === 'production' ? 'combined' : 'dev'));

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));
app.use('/api/courses', courseRoutes);
app.use('/api/branches', branchRoutes);
app.use('/api/leads', leadRoutes);
app.use(errorHandler);

let server;

if (process.env.NODE_ENV !== 'test') {
  connectDatabase(env.mongoUri)
    .then(() => {
      server = app.listen(env.port, () => console.info(`API listening on http://localhost:${env.port}`));
    })
    .catch((error) => {
      console.error('Unable to start server', error);
      process.exit(1);
    });

  const gracefulShutdown = (signal) => {
    console.info(`\n${signal} received. Closing HTTP server and database connections...`);
    if (server) {
      server.close(async () => {
        console.info('HTTP server closed.');
        try {
          await disconnectDatabase();
        } catch (err) {
          console.error('Error during database disconnect:', err);
        }
        process.exit(0);
      });
    } else {
      process.exit(0);
    }
  };

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
}

export default app;