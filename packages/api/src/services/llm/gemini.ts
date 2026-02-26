import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from '../../config';
import type { LLMProvider, DiagnosisInput, DiagnosisOutput, ChatInput, ChatOutput } from './types';
import { buildDiagnosisPrompt, parseDiagnosisResponse } from './prompts';

export class GeminiProvider implements LLMProvider {
  readonly name = 'gemini';
  private genAI: GoogleGenerativeAI;
  private model: string;

  constructor() {
    this.genAI = new GoogleGenerativeAI(config.llm.gemini.apiKey);
    this.model = config.llm.gemini.model;
  }

  async generateDiagnosis(input: DiagnosisInput): Promise<DiagnosisOutput> {
    const prompt = buildDiagnosisPrompt(input);
    const model = this.genAI.getGenerativeModel({
      model: this.model,
      systemInstruction: prompt.system,
    });

    const result = await model.generateContent(prompt.user);
    const text = result.response.text();

    return parseDiagnosisResponse(text);
  }

  async generateChatResponse(input: ChatInput): Promise<ChatOutput> {
    const model = this.genAI.getGenerativeModel({
      model: this.model,
      systemInstruction: input.systemPrompt,
    });

    const chat = model.startChat({
      history: input.messages.slice(0, -1).map((m) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      })),
    });

    const lastMessage = input.messages[input.messages.length - 1];
    const result = await chat.sendMessage(lastMessage.content);
    const text = result.response.text();

    return { content: text };
  }
}
