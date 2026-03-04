import { GoogleGenerativeAIEmbeddings } from '@langchain/google-genai'
import { OpenAIEmbeddings } from '@langchain/openai'
import type { Embeddings } from '@langchain/core/embeddings'

export function getEmbeddings(): Embeddings {
  // Prefer Gemini (free tier) → fall back to OpenAI
  if (process.env.GEMINI_API_KEY) {
    return new GoogleGenerativeAIEmbeddings({
      model: 'embedding-001',
      apiKey: process.env.GEMINI_API_KEY,
    })
  }
  if (process.env.OPENAI_API_KEY) {
    return new OpenAIEmbeddings({
      model: 'text-embedding-3-small',
      apiKey: process.env.OPENAI_API_KEY,
    })
  }
  throw new Error(
    'No embedding provider found.\n' +
    'Set GEMINI_API_KEY (free at aistudio.google.com) or OPENAI_API_KEY in .env.local'
  )
}

// Dimension must match your Upstash index:
//   Gemini embedding-001  → 768 dimensions
//   OpenAI text-embedding-3-small → 1536 dimensions
export function getEmbeddingDimension(): number {
  if (process.env.GEMINI_API_KEY) return 768
  return 1536
}
