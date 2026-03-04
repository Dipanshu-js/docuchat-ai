'use client'

import { useState, useRef, useEffect } from 'react'
import { MessageBubble, type Message } from './MessageBubble'
import {
  PROVIDER_MODELS,
  PROVIDER_LABELS,
  DEFAULT_MODELS,
  type Provider,
} from '@/app/lib/llm'

interface ChatWindowProps {
  collectionId: string
  fileNames:    string[]
}

let _id = 0
const uid = () => `m${++_id}`

export function ChatWindow({ collectionId, fileNames }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([{
    id:      uid(),
    role:    'assistant',
    content: `Ready! Loaded ${fileNames.length === 1 ? `"${fileNames[0]}"` : `${fileNames.length} files`}.\n\nAsk me anything about ${fileNames.length === 1 ? 'it' : 'them'}.`,
  }])
  const [input,    setInput]    = useState('')
  const [loading,  setLoading]  = useState(false)
  const [provider, setProvider] = useState<Provider>('groq')
  const [model,    setModel]    = useState(DEFAULT_MODELS['groq'])

  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef  = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const switchProvider = (p: Provider) => {
    setProvider(p)
    setModel(DEFAULT_MODELS[p])
  }

  const sendMessage = async () => {
    const q = input.trim()
    if (!q || loading) return

    const userMsg: Message = { id: uid(), role: 'user', content: q }
    const asstId           = uid()
    const asstMsg: Message = { id: asstId, role: 'assistant', content: '', loading: true }

    setMessages(prev => [...prev, userMsg, asstMsg])
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ question: q, collectionId, provider, model }),
      })

      if (!res.ok) {
        const err = await res.json() as { error: string }
        throw new Error(err.error ?? 'Chat failed')
      }

      const reader  = res.body!.getReader()
      const decoder = new TextDecoder()
      let answer  = ''
      let sources: string[] = []

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const text  = decoder.decode(value, { stream: true })
        const lines = text.split('\n').filter(l => l.startsWith('data: '))

        for (const line of lines) {
          try {
            const event = JSON.parse(line.slice(6)) as
              | { type: 'sources'; sources: string[] }
              | { type: 'chunk';   text: string }
              | { type: 'done' }
              | { type: 'error';   message: string }

            if (event.type === 'sources') {
              sources = event.sources
            } else if (event.type === 'chunk') {
              answer += event.text
              setMessages(prev => prev.map(m =>
                m.id === asstId
                  ? { ...m, content: answer, sources, loading: false }
                  : m
              ))
            } else if (event.type === 'error') {
              throw new Error(event.message)
            }
          } catch { /* skip malformed event lines */ }
        }
      }
    } catch (err) {
      setMessages(prev => prev.map(m =>
        m.id === asstId
          ? { ...m, content: `Error: ${err instanceof Error ? err.message : 'Something went wrong'}`, loading: false }
          : m
      ))
    } finally {
      setLoading(false)
      inputRef.current?.focus()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const providers = Object.keys(PROVIDER_LABELS) as Provider[]

  return (
    <div className="flex flex-col h-full">

      {/* Provider selector bar */}
      <div className="flex items-center gap-3 px-4 py-2.5 border-b border-zinc-800 bg-zinc-900/60 flex-wrap">
        <span className="text-zinc-500 text-xs font-medium shrink-0">Model</span>
        <div className="flex gap-1 flex-wrap">
          {providers.map(p => (
            <button key={p}
              onClick={() => switchProvider(p)}
              className={[
                'px-3 py-1 rounded-lg text-xs font-medium transition-colors',
                provider === p
                  ? 'bg-violet-700 text-white'
                  : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200',
              ].join(' ')}
            >
              {PROVIDER_LABELS[p]}
            </button>
          ))}
        </div>
        <select
          value={model}
          onChange={e => setModel(e.target.value)}
          className="ml-auto bg-zinc-800 text-zinc-300 text-xs rounded-lg px-2 py-1.5
                     border border-zinc-700 outline-none cursor-pointer"
        >
          {PROVIDER_MODELS[provider].map(m => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 pt-5 pb-2">
        {messages.map(m => <MessageBubble key={m.id} message={m} />)}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-4 pb-5 pt-3 border-t border-zinc-800">
        <div className="flex gap-2 items-end bg-zinc-800/80 rounded-2xl border border-zinc-700 px-4 py-3">
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything about your documents…"
            rows={1}
            className="flex-1 bg-transparent text-zinc-200 text-sm resize-none outline-none
                       placeholder:text-zinc-600 max-h-36 leading-relaxed"
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || loading}
            className="shrink-0 w-9 h-9 rounded-xl bg-violet-600 hover:bg-violet-500
                       disabled:bg-zinc-700 disabled:text-zinc-500 flex items-center
                       justify-center transition-colors"
          >
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        </div>
        <p className="text-zinc-700 text-xs mt-2 text-center">
          Enter to send · Shift + Enter for new line
        </p>
      </div>
    </div>
  )
}
