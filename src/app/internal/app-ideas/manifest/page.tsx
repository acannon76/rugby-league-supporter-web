import type { Metadata } from "next";
import ManifestMockupClient from "./ManifestMockupClient";

export const metadata: Metadata = {
  title: "DriverOS Manifest Mockup",
  description: "Hidden DriverOS manifest mockup.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function ManifestPage() {
  return <ManifestMockupClient />;
}
