'use client'

import { useState, useCallback } from 'react'

interface IngestedFile {
  name: string
  chunks: number
  pages?: number
}

interface UploadZoneProps {
  onIngest: (collectionId: string, files: IngestedFile[]) => void
}

export function UploadZone({ onIngest }: UploadZoneProps) {
  const [dragging,  setDragging]  = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error,     setError]     = useState<string | null>(null)
  const [files,     setFiles]     = useState<File[]>([])

  const ALLOWED = ['.pdf', '.docx', '.txt', '.md']

  const handleFiles = useCallback((list: FileList | null) => {
    if (!list) return
    const valid = Array.from(list).filter(f =>
      ALLOWED.some(ext => f.name.toLowerCase().endsWith(ext))
    )
    if (!valid.length) {
      setError('Only PDF, DOCX, TXT, and MD files are supported.')
      return
    }
    setError(null)
    setFiles(valid)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    handleFiles(e.dataTransfer.files)
  }, [handleFiles])

  const handleUpload = async () => {
    if (!files.length) return
    setUploading(true)
    setError(null)

    try {
      const form = new FormData()
      files.forEach(f => form.append('files', f))

      const res  = await fetch('/api/ingest', { method: 'POST', body: form })
      const data = await res.json() as { error?: string; collectionId: string; files: IngestedFile[] }

      if (!res.ok) throw new Error(data.error ?? 'Upload failed')

      onIngest(data.collectionId, data.files)
      setFiles([])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="w-full max-w-xl mx-auto">
      {/* Drop zone */}
      <div
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => document.getElementById('file-input')?.click()}
        className={[
          'border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all select-none',
          dragging
            ? 'border-violet-400 bg-violet-950/30 scale-[1.01]'
            : 'border-zinc-700 hover:border-zinc-500 hover:bg-zinc-900/40',
        ].join(' ')}
      >
        <input
          id="file-input"
          type="file"
          multiple
          accept=".pdf,.docx,.txt,.md"
          className="hidden"
          onChange={e => handleFiles(e.target.files)}
        />
        <div className="text-5xl mb-4">📂</div>
        <p className="text-zinc-200 font-semibold text-lg">Drop files here or click to browse</p>
        <p className="text-zinc-500 text-sm mt-2">PDF · DOCX · TXT · Markdown — max 50 MB each</p>
      </div>

      {/* Selected files */}
      {files.length > 0 && (
        <div className="mt-4 space-y-2">
          {files.map(f => (
            <div key={f.name}
              className="flex items-center justify-between bg-zinc-800/80 rounded-xl px-4 py-2.5 border border-zinc-700/50">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-lg shrink-0">
                  {f.name.endsWith('.pdf') ? '📄' : f.name.endsWith('.docx') ? '📝' : '📃'}
                </span>
                <span className="text-zinc-300 text-sm truncate">{f.name}</span>
              </div>
              <span className="text-zinc-500 text-xs ml-3 shrink-0">
                {(f.size / 1024).toFixed(0)} KB
              </span>
            </div>
          ))}

          <button
            onClick={handleUpload}
            disabled={uploading}
            className="w-full mt-1 bg-violet-600 hover:bg-violet-500 disabled:bg-zinc-700
                       disabled:text-zinc-500 text-white font-semibold py-3 rounded-xl
                       transition-colors text-sm"
          >
            {uploading
              ? '⏳  Processing…'
              : `Upload & Process ${files.length} file${files.length > 1 ? 's' : ''}`
            }
          </button>
        </div>
      )}

      {error && (
        <div className="mt-3 bg-red-950/50 border border-red-800 rounded-xl px-4 py-3">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}
    </div>
  )
}
