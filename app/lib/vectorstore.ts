import { UpstashVectorStore } from "@langchain/community/vectorstores/upstash";
import { Index } from "@upstash/vector";
import { getEmbeddings } from "./embeddings";
import type { Document } from "@langchain/core/documents";

function getIndex(): Index {
  const url = process.env.UPSTASH_VECTOR_REST_URL;
  const token = process.env.UPSTASH_VECTOR_REST_TOKEN;

  if (!url || !token) {
    throw new Error(
      "Missing UPSTASH_VECTOR_REST_URL or UPSTASH_VECTOR_REST_TOKEN.\n" +
        "Create a free index at https://console.upstash.com and add the credentials to .env.local",
    );
  }

  return new Index({ url, token });
}

export async function addDocuments(
  docs: Document[],
  namespace: string,
): Promise<void> {
  const store = new UpstashVectorStore(getEmbeddings(), {
    index: getIndex(),
    namespace,
  });
  await store.addDocuments(docs);
}

export async function getRetriever(namespace: string, k = 5) {
  const store = new UpstashVectorStore(getEmbeddings(), {
    index: getIndex(),
    namespace,
  });
  return store.asRetriever({ k });
}

export async function deleteNamespace(namespace: string): Promise<void> {
  const index = getIndex();
  await index.deleteNamespace(namespace);
}
