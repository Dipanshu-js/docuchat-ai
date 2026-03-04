'use client'

export function SourceCard({ sources }: { sources: string[] }) {
  if (!sources?.length) return null
  return (
    <div className="mt-2 flex flex-wrap gap-1.5">
      {sources.map(src => (
        <span key={src}
          className="inline-flex items-center gap-1 bg-zinc-900 border border-zinc-700
                     text-zinc-400 text-xs px-2.5 py-1 rounded-full">
          <span>📎</span>
          <span className="max-w-[180px] truncate">{src}</span>
        </span>
      ))}
    </div>
  )
}
