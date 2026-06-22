import type { Metadata } from "next";
import ManifestMockupClient from "./ManifestMockupClient";

export const metadata: Metadata = {
  title: "Driver PDA Manifest Mockup",
  description: "Hidden Driver PDA manifest mockup.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function ManifestPage() {
  return <ManifestMockupClient />;
}
