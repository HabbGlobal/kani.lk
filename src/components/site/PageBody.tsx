/**
 * Renders admin-authored page bodies. Deliberately a tiny subset of Markdown —
 * "## " headings, "- " lists and paragraphs — parsed here rather than pulling a
 * full Markdown library and an HTML sanitiser into the bundle for three pages.
 * Nothing is rendered as raw HTML, so admin text can never inject markup.
 */
export function PageBody({ body }: { body: string }) {
  const blocks = body.split(/\n\s*\n/).filter((b) => b.trim());

  return (
    <div className="prose-kani text-[17px] leading-relaxed text-[var(--ink)]">
      {blocks.map((block, i) => {
        const trimmed = block.trim();

        if (trimmed.startsWith("### ")) {
          return <h3 key={i}>{trimmed.slice(4)}</h3>;
        }
        if (trimmed.startsWith("## ")) {
          return <h2 key={i}>{trimmed.slice(3)}</h2>;
        }

        // A block where every line starts with "- " is a list.
        const lines = trimmed.split("\n");
        if (lines.every((l) => l.trim().startsWith("- "))) {
          return (
            <ul key={i}>
              {lines.map((l, k) => (
                <li key={k}>{l.trim().slice(2)}</li>
              ))}
            </ul>
          );
        }

        return <p key={i}>{trimmed}</p>;
      })}
    </div>
  );
}
