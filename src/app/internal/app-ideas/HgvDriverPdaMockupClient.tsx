"use client";

import Link from "next/link";
import { useState } from "react";
import VehicleCheckTimer, { resetVehicleCheckMockup } from "../vehicle-checks/VehicleCheckTimer";
import { resetDriverPdaManifestMockup } from "./driverPdaManifestData";

type AppButton = {
  title: string;
  text: string;
  redText?: string;
  href?: string;
  externalHref?: string;
  icon: string;
  actionText?: string;
  isMessaging?: boolean;
};

const appButtons: AppButton[] = [
  {
    title: "Vehicle Checks",
    text: "Daily checks and defect reporting.",
    href: "/internal/vehicle-check-type",
    icon: "✓",
    actionText: "OPEN",
  },
  {
    title: "Duty",
    text: "Duty details, trailer journey and 318 manifest information.",
    href: "/internal/app-ideas/manifest",
    icon: "318",
    actionText: "OPEN",
  },
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
    title: "Messaging",
    text: "Receive incoming operational messages.",
    href: "/internal/app-ideas/messaging",
    icon: "✉",
    actionText: "OPEN",
    isMessaging: true,
  },
  {
    title: "Report RTC",
    text: "Report a road traffic collision, incident, damage or breakdown immediately.",
    href: "/internal/app-ideas/rtc",
    icon: "!",
    actionText: "OPEN",
  },
  {
    title: "Robin",
    text: "Internal website function to be added.",
    icon: "R",
    actionText: "TO BE ADDED",
  },
  {
    title: "Contacts",
    text: "Key contact numbers and operational support details.",
    href: "/internal/app-ideas/contacts",
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

  function handleMockMessage() {
    setMessageActive((current) => !current);
  }

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
                Driver PDA
              </h1>
              <p className="text-sm font-black leading-none sm:text-base">
                Concept Mockup
              </p>
            </div>
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
            />
          ))}

          <MessagingControls
            messageActive={messageActive}
            onResetAllMocks={handleResetAllMocks}
            onMockMessage={handleMockMessage}
          />
        </div>
      </section>
    </main>
  );
}

function ActionCard({
  button,
  messageActive,
}: {
  button: AppButton;
  messageActive: boolean;
}) {
  const isMessagingActive = button.isMessaging && messageActive;
  const isInteractive = Boolean(button.href || button.externalHref);

  const cardClasses = `group flex h-full min-h-[270px] flex-col rounded-[28px] border p-6 text-left shadow-sm transition ${
    isInteractive ? "hover:-translate-y-1 hover:shadow-lg" : ""
  } ${
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
        {isInteractive && (
          <span className="transition group-hover:translate-x-1">→</span>
        )}
      </div>
    </>
  );

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
    return (
      <Link href={button.href} className={`${cardClasses} no-underline`}>
        {content}
      </Link>
    );
  }

  return <div className={cardClasses}>{content}</div>;
}

function MessagingControls({
  messageActive,
  onResetAllMocks,
  onMockMessage,
}: {
  messageActive: boolean;
  onResetAllMocks: () => void;
  onMockMessage: () => void;
}) {
  return (
    <div className="rounded-[18px] border border-[#d0d7df] bg-white p-2 shadow-sm sm:col-span-2 lg:col-span-4">
      <div className="grid w-full grid-cols-2 gap-3 sm:grid-cols-4">
        <button
          type="button"
          onClick={onResetAllMocks}
          className="flex min-h-[42px] w-full items-center justify-center rounded-[14px] bg-[#c4002f] px-4 py-2 text-center text-[11px] font-black uppercase tracking-[0.14em] text-white transition hover:bg-[#9f0026]"
        >
          Reset
        </button>

        <button
          type="button"
          onClick={onMockMessage}
          className={`flex min-h-[42px] w-full items-center justify-center rounded-[14px] px-4 py-2 text-center text-[11px] font-black uppercase tracking-[0.14em] transition ${
            messageActive
              ? "bg-[#067a35] text-white hover:bg-[#045c28]"
              : "bg-[#e8f7ee] text-[#067a35] hover:bg-[#d9f7e5]"
          }`}
        >
          Message
        </button>

        <Link
          href="/internal/app-ideas/dct"
          className="flex min-h-[42px] w-full items-center justify-center rounded-[14px] bg-[#001b3a] px-4 py-2 text-center text-[11px] font-black uppercase tracking-[0.14em] text-white no-underline transition hover:bg-[#0f2f57]"
        >
          DCT
        </Link>

        <Link
          href="/internal/app-ideas/link-message-mock"
          className="flex min-h-[42px] w-full items-center justify-center rounded-[14px] bg-[#001b3a] px-4 py-2 text-center text-[11px] font-black uppercase tracking-[0.14em] text-white no-underline transition hover:bg-[#0f2f57]"
        >
          Office Dashboard
        </Link>
      </div>
    </div>
  );
}

function resetAllDriverPdaMocks() {
  resetDriverPdaManifestMockup();

  if (typeof window === "undefined") {
    return;
  }

  resetVehicleCheckMockup();

  const exactKeysToRemove = [
    "hgv-check-timer-started-at",
    "hgv-vehicle-check-status",
    "hgv-current-mileage-km",
    "hgv-vehicle-check-brake-status",
    "hgv-vehicle-check-brake-descriptions",
    "hgv-vehicle-check-brake-photo-names",
    "hgv-brake-system-status",
    "hgv-brake-system-descriptions",
    "hgv-brake-system-photo-names",
    "driver-pda-rtc-report",
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
