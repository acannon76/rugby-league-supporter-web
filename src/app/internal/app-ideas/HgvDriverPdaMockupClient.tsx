"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import VehicleCheckTimer, { resetVehicleCheckMockup } from "../vehicle-checks/VehicleCheckTimer";
import { resetDriverPdaManifestMockup } from "./driverPdaManifestData";
import {
  clearDriverSession,
  saveDriverSession,
} from "../driverPdaSession";
import { useDriverSession } from "../DriverName";
import {
  DRIVER_MESSAGE_STORE_CHANGED_EVENT,
  getUnreadOfficeMessages,
  priorityRank,
  readDriverReadKeys,
  readOpenCommsItems,
  writeDriverReadKeys,
} from "./driverMessageSync";

type AppButton = {
  title: string;
  text: string;
  redText?: string;
  href?: string;
  externalHref?: string;
  icon: string;
  actionText?: string;
  isMessaging?: boolean;
  isLogout?: boolean;
};

type MessageLevel = "none" | "normal" | "high" | "critical";

type MessageAlert = {
  level: MessageLevel;
  count: number;
  latestText: string;
};

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
    title: "Log Out",
    text: "End this mock session and return to the log on screen.",
    icon: "↪",
    actionText: "LOG OUT",
    isLogout: true,
  },
];

export default function HgvDriverPdaMockupClient() {
  const { isLoggedIn, driverName } = useDriverSession();
  const [messageAlert, setMessageAlert] = useState<MessageAlert>({ level: "none", count: 0, latestText: "" });
  const messageLevel = messageAlert.level;
  const messageConfig = messageLevel === "none" ? null : messageLevelConfigs[messageLevel];

  useEffect(() => {
    if (!isLoggedIn) {
      setMessageAlert({ level: "none", count: 0, latestText: "" });
      return;
    }

    function refreshMessageAlert() {
      const unreadMessages = getUnreadOfficeMessages(
        readOpenCommsItems(),
        readDriverReadKeys(),
        driverName,
        "NWH254",
      );

      if (!unreadMessages.length) {
        setMessageAlert({ level: "none", count: 0, latestText: "" });
        return;
      }

      const highestMessage = unreadMessages.reduce((highest, current) =>
        priorityRank(current.message.priority) > priorityRank(highest.message.priority) ? current : highest,
      );
      const level = highestMessage.message.priority.toLowerCase() as Exclude<MessageLevel, "none">;

      setMessageAlert({
        level,
        count: unreadMessages.length,
        latestText: highestMessage.message.message,
      });
    }

    refreshMessageAlert();
    window.addEventListener("storage", refreshMessageAlert);
    window.addEventListener("focus", refreshMessageAlert);
    window.addEventListener(DRIVER_MESSAGE_STORE_CHANGED_EVENT, refreshMessageAlert);

    return () => {
      window.removeEventListener("storage", refreshMessageAlert);
      window.removeEventListener("focus", refreshMessageAlert);
      window.removeEventListener(DRIVER_MESSAGE_STORE_CHANGED_EVENT, refreshMessageAlert);
    };
  }, [driverName, isLoggedIn]);

  function handleLogin(name: string) {
    saveDriverSession(name);
  }

  function handleLogout() {
    clearDriverSession();
  }

  function handleResetAllMocks() {
    resetAllDriverPdaMocks();
    writeDriverReadKeys([]);
    setMessageAlert({ level: "none", count: 0, latestText: "" });
    window.alert("All Driver PDA mock journeys have been reset.");
  }



  if (!isLoggedIn) {
    return <DriverLoginScreen onLogin={handleLogin} />;
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
              <p className="text-base font-black">{driverName}</p>
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
              <p className="mt-2 text-base font-black">{messageAlert.latestText || messageConfig.text}</p>
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
              messageCount={messageAlert.count}
              onLogout={handleLogout}
            />
          ))}

          <MessagingControls
            messageConfig={messageConfig}
            messageCount={messageAlert.count}
            onResetAllMocks={handleResetAllMocks}
          />
        </div>
      </section>
    </main>
  );
}

function ActionCard({
  button,
  messageConfig,
  messageCount,
  onLogout,
}: {
  button: AppButton;
  messageConfig: MessageLevelConfig | null;
  messageCount: number;
  onLogout: () => void;
}) {
  const isMessagingActive = button.isMessaging && Boolean(messageConfig);
  const isInteractive = Boolean(button.href || button.externalHref || button.isLogout);

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
        {isMessagingActive && messageConfig
          ? `${messageCount} unread ${messageConfig.label.toLowerCase()} priority message${messageCount === 1 ? "" : "s"}. Open Messaging to review.`
          : button.text}
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

  if (button.isLogout) {
    return (
      <button type="button" onClick={onLogout} className={cardClasses}>
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
  messageCount,
  onResetAllMocks,
}: {
  messageConfig: MessageLevelConfig | null;
  messageCount: number;
  onResetAllMocks: () => void;
}) {
  const messageButtonClasses = messageConfig
    ? `${messageConfig.buttonClass} ${messageConfig.buttonHoverClass}`
    : "bg-[#e8f7ee] text-[#067a35] hover:bg-[#d9f7e5]";

  const messageButtonLabel = messageConfig
    ? `${messageConfig.label} Message (${messageCount})`
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

        <Link
          href="/internal/app-ideas/messaging"
          className={`flex min-h-[42px] w-full items-center justify-center rounded-[14px] px-4 py-2 text-center text-[11px] font-black uppercase tracking-[0.14em] no-underline transition ${messageButtonClasses}`}
        >
          {messageButtonLabel}
        </Link>

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

function DriverLoginScreen({ onLogin }: { onLogin: (driverName: string) => void }) {
  const [name, setName] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");

  function submitLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!name.trim()) {
      setError("Enter a driver name to continue.");
      return;
    }

    if (pin !== "00000") {
      setError("The PIN is incorrect. Use 00000 for this mockup.");
      return;
    }

    setError("");
    onLogin(name.trim());
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f4f1ec] px-4 py-10 font-sans text-[#001b3a] sm:px-6">
      <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-[#c4002f]/10" />
      <div className="pointer-events-none absolute -bottom-32 -right-20 h-96 w-96 rounded-full bg-[#001b3a]/[0.08]" />

      <section className="relative w-full max-w-[980px] overflow-hidden rounded-[34px] border border-[#d0d7df] bg-white shadow-2xl">
        <div className="grid min-h-[610px] lg:grid-cols-[0.9fr_1.1fr]">
          <div className="flex flex-col justify-between bg-[#c4002f] p-8 text-white sm:p-10 lg:p-12">
            <div>
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-white text-lg font-black">
                  HGV
                </div>
                <div>
                  <h1 className="text-2xl font-black leading-none sm:text-3xl">Driver PDA</h1>
                  <p className="mt-1 text-sm font-black uppercase tracking-[0.16em] text-white/80">
                    Concept Mockup
                  </p>
                </div>
              </div>

              <div className="mt-16 max-w-sm">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-white/75">Driver access</p>
                <h2 className="mt-4 text-4xl font-black leading-tight sm:text-5xl">Log on to begin your duty.</h2>
                <p className="mt-6 text-base font-bold leading-7 text-white/80">
                  Enter any driver name for the mockup. The name will be shown throughout the Driver PDA screens.
                </p>
              </div>
            </div>

            <div className="mt-12 flex items-center gap-3 rounded-2xl border border-white/25 bg-white/10 p-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-xl font-black text-[#c4002f]">✓</div>
              <p className="text-sm font-bold leading-6 text-white/90">Mock access only — no real driver account is required.</p>
            </div>
          </div>

          <div className="flex flex-col justify-center p-8 sm:p-10 lg:p-14">
            <div className="mx-auto w-full max-w-md">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#c4002f]">Welcome</p>
              <h2 className="mt-3 text-3xl font-black sm:text-4xl">Driver log on</h2>
              <p className="mt-3 text-base font-bold leading-7 text-[#61748b]">
                Use your chosen name and the five-digit mock PIN.
              </p>

              <form onSubmit={submitLogin} className="mt-9 space-y-6">
                <label className="block">
                  <span className="text-sm font-black text-[#001b3a]">Driver name</span>
                  <input
                    type="text"
                    value={name}
                    onChange={(event) => {
                      setName(event.target.value);
                      setError("");
                    }}
                    autoComplete="name"
                    autoFocus
                    placeholder="Enter your name"
                    className="mt-2 h-14 w-full rounded-2xl border-2 border-[#d0d7df] bg-[#f8fafc] px-4 text-base font-bold outline-none transition placeholder:text-[#94a3b8] focus:border-[#c4002f] focus:bg-white focus:ring-4 focus:ring-[#c4002f]/10"
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-black text-[#001b3a]">PIN</span>
                  <input
                    type="password"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={5}
                    value={pin}
                    onChange={(event) => {
                      setPin(event.target.value.replace(/\D/g, "").slice(0, 5));
                      setError("");
                    }}
                    autoComplete="off"
                    placeholder="Enter 5-digit PIN"
                    className="mt-2 h-14 w-full rounded-2xl border-2 border-[#d0d7df] bg-[#f8fafc] px-4 text-lg font-black tracking-[0.35em] outline-none transition placeholder:text-base placeholder:font-bold placeholder:tracking-normal placeholder:text-[#94a3b8] focus:border-[#c4002f] focus:bg-white focus:ring-4 focus:ring-[#c4002f]/10"
                  />
                </label>

                {error && (
                  <div role="alert" className="rounded-2xl border border-[#fecaca] bg-[#fff1f2] px-4 py-3 text-sm font-black text-[#b91c1c]">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  className="flex h-14 w-full items-center justify-center rounded-2xl bg-[#c4002f] px-6 text-sm font-black uppercase tracking-[0.16em] text-white transition hover:bg-[#9f0026] focus:outline-none focus:ring-4 focus:ring-[#c4002f]/25"
                >
                  Log On <span className="ml-3 text-lg">→</span>
                </button>
              </form>

              <p className="mt-8 text-center text-xs font-bold text-[#61748b]">
                For this mockup, the PIN is <span className="font-black text-[#001b3a]">00000</span>.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
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
    "link-message-comms-open-items",
    "link-message-comms-history",
    "driver-messaging-read-items",
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
