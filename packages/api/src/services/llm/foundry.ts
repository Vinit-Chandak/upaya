import OpenAI from 'openai';
import { config } from '../../config';
import type { LLMProvider, DiagnosisInput, DiagnosisOutput, ChatInput, ChatOutput } from './types';
import { buildDiagnosisPrompt, parseDiagnosisResponse } from './prompts';

/**
 * Microsoft Azure AI Foundry provider.
 *
 * Uses the OpenAI-compatible /openai/v1 endpoint exposed by Azure AI Foundry.
 * Auth is via `api-key` header (same key passed as `apiKey` to the OpenAI client).
 *
 * Endpoint format: https://<resource>.services.ai.azure.com/openai/v1
 */
export class FoundryProvider implements LLMProvider {
  readonly name = 'foundry';
  private client: OpenAI;
  private model: string;

  constructor() {
    this.client = new OpenAI({
      apiKey: config.llm.foundry.apiKey,
      baseURL: config.llm.foundry.baseURL,
      defaultHeaders: {
        'api-key': config.llm.foundry.apiKey,
      },
    });
    this.model = config.llm.foundry.model;
  }

  async generateDiagnosis(input: DiagnosisInput): Promise<DiagnosisOutput> {
    const prompt = buildDiagnosisPrompt(input);

    const response = await this.client.chat.completions.create({
      model: this.model,
      max_tokens: 4096,
      messages: [
        { role: 'system', content: prompt.system },
        { role: 'user', content: prompt.user },
      ],
    });

    const text = response.choices[0]?.message?.content || '';
    return parseDiagnosisResponse(text);
  }

  async generateChatResponse(input: ChatInput): Promise<ChatOutput> {
    const response = await this.client.chat.completions.create({
      model: this.model,
      max_tokens: 1024,
      messages: [
        { role: 'system', content: input.systemPrompt },
        ...input.messages.map((m) => ({
          role: m.role as 'user' | 'assistant',
          content: m.content,
        })),
      ],
    });

    const text = response.choices[0]?.message?.content || '';
    return { content: text };
  }
}
