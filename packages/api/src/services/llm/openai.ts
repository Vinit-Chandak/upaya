import OpenAI from 'openai';
import { config } from '../../config';
import type { LLMProvider, DiagnosisInput, DiagnosisOutput, ChatInput, ChatOutput } from './types';
import { buildDiagnosisPrompt, buildChatSystemPrompt, parseDiagnosisResponse } from './prompts';

export class OpenAIProvider implements LLMProvider {
  readonly name = 'openai';
  private client: OpenAI;
  private model: string;

  constructor() {
    this.client = new OpenAI({
      apiKey: config.llm.openai.apiKey,
    });
    this.model = config.llm.openai.model;
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
    const systemPrompt = buildChatSystemPrompt(input.language);

    const response = await this.client.chat.completions.create({
      model: this.model,
      max_tokens: 1024,
      messages: [
        { role: 'system', content: systemPrompt },
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
