import type { Metadata } from "next";
import ManifestMockupClient from "./ManifestMockupClient";

export const metadata: Metadata = {
  title: "Manifest Mockup",
  description: "Hidden Driver PDA manifest mock-up page.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function ManifestMockupPage() {
  return <ManifestMockupClient />;
}
