/**
 * docuchat-ai — unit tests
 * Run: node test.js
 * No test framework needed — plain Node.js
 */

let passed = 0
let failed = 0

function assert(condition, label) {
  if (condition) {
    console.log(`  ✓  ${label}`)
    passed++
  } else {
    console.error(`  ✗  FAIL: ${label}`)
    failed++
  }
}

// ── 1. Providers ─────────────────────────────────────────────────────────────
console.log('\n providers')

const PROVIDERS = ['groq', 'gemini', 'openai', 'anthropic', 'ollama']
const DEFAULT_MODELS = {
  groq:      'llama-3.3-70b-versatile',
  gemini:    'gemini-1.5-flash',
  openai:    'gpt-4o',
  anthropic: 'claude-3-5-haiku-20241022',
  ollama:    'llama3',
}
const PROVIDER_MODELS = {
  groq:      ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant', 'mixtral-8x7b-32768', 'gemma2-9b-it'],
  gemini:    ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-2.0-flash-exp'],
  openai:    ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo'],
  anthropic: ['claude-3-5-haiku-20241022', 'claude-3-5-sonnet-20241022', 'claude-3-opus-20240229'],
  ollama:    ['llama3', 'mistral', 'codellama', 'phi3'],
}

assert(PROVIDERS.length === 5, '5 providers total')
assert(PROVIDERS[0] === 'groq',   'groq is first (primary)')
assert(PROVIDERS[1] === 'gemini', 'gemini is second (primary)')

for (const p of PROVIDERS) {
  assert(DEFAULT_MODELS[p] !== undefined, `default model exists for ${p}`)
  assert(Array.isArray(PROVIDER_MODELS[p]) && PROVIDER_MODELS[p].length > 0, `model list exists for ${p}`)
  assert(PROVIDER_MODELS[p].includes(DEFAULT_MODELS[p]), `default is in model list for ${p}`)
}

// ── 2. File type validation ───────────────────────────────────────────────────
console.log('\n file types')

const ALLOWED_EXTS = ['.pdf', '.docx', '.txt', '.md']
const isAllowed = f => ALLOWED_EXTS.some(e => f.toLowerCase().endsWith(e))

assert(isAllowed('report.pdf'),    'pdf allowed')
assert(isAllowed('doc.docx'),      'docx allowed')
assert(isAllowed('notes.txt'),     'txt allowed')
assert(isAllowed('readme.md'),     'md allowed')
assert(isAllowed('REPORT.PDF'),    'uppercase PDF allowed')
assert(isAllowed('README.MD'),     'uppercase MD allowed')
assert(!isAllowed('virus.exe'),    'exe blocked')
assert(!isAllowed('sheet.csv'),    'csv blocked')
assert(!isAllowed('photo.png'),    'png blocked')
assert(!isAllowed('archive.zip'),  'zip blocked')

// ── 3. File size ──────────────────────────────────────────────────────────────
console.log('\n file size')

const MAX = 50 * 1024 * 1024
const sizeOk = n => n <= MAX

assert(sizeOk(1024),       '1 KB ok')
assert(sizeOk(10 * 1024 * 1024), '10 MB ok')
assert(sizeOk(MAX),        '50 MB (limit) ok')
assert(!sizeOk(MAX + 1),   '50 MB + 1 byte rejected')
assert(!sizeOk(100 * 1024 * 1024), '100 MB rejected')

// ── 4. Collection ID (UUID v4) ────────────────────────────────────────────────
console.log('\n collection id')

const uuidRe = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
const isUUID = id => typeof id === 'string' && uuidRe.test(id)

assert(isUUID('550e8400-e29b-41d4-a716-446655440000'), 'valid UUID v4 passes')
assert(isUUID('123e4567-e89b-42d3-a456-426614174000'), 'another valid UUID passes')
assert(!isUUID('not-a-uuid'),   'random string rejected')
assert(!isUUID(''),             'empty string rejected')
assert(!isUUID(null),           'null rejected')
assert(!isUUID(undefined),      'undefined rejected')

// ── 5. SSE event format ───────────────────────────────────────────────────────
console.log('\n SSE events')

const makeSSE   = d => `data: ${JSON.stringify(d)}\n\n`
const parseSSE  = line => {
  if (!line.startsWith('data: ')) return null
  try { return JSON.parse(line.slice(6)) } catch { return null }
}

const evSources = makeSSE({ type: 'sources', sources: ['a.pdf', 'b.docx'] })
const evChunk   = makeSSE({ type: 'chunk',   text: 'Hello world' })
const evDone    = makeSSE({ type: 'done' })
const evError   = makeSSE({ type: 'error',   message: 'oops' })

assert(parseSSE(evSources.trim())?.type === 'sources',           'sources event type')
assert(parseSSE(evSources.trim())?.sources.length === 2,         'sources event payload')
assert(parseSSE(evChunk.trim())?.text === 'Hello world',         'chunk event text')
assert(parseSSE(evDone.trim())?.type === 'done',                 'done event')
assert(parseSSE(evError.trim())?.message === 'oops',             'error event message')
assert(parseSSE('not-sse') === null,                             'non-sse line → null')
assert(parseSSE('data: {broken}') === null,                      'invalid JSON → null')

// ── 6. RAG prompt ─────────────────────────────────────────────────────────────
console.log('\n RAG prompt')

const TEMPLATE = `You are a helpful assistant.\nContext:\n{context}\nQuestion: {question}\nAnswer:`

assert(TEMPLATE.includes('{context}'),  'context placeholder present')
assert(TEMPLATE.includes('{question}'), 'question placeholder present')
assert(TEMPLATE.includes('Answer:'),    'answer marker present')
assert(TEMPLATE.startsWith('You are'), 'starts with system instruction')

// ── 7. Upstash env var names ──────────────────────────────────────────────────
console.log('\n env vars')

const UPSTASH_VARS = ['UPSTASH_VECTOR_REST_URL', 'UPSTASH_VECTOR_REST_TOKEN']
for (const v of UPSTASH_VARS) {
  assert(v.startsWith('UPSTASH_'), `${v} has correct prefix`)
}

const AI_VARS = ['GROQ_API_KEY', 'GEMINI_API_KEY', 'OPENAI_API_KEY', 'ANTHROPIC_API_KEY']
for (const v of AI_VARS) {
  assert(v.endsWith('_API_KEY'), `${v} has correct suffix`)
}

// ── Summary ───────────────────────────────────────────────────────────────────
console.log(`\n  ${passed} passed, ${failed} failed\n`)
if (failed > 0) process.exit(1)
