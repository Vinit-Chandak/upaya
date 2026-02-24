import Anthropic from '@anthropic-ai/sdk';
import { config } from '../../config';
import type { LLMProvider, DiagnosisInput, DiagnosisOutput, ChatInput, ChatOutput } from './types';
import { buildDiagnosisPrompt, buildChatSystemPrompt, parseDiagnosisResponse } from './prompts';

export class AnthropicProvider implements LLMProvider {
  readonly name = 'anthropic';
  private client: Anthropic;
  private model: string;

  constructor() {
    this.client = new Anthropic({
      apiKey: config.llm.anthropic.apiKey,
    });
    this.model = config.llm.anthropic.model;
  }

  async generateDiagnosis(input: DiagnosisInput): Promise<DiagnosisOutput> {
    const prompt = buildDiagnosisPrompt(input);

    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: 4096,
      system: prompt.system,
      messages: [{ role: 'user', content: prompt.user }],
    });

    const text =
      response.content[0].type === 'text' ? response.content[0].text : '';

    return parseDiagnosisResponse(text);
  }

  async generateChatResponse(input: ChatInput): Promise<ChatOutput> {
    const systemPrompt = buildChatSystemPrompt(input.language);

    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: 1024,
      system: systemPrompt,
      messages: input.messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
    });

    const text =
      response.content[0].type === 'text' ? response.content[0].text : '';

    return { content: text };
  }
}
