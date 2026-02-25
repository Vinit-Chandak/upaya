import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config';
import { authRouter } from './routes/auth';
import { chatRouter } from './routes/chat';
import { kundliRouter } from './routes/kundli';
import { diagnosisRouter } from './routes/diagnosis';
import { reportRouter } from './routes/report';
import { paymentRouter } from './routes/payment';
import { referralRouter } from './routes/referral';
import { errorHandler } from './middleware/error';
import { requestLogger } from './middleware/logger';

const app = express();

// --- Global Middleware ---
app.use(helmet());
app.use(
  cors({
    origin: config.corsOrigins,
    credentials: true,
  }),
);
app.use(express.json({ limit: '10mb' }));
app.use(requestLogger);

// --- Health Check ---
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '0.1.0',
  });
});

// --- API Routes ---
app.use('/api/auth', authRouter);
app.use('/api/chat', chatRouter);
app.use('/api/kundli', kundliRouter);
app.use('/api/diagnosis', diagnosisRouter);
app.use('/api/reports', reportRouter);
app.use('/api/payments', paymentRouter);
app.use('/api/referrals', referralRouter);

// --- Error Handler (must be last) ---
app.use(errorHandler);

// --- Start Server ---
app.listen(config.port, () => {
  console.log(`[Upaya API] Server running on port ${config.port}`);
  console.log(`[Upaya API] Environment: ${config.env}`);
  console.log(`[Upaya API] Health check: http://localhost:${config.port}/health`);
});

export { app };
