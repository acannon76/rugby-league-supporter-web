import type { Metadata } from "next";
import DctMockupClient from "./DctMockupClient";

export const metadata: Metadata = {
  title: "DCT Mockup Test",
  description: "Hidden DriverOS DCT mockup results page.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function DctPage() {
  return <DctMockupClient />;
}
