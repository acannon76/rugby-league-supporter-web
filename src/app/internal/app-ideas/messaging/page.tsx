"use client";

import Link from "next/link";
import DriverName from "../../DriverName";
import VehicleCheckTimer from "../../vehicle-checks/VehicleCheckTimer";

type MessagingOption = {
  title: string;
  icon: string;
  text: string;
  href?: string;
  actionText?: string;
};

const messagingOptions: MessagingOption[] = [
  {
    title: "Breakdown",
    icon: "🚛",
    text: "Breakdown support and recovery information.",
    href: "/internal/app-ideas/breakdown",
    actionText: "OPEN",
  },
  {
    title: "CPC",
    icon: "CPC",
    text: "Dummy CPC messaging function for mockup build-out.",
    actionText: "TO BE ADDED",
  },
  {
    title: "Button 3",
    icon: "■",
    text: "Dummy messaging function for mockup build-out.",
    actionText: "TO BE ADDED",
  },
  {
    title: "Button 4",
    icon: "▲",
    text: "Dummy messaging function for mockup build-out.",
    actionText: "TO BE ADDED",
  },
  {
    title: "Button 5",
    icon: "★",
    text: "Dummy messaging function for mockup build-out.",
    actionText: "TO BE ADDED",
  },
  {
    title: "Button 6",
    icon: "✓",
    text: "Dummy messaging function for mockup build-out.",
    actionText: "TO BE ADDED",
  },
  {
    title: "Button 7",
    icon: "!",
    text: "Dummy messaging function for mockup build-out.",
    actionText: "TO BE ADDED",
  },
  {
    title: "Other",
    icon: "→",
    text: "Send another message direct to the transport office.",
    href: "/internal/app-ideas/messaging-transport-office",
    actionText: "OPEN",
  },
];

export default function MessagingPage() {
  return (
    <main className="min-h-screen bg-[#f4f1ec] font-sans text-[#001b3a]">
      <header className="bg-[#c4002f] px-4 py-5 text-white sm:px-6 lg:px-10">
        <div className="mx-auto flex max-w-[1280px] flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border-2 border-white text-base font-black">
              HGV
            </div>

            <div>
              <h1 className="text-xl font-black leading-none sm:text-2xl">
                Messaging
              </h1>
              <p className="text-sm font-black leading-none sm:text-base">
                Driver PDA Concept
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:ml-auto sm:flex-row sm:items-center">
            <VehicleCheckTimer />

            <div className="rounded-2xl border border-white/30 bg-white/10 px-5 py-3 text-right">
              <p className="text-xs font-black uppercase tracking-[0.16em]">
                Driver
              </p>
              <p className="text-base font-black"><DriverName /></p>
            </div>

            <Link
              href="/internal/app-ideas"
              className="rounded-2xl border border-white/30 bg-white/10 px-5 py-3 text-sm font-black text-white no-underline transition hover:bg-white/20"
            >
              Back
            </Link>
          </div>
        </div>
      </header>

      <section className="px-4 py-7 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-[1280px]">
          <section className="mb-5 rounded-[28px] border border-[#d0d7df] bg-white p-6 shadow-sm">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#c4002f]">
              Messaging mockup
            </p>
            <h2 className="mt-3 text-4xl font-black leading-tight text-[#001b3a] sm:text-5xl">
              Messaging options
            </h2>
            <p className="mt-4 max-w-[780px] text-base font-bold leading-7 text-[#61748b]">
              Dummy buttons added for the future driver-to-office messaging workflow.
            </p>
          </section>

          <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {messagingOptions.map((button) => (
              <MessagingOptionCard key={button.title} button={button} />
            ))}
          </section>
        </div>
      </section>
    </main>
  );
}

function MessagingOptionCard({ button }: { button: MessagingOption }) {
  const cardClasses =
    "group flex h-full min-h-[270px] flex-col rounded-[28px] border border-[#d0d7df] bg-white p-6 text-left text-[#001b3a] shadow-sm transition hover:-translate-y-1 hover:shadow-lg";

  const content = (
    <>
      <div className="mb-7 flex h-16 w-16 items-center justify-center rounded-3xl bg-[#c4002f] text-2xl font-black text-white">
        {button.icon}
      </div>

      <h3 className="text-3xl font-black leading-tight">{button.title}</h3>

      <p className="mt-5 text-base font-bold leading-7 text-[#61748b]">
        {button.text}
      </p>

      <div className="mt-auto pt-8 text-xs font-black uppercase tracking-[0.16em] text-[#c4002f]">
        {button.actionText || "TO BE ADDED"}{" "}
        {button.href && (
          <span className="transition group-hover:translate-x-1">→</span>
        )}
      </div>
    </>
  );

  if (button.href) {
    return (
      <Link href={button.href} className={`${cardClasses} no-underline`}>
        {content}
      </Link>
    );
  }

  return (
    <button type="button" className={cardClasses}>
      {content}
    </button>
  );
}
