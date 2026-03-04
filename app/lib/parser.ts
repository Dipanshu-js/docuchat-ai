import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters'
import type { Document } from '@langchain/core/documents'

export interface ParsedFile {
  text: string
  filename: string
  pages?: number
}

export async function parseFile(
  buffer: Buffer,
  filename: string,
  mimetype: string
): Promise<ParsedFile> {
  const ext = filename.toLowerCase()

  if (mimetype === 'application/pdf' || ext.endsWith('.pdf')) {
    const pdfParse = (await import('pdf-parse')).default
    const data = await pdfParse(buffer)
    return { text: data.text, filename, pages: data.numpages }
  }

  if (
    mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    ext.endsWith('.docx')
  ) {
    const mammoth = await import('mammoth')
    const result = await mammoth.extractRawText({ buffer })
    return { text: result.value, filename }
  }

  if (
    mimetype === 'text/plain' || mimetype === 'text/markdown' ||
    ext.endsWith('.txt') || ext.endsWith('.md')
  ) {
    return { text: buffer.toString('utf-8'), filename }
  }

  throw new Error(`Unsupported file: ${filename}. Use PDF, DOCX, TXT, or MD.`)
}

export async function chunkDocument(
  parsed: ParsedFile,
  collectionId: string
): Promise<Document[]> {
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
  })

  return splitter.createDocuments(
    [parsed.text],
    [{
      source: parsed.filename,
      collectionId,
      pages: parsed.pages ?? 'unknown',
    }]
  )
}
