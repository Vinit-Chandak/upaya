import { AzureOpenAI } from 'openai';
import { config } from '../../config';
import type { LLMProvider, DiagnosisInput, DiagnosisOutput, ChatInput, ChatOutput } from './types';
import { buildDiagnosisPrompt, parseDiagnosisResponse } from './prompts';

export class AzureOpenAIProvider implements LLMProvider {
  readonly name = 'azure_openai';
  private client: AzureOpenAI;
  private deploymentName: string;

  constructor() {
    this.client = new AzureOpenAI({
      endpoint: config.llm.azureOpenai.endpoint,
      apiKey: config.llm.azureOpenai.apiKey,
      apiVersion: config.llm.azureOpenai.apiVersion,
    });
    this.deploymentName = config.llm.azureOpenai.deploymentName;
  }

  async generateDiagnosis(input: DiagnosisInput): Promise<DiagnosisOutput> {
    const prompt = buildDiagnosisPrompt(input);

    const response = await this.client.chat.completions.create({
      model: this.deploymentName,
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
      model: this.deploymentName,
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
