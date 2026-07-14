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

type MessageLevel = "none" | "normal" | "high" | "critical";

type MessageLevelConfig = {
  level: Exclude<MessageLevel, "none">;
  label: string;
  buttonLabel: string;
  heading: string;
  text: string;
  icon: string;
  borderClass: string;
  panelClass: string;
  textClass: string;
  mutedTextClass: string;
  iconClass: string;
  buttonClass: string;
  buttonHoverClass: string;
};

const messageLevelConfigs: Record<Exclude<MessageLevel, "none">, MessageLevelConfig> = {
  normal: {
    level: "normal",
    label: "Normal",
    buttonLabel: "Normal Message",
    heading: "Normal Message From NWH Transport",
    text: "Routine operational message received. Please check your messages when safe to do so.",
    icon: "✉",
    borderClass: "border-[#1d4ed8]",
    panelClass: "bg-[#dbeafe]",
    textClass: "text-[#1d4ed8]",
    mutedTextClass: "text-[#1e3a8a]",
    iconClass: "bg-[#1d4ed8]",
    buttonClass: "bg-[#1d4ed8] text-white",
    buttonHoverClass: "hover:bg-[#1e40af]",
  },
  high: {
    level: "high",
    label: "High",
    buttonLabel: "High Message",
    heading: "High Priority Message From NWH Transport",
    text: "High priority operational message received. Please review before continuing your duty.",
    icon: "▲",
    borderClass: "border-[#d97706]",
    panelClass: "bg-[#fef3c7]",
    textClass: "text-[#b45309]",
    mutedTextClass: "text-[#92400e]",
    iconClass: "bg-[#d97706]",
    buttonClass: "bg-[#d97706] text-white",
    buttonHoverClass: "hover:bg-[#b45309]",
  },
  critical: {
    level: "critical",
    label: "Critical",
    buttonLabel: "Critical Message",
    heading: "Critical Message From NWH Transport",
    text: "Critical operational message received. Stop when safe and contact Transport Office immediately.",
    icon: "!",
    borderClass: "border-[#dc2626]",
    panelClass: "bg-[#fee2e2]",
    textClass: "text-[#b91c1c]",
    mutedTextClass: "text-[#7f1d1d]",
    iconClass: "bg-[#dc2626]",
    buttonClass: "bg-[#dc2626] text-white",
    buttonHoverClass: "hover:bg-[#b91c1c]",
  },
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
  const [messageLevel, setMessageLevel] = useState<MessageLevel>("none");
  const messageConfig = messageLevel === "none" ? null : messageLevelConfigs[messageLevel];

  function handleResetAllMocks() {
    resetAllDriverPdaMocks();
    setMessageLevel("none");
    window.alert("All Driver PDA mock journeys have been reset.");
  }

  function handleMockMessage() {
    setMessageLevel((current) => {
      if (current === "none") {
        return "normal";
      }

      if (current === "normal") {
        return "high";
      }

      if (current === "high") {
        return "critical";
      }

      return "none";
    });
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

      {messageConfig && (
        <section className="px-4 pt-5 sm:px-6 lg:px-10">
          <div
            className={`mx-auto flex max-w-[1280px] flex-col gap-4 rounded-[18px] border-2 px-5 py-4 shadow-sm sm:flex-row sm:items-center sm:justify-between ${messageConfig.borderClass} ${messageConfig.panelClass} ${messageConfig.textClass}`}
          >
            <div>
              <p className="text-xs font-black uppercase tracking-[0.16em]">
                {messageConfig.heading}
              </p>
              <p className="mt-2 text-base font-black">{messageConfig.text}</p>
            </div>

            <div className="flex shrink-0 items-center gap-2" aria-label="Message priority options">
              {Object.values(messageLevelConfigs).map((levelConfig) => {
                const isActiveLevel = levelConfig.level === messageConfig.level;

                return (
                  <div
                    key={levelConfig.level}
                    title={`${levelConfig.label} priority`}
                    className={`flex h-12 w-12 items-center justify-center rounded-2xl border text-xl font-black transition ${
                      isActiveLevel
                        ? `${levelConfig.iconClass} border-transparent text-white shadow-md`
                        : "border-white/70 bg-white/60 text-[#475569]"
                    }`}
                  >
                    {levelConfig.icon}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      <section className="px-4 py-7 sm:px-6 lg:px-10">
        <div className="mx-auto grid max-w-[1280px] grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {appButtons.map((button) => (
            <ActionCard
              key={button.title}
              button={button}
              messageConfig={messageConfig}
            />
          ))}

          <MessagingControls
            messageConfig={messageConfig}
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
  messageConfig,
}: {
  button: AppButton;
  messageConfig: MessageLevelConfig | null;
}) {
  const isMessagingActive = button.isMessaging && Boolean(messageConfig);
  const isInteractive = Boolean(button.href || button.externalHref);

  const cardClasses = `group flex h-full min-h-[270px] flex-col rounded-[28px] border p-6 text-left shadow-sm transition ${
    isInteractive ? "hover:-translate-y-1 hover:shadow-lg" : ""
  } ${
    isMessagingActive && messageConfig
      ? `${messageConfig.borderClass} ${messageConfig.panelClass} text-[#001b3a]`
      : "border-[#d0d7df] bg-white text-[#001b3a]"
  }`;

  const iconClasses = `mb-7 flex h-16 w-16 items-center justify-center rounded-3xl text-2xl font-black text-white ${
    isMessagingActive && messageConfig ? messageConfig.iconClass : "bg-[#c4002f]"
  }`;

  const actionClasses = `mt-auto pt-8 text-xs font-black uppercase tracking-[0.16em] ${
    isMessagingActive && messageConfig ? messageConfig.textClass : "text-[#c4002f]"
  }`;

  const content = (
    <>
      <div className={iconClasses}>{isMessagingActive && messageConfig ? messageConfig.icon : button.icon}</div>

      <h2 className="text-3xl font-black leading-tight">{button.title}</h2>

      <p
        className={`mt-5 text-base font-bold leading-7 ${
          isMessagingActive && messageConfig ? messageConfig.mutedTextClass : "text-[#61748b]"
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
        {isMessagingActive && messageConfig
          ? messageConfig.buttonLabel
          : button.actionText || "OPEN"}{" "}
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
  messageConfig,
  onResetAllMocks,
  onMockMessage,
}: {
  messageConfig: MessageLevelConfig | null;
  onResetAllMocks: () => void;
  onMockMessage: () => void;
}) {
  const messageButtonClasses = messageConfig
    ? `${messageConfig.buttonClass} ${messageConfig.buttonHoverClass}`
    : "bg-[#e8f7ee] text-[#067a35] hover:bg-[#d9f7e5]";

  const messageButtonLabel = messageConfig
    ? `${messageConfig.label} Message`
    : "Message";

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
          className={`flex min-h-[42px] w-full items-center justify-center rounded-[14px] px-4 py-2 text-center text-[11px] font-black uppercase tracking-[0.14em] transition ${messageButtonClasses}`}
        >
          {messageButtonLabel}
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
