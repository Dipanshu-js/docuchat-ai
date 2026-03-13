import { NextRequest, NextResponse } from "next/server";
import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import {
  RunnableSequence,
  RunnablePassthrough,
} from "@langchain/core/runnables";
import { HumanMessage, AIMessage } from "@langchain/core/messages";
import { formatDocumentsAsString } from "langchain/util/document";
import { getLLM, type Provider } from "@/app/lib/llm";
import { getRetriever } from "@/app/lib/vectorstore";

export const runtime = "nodejs";
export const maxDuration = 60;

interface HistoryMessage {
  role: "user" | "assistant";
  content: string;
}

const RAG_PROMPT = ChatPromptTemplate.fromMessages([
  [
    "system",
    `You are a helpful assistant that answers questions based strictly on the provided document context.

Rules:
- Answer only from the context. Do not use outside knowledge.
- If the answer is not in the context, say "I couldn't find that in the uploaded documents."
- Be concise and clear.
- When referencing information, mention the source filename.
- You have access to the conversation history — use it to understand follow-up questions.

Context:
{context}`,
  ],
  new MessagesPlaceholder("history"),
  ["human", "{question}"],
]);

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      question: string;
      collectionId: string;
      provider?: Provider;
      model?: string;
      history?: HistoryMessage[];
    };

    const {
      question,
      collectionId,
      provider = "groq",
      model,
      history = [],
    } = body;

    if (!question?.trim()) {
      return NextResponse.json(
        { error: "question is required" },
        { status: 400 },
      );
    }
    if (!collectionId?.trim()) {
      return NextResponse.json(
        { error: "collectionId is required" },
        { status: 400 },
      );
    }

    const chatHistory = history
      .slice(-10)
      .map((m) =>
        m.role === "user"
          ? new HumanMessage(m.content)
          : new AIMessage(m.content),
      );

    const retriever = await getRetriever(collectionId, 5);
    const sourceDocs = await retriever.invoke(question);
    const sources = [
      ...new Set(
        sourceDocs.map((d) => d.metadata?.source as string).filter(Boolean),
      ),
    ];

    const llm = getLLM({ provider, model });

    const chain = RunnableSequence.from([
      {
        context: retriever.pipe(formatDocumentsAsString),
        question: new RunnablePassthrough(),
        history: () => chatHistory,
      },
      RAG_PROMPT,
      llm,
      new StringOutputParser(),
    ]);

    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        const send = (data: object) =>
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(data)}\n\n`),
          );

        try {
          send({ type: "sources", sources });
          for await (const chunk of await chain.stream(question)) {
            send({ type: "chunk", text: chunk });
          }
          send({ type: "done" });
        } catch (err) {
          send({
            type: "error",
            message: err instanceof Error ? err.message : "Stream error",
          });
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Chat failed";
    console.error("[chat]", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
