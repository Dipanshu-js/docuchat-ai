"use client";

import { useState } from "react";

interface DocFile {
  name: string;
  chunks: number;
  pages?: number;
}

interface DocSidebarProps {
  files: DocFile[];
  collectionId: string;
  onDelete: () => void;
}

export function DocSidebar({ files, collectionId, onDelete }: DocSidebarProps) {
  const [deleting, setDeleting] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Delete this session and all its documents?")) return;
    setDeleting(true);
    try {
      await fetch("/api/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ collectionId }),
      });
      onDelete();
    } catch {
      setDeleting(false);
    }
  };

  const fileIcon = (name: string) => {
    if (name.endsWith(".pdf")) return "📄";
    if (name.endsWith(".docx")) return "📝";
    if (name.endsWith(".md")) return "📋";
    return "📃";
  };

  return (
    <div
      className={`border-r border-zinc-800 bg-zinc-900/40 flex flex-col transition-all duration-200
                     ${collapsed ? "w-12" : "w-64"} shrink-0`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-3 border-b border-zinc-800">
        {!collapsed && (
          <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">
            Documents
          </span>
        )}
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="text-zinc-600 hover:text-zinc-400 transition-colors ml-auto"
          title={collapsed ? "Expand" : "Collapse"}
        >
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d={collapsed ? "M9 5l7 7-7 7" : "M15 19l-7-7 7-7"}
            />
          </svg>
        </button>
      </div>

      {!collapsed && (
        <>
          {/* File list */}
          <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
            {files.map((f) => (
              <div
                key={f.name}
                className="bg-zinc-800/60 rounded-lg px-3 py-2.5 border border-zinc-700/40"
              >
                <div className="flex items-start gap-2">
                  <span className="text-base shrink-0 mt-0.5">
                    {fileIcon(f.name)}
                  </span>
                  <div className="min-w-0">
                    <p
                      className="text-zinc-300 text-xs font-medium truncate"
                      title={f.name}
                    >
                      {f.name}
                    </p>
                    <p className="text-zinc-600 text-[10px] mt-0.5">
                      {f.chunks} chunks{f.pages ? ` · ${f.pages} pages` : ""}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Stats + delete */}
          <div className="p-3 border-t border-zinc-800 space-y-2">
            <div className="flex justify-between text-[10px] text-zinc-600">
              <span>
                {files.length} file{files.length > 1 ? "s" : ""}
              </span>
              <span>
                {files.reduce((a, f) => a + f.chunks, 0)} total chunks
              </span>
            </div>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="w-full text-xs text-red-500 hover:text-red-400 hover:bg-red-950/30
                         border border-red-900/40 hover:border-red-800 rounded-lg py-1.5
                         transition-all disabled:opacity-50"
            >
              {deleting ? "Deleting…" : "🗑 Delete session"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
