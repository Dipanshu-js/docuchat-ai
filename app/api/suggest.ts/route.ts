import { NextRequest, NextResponse } from "next/server";
import { HumanMessage } from "@langchain/core/messages";
import { getLLM, type Provider } from "@/app/lib/llm";
import { getRetriever } from "@/app/lib/vectorstore";
import { formatDocumentsAsString } from "langchain/util/document";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      collectionId: string;
      fileNames: string[];
      provider?: Provider;
      model?: string;
    };

    const { collectionId, fileNames, provider = "groq", model } = body;

    if (!collectionId?.trim()) {
      return NextResponse.json(
        { error: "collectionId is required" },
        { status: 400 },
      );
    }

    // Sample the doc content to generate relevant questions
    const retriever = await getRetriever(collectionId, 8);
    const sampleDocs = await retriever.invoke(
      "main topic overview summary introduction",
    );
    const context = formatDocumentsAsString(sampleDocs).slice(0, 3000);

    const llm = getLLM({ provider, model });

    const prompt = `You are given a sample of document content below. Generate exactly 3 short, specific questions a user would naturally want to ask about this document.

Rules:
- Each question must be answerable from the document content
- Keep questions concise (under 12 words each)
- Make them specific, not generic like "what is this about?"
- Return ONLY a JSON array of 3 strings, nothing else

Document sample:
${context}

Files: ${fileNames.join(", ")}

Return format: ["question 1", "question 2", "question 3"]`;

    const response = await llm.invoke([new HumanMessage(prompt)]);
    const text =
      typeof response.content === "string"
        ? response.content
        : JSON.stringify(response.content);

    // Parse the JSON array from the response
    const match = text.match(/\[[\s\S]*\]/);
    if (!match) {
      return NextResponse.json({ questions: [] });
    }

    const questions = JSON.parse(match[0]) as string[];
    return NextResponse.json({ questions: questions.slice(0, 3) });
  } catch (err) {
    console.error("[suggest]", err);
    // Fail silently — suggested questions are optional
    return NextResponse.json({ questions: [] });
  }
}
