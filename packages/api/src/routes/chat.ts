import { Router } from 'express';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { query, queryOne } from '../db/connection';
import { llmService } from '../services/llm';
import { buildChatSystemPrompt } from '../services/llm/prompts';
import { optionalAuth, type AuthenticatedRequest } from '../middleware/auth';
import { AppError } from '../middleware/error';
import type { ChatSession, ChatMessage } from '@upaya/shared';

export const chatRouter = Router();

const createSessionSchema = z.object({
  problemType: z.string().optional(),
  language: z.enum(['hi', 'en']).default('hi'),
  seedMessage: z.string().optional(), // First AI qualifying question shown client-side
});

/**
 * POST /api/chat/sessions
 * Create a new chat session. Works for both anonymous and authenticated users.
 */
chatRouter.post('/sessions', optionalAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const body = createSessionSchema.parse(req.body);
    const sessionId = uuidv4();

    // Look up user ID from Firebase UID if authenticated
    let userId: string | null = null;
    if (req.user) {
      const user = await queryOne<{ id: string }>(
        'SELECT id FROM users WHERE firebase_uid = $1',
        [req.user.uid],
      );
      userId = user?.id ?? null;
    }

    const rows = await query<ChatSession>(
      `INSERT INTO chat_sessions (user_id, session_id, problem_type, language)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [userId, sessionId, body.problemType || null, body.language],
    );

    // Seed the qualifying question as the first assistant message so the LLM
    // has full context when the user replies (exchange 2).
    if (body.seedMessage) {
      await query(
        `INSERT INTO chat_messages (session_id, role, content, message_type)
         VALUES ($1, 'assistant', $2, 'text')`,
        [rows[0].id, body.seedMessage],
      );
    }

    res.status(201).json({ session: rows[0] });
  } catch (error) {
    if (error instanceof z.ZodError) {
      next(new AppError(400, 'Invalid request body', 'VALIDATION_ERROR'));
      return;
    }
    next(error);
  }
});

const sendMessageSchema = z.object({
  content: z.string().min(1),
  messageType: z.string().default('text'),
  metadata: z.record(z.unknown()).optional(),
});

/**
 * POST /api/chat/sessions/:sessionId/messages
 * Send a message in a chat session and get an AI response.
 */
chatRouter.post(
  '/sessions/:sessionId/messages',
  optionalAuth,
  async (req: AuthenticatedRequest, res, next) => {
    try {
      const { sessionId } = req.params;
      const body = sendMessageSchema.parse(req.body);

      // Verify session exists
      const session = await queryOne<ChatSession>(
        'SELECT * FROM chat_sessions WHERE session_id = $1',
        [sessionId],
      );

      if (!session) {
        throw new AppError(404, 'Chat session not found', 'SESSION_NOT_FOUND');
      }

      // Save user message
      await query(
        `INSERT INTO chat_messages (session_id, role, content, message_type, metadata)
         VALUES ($1, 'user', $2, $3, $4)`,
        [session.id, body.content, body.messageType, body.metadata ? JSON.stringify(body.metadata) : null],
      );

      // Get conversation history for context
      const history = await query<ChatMessage>(
        `SELECT role, content FROM chat_messages
         WHERE session_id = $1 ORDER BY created_at ASC`,
        [session.id],
      );

      // Detect language from the user's actual message (Devanagari = hi, else en)
      const detectedLanguage: 'hi' | 'en' = /[\u0900-\u097F]/.test(body.content) ? 'hi' : 'en';

      // Detect which exchange we're in by counting AI responses already in history.
      // Exchange 2 (deepening follow-up): AI has replied once (assistantCount === 1).
      // Exchange 3 (curiosity bridge + CTA): AI has replied twice (assistantCount === 2).
      // Using assistantCount alone works regardless of how many user messages came first.
      const assistantCount = history.filter((m) => m.role === 'assistant').length;
      const isExchange2 = assistantCount === 1;
      const isExchange3 = assistantCount === 2;

      // Generate AI response
      const aiResponse = await llmService.generateChatResponse({
        messages: history.map((m) => ({
          role: m.role as 'user' | 'assistant',
          content: m.content,
        })),
        systemPrompt: buildChatSystemPrompt(detectedLanguage, { isExchange2, isExchange3 }),
        language: detectedLanguage,
      });

      // Save AI response
      const aiMessages = await query<ChatMessage>(
        `INSERT INTO chat_messages (session_id, role, content, message_type, metadata)
         VALUES ($1, 'assistant', $2, 'text', $3)
         RETURNING *`,
        [
          session.id,
          aiResponse.content,
          aiResponse.quickReplies ? JSON.stringify({ quickReplies: aiResponse.quickReplies }) : null,
        ],
      );

      res.json({
        userMessage: { content: body.content, role: 'user' },
        aiMessage: aiMessages[0],
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        next(new AppError(400, 'Invalid request body', 'VALIDATION_ERROR'));
        return;
      }
      next(error);
    }
  },
);

/**
 * GET /api/chat/sessions/:sessionId/messages
 * Get all messages in a chat session.
 */
chatRouter.get('/sessions/:sessionId/messages', optionalAuth, async (req, res, next) => {
  try {
    const { sessionId } = req.params;

    const session = await queryOne<ChatSession>(
      'SELECT * FROM chat_sessions WHERE session_id = $1',
      [sessionId],
    );

    if (!session) {
      throw new AppError(404, 'Chat session not found', 'SESSION_NOT_FOUND');
    }

    const messages = await query<ChatMessage>(
      `SELECT * FROM chat_messages
       WHERE session_id = $1 ORDER BY created_at ASC`,
      [session.id],
    );

    res.json({ messages });
  } catch (error) {
    next(error);
  }
});
