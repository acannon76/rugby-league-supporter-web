import type { Metadata } from "next";
import HgvDriverPdaMockupClient from "./HgvDriverPdaMockupClient";

export const metadata: Metadata = {
  title: "HGV Driver PDA Mockup",
  description: "Hidden mockup page for a HGV driver PDA concept.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function HgvDriverPdaMockupPage() {
  return <HgvDriverPdaMockupClient />;
}