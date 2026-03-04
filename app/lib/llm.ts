import { ChatOpenAI } from '@langchain/openai'
import { ChatAnthropic } from '@langchain/anthropic'
import { ChatGroq } from '@langchain/groq'
import { ChatGoogleGenerativeAI } from '@langchain/google-genai'
import type { BaseChatModel } from '@langchain/core/language_models/chat_models'

export type Provider = 'groq' | 'gemini' | 'openai' | 'anthropic' | 'ollama'

export interface LLMConfig {
  provider: Provider
  model?: string
  temperature?: number
}

export const DEFAULT_MODELS: Record<Provider, string> = {
  groq:      'llama-3.3-70b-versatile',
  gemini:    'gemini-1.5-flash',
  openai:    'gpt-4o',
  anthropic: 'claude-3-5-haiku-20241022',
  ollama:    'llama3',
}

export const PROVIDER_MODELS: Record<Provider, string[]> = {
  groq:      ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant', 'mixtral-8x7b-32768', 'gemma2-9b-it'],
  gemini:    ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-2.0-flash-exp'],
  openai:    ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo'],
  anthropic: ['claude-3-5-haiku-20241022', 'claude-3-5-sonnet-20241022', 'claude-3-opus-20240229'],
  ollama:    ['llama3', 'mistral', 'codellama', 'phi3'],
}

export const PROVIDER_LABELS: Record<Provider, string> = {
  groq:      'Groq',
  gemini:    'Gemini',
  openai:    'OpenAI',
  anthropic: 'Anthropic',
  ollama:    'Ollama',
}

export function getLLM({ provider, model, temperature = 0.2 }: LLMConfig): BaseChatModel {
  const resolvedModel = model ?? DEFAULT_MODELS[provider]

  switch (provider) {
    case 'groq':
      if (!process.env.GROQ_API_KEY) throw new Error('GROQ_API_KEY is not set in environment variables')
      return new ChatGroq({
        model: resolvedModel,
        temperature,
        apiKey: process.env.GROQ_API_KEY,
        streaming: true,
      })

    case 'gemini':
      if (!process.env.GEMINI_API_KEY) throw new Error('GEMINI_API_KEY is not set in environment variables')
      return new ChatGoogleGenerativeAI({
        model: resolvedModel,
        temperature,
        apiKey: process.env.GEMINI_API_KEY,
        streaming: true,
      })

    case 'openai':
      if (!process.env.OPENAI_API_KEY) throw new Error('OPENAI_API_KEY is not set in environment variables')
      return new ChatOpenAI({
        model: resolvedModel,
        temperature,
        apiKey: process.env.OPENAI_API_KEY,
        streaming: true,
      })

    case 'anthropic':
      if (!process.env.ANTHROPIC_API_KEY) throw new Error('ANTHROPIC_API_KEY is not set in environment variables')
      return new ChatAnthropic({
        model: resolvedModel,
        temperature,
        apiKey: process.env.ANTHROPIC_API_KEY,
        streaming: true,
      })

    case 'ollama':
      return new ChatOpenAI({
        model: resolvedModel,
        temperature,
        configuration: {
          baseURL: process.env.OLLAMA_BASE_URL ?? 'http://localhost:11434/v1',
          apiKey: 'ollama',
        },
        streaming: true,
      })

    default:
      throw new Error(`Unknown provider: ${provider}`)
  }
}

export function getAvailableProviders(): Provider[] {
  const providers: Provider[] = []
  if (process.env.GROQ_API_KEY)      providers.push('groq')
  if (process.env.GEMINI_API_KEY)    providers.push('gemini')
  if (process.env.OPENAI_API_KEY)    providers.push('openai')
  if (process.env.ANTHROPIC_API_KEY) providers.push('anthropic')
  providers.push('ollama')
  return providers
}
