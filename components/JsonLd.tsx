import type { FC } from "react";
import type { SchemaNode } from "@/lib/schema";

type JsonLdProps = {
  data: SchemaNode;
};

export const JsonLd: FC<JsonLdProps> = ({ data }) => {
  const json = JSON.stringify(data).replace(/</g, "\\u003c");
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
};
