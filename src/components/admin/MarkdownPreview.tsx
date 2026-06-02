"use client";

import ReactMarkdown from "react-markdown";

export function MarkdownPreview({ body }: { body: string }) {
  return (
    <div className="prose prose-sm max-w-none text-brand-ink prose-headings:font-script prose-headings:text-brand-pink">
      <ReactMarkdown>{body || "_Nothing yet._"}</ReactMarkdown>
    </div>
  );
}
