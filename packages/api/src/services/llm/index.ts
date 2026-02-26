import { config } from '../../config';
import { AnthropicProvider } from './anthropic';
import { OpenAIProvider } from './openai';
import { GeminiProvider } from './gemini';
import { AzureOpenAIProvider } from './azure-openai';
import type { LLMProvider, DiagnosisInput, DiagnosisOutput, ChatInput, ChatOutput } from './types';

export type { LLMProvider, DiagnosisInput, DiagnosisOutput, ChatInput, ChatOutput };

type ProviderName = 'anthropic' | 'openai' | 'gemini' | 'azure_openai';

const providers: Record<ProviderName, () => LLMProvider> = {
  anthropic: () => new AnthropicProvider(),
  openai: () => new OpenAIProvider(),
  gemini: () => new GeminiProvider(),
  azure_openai: () => new AzureOpenAIProvider(),
};

// Cache provider instances
const instanceCache = new Map<ProviderName, LLMProvider>();

function getProvider(name: ProviderName): LLMProvider {
  if (!instanceCache.has(name)) {
    const factory = providers[name];
    if (!factory) {
      throw new Error(`Unknown LLM provider: ${name}`);
    }
    instanceCache.set(name, factory());
  }
  return instanceCache.get(name)!;
}

/**
 * Provider-agnostic LLM service with automatic fallback.
 *
 * Uses the configured default provider, falls back to the fallback provider
 * if the primary fails. Tracks usage metrics for cost optimization.
 */
export const llmService = {
  async generateDiagnosis(input: DiagnosisInput): Promise<DiagnosisOutput & { provider: string }> {
    const primaryName = config.llm.defaultProvider;
    const fallbackName = config.llm.fallbackProvider;

    try {
      const provider = getProvider(primaryName);
      const startTime = Date.now();
      const result = await provider.generateDiagnosis(input);
      const duration = Date.now() - startTime;
      console.log(`[LLM] Diagnosis via ${primaryName} in ${duration}ms`);
      return { ...result, provider: primaryName };
    } catch (error) {
      console.warn(`[LLM] ${primaryName} failed, falling back to ${fallbackName}:`, error);

      const fallback = getProvider(fallbackName);
      const startTime = Date.now();
      const result = await fallback.generateDiagnosis(input);
      const duration = Date.now() - startTime;
      console.log(`[LLM] Diagnosis via ${fallbackName} (fallback) in ${duration}ms`);
      return { ...result, provider: fallbackName };
    }
  },

  async generateChatResponse(input: ChatInput): Promise<ChatOutput & { provider: string }> {
    const primaryName = config.llm.defaultProvider;
    const fallbackName = config.llm.fallbackProvider;

    try {
      const provider = getProvider(primaryName);
      const result = await provider.generateChatResponse(input);
      return { ...result, provider: primaryName };
    } catch (error) {
      console.warn(`[LLM] ${primaryName} failed, falling back to ${fallbackName}:`, error);

      const fallback = getProvider(fallbackName);
      const result = await fallback.generateChatResponse(input);
      return { ...result, provider: fallbackName };
    }
  },
};
