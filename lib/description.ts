export function structureDescription(html: string) {
  const trimmed = html.trim();
  if (!trimmed) return "";
  if (/<(p|ul|ol|h2|h3)\b/i.test(trimmed)) return trimmed;

  return trimmed
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .map((paragraph) => `<p>${paragraph}</p>`)
    .join("");
}
