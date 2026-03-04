import { NextRequest, NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import { parseFile, chunkDocument } from '@/app/lib/parser'
import { addDocuments } from '@/app/lib/vectorstore'

export const runtime    = 'nodejs'
export const maxDuration = 60

const ALLOWED_EXTS = ['.pdf', '.docx', '.txt', '.md']
const ALLOWED_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
  'text/markdown',
]
const MAX_BYTES = 50 * 1024 * 1024 // 50 MB

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const files    = formData.getAll('files') as File[]

    if (!files.length) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 })
    }

    for (const file of files) {
      const ext       = file.name.toLowerCase()
      const validExt  = ALLOWED_EXTS.some(e => ext.endsWith(e))
      const validType = ALLOWED_TYPES.includes(file.type) || validExt
      if (!validType) {
        return NextResponse.json(
          { error: `Unsupported file: ${file.name}. Use PDF, DOCX, TXT, or MD.` },
          { status: 400 }
        )
      }
      if (file.size > MAX_BYTES) {
        return NextResponse.json(
          { error: `File too large: ${file.name}. Max 50 MB.` },
          { status: 400 }
        )
      }
    }

    const collectionId = uuidv4()
    const processed: { name: string; chunks: number; pages?: number }[] = []
    const allDocs = []

    for (const file of files) {
      const buffer = Buffer.from(await file.arrayBuffer())
      const parsed = await parseFile(buffer, file.name, file.type)
      const docs   = await chunkDocument(parsed, collectionId)
      processed.push({ name: file.name, chunks: docs.length, pages: parsed.pages })
      allDocs.push(...docs)
    }

    await addDocuments(allDocs, collectionId)

    return NextResponse.json({
      success: true,
      collectionId,
      files: processed,
      totalChunks: allDocs.length,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Ingestion failed'
    console.error('[ingest]', err)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
