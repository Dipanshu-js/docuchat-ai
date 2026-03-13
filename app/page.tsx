"use client";

import { useState } from "react";
import { UploadZone } from "./components/UploadZone";
import { ChatWindow } from "./components/ChatWindow";
import { DocSidebar } from "./components/DocSidebar";

interface DocFile {
  name: string;
  chunks: number;
  pages?: number;
}

interface Session {
  collectionId: string;
  files: DocFile[];
}

export default function Home() {
  const [session, setSession] = useState<Session | null>(null);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header
        className="border-b border-zinc-800/80 px-6 py-4 flex items-center justify-between
                         bg-zinc-950/80 backdrop-blur shrink-0"
      >
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-xl bg-violet-600 flex items-center justify-center
                          text-sm font-bold select-none"
          >
            DC
          </div>
          <div>
            <h1 className="text-sm font-bold text-white leading-none">
              docuchat-ai
            </h1>
            <p className="text-zinc-500 text-xs mt-0.5">
              Chat with your documents
            </p>
          </div>
        </div>

        {session && (
          <button
            onClick={() => setSession(null)}
            className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors
                       flex items-center gap-1"
          >
            ← New session
          </button>
        )}
      </header>

      {/* Main */}
      <main className="flex-1 flex overflow-hidden">
        {!session ? (
          /* ── Upload screen ── */
          <div className="flex-1 flex flex-col items-center justify-center px-6 py-16 gap-10">
            <div className="text-center max-w-md">
              <h2 className="text-4xl font-bold text-white mb-3 tracking-tight">
                Chat with your docs
              </h2>
              <p className="text-zinc-400 text-base leading-relaxed">
                Upload PDFs, Word docs, or text files. Ask questions and get
                answers with source citations.
              </p>
            </div>

            <UploadZone
              onIngest={(id, files) => setSession({ collectionId: id, files })}
            />

            <div className="flex flex-col items-center gap-3">
              <p className="text-zinc-600 text-xs">Powered by</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {["Groq", "Gemini", "OpenAI", "Anthropic", "Ollama"].map(
                  (p) => (
                    <span
                      key={p}
                      className="bg-zinc-900 border border-zinc-800 text-zinc-400
                               text-xs px-3 py-1 rounded-full"
                    >
                      {p}
                    </span>
                  ),
                )}
              </div>
            </div>
          </div>
        ) : (
          /* ── Chat screen with sidebar ── */
          <div
            className="flex flex-1 overflow-hidden"
            style={{ height: "calc(100vh - 65px)" }}
          >
            <DocSidebar
              files={session.files}
              collectionId={session.collectionId}
              onDelete={() => setSession(null)}
            />
            <div className="flex-1 flex flex-col overflow-hidden">
              <ChatWindow
                collectionId={session.collectionId}
                files={session.files}
                onDelete={() => setSession(null)}
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
