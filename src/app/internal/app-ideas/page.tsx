import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "HGV Driver PDA Mockup",
  description: "Hidden mockup page for a HGV driver PDA concept.",
  robots: {
    index: false,
    follow: false,
  },
};

const appButtons = [
  {
    title: "Navigation",
    text: "Route guidance and journey information.",
    href: "#",
    icon: "➤",
  },
  {
    title: "Driving Style",
    text: "Driving behaviour and safety indicators.",
    href: "#",
    icon: "◆",
  },
  {
    title: "Vehicle Checks",
    text: "Daily checks and defect reporting.",
    href: "#",
    icon: "✓",
  },
  {
    title: "FNOL / Breakdown",
    text: "Report an incident, damage or breakdown.",
    href: "#",
    icon: "!",
  },
];

export default function HgvDriverPdaMockupPage() {
  return (
    <main className="min-h-screen bg-[#f4f1ec] font-sans text-[#111]">
      <header className="border-b border-white/20 bg-[#b00020] px-4 py-4 text-white sm:px-6 lg:px-10">
        <div className="mx-auto flex max-w-[1180px] items-center justify-between gap-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border-2 border-white bg-[#7d0017] text-lg font-black text-white">
              HGV
            </div>

            <div>
              <p className="text-lg font-black leading-none text-white">
                Driver PDA
              </p>
              <p className="text-sm font-black leading-none text-[#ffd9df]">
                Concept Mockup
              </p>
            </div>
          </div>

          <Link href="/" className="text-sm font-black text-white no-underline">
            Back to website
          </Link>
        </div>
      </header>

      <section className="px-4 py-6 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-[1180px]">
          <section className="grid min-h-[calc(100vh-110px)] grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:items-center">
            {appButtons.map((button) => (
              <ActionCard
                key={button.title}
                title={button.title}
                text={button.text}
                href={button.href}
                icon={button.icon}
              />
            ))}
          </section>
        </div>
      </section>
    </main>
  );
}

function ActionCard({
  title,
  text,
  href,
  icon,
}: {
  title: string;
  text: string;
  href: string;
  icon: string;
}) {
  return (
    <a
      href={href}
      className="group flex min-h-[220px] flex-col rounded-[32px] border border-[#d6dce5] bg-white p-6 text-[#111] no-underline shadow-sm transition hover:-translate-y-1 hover:shadow-lg sm:min-h-[260px] lg:min-h-[300px]"
    >
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-3xl bg-[#b00020] text-3xl font-black text-white transition group-hover:bg-[#7d0017]">
        {icon}
      </div>

      <h2 className="text-3xl font-black leading-tight text-[#18243a]">
        {title}
      </h2>

      <p className="mt-3 text-sm font-bold leading-6 text-[#64748b]">
        {text}
      </p>

      <div className="mt-auto flex items-center gap-2 pt-6 text-xs font-black uppercase tracking-widest text-[#b00020]">
        Open <span className="transition group-hover:translate-x-1">→</span>
      </div>
    </a>
  );
}