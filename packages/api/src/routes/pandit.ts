import { Router } from 'express';
import { z } from 'zod';
import { query, queryOne } from '../db/connection';
import { requireAuth, type AuthenticatedRequest } from '../middleware/auth';
import { AppError } from '../middleware/error';
import { llmService } from '../services/llm';

export const panditRouter = Router();

/**
 * GET /api/pandits
 * List available pandits with optional speciality filter.
 */
panditRouter.get('/', async (req, res, next) => {
  try {
    const { speciality } = req.query;

    let sql = `SELECT * FROM pandits WHERE status = 'active'`;
    const params: unknown[] = [];
    let paramIdx = 1;

    if (speciality) {
      sql += ` AND specialities @> $${paramIdx}::jsonb`;
      params.push(JSON.stringify([speciality]));
      paramIdx++;
    }

    sql += ' ORDER BY rating DESC, total_consultations DESC';

    const pandits = await query(sql, params);
    res.json({ pandits });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/pandits/:id
 * Get pandit profile details.
 */
panditRouter.get('/:id', async (req, res, next) => {
  try {
    const pandit = await queryOne(
      `SELECT * FROM pandits WHERE id = $1 AND status = 'active'`,
      [req.params.id],
    );
    if (!pandit) throw new AppError(404, 'Pandit not found', 'PANDIT_NOT_FOUND');

    res.json({ pandit });
  } catch (error) {
    next(error);
  }
});

const createSessionSchema = z.object({
  panditId: z.string().uuid(),
  type: z.enum(['chat', 'call']).default('chat'),
});

/**
 * POST /api/pandit-sessions
 * Start a consultation session. Requires auth and sufficient wallet balance.
 */
panditRouter.post('/sessions', requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const body = createSessionSchema.parse(req.body);

    const user = await queryOne<{ id: string }>(
      'SELECT id FROM users WHERE firebase_uid = $1',
      [req.user!.uid],
    );
    if (!user) throw new AppError(404, 'User not found', 'USER_NOT_FOUND');

    // Verify pandit exists and is active
    const pandit = await queryOne<{ id: string; price_per_min_chat: number; price_per_min_call: number }>(
      `SELECT id, price_per_min_chat, price_per_min_call FROM pandits WHERE id = $1 AND status = 'active'`,
      [body.panditId],
    );
    if (!pandit) throw new AppError(404, 'Pandit not found', 'PANDIT_NOT_FOUND');

    // Check wallet balance (minimum 5 minutes worth)
    const pricePerMin = body.type === 'chat' ? pandit.price_per_min_chat : pandit.price_per_min_call;
    const minimumBalance = pricePerMin * 5;

    const wallet = await queryOne<{ id: string; balance: number }>(
      'SELECT id, balance FROM wallets WHERE user_id = $1',
      [user.id],
    );

    if (!wallet || wallet.balance < minimumBalance) {
      throw new AppError(400, 'Insufficient wallet balance', 'INSUFFICIENT_BALANCE');
    }

    // Generate AI brief from user's data
    let aiBrief = null;
    try {
      // Get user's latest diagnosis and chat data for the AI brief
      const latestDiagnosis = await queryOne<{ result: string; problem_type: string }>(
        `SELECT d.result, d.problem_type FROM diagnoses d
         JOIN kundlis k ON k.id = d.kundli_id
         WHERE k.user_id = $1
         ORDER BY d.created_at DESC LIMIT 1`,
        [user.id],
      );

      if (latestDiagnosis) {
        aiBrief = {
          problemCategory: latestDiagnosis.problem_type || 'General',
          problemDuration: 'Not specified',
          chartHighlights: 'See diagnosis details',
          currentDasha: 'See diagnosis details',
          severity: 'See diagnosis details',
          currentRemedies: [],
          userExpectations: 'Guidance and additional remedy advice',
          instructionNote: 'User has already seen AI diagnosis. Session should build on it, not contradict it.',
        };
      }
    } catch {
      // AI brief generation is non-critical
    }

    // Create session
    const session = await queryOne(
      `INSERT INTO pandit_sessions (user_id, pandit_id, type, start_time, ai_brief_json, status)
       VALUES ($1, $2, $3, NOW(), $4, 'active')
       RETURNING *`,
      [user.id, body.panditId, body.type, aiBrief ? JSON.stringify(aiBrief) : null],
    );

    res.status(201).json({ session });
  } catch (error) {
    if (error instanceof z.ZodError) {
      next(new AppError(400, 'Invalid request body', 'VALIDATION_ERROR'));
      return;
    }
    next(error);
  }
});

/**
 * GET /api/pandit-sessions
 * List user's past sessions.
 */
panditRouter.get('/sessions', requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const user = await queryOne<{ id: string }>(
      'SELECT id FROM users WHERE firebase_uid = $1',
      [req.user!.uid],
    );
    if (!user) throw new AppError(404, 'User not found', 'USER_NOT_FOUND');

    const sessions = await query(
      `SELECT ps.*, p.name AS pandit_name, p.name_hi AS pandit_name_hi, p.photo_url AS pandit_photo_url
       FROM pandit_sessions ps
       JOIN pandits p ON p.id = ps.pandit_id
       WHERE ps.user_id = $1
       ORDER BY ps.created_at DESC`,
      [user.id],
    );

    res.json({ sessions });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/pandit-sessions/:id
 * Get session details + AI summary.
 */
panditRouter.get('/sessions/:id', requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const user = await queryOne<{ id: string }>(
      'SELECT id FROM users WHERE firebase_uid = $1',
      [req.user!.uid],
    );
    if (!user) throw new AppError(404, 'User not found', 'USER_NOT_FOUND');

    const session = await queryOne(
      `SELECT ps.*, p.name AS pandit_name, p.name_hi AS pandit_name_hi, p.photo_url AS pandit_photo_url
       FROM pandit_sessions ps
       JOIN pandits p ON p.id = ps.pandit_id
       WHERE ps.id = $1 AND ps.user_id = $2`,
      [req.params.id, user.id],
    );

    if (!session) throw new AppError(404, 'Session not found', 'SESSION_NOT_FOUND');

    res.json({ session });
  } catch (error) {
    next(error);
  }
});

const sendMessageSchema = z.object({
  content: z.string().min(1).max(5000),
});

/**
 * POST /api/pandit-sessions/:id/messages
 * Send a message in a pandit consultation session. Deducts wallet balance per minute.
 */
panditRouter.post('/sessions/:id/messages', requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const body = sendMessageSchema.parse(req.body);

    const user = await queryOne<{ id: string }>(
      'SELECT id FROM users WHERE firebase_uid = $1',
      [req.user!.uid],
    );
    if (!user) throw new AppError(404, 'User not found', 'USER_NOT_FOUND');

    const session = await queryOne<{ id: string; pandit_id: string; messages_json: string; status: string; start_time: string; cost: number }>(
      `SELECT * FROM pandit_sessions WHERE id = $1 AND user_id = $2`,
      [req.params.id, user.id],
    );

    if (!session) throw new AppError(404, 'Session not found', 'SESSION_NOT_FOUND');
    if (session.status !== 'active') throw new AppError(400, 'Session is not active', 'SESSION_NOT_ACTIVE');

    // Add message to session
    const messages = typeof session.messages_json === 'string'
      ? JSON.parse(session.messages_json)
      : session.messages_json || [];
    messages.push({
      role: 'user',
      content: body.content,
      timestamp: new Date().toISOString(),
    });

    // Calculate cost based on elapsed time
    const pandit = await queryOne<{ price_per_min_chat: number }>(
      'SELECT price_per_min_chat FROM pandits WHERE id = $1',
      [session.pandit_id],
    );
    const startTime = new Date(session.start_time);
    const elapsedMinutes = Math.ceil((Date.now() - startTime.getTime()) / 60000);
    const totalCost = elapsedMinutes * (pandit?.price_per_min_chat || 1000);

    await query(
      'UPDATE pandit_sessions SET messages_json = $1, cost = $2 WHERE id = $3',
      [JSON.stringify(messages), totalCost, req.params.id],
    );

    // Check wallet balance
    const wallet = await queryOne<{ balance: number }>(
      'SELECT balance FROM wallets WHERE user_id = $1',
      [user.id],
    );

    const remainingBalance = (wallet?.balance || 0) - totalCost;

    res.json({
      message: { role: 'user', content: body.content, timestamp: new Date().toISOString() },
      elapsedMinutes,
      totalCost,
      remainingBalance: Math.max(0, remainingBalance),
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      next(new AppError(400, 'Invalid request body', 'VALIDATION_ERROR'));
      return;
    }
    next(error);
  }
});

const endSessionSchema = z.object({
  rating: z.number().int().min(1).max(5).optional(),
});

/**
 * PATCH /api/pandit-sessions/:id/end
 * End a consultation session. Generates AI summary and deducts wallet.
 */
panditRouter.patch('/sessions/:id/end', requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const body = endSessionSchema.parse(req.body);

    const user = await queryOne<{ id: string }>(
      'SELECT id FROM users WHERE firebase_uid = $1',
      [req.user!.uid],
    );
    if (!user) throw new AppError(404, 'User not found', 'USER_NOT_FOUND');

    const session = await queryOne<{ id: string; pandit_id: string; start_time: string; cost: number; messages_json: string }>(
      `SELECT * FROM pandit_sessions WHERE id = $1 AND user_id = $2 AND status = 'active'`,
      [req.params.id, user.id],
    );

    if (!session) throw new AppError(404, 'Active session not found', 'SESSION_NOT_FOUND');

    // Calculate final cost
    const pandit = await queryOne<{ price_per_min_chat: number; total_consultations: number; rating: number }>(
      'SELECT price_per_min_chat, total_consultations, rating FROM pandits WHERE id = $1',
      [session.pandit_id],
    );
    const startTime = new Date(session.start_time);
    const endTime = new Date();
    const durationMinutes = Math.ceil((endTime.getTime() - startTime.getTime()) / 60000);
    const finalCost = durationMinutes * (pandit?.price_per_min_chat || 1000);

    // Deduct from wallet
    const wallet = await queryOne<{ id: string; balance: number }>(
      'SELECT id, balance FROM wallets WHERE user_id = $1',
      [user.id],
    );

    if (wallet) {
      const newBalance = Math.max(0, wallet.balance - finalCost);
      await query('UPDATE wallets SET balance = $1 WHERE id = $2', [newBalance, wallet.id]);

      // Record wallet transaction
      await query(
        `INSERT INTO wallet_transactions (wallet_id, type, amount, description, reference_id)
         VALUES ($1, 'debit', $2, 'Pandit consultation', $3)`,
        [wallet.id, finalCost, req.params.id],
      );
    }

    // Generate AI summary (non-blocking)
    let aiSummary = null;
    try {
      const messages = typeof session.messages_json === 'string'
        ? JSON.parse(session.messages_json)
        : session.messages_json || [];

      if (messages.length > 0) {
        const summaryResponse = await llmService.generateChatResponse({
          messages: [
            { role: 'user', content: `Summarize this pandit consultation session. Extract: 1) Key points discussed 2) New remedies suggested 3) Timeline guidance. Session messages: ${JSON.stringify(messages)}` },
          ],
          systemPrompt: 'You are a summarization engine for astrology consultation sessions. Output a JSON object with fields: keyPoints (string array), newRemedies (array of {name, nameHi, type, description}), timelineGuidance (string).',
          language: 'en',
        });

        try {
          aiSummary = JSON.parse(summaryResponse.content);
        } catch {
          aiSummary = {
            keyPoints: [summaryResponse.content],
            newRemedies: [],
            timelineGuidance: '',
          };
        }
      }
    } catch {
      // AI summary is non-critical
    }

    // Update session
    await query(
      `UPDATE pandit_sessions SET end_time = NOW(), duration_minutes = $1, cost = $2, rating = $3, ai_summary_json = $4, status = 'ended'
       WHERE id = $5`,
      [durationMinutes, finalCost, body.rating || null, aiSummary ? JSON.stringify(aiSummary) : null, req.params.id],
    );

    // Update pandit stats
    if (pandit && body.rating) {
      const newTotal = pandit.total_consultations + 1;
      const newRating = ((pandit.rating * pandit.total_consultations) + body.rating) / newTotal;
      await query(
        'UPDATE pandits SET total_consultations = $1, rating = $2 WHERE id = $3',
        [newTotal, Math.round(newRating * 100) / 100, session.pandit_id],
      );
    }

    const updatedSession = await queryOne(
      'SELECT * FROM pandit_sessions WHERE id = $1',
      [req.params.id],
    );

    res.json({ session: updatedSession });
  } catch (error) {
    if (error instanceof z.ZodError) {
      next(new AppError(400, 'Invalid request body', 'VALIDATION_ERROR'));
      return;
    }
    next(error);
  }
});
