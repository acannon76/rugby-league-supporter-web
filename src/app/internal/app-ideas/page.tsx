import type { Metadata } from "next";
import HgvDriverPdaMockupClient from "./HgvDriverPdaMockupClient";

export const metadata: Metadata = {
  title: "Driver PDA Concept Mockup",
  description: "Hidden Driver PDA concept mockup.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function DriverPdaConceptMockupPage() {
  return <HgvDriverPdaMockupClient />;
}
