"use client";

import Link from "next/link";
import { useState } from "react";
import VehicleCheckTimer, {
  resetVehicleCheckMockup,
  startVehicleCheckTimer,
} from "../vehicle-checks/VehicleCheckTimer";
import { resetDriverPdaManifestMockup } from "./driverPdaManifestData";

type AppButton = {
  title: string;
  text: string;
  redText?: string;
  href?: string;
  externalHref?: string;
  icon: string;
  actionText?: string;
  isReset?: boolean;
  isMessaging?: boolean;
  startsVehicleChecks?: boolean;
};

const appButtons: AppButton[] = [
  {
    title: "Navigation",
    text: "Route guidance and journey information.",
    externalHref: "https://www.google.com/maps",
    icon: "➤",
    actionText: "OPEN MAPS",
  },
  {
    title: "Driving Style",
    text: "Driving behaviour and safety indicators.",
    href: "/internal/app-ideas/driving-style",
    icon: "◆",
    actionText: "OPEN",
  },
  {
    title: "Vehicle Checks",
    text: "Daily checks and defect reporting.",
    href: "/internal/vehicle-history",
    icon: "✓",
    actionText: "OPEN",
    startsVehicleChecks: true,
  },
  {
    title: "RTC",
    text: "Report a road traffic collision, incident, damage or breakdown immediately.",
    href: "/internal/app-ideas/rtc",
    icon: "!",
    actionText: "OPEN",
  },
  {
    title: "Robin",
    text: "Internal Website.",
    redText: "Mock reset for all Driver PDA mock journeys.",
    icon: "R",
    actionText: "RESET ALL MOCKS",
    isReset: true,
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

  function handleResetAllMocks() {
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
        <div className="mx-auto flex max-w-[1280px] flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex min-w-0 flex-col gap-4 lg:flex-row lg:items-center lg:gap-5">
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

            {messageActive && (
              <div className="rounded-2xl border border-[#067a35] bg-[#d9f7e5] px-4 py-3 text-[#067a35] shadow-sm lg:max-w-[420px]">
                <p className="text-[10px] font-black uppercase tracking-[0.16em]">
                  Message From NWH Transport
                </p>
                <p className="mt-1 text-sm font-black leading-5">
                  Please review messages before continuing your duty.
                </p>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-3 sm:ml-auto sm:flex-row sm:items-center">
            <VehicleCheckTimer />

            <div className="rounded-2xl border border-white/30 bg-white/10 px-5 py-3 text-right">
              <p className="text-xs font-black uppercase tracking-[0.16em]">
                Driver
              </p>
              <p className="text-base font-black">Andrew Cannon</p>
            </div>
          </div>
        </div>
      </header>

      <section className="px-4 py-7 sm:px-6 lg:px-10">
        <div className="mx-auto grid max-w-[1280px] grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:auto-rows-fr">
          {appButtons.map((button) => (
            <ActionCard
              key={button.title}
              button={button}
              messageActive={messageActive}
              onResetAllMocks={handleResetAllMocks}
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
  onResetAllMocks,
  onMessagingClick,
}: {
  button: AppButton;
  messageActive: boolean;
  onResetAllMocks: () => void;
  onMessagingClick: () => void;
}) {
  const isMessagingActive = button.isMessaging && messageActive;

  const cardClasses = `group flex h-full min-h-[300px] flex-col rounded-[28px] border p-6 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-lg ${
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

      {button.redText && (
        <p className="mt-3 text-sm font-black leading-6 text-[#c4002f]">
          {button.redText}
        </p>
      )}

      <div className={actionClasses}>
        {isMessagingActive ? "MESSAGE RECEIVED" : button.actionText || "OPEN"}{" "}
        <span className="transition group-hover:translate-x-1">→</span>
      </div>
    </>
  );

  if (button.isReset) {
    return (
      <button type="button" onClick={onResetAllMocks} className={cardClasses}>
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

  if (button.externalHref) {
    return (
      <a
        href={button.externalHref}
        target="_blank"
        rel="noopener noreferrer"
        className={`${cardClasses} no-underline`}
      >
        {content}
      </a>
    );
  }

  if (button.href) {
    const linkProps = button.startsVehicleChecks
      ? { onClick: startVehicleCheckTimer }
      : {};

    return (
      <Link href={button.href} className={`${cardClasses} no-underline`} {...linkProps}>
        {content}
      </Link>
    );
  }

  return <div className={cardClasses}>{content}</div>;
}

function resetAllDriverPdaMocks() {
  resetVehicleCheckMockup();
  resetDriverPdaManifestMockup();

  if (typeof window !== "undefined") {
    const keysToRemove = [
      "driver-pda-dct-rows",
      "driver-pda-dct-duty-id",
      "driver-pda-dct-vehicle-number",
      "driver-pda-dct-source-mockup",
      "driver-pda-driver-message-active",
      "hgv-mock-vehicle-history-extra",
    ];

    keysToRemove.forEach((key) => window.localStorage.removeItem(key));
  }
}
