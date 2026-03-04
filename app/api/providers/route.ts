import { NextResponse } from 'next/server'
import { getAvailableProviders } from '@/app/lib/llm'

export const runtime = 'nodejs'

export async function GET() {
  return NextResponse.json({ providers: getAvailableProviders() })
}
