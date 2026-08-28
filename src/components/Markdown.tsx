import ReactMarkdown from "react-markdown";

export function Markdown({ children }: { children: string }) {
  return (
    <div className="space-y-4 text-sm leading-relaxed text-foreground">
      <ReactMarkdown
        components={{
          h1: (props) => <h1 className="font-display text-2xl font-bold" {...props} />,
          h2: (props) => (
            <h2 className="mt-6 font-display text-lg font-bold text-brand first:mt-0" {...props} />
          ),
          h3: (props) => <h3 className="mt-4 font-display text-base font-semibold" {...props} />,
          p: (props) => <p className="leading-relaxed" {...props} />,
          ul: (props) => <ul className="ml-5 list-disc space-y-1.5" {...props} />,
          ol: (props) => <ol className="ml-5 list-decimal space-y-1.5" {...props} />,
          strong: (props) => <strong className="font-semibold text-foreground" {...props} />,
          a: (props) => <a className="text-primary underline" {...props} />,
          code: (props) => (
            <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[0.85em]" {...props} />
          ),
          pre: (props) => (
            <pre className="overflow-x-auto rounded-lg bg-muted p-4 text-xs" {...props} />
          ),
          blockquote: (props) => (
            <blockquote className="border-l-2 border-accent pl-4 italic text-muted-foreground" {...props} />
          ),
          table: (props) => (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm" {...props} />
            </div>
          ),
          th: (props) => (
            <th className="border-b border-border bg-muted/60 px-3 py-2 font-semibold" {...props} />
          ),
          td: (props) => <td className="border-b border-border px-3 py-2 align-top" {...props} />,
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
