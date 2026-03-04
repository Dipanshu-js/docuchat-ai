'use client'

import { useState } from 'react'
import { UploadZone } from './components/UploadZone'
import { ChatWindow } from './components/ChatWindow'

interface Session {
  collectionId: string
  fileNames:    string[]
}

export default function Home() {
  const [session, setSession] = useState<Session | null>(null)

  return (
    <div className="min-h-screen flex flex-col">

      {/* Header */}
      <header className="border-b border-zinc-800/80 px-6 py-4 flex items-center justify-between bg-zinc-950/80 backdrop-blur">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-violet-600 flex items-center justify-center text-sm font-bold">
            DC
          </div>
          <div>
            <h1 className="text-sm font-bold text-white leading-none">docuchat-ai</h1>
            <p className="text-zinc-500 text-xs mt-0.5">Chat with your documents</p>
          </div>
        </div>

        {session && (
          <button
            onClick={() => setSession(null)}
            className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors flex items-center gap-1"
          >
            ← New session
          </button>
        )}
      </header>

      {/* Main */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {!session ? (

          /* Upload screen */
          <div className="flex-1 flex flex-col items-center justify-center px-6 py-16 gap-10">
            <div className="text-center max-w-md">
              <h2 className="text-4xl font-bold text-white mb-3 tracking-tight">
                Chat with your docs
              </h2>
              <p className="text-zinc-400 text-base leading-relaxed">
                Upload PDFs, Word docs, or text files.
                Ask questions and get answers with source citations.
              </p>
            </div>

            <UploadZone
              onIngest={(id, files) =>
                setSession({ collectionId: id, fileNames: files.map(f => f.name) })
              }
            />

            <div className="flex flex-col items-center gap-3">
              <p className="text-zinc-600 text-xs">Powered by</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {['Groq', 'Gemini', 'OpenAI', 'Anthropic', 'Ollama'].map(p => (
                  <span key={p}
                    className="bg-zinc-900 border border-zinc-800 text-zinc-400 text-xs
                               px-3 py-1 rounded-full">
                    {p}
                  </span>
                ))}
              </div>
            </div>
          </div>

        ) : (

          /* Chat screen */
          <div className="flex-1 flex flex-col" style={{ height: 'calc(100vh - 65px)' }}>
            <ChatWindow
              collectionId={session.collectionId}
              fileNames={session.fileNames}
            />
          </div>

        )}
      </main>
    </div>
  )
}
