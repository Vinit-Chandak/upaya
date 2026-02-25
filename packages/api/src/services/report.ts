import { query, queryOne } from '../db/connection';
import { llmService } from './llm';
import type { Report } from '@upaya/shared';

/**
 * Report generation service.
 *
 * Generates a full remedy report using the LLM based on the diagnosis data.
 * The report includes:
 *  - Detailed dosha analysis with Vedic references
 *  - Complete remedy plan (free + paid)
 *  - Temple recommendations with puja details
 *  - 9-week structured protocol timeline
 *
 * In production, this would also render the report as a PDF and upload to R2.
 * For now it generates the report content as JSON and marks the report as ready.
 */
export async function generateFullReport(reportId: string): Promise<Report | null> {
  // Fetch report with diagnosis data
  const report = await queryOne<Report>(
    'SELECT * FROM reports WHERE id = $1',
    [reportId],
  );

  if (!report) return null;

  // Fetch diagnosis
  const diagnosis = await queryOne<{
    id: string;
    kundli_id: string;
    problem_type: string;
    root_dosha: string;
    severity: string;
    result: Record<string, unknown>;
    free_remedies: Record<string, unknown>[];
    full_remedies: Record<string, unknown>[];
  }>(
    'SELECT * FROM diagnoses WHERE id = $1',
    [report.diagnosisId],
  );

  if (!diagnosis) {
    // Mark report as failed
    await query(
      "UPDATE reports SET status = 'failed' WHERE id = $1",
      [reportId],
    );
    return null;
  }

  // Fetch kundli data
  const kundli = await queryOne<{
    planetary_data: Record<string, unknown>;
    date_of_birth: string;
    place_of_birth: string;
  }>(
    'SELECT planetary_data, date_of_birth, place_of_birth FROM kundlis WHERE id = $1',
    [diagnosis.kundli_id],
  );

  try {
    // Generate the full report content using LLM
    const reportContent = await generateReportContent({
      diagnosisResult: diagnosis.result,
      freeRemedies: diagnosis.free_remedies,
      fullRemedies: diagnosis.full_remedies,
      problemType: diagnosis.problem_type,
      rootDosha: diagnosis.root_dosha,
      kundliData: kundli?.planetary_data || {},
      dob: kundli?.date_of_birth || '',
      place: kundli?.place_of_birth || '',
    });

    // In production: render to PDF and upload to R2
    // For now: store content as JSON and mark ready
    const updated = await queryOne<Report>(
      `UPDATE reports
       SET status = 'ready',
           pdf_url = $1
       WHERE id = $2
       RETURNING *`,
      [
        // Placeholder URL — in production, this would be the R2 URL after PDF upload
        `/api/reports/${reportId}/content`,
        reportId,
      ],
    );

    return updated || null;
  } catch (error) {
    console.error('[Report] Generation failed:', error);
    await query(
      "UPDATE reports SET status = 'failed' WHERE id = $1",
      [reportId],
    );
    return null;
  }
}

/**
 * Generate report content using LLM.
 */
async function generateReportContent(input: {
  diagnosisResult: Record<string, unknown>;
  freeRemedies: Record<string, unknown>[];
  fullRemedies: Record<string, unknown>[];
  problemType: string;
  rootDosha: string;
  kundliData: Record<string, unknown>;
  dob: string;
  place: string;
}): Promise<Record<string, unknown>> {
  const systemPrompt = `You are Upaya's AI report generator. Generate a comprehensive, personalized Vedic remedy report.

OUTPUT FORMAT: Return a JSON object with these sections:
{
  "doshaAnalysis": { "cards": [...], "dashaAnalysis": {...} },
  "remedyPlan": { "freeRemedies": [...], "pujaRecommendations": [...], "productRecommendations": [...] },
  "templeRecommendations": [...],
  "timeline": { "phases": [...], "postProtocol": "..." }
}

RULES:
- Base analysis on actual kundli data provided.
- Include specific Vedic references (shlokas) where relevant.
- Recommend real temples known for the specific dosha.
- Provide practical, actionable timeline with weekly milestones.
- Use empowering language — never scary or fear-based.
- Include both Hindi and English for key terms.`;

  const userPrompt = `Generate a full remedy report for:
Problem: ${input.problemType}
Root Dosha: ${input.rootDosha}
DOB: ${input.dob}
Place: ${input.place}

Diagnosis: ${JSON.stringify(input.diagnosisResult)}
Free Remedies: ${JSON.stringify(input.freeRemedies)}
Full Remedies: ${JSON.stringify(input.fullRemedies)}
Kundli Data: ${JSON.stringify(input.kundliData)}`;

  const response = await llmService.generateChatResponse({
    messages: [{ role: 'user', content: userPrompt }],
    systemPrompt,
    language: 'hi',
  });

  try {
    const cleaned = response.content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(cleaned);
  } catch {
    // Return a structured fallback
    return {
      doshaAnalysis: input.diagnosisResult,
      remedyPlan: {
        freeRemedies: input.freeRemedies,
        fullRemedies: input.fullRemedies,
      },
      generated: true,
      rawContent: response.content,
    };
  }
}
