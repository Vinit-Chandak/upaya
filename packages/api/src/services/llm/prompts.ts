import type { DiagnosisInput, DiagnosisOutput } from './types';

/**
 * Build the system + user prompt for diagnosis generation.
 */
export function buildDiagnosisPrompt(input: DiagnosisInput): {
  system: string;
  user: string;
} {
  const languageInstruction =
    input.language === 'hi'
      ? 'Respond in Hindi (Devanagari + Roman transliteration where appropriate). Use natural, empathetic Hindi — not translated English.'
      : 'Respond in English. Be empathetic and warm.';

  const system = `You are Upaya's AI astrology diagnosis engine. You analyze Vedic kundli (birth chart) data and provide accurate, empathetic diagnosis.

RULES:
- You MUST base your analysis on the actual planetary positions provided.
- NEVER use words like "danger", "cursed", "terrible", "disaster".
- Use: "challenging period", "temporary blockage", "significant influence".
- ALWAYS end with hope and actionable remedies.
- Frame dosha levels as: "Significant", "Moderate", or "Mild" — NEVER use scary numerical scores.
- Include "Commonly addressed? YES" and "Responsive to remedies? Highly responsive" where appropriate.
- Provide 2-3 FREE actionable remedies (mantras with both Devanagari and Roman text, fasting, daan).
- Reference specific Vedic houses and planets in your explanation.
- ${languageInstruction}

OUTPUT FORMAT: Respond with a JSON object matching the DiagnosisOutput schema. Do NOT wrap in markdown code blocks.`;

  const user = `Analyze this kundli for a user experiencing "${input.problemType}":

KUNDLI DATA:
${JSON.stringify(input.kundliData, null, 2)}

USER'S EMOTIONAL CONTEXT:
"${input.emotionalContext}"

QUALIFYING ANSWER:
"${input.qualifyingAnswer}"

Provide a complete diagnosis with:
1. Root dosha identification
2. Impacted areas (primary + secondary)
3. Dosha assessment (level, commonly addressed?, responsive to remedies?)
4. Positive message
5. 2-3 FREE remedies with mantra text (Devanagari + Roman), frequency, and duration
6. Brief descriptions of what the full paid report would contain`;

  return { system, user };
}

/**
 * Build the system prompt for chat responses.
 */
export function buildChatSystemPrompt(language: 'hi' | 'en'): string {
  const languageInstruction =
    language === 'hi'
      ? 'Respond in natural Hindi. Mix in common English words where Indians naturally would (like "problem", "solution", "career"). Use Devanagari script.'
      : 'Respond in English. Be warm and empathetic. Use simple language accessible to Indian users.';

  return `You are Upaya's AI spiritual advisor. You help users understand their problems through the lens of Vedic astrology.

PERSONALITY:
- Warm, empathetic, like a wise elder (not robotic)
- Acknowledge emotions before analysis
- Use reassuring tone — never alarming
- Mirror the user's language style

CONVERSATION RULES:
- Maximum 2 exchanges before curiosity bridge + birth details request
- Exchange 1: Empathy + ONE qualifying question
- Exchange 2: Curiosity bridge (partial insight) + birth details CTA
- NEVER ask more than one question per message
- Keep messages concise — max 4-5 sentences

SAFETY RULES:
- If user mentions suicide/self-harm: Show AASRA helpline 9820466726 (24/7). Pause remedy flow.
- If user mentions health conditions: Advise professional medical help alongside spiritual guidance.
- If user asks about gambling/lottery: Redirect to financial stability remedies.
- NEVER promise specific outcomes.

${languageInstruction}`;
}

/**
 * Parse the LLM's diagnosis response into a structured DiagnosisOutput.
 */
export function parseDiagnosisResponse(text: string): DiagnosisOutput {
  try {
    // Try parsing as JSON directly
    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(cleaned) as DiagnosisOutput;
  } catch {
    // If JSON parsing fails, return a fallback structure
    console.warn('[LLM] Failed to parse diagnosis response as JSON, using fallback');
    return {
      rootDosha: 'unknown',
      rootPlanets: [],
      affectedHouses: [],
      severityLevel: 'moderate',
      responsivenessLevel: 'responsive',
      isCommonlyAddressed: true,
      impactedAreas: {
        primary: 'General life areas',
        secondary: [],
      },
      positiveMessage:
        'Your chart shows areas that can be improved with the right remedies. Many people with similar charts have found positive changes.',
      freeRemedies: [],
      fullRemedies: [],
    };
  }
}
