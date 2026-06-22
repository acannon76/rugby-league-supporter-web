"use client";

import Link from "next/link";
import { resetDriverPdaManifestMockup } from "./driverPdaManifestData";

type AppButton = {
  title: string;
  text: string;
  href?: string;
  icon: string;
  actionText?: string;
  isNavigation?: boolean;
};

const appButtons: AppButton[] = [
  {
    title: "Navigation",
    text: "Route guidance and journey information. Mock reset for vehicle check journey.",
    icon: "➤",
    actionText: "RESET MOCK JOURNEY",
    isNavigation: true,
  },
  {
    title: "Driving Style",
    text: "Driving behaviour and safety indicators.",
    href: "#",
    icon: "◆",
    actionText: "OPEN",
  },
  {
    title: "Vehicle Checks",
    text: "Daily checks and defect reporting.",
    href: "/internal/vehicle-checks",
    icon: "✓",
    actionText: "OPEN",
  },
  {
    title: "RTC",
    text: "Report an incident, damage or breakdown.",
    href: "#",
    icon: "!",
    actionText: "OPEN",
  },
  {
    title: "Robin",
    text: "Internal website access for driver and operational information.",
    href: "#",
    icon: "R",
    actionText: "OPEN",
  },
  {
    title: "Manifest",
    text: "Duty details, trailer journey and 318 manifest information.",
    href: "/internal/app-ideas/manifest",
    icon: "318",
    actionText: "OPEN",
  },
  {
    title: "Messaging",
    text: "Receive incoming operational messages.",
    href: "#",
    icon: "✉",
    actionText: "MOCK MESSAGE",
  },
  {
    title: "Contacts",
    text: "Useful contact numbers and support details. DCT Mockup test.",
    href: "/internal/app-ideas/dct",
    icon: "☎",
    actionText: "OPEN",
  },
];

export default function HgvDriverPdaMockupClient() {
  function handleNavigationReset() {
    resetDriverPdaManifestMockup();
    window.alert("Mock journey reset. Manifest and DCT mockup data has been cleared.");
  }

  return (
    <main className="min-h-screen bg-[#f4f1ec] font-sans text-[#001b3a]">
      <header className="bg-[#c4002f] px-4 py-5 text-white sm:px-6 lg:px-10">
        <div className="mx-auto flex max-w-[1280px] items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border-2 border-white text-base font-black">
              HGV
            </div>

            <div>
              <h1 className="text-xl font-black leading-none sm:text-2xl">
                Driver PDA
              </h1>
              <p className="text-sm font-black leading-none sm:text-base">
                Concept Mockup
              </p>
            </div>
          </div>

          <div className="hidden rounded-2xl border border-white/30 bg-white/10 px-5 py-3 sm:block">
            <p className="text-xs font-black uppercase tracking-[0.16em]">
              Driver
            </p>
            <p className="text-base font-black">Andrew Cannon</p>
          </div>

          <Link
            href="/"
            className="text-sm font-black text-white no-underline sm:text-base"
          >
            Back to website
          </Link>
        </div>
      </header>

      <section className="px-4 py-7 sm:px-6 lg:px-10">
        <div className="mx-auto grid max-w-[1280px] grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {appButtons.map((button) => (
            <ActionCard
              key={button.title}
              button={button}
              onNavigationReset={handleNavigationReset}
            />
          ))}
        </div>
      </section>
    </main>
  );
}

function ActionCard({
  button,
  onNavigationReset,
}: {
  button: AppButton;
  onNavigationReset: () => void;
}) {
  const cardClasses =
    "group flex min-h-[270px] flex-col rounded-[28px] border border-[#d0d7df] bg-white p-6 text-left text-[#001b3a] shadow-sm transition hover:-translate-y-1 hover:shadow-lg";

  const content = (
    <>
      <div className="mb-7 flex h-16 w-16 items-center justify-center rounded-3xl bg-[#c4002f] text-2xl font-black text-white">
        {button.icon}
      </div>

      <h2 className="text-3xl font-black leading-tight">{button.title}</h2>

      <p className="mt-5 text-base font-bold leading-7 text-[#61748b]">
        {button.text}
      </p>

      <div className="mt-auto pt-8 text-xs font-black uppercase tracking-[0.16em] text-[#c4002f]">
        {button.actionText || "OPEN"} <span className="transition group-hover:translate-x-1">→</span>
      </div>
    </>
  );

  if (button.isNavigation) {
    return (
      <button type="button" onClick={onNavigationReset} className={cardClasses}>
        {content}
      </button>
    );
  }

  return (
    <Link href={button.href || "#"} className={`${cardClasses} no-underline`}>
      {content}
    </Link>
  );
}
