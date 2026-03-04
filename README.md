<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:0d1117,100:7c3aed&height=140&section=header&text=docuchat-ai&fontSize=48&fontColor=ffffff&fontAlignY=52&desc=RAG+chat+for+your+documents&descSize=15&descAlignY=72&descFontColor=c4b5fd" />

![Next.js](https://img.shields.io/badge/Next.js-15-7c3aed?style=flat-square&labelColor=0d1117)
&nbsp;
![LangChain](https://img.shields.io/badge/LangChain-0.3-7c3aed?style=flat-square&labelColor=0d1117)
&nbsp;
![CI](https://img.shields.io/github/actions/workflow/status/Dipanshu-js/docuchat-ai/ci.yml?style=flat-square&color=7c3aed&labelColor=0d1117&label=CI)
&nbsp;
![License](https://img.shields.io/github/license/Dipanshu-js/docuchat-ai?style=flat-square&color=555&labelColor=0d1117)
&nbsp;
![Stars](https://img.shields.io/github/stars/Dipanshu-js/docuchat-ai?style=flat-square&color=f0b429&labelColor=0d1117)

</div>

---

Upload PDFs, Word docs, or text files and chat with them using AI. Powered by LangChain RAG with Groq, Gemini, OpenAI, Anthropic, or Ollama. Fully serverless — runs on Vercel with Upstash Vector, no Docker required.

```
Upload → chunk → embed → Upstash Vector
Ask question → similarity search → LLM → streamed answer + source citations
```

---

## Features

- **Multi-format** — PDF, DOCX, TXT, Markdown
- **5 AI providers** — Groq, Gemini, OpenAI, Anthropic, Ollama (switch mid-conversation)
- **Source citations** — every answer shows which file it came from
- **Streaming** — token-by-token SSE streaming
- **Multi-doc** — upload several files and chat across all of them at once
- **Serverless** — Vercel + Upstash, zero Docker, zero servers to manage
- **Free to start** — Groq and Gemini both have generous free tiers

---

## Quick start

```sh
git clone https://github.com/Dipanshu-js/docuchat-ai.git
cd docuchat-ai

cp .env.example .env.local
# → add your API keys (see Environment Variables below)

npm install
npm run dev
# → http://localhost:3000
```

---

## Environment variables

Copy `.env.example` to `.env.local` and fill in your keys:

```sh
# Free providers (start here)
GROQ_API_KEY=gsk_...        # https://console.groq.com
GEMINI_API_KEY=AIza...      # https://aistudio.google.com

# Optional paid providers
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...

# Upstash Vector — free serverless vector DB
# https://console.upstash.com → Create Index
# Dimensions: 768 (Gemini) or 1536 (OpenAI)
UPSTASH_VECTOR_REST_URL=https://your-index.upstash.io
UPSTASH_VECTOR_REST_TOKEN=your-token
```

---

## AI providers

| Provider | Free tier | Default model | Notes |
|---|---|---|---|
| **Groq** | Yes | llama-3.3-70b-versatile | Fastest inference |
| **Gemini** | Yes | gemini-1.5-flash | Also provides free embeddings |
| OpenAI | No | gpt-4o | Also provides embeddings |
| Anthropic | No | claude-3-5-haiku | Best for long documents |
| Ollama | Local | llama3 | Fully offline |

---

## How it works

```
1. Upload
   File → text extraction (pdf-parse / mammoth)
        → RecursiveCharacterTextSplitter (1000 chars, 200 overlap)
        → Gemini / OpenAI embeddings
        → Upstash Vector (stored under a UUID namespace)

2. Chat
   Question → embed → Upstash similarity search (top 5 chunks)
            → RAG prompt → chosen LLM (streamed)
            → SSE to browser → answer + source citations
```

---

## Tech stack

| | |
|---|---|
| Framework | Next.js 15 (App Router) |
| AI | LangChain.js 0.3 |
| Providers | Groq · Gemini · OpenAI · Anthropic · Ollama |
| Vector DB | Upstash Vector |
| Embeddings | Gemini embedding-001 · OpenAI text-embedding-3-small |
| File parsing | pdf-parse · mammoth |
| Styling | Tailwind CSS v4 |
| Language | TypeScript |
| Hosting | Vercel |

---

## Deploy to Vercel

1. Push this repo to your GitHub
2. Go to [vercel.com](https://vercel.com) → **Add New Project** → import `docuchat-ai`
3. Add environment variables in **Settings → Environment Variables**:
   - `GROQ_API_KEY`
   - `GEMINI_API_KEY`
   - `UPSTASH_VECTOR_REST_URL`
   - `UPSTASH_VECTOR_REST_TOKEN`
   - (and any others you want)
4. Click **Deploy**

---

## Development

```sh
npm run dev      # start dev server
npm test         # run 56 unit tests
npx tsc --noEmit # type check
npm run build    # production build
```

---

## License

MIT © [Dipanshu Singh](https://github.com/Dipanshu-js)

<div align="center">
<br/>
<img src="https://capsule-render.vercel.app/api?type=waving&color=0:7c3aed,100:0d1117&height=80&section=footer" />
</div>
