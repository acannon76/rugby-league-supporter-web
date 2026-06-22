"use client";

import Link from "next/link";
import { useState } from "react";
import { resetDriverPdaManifestMockup } from "./driverPdaManifestData";
import VehicleCheckTimer, {
  resetVehicleCheckMockup,
  startVehicleCheckTimer,
} from "../vehicle-checks/VehicleCheckTimer";

type AppButton = {
  title: string;
  text: string;
  href?: string;
  icon: string;
  actionText?: string;
  isNavigation?: boolean;
  isMessaging?: boolean;
};

const appButtons: AppButton[] = [
  {
    title: "Navigation",
    text: "Route guidance and journey information. Mock reset for all Driver PDA mock journeys.",
    icon: "➤",
    actionText: "RESET ALL MOCKS",
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
    href: "/internal/vehicle-history",
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
    icon: "✉",
    actionText: "MOCK MESSAGE",
    isMessaging: true,
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
  const [messageActive, setMessageActive] = useState(false);

  function handleNavigationReset() {
    resetAllDriverPdaMocks();
    setMessageActive(false);
    window.alert("All Driver PDA mock journeys have been reset.");
  }

  function handleMessagingClick() {
    setMessageActive((current) => !current);
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

          <div className="ml-auto hidden sm:block">
            <VehicleCheckTimer />
          </div>

          <div className="rounded-2xl border border-white/30 bg-white/10 px-5 py-3 text-right">
            <p className="text-xs font-black uppercase tracking-[0.16em]">
              Driver
            </p>
            <p className="text-base font-black">Andrew Cannon</p>
          </div>
        </div>
      </header>

      <section className="bg-[#c4002f] px-4 pb-4 text-white sm:hidden">
        <div className="mx-auto max-w-[1280px]">
          <VehicleCheckTimer />
        </div>
      </section>

      {messageActive && (
        <section className="px-4 pt-5 sm:px-6 lg:px-10">
          <div className="mx-auto max-w-[1280px] rounded-[18px] border-2 border-[#067a35] bg-[#d9f7e5] px-5 py-4 text-[#067a35] shadow-sm">
            <p className="text-xs font-black uppercase tracking-[0.16em]">
              Message From NWH Transport
            </p>
            <p className="mt-2 text-base font-black">
              Please check your operational messages before continuing your duty.
            </p>
          </div>
        </section>
      )}

      <section className="px-4 py-7 sm:px-6 lg:px-10">
        <div className="mx-auto grid max-w-[1280px] grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {appButtons.map((button) => (
            <ActionCard
              key={button.title}
              button={button}
              messageActive={messageActive}
              onNavigationReset={handleNavigationReset}
              onMessagingClick={handleMessagingClick}
            />
          ))}
        </div>
      </section>
    </main>
  );
}

function ActionCard({
  button,
  messageActive,
  onNavigationReset,
  onMessagingClick,
}: {
  button: AppButton;
  messageActive: boolean;
  onNavigationReset: () => void;
  onMessagingClick: () => void;
}) {
  const isMessagingActive = button.isMessaging && messageActive;

  const cardClasses = `group flex min-h-[270px] flex-col rounded-[28px] border p-6 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-lg ${
    isMessagingActive
      ? "border-[#067a35] bg-[#d9f7e5] text-[#064e3b]"
      : "border-[#d0d7df] bg-white text-[#001b3a]"
  }`;

  const iconClasses = `mb-7 flex h-16 w-16 items-center justify-center rounded-3xl text-2xl font-black text-white ${
    isMessagingActive ? "bg-[#067a35]" : "bg-[#c4002f]"
  }`;

  const actionClasses = `mt-auto pt-8 text-xs font-black uppercase tracking-[0.16em] ${
    isMessagingActive ? "text-[#067a35]" : "text-[#c4002f]"
  }`;

  const content = (
    <>
      <div className={iconClasses}>{button.icon}</div>

      <h2 className="text-3xl font-black leading-tight">{button.title}</h2>

      <p
        className={`mt-5 text-base font-bold leading-7 ${
          isMessagingActive ? "text-[#166534]" : "text-[#61748b]"
        }`}
      >
        {button.text}
      </p>

      <div className={actionClasses}>
        {isMessagingActive ? "MESSAGE RECEIVED" : button.actionText || "OPEN"}{" "}
        <span className="transition group-hover:translate-x-1">→</span>
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

  if (button.isMessaging) {
    return (
      <button type="button" onClick={onMessagingClick} className={cardClasses}>
        {content}
      </button>
    );
  }

  return (
    <Link
      href={button.href || "#"}
      onClick={button.title === "Vehicle Checks" ? startVehicleCheckTimer : undefined}
      className={`${cardClasses} no-underline`}
    >
      {content}
    </Link>
  );
}

function resetAllDriverPdaMocks() {
  resetDriverPdaManifestMockup();
  resetVehicleCheckMockup();

  if (typeof window === "undefined") {
    return;
  }

  const exactKeysToRemove = [
    "hgv-vehicle-check-status",
    "hgv-vehicle-check-brake-status",
    "hgv-vehicle-check-brake-descriptions",
    "hgv-vehicle-check-brake-photo-names",
    "hgv-brake-system-status",
    "hgv-brake-system-descriptions",
    "hgv-brake-system-photo-names",
    "hgv-check-timer-started-at",
    "hgv-current-mileage-km",
    "hgv-mock-vehicle-history-extra",
  ];

  exactKeysToRemove.forEach((key) => window.localStorage.removeItem(key));

  const prefixesToRemove = [
    "driver-pda-",
    "hgv-vehicle-check",
    "hgv-brake",
    "vehicle-check",
  ];

  const keysToRemove: string[] = [];

  for (let index = 0; index < window.localStorage.length; index += 1) {
    const key = window.localStorage.key(index);

    if (!key) {
      continue;
    }

    if (prefixesToRemove.some((prefix) => key.startsWith(prefix))) {
      keysToRemove.push(key);
    }
  }

  keysToRemove.forEach((key) => window.localStorage.removeItem(key));
}
