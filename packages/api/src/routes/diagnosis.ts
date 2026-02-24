import { Router } from 'express';
import { z } from 'zod';
import { query, queryOne } from '../db/connection';
import { llmService } from '../services/llm';
import { optionalAuth, type AuthenticatedRequest } from '../middleware/auth';
import { AppError } from '../middleware/error';
import type { Diagnosis, Kundli } from '@upaya/shared';

export const diagnosisRouter = Router();

const generateDiagnosisSchema = z.object({
  kundliId: z.string().uuid(),
  chatSessionId: z.string().uuid().optional(),
  problemType: z.string(),
  emotionalContext: z.string(),
  qualifyingAnswer: z.string(),
  language: z.enum(['hi', 'en']).default('hi'),
});

/**
 * POST /api/diagnosis/generate
 * Generate a diagnosis from kundli data and user context.
 */
diagnosisRouter.post(
  '/generate',
  optionalAuth,
  async (req: AuthenticatedRequest, res, next) => {
    try {
      const body = generateDiagnosisSchema.parse(req.body);

      // Fetch kundli data
      const kundli = await queryOne<Kundli>(
        'SELECT * FROM kundlis WHERE id = $1',
        [body.kundliId],
      );

      if (!kundli) {
        throw new AppError(404, 'Kundli not found', 'KUNDLI_NOT_FOUND');
      }

      // Generate diagnosis using LLM with rule engine validation
      const result = await llmService.generateDiagnosis({
        kundliData: kundli.planetaryData as unknown as Record<string, unknown>,
        problemType: body.problemType as Parameters<typeof llmService.generateDiagnosis>[0]['problemType'],
        emotionalContext: body.emotionalContext,
        qualifyingAnswer: body.qualifyingAnswer,
        language: body.language,
      });

      // Store diagnosis
      const rows = await query<Diagnosis>(
        `INSERT INTO diagnoses (
          kundli_id, chat_session_id, problem_type, root_dosha,
          severity, impacted_areas, dasha_analysis,
          free_remedies, full_remedies, result, llm_provider
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING *`,
        [
          body.kundliId,
          body.chatSessionId || null,
          body.problemType,
          result.rootDosha,
          result.severityLevel,
          JSON.stringify(result.impactedAreas),
          null,
          JSON.stringify(result.freeRemedies),
          JSON.stringify(result.fullRemedies),
          JSON.stringify(result),
          result.provider,
        ],
      );

      res.status(201).json({ diagnosis: rows[0] });
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
 * GET /api/diagnosis/:id
 * Get a specific diagnosis by ID.
 */
diagnosisRouter.get('/:id', async (req, res, next) => {
  try {
    const diagnosis = await queryOne<Diagnosis>(
      'SELECT * FROM diagnoses WHERE id = $1',
      [req.params.id],
    );

    if (!diagnosis) {
      throw new AppError(404, 'Diagnosis not found', 'DIAGNOSIS_NOT_FOUND');
    }

    res.json({ diagnosis });
  } catch (error) {
    next(error);
  }
});
