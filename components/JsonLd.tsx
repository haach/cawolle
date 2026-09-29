import type { SchemaNode } from "@/lib/schema";

export function JsonLd({ data }: { data: SchemaNode }) {
  const json = JSON.stringify(data).replace(/</g, "\\u003c");
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}
