import type { Metadata } from "next";
import { Typography } from "@/components/atoms/Typography";

export const metadata: Metadata = {
  title: "Impressum",
};

export default function ImpressumPage() {
  return <Typography variant="h1">Impressum</Typography>;
}
