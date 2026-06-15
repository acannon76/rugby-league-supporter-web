"use client";

import Link from "next/link";
import { useState } from "react";
import { resetVehicleCheckMockup } from "../vehicle-checks/VehicleCheckTimer";

type AppButton = {
  title: string;
  text: string;
  href?: string;
  icon: string;
  isMessaging?: boolean;
  isNavigation?: boolean;
};

const appButtons: AppButton[] = [
  {
  title: "Navigation",
  text: "Route guidance and journey information. Mock reset for vehicle check journey.",
  icon: "➤",
  isNavigation: true,
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
    href: "/internal/vehicle-history",
    icon: "✓",
  },
  {
    title: "RTC",
    text: "Report an incident, damage or breakdown.",
    href: "#",
    icon: "!",
  },
  {
    title: "Robin",
    text: "Internal website access for driver and operational information.",
    href: "#",
    icon: "R",
  },
  {
    title: "Manifest",
    text: "Duty details and 318 manifest information.",
    href: "#",
    icon: "318",
  },
  {
    title: "Messaging",
    text: "Receive incoming operational messages.",
    icon: "✉",
    isMessaging: true,
  },
  {
    title: "Contacts",
    text: "Useful contact numbers and support details.",
    href: "#",
    icon: "☎",
  },
];

export default function HgvDriverPdaMockupClient() {
  const [messageReceived, setMessageReceived] = useState(false);

  return (
    <main className="min-h-screen bg-[#f4f1ec] font-sans text-[#111]">
      <header className="border-b border-white/20 bg-[#b00020] px-4 py-4 text-white sm:px-6 lg:px-10">
        <div className="mx-auto flex max-w-[1180px] flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
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

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            {messageReceived && (
              <div className="rounded-2xl border border-[#86efac] bg-[#dcfce7] px-4 py-2 shadow-sm">
                <p className="text-xs font-black uppercase tracking-widest text-[#15803d]">
                  New Message
                </p>
                <p className="text-sm font-black text-[#14532d]">
                  Message from NWHUB Transport
                </p>
              </div>
            )}

            <div className="rounded-2xl border border-white/30 bg-white/10 px-4 py-2">
              <p className="text-xs font-black uppercase tracking-widest text-[#ffd9df]">
                Driver
              </p>
              <p className="text-base font-black text-white">
                Andrew Cannon
              </p>
            </div>

            <Link
              href="/"
              className="text-sm font-black text-white no-underline"
            >
              Back to website
            </Link>
          </div>
        </div>
      </header>

      <section className="px-4 py-6 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-[1180px]">
          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4 md:auto-rows-[340px]">
            {appButtons.map((button) => (
              
<ActionCard
  key={button.title}
  title={button.title}
  text={
    button.isMessaging && messageReceived
      ? "New message received. Tap to clear mock notification."
      : button.text
  }
  href={button.href}
  icon={button.icon}
  isMessaging={button.isMessaging}
  isNavigation={button.isNavigation}
  messageReceived={button.isMessaging ? messageReceived : false}
  onMessagingClick={() =>
    setMessageReceived((currentValue) => !currentValue)
  }
  onNavigationClick={() => {
    resetVehicleCheckMockup();
    window.location.href = "/internal/app-ideas";
  }}
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
  isMessaging = false,
  isNavigation = false,
  messageReceived = false,
  onMessagingClick,
  onNavigationClick,
}: {
  title: string;
  text: string;
  href?: string;
  icon: string;
  isMessaging?: boolean;
  isNavigation?: boolean;
  messageReceived?: boolean;
  onMessagingClick?: () => void;
  onNavigationClick?: () => void;
}) {





  const cardClasses = `
    group flex h-[300px] w-full flex-col rounded-[32px] border p-6 text-[#111]
    no-underline shadow-sm transition hover:shadow-lg
    sm:h-[330px] md:h-full
    ${
      messageReceived
        ? "border-[#15803d] bg-[#dcfce7]"
        : "border-[#d6dce5] bg-white"
    }
  `;

  const iconClasses = `
    mb-6 flex h-16 w-16 items-center justify-center rounded-3xl text-2xl
    font-black text-white transition
    ${
      messageReceived
        ? "bg-[#15803d] group-hover:bg-[#166534]"
        : "bg-[#b00020] group-hover:bg-[#7d0017]"
    }
  `;

  const titleClasses = `
    text-3xl font-black leading-tight
    ${messageReceived ? "text-[#14532d]" : "text-[#18243a]"}
  `;

  const actionTextClasses = `
    mt-auto flex items-center gap-2 pt-6 text-xs font-black uppercase tracking-widest
    ${messageReceived ? "text-[#15803d]" : "text-[#b00020]"}
  `;
if (isNavigation) {
  return (
    <button
      type="button"
      onClick={onNavigationClick}
      className={`${cardClasses} text-left`}
    >
      <div className={iconClasses}>{icon}</div>

      <h2 className={titleClasses}>{title}</h2>

      <p className="mt-3 text-sm font-bold leading-6 text-[#64748b]">
        {text}
      </p>

      <div className={actionTextClasses}>
        Reset mock journey <span className="transition group-hover:translate-x-1">→</span>
      </div>
    </button>
  );
}
  if (isMessaging) {
    return (
      <button
        type="button"
        onClick={onMessagingClick}
        className={`${cardClasses} text-left`}
      >
        <div className={iconClasses}>{messageReceived ? "✓" : icon}</div>

        <h2 className={titleClasses}>{title}</h2>

        <p className="mt-3 text-sm font-bold leading-6 text-[#64748b]">
          {text}
        </p>

        <div className={actionTextClasses}>
          {messageReceived ? "Message received" : "Mock message"}
          <span className="transition group-hover:translate-x-1">→</span>
        </div>
      </button>
    );
  }

  return (
    <Link href={href ?? "#"} className={cardClasses}>
      <div className={iconClasses}>{icon}</div>

      <h2 className={titleClasses}>{title}</h2>

      <p className="mt-3 text-sm font-bold leading-6 text-[#64748b]">
        {text}
      </p>

      <div className={actionTextClasses}>
        Open <span className="transition group-hover:translate-x-1">→</span>
      </div>
    </Link>
  );
}