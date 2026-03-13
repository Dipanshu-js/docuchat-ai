"use client";

import { useState } from "react";
import { SourceCard } from "./SourceCard";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: string[];
  loading?: boolean;
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={copy}
      className="opacity-0 group-hover:opacity-100 transition-opacity ml-2 text-zinc-600
                 hover:text-zinc-400 shrink-0"
      title="Copy"
    >
      {copied ? (
        <svg
          className="w-3.5 h-3.5 text-violet-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M5 13l4 4L19 7"
          />
        </svg>
      ) : (
        <svg
          className="w-3.5 h-3.5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
          />
        </svg>
      )}
    </button>
  );
}

export function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-5`}>
      <div className="max-w-[80%]">
        {!isUser && (
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-6 h-6 rounded-full bg-violet-600 flex items-center justify-center text-[10px] font-bold">
              AI
            </div>
            <span className="text-zinc-500 text-xs">docuchat</span>
          </div>
        )}

        <div
          className={[
            "group relative rounded-2xl px-4 py-3 text-sm leading-relaxed",
            isUser
              ? "bg-violet-700 text-white rounded-tr-sm"
              : "bg-zinc-800 text-zinc-200 rounded-tl-sm",
          ].join(" ")}
        >
          {message.loading ? (
            <span className="inline-flex gap-1 items-center h-4">
              <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce [animation-delay:0ms]" />
              <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce [animation-delay:150ms]" />
              <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce [animation-delay:300ms]" />
            </span>
          ) : (
            <div className="flex items-start gap-1">
              <span className="whitespace-pre-wrap flex-1">
                {message.content}
              </span>
              {!isUser && <CopyButton text={message.content} />}
            </div>
          )}
        </div>

        {!isUser && message.sources && <SourceCard sources={message.sources} />}
      </div>
    </div>
  );
}
