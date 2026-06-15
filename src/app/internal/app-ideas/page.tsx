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
    text: "Route guidance, destination details and key journey information.",
    href: "#navigation",
    icon: "➤",
  },
  {
    title: "Driving Style",
    text: "Driver behaviour, smooth braking, acceleration and safety indicators.",
    href: "#driving-style",
    icon: "◆",
  },
  {
    title: "Vehicle Checks",
    text: "Daily walkaround checks, defect reporting and vehicle readiness.",
    href: "#vehicle-checks",
    icon: "✓",
  },
  {
    title: "FNOL / Breakdown",
    text: "Report an incident, breakdown, damage or urgent roadside issue.",
    href: "#fnol-breakdown",
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

      <section className="bg-[#b00020] px-4 py-8 text-white sm:px-6 lg:px-10 lg:py-12">
        <div className="mx-auto grid max-w-[1180px] gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <p className="mb-4 text-xs font-black uppercase tracking-[0.22em] text-[#ffd9df]">
              HGV Driver PDA
            </p>

            <h1 className="max-w-[820px] text-[44px] font-black leading-[0.95] sm:text-[68px] lg:text-[84px]">
              Driver tools in one simple place.
            </h1>

            <p className="mt-5 max-w-[720px] text-base font-bold leading-7 text-[#ffecef] sm:text-lg">
              A simple mockup for a driver-facing PDA screen that works on
              phone, tablet and desktop. Designed for quick access to navigation,
              driving style, vehicle checks and FNOL / breakdown support.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <a
                href="#driver-hub"
                className="rounded-full bg-white px-5 py-3 text-sm font-black text-[#b00020] no-underline"
              >
                Open Driver Hub
              </a>

              <a
                href="#concept-notes"
                className="rounded-full border-2 border-white px-5 py-3 text-sm font-black text-white no-underline"
              >
                View Concept Notes
              </a>
            </div>
          </div>

          <section className="rounded-[30px] border border-white/20 bg-white/10 p-5 shadow-2xl backdrop-blur">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#ffd9df]">
              Mockup Purpose
            </p>

            <h2 className="mt-4 text-3xl font-black leading-tight text-white sm:text-4xl">
              Fast, clear and driver friendly.
            </h2>

            <p className="mt-3 text-sm font-bold leading-6 text-[#ffecef]">
              The layout keeps the main actions large, visible and easy to press
              while on a phone or tablet.
            </p>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <InfoPill label="Phone" />
              <InfoPill label="Tablet" />
              <InfoPill label="Desktop" />
              <InfoPill label="PDA" />
            </div>
          </section>
        </div>
      </section>

      <section id="driver-hub" className="px-4 py-6 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-[1180px]">
          <div className="mb-5">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#b00020]">
              Driver Hub
            </p>

            <h2 className="mt-1 text-3xl font-black text-[#18243a] sm:text-4xl">
              Main PDA actions
            </h2>

            <p className="mt-2 max-w-[760px] text-sm font-bold leading-6 text-[#64748b]">
              Four large action buttons designed for fast use on a handheld
              device, tablet or desktop screen.
            </p>
          </div>

          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
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

          <section
            id="concept-notes"
            className="mt-7 grid gap-5 lg:grid-cols-[0.95fr_1.05fr]"
          >
            <section className="rounded-[30px] border border-[#d6dce5] bg-white p-6 shadow-sm">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#b00020]">
                Screen Design
              </p>

              <h2 className="mt-3 text-3xl font-black text-[#18243a]">
                Built for simple decisions.
              </h2>

              <p className="mt-3 text-sm font-bold leading-6 text-[#64748b]">
                The front screen avoids clutter. Drivers see four clear choices,
                each using large touch targets, strong contrast and simple wording.
              </p>
            </section>

            <section className="rounded-[30px] border border-[#d6dce5] bg-white p-6 shadow-sm">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#b00020]">
                Future Ideas
              </p>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <FeatureItem text="Duty details" />
                <FeatureItem text="Vehicle registration" />
                <FeatureItem text="Trailer number" />
                <FeatureItem text="Defect history" />
                <FeatureItem text="Incident reference" />
                <FeatureItem text="Driver confirmation" />
              </div>
            </section>
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
      className="group flex min-h-[230px] flex-col rounded-[30px] border border-[#d6dce5] bg-white p-6 text-[#111] no-underline shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
    >
      <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-3xl bg-[#b00020] text-3xl font-black text-white transition group-hover:bg-[#7d0017]">
        {icon}
      </div>

      <h2 className="text-2xl font-black leading-tight text-[#18243a]">
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

function InfoPill({ label }: { label: string }) {
  return (
    <div className="rounded-2xl bg-[#7d0017] px-4 py-3 text-center text-sm font-black text-white">
      {label}
    </div>
  );
}

function FeatureItem({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-[#f3f5f8] p-4">
      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#b00020] text-sm font-black text-white">
        ✓
      </div>

      <p className="text-sm font-black text-[#18243a]">{text}</p>
    </div>
  );
}