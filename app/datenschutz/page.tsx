import type { Metadata } from "next";
import { Typography } from "@/components/atoms";

export const metadata: Metadata = {
  title: "Datenschutz",
};

export default function DatenschutzPage() {
  return <Typography variant="h1">Datenschutz</Typography>;
}
