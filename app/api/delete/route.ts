import { NextRequest, NextResponse } from "next/server";
import { deleteNamespace } from "@/app/lib/vectorstore";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { collectionId } = (await req.json()) as { collectionId: string };

    if (!collectionId?.trim()) {
      return NextResponse.json(
        { error: "collectionId is required" },
        { status: 400 },
      );
    }

    await deleteNamespace(collectionId);
    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Delete failed";
    console.error("[delete]", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
