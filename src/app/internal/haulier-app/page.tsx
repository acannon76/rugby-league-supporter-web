import type { Metadata } from "next";
import HaulierAppMockupClient from "./HaulierAppMockupClient";

export const metadata: Metadata = {
  title: "Haulier Mock Up",
  description: "Hidden haulier app mock-up page.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function HaulierAppMockupPage() {
  return <HaulierAppMockupClient />;
}
