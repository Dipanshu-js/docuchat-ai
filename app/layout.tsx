import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'docuchat-ai',
  description: 'Chat with your documents — RAG powered by Groq, Gemini, OpenAI, Anthropic, or Ollama.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-zinc-950 text-zinc-100 antialiased min-h-screen">
        {children}
      </body>
    </html>
  )
}
