import ReactMarkdown from "react-markdown";

export function MarkdownView({ body }: { body: string }) {
  return <ReactMarkdown>{body}</ReactMarkdown>;
}
