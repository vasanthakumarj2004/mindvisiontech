import cors from 'cors';
import express from 'express';
import morgan from 'morgan';
import { connectDatabase } from './config/db.js';
import { env } from './config/env.js';
import { errorHandler } from './middleware/errorHandler.js';
import branchRoutes from './routes/branchRoutes.js';
import courseRoutes from './routes/courseRoutes.js';
import leadRoutes from './routes/leadRoutes.js';

const app = express();
app.use(cors({ origin: env.clientUrl }));
app.use(express.json());
app.use(morgan('dev'));

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));
app.use('/api/courses', courseRoutes);
app.use('/api/branches', branchRoutes);
app.use('/api/leads', leadRoutes);
app.use(errorHandler);

if (process.env.NODE_ENV !== 'test') {
  connectDatabase(env.mongoUri)
    .then(() => app.listen(env.port, () => console.log(`API listening on http://localhost:${env.port}`)))
    .catch((error) => {
      console.error('Unable to start server', error);
      process.exit(1);
    });
}

export default app;