import type { Metadata } from "next";
import DctMockupClient from "./DctMockupClient";

export const metadata: Metadata = {
  title: "DCT Mockup Test",
  description: "Hidden Driver PDA DCT results mock-up page.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function DctMockupPage() {
  return <DctMockupClient />;
}
