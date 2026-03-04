'use client'

import { SourceCard } from './SourceCard'

export interface Message {
  id:       string
  role:     'user' | 'assistant'
  content:  string
  sources?: string[]
  loading?: boolean
}

export function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === 'user'

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-5`}>
      <div className="max-w-[80%]">
        {!isUser && (
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-6 h-6 rounded-full bg-violet-600 flex items-center justify-center text-[10px] font-bold">
              AI
            </div>
            <span className="text-zinc-500 text-xs">docuchat</span>
          </div>
        )}

        <div className={[
          'rounded-2xl px-4 py-3 text-sm leading-relaxed',
          isUser
            ? 'bg-violet-700 text-white rounded-tr-sm'
            : 'bg-zinc-800 text-zinc-200 rounded-tl-sm',
        ].join(' ')}>
          {message.loading ? (
            <span className="inline-flex gap-1 items-center h-4">
              <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce [animation-delay:0ms]" />
              <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce [animation-delay:150ms]" />
              <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce [animation-delay:300ms]" />
            </span>
          ) : (
            <span className="whitespace-pre-wrap">{message.content}</span>
          )}
        </div>

        {!isUser && message.sources && (
          <SourceCard sources={message.sources} />
        )}
      </div>
    </div>
  )
}
