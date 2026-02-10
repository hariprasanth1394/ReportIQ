import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from './config.js';
import './firebase.js'; // Initialize Firebase
import authRoutes from './routes/auth.js';
import executionRoutes from './routes/executions.js';
import userRoutes from './routes/users.js';
import { authenticate } from './middleware/auth.js';

const app = express();
app.use(helmet());
app.use(cors({ origin: config.allowOrigins, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(morgan('dev'));

app.get('/health', (_req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/executions', authenticate, executionRoutes);

app.use((err, _req, res, _next) => {
  // eslint-disable-next-line no-console
  console.error('Error:', err);
  return res.status(500).json({ message: 'Internal server error', detail: err.message });
});

app.listen(config.port, () => {
  // eslint-disable-next-line no-console
  console.log(`Reporter backend listening on port ${config.port}`);
});
