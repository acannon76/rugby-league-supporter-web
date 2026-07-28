import type { Metadata } from "next";
import HgvDriverPdaMockupClient from "./HgvDriverPdaMockupClient";

export const metadata: Metadata = {
  title: "DriverOS Concept Mockup",
  description: "Hidden DriverOS concept mockup.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function DriverPdaConceptMockupPage() {
  return <HgvDriverPdaMockupClient />;
}
