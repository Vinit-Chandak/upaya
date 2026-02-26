import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3001', 10),
  corsOrigins: (process.env.CORS_ORIGINS || 'http://localhost:3000').split(','),

  database: {
    url: process.env.DATABASE_URL || 'postgresql://localhost:5432/upaya',
    ssl: process.env.DATABASE_SSL === 'true',
  },

  firebase: {
    projectId: process.env.FIREBASE_PROJECT_ID || '',
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL || '',
    privateKey: (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
  },

  llm: {
    defaultProvider: (process.env.LLM_DEFAULT_PROVIDER || 'anthropic') as
      | 'anthropic'
      | 'openai'
      | 'gemini'
      | 'azure_openai',
    fallbackProvider: (process.env.LLM_FALLBACK_PROVIDER || 'openai') as
      | 'anthropic'
      | 'openai'
      | 'gemini'
      | 'azure_openai',
    anthropic: {
      apiKey: process.env.ANTHROPIC_API_KEY || '',
      model: 'claude-sonnet-4-20250514',
    },
    openai: {
      apiKey: process.env.OPENAI_API_KEY || '',
      model: 'gpt-4o',
    },
    gemini: {
      apiKey: process.env.GOOGLE_GEMINI_API_KEY || '',
      model: 'gemini-2.0-flash',
    },
    azureOpenai: {
      endpoint: process.env.AZURE_OPENAI_ENDPOINT || '',
      apiKey: process.env.AZURE_OPENAI_API_KEY || '',
      deploymentName: process.env.AZURE_OPENAI_DEPLOYMENT_NAME || '',
      apiVersion: process.env.AZURE_OPENAI_API_VERSION || '2024-12-01-preview',
    },
  },

  razorpay: {
    keyId: process.env.RAZORPAY_KEY_ID || '',
    keySecret: process.env.RAZORPAY_KEY_SECRET || '',
    webhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET || '',
  },

  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
  },

  jwt: {
    secret: process.env.JWT_SECRET || 'dev-secret-change-me',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
} as const;
