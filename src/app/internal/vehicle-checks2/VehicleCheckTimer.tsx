"use client";

import { useEffect, useState } from "react";

const timerStartedAtStorageKey = "hgv-backup2-check-timer-started-at";
const timerDurationMs = 20 * 60 * 1000;
const amberWarningMs = 5 * 60 * 1000;

export function startVehicleCheckTimer() {
  const existingStartTime = window.localStorage.getItem(
    timerStartedAtStorageKey
  );

  if (!existingStartTime) {
    window.localStorage.setItem(timerStartedAtStorageKey, Date.now().toString());
  }
}

export function resetVehicleCheckMockup() {
  const keysToRemove = [
    "hgv-backup2-check-timer-started-at",
    "hgv-backup2-vehicle-check-status",
    "hgv-backup2-current-mileage-km",

    "hgv-backup2-brake-system-defects-status",
    "hgv-backup2-brake-system-defects-descriptions",
    "hgv-backup2-brake-system-defects-photo-names",

    "hgv-backup2-steering-controls-status",
    "hgv-backup2-steering-controls-descriptions",
    "hgv-backup2-steering-controls-photo-names",

    "hgv-backup2-tyres-wheels-suspension-status",
    "hgv-backup2-tyres-wheels-suspension-descriptions",
    "hgv-backup2-tyres-wheels-suspension-photo-names",

    "hgv-backup2-lights-visibility-warning-devices-status",
    "hgv-backup2-lights-visibility-warning-devices-descriptions",
    "hgv-backup2-lights-visibility-warning-devices-photo-names",

    "hgv-backup2-trailer-coupling-defects-status",
    "hgv-backup2-trailer-coupling-defects-descriptions",
    "hgv-backup2-trailer-coupling-defects-photo-names",

    "hgv-backup2-load-security-vehicle-security-status",
    "hgv-backup2-load-security-vehicle-security-descriptions",
    "hgv-backup2-load-security-vehicle-security-photo-names",

    "hgv-backup2-fluid-leaks-mechanical-failures-status",
    "hgv-backup2-fluid-leaks-mechanical-failures-descriptions",
    "hgv-backup2-fluid-leaks-mechanical-failures-photo-names",

    "hgv-backup2-legal-compliance-failures-status",
    "hgv-backup2-legal-compliance-failures-descriptions",
    "hgv-backup2-legal-compliance-failures-photo-names",

    "hgv-backup2-safety-equipment-emergency-systems-status",
    "hgv-backup2-safety-equipment-emergency-systems-descriptions",
    "hgv-backup2-safety-equipment-emergency-systems-photo-names",

    "hgv-backup2-structural-general-vehicle-condition-status",
    "hgv-backup2-structural-general-vehicle-condition-descriptions",
    "hgv-backup2-structural-general-vehicle-condition-photo-names",
  ];

  keysToRemove.forEach((key) => window.localStorage.removeItem(key));
}

export default function VehicleCheckTimer() {
  const [remainingMs, setRemainingMs] = useState<number | null>(null);

  useEffect(() => {
    function updateTimer() {
      const startedAt = window.localStorage.getItem(timerStartedAtStorageKey);

      if (!startedAt) {
        setRemainingMs(timerDurationMs);
        return;
      }

      const elapsedMs = Date.now() - Number(startedAt);
      const nextRemainingMs = Math.max(timerDurationMs - elapsedMs, 0);

      setRemainingMs(nextRemainingMs);
    }

    updateTimer();

    const interval = window.setInterval(updateTimer, 1000);

    return () => window.clearInterval(interval);
  }, []);

  const safeRemainingMs = remainingMs ?? timerDurationMs;

  const isTimedOut = safeRemainingMs === 0;
  const isAmber = safeRemainingMs <= amberWarningMs && safeRemainingMs > 0;

  const minutes = Math.floor(safeRemainingMs / 60000);
  const seconds = Math.floor((safeRemainingMs % 60000) / 1000);

  const displayTime = `${minutes.toString().padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")}`;

  return (
    <div
      className={`rounded-2xl border px-4 py-2 shadow-sm ${
        isTimedOut
          ? "border-[#86efac] bg-[#dcfce7]"
          : isAmber
          ? "border-[#fcd34d] bg-[#fef3c7]"
          : "border-white/30 bg-white/10"
      }`}
    >
      <p
        className={`text-[10px] font-black uppercase tracking-[0.16em] ${
          isTimedOut
            ? "text-[#15803d]"
            : isAmber
            ? "text-[#92400e]"
            : "text-[#ffd9df]"
        }`}
      >
        Check Timer
      </p>

      <p
        className={`text-base font-black ${
          isTimedOut
            ? "text-[#14532d]"
            : isAmber
            ? "text-[#92400e]"
            : "text-white"
        }`}
      >
        {isTimedOut ? "Checks Timeout" : displayTime}
      </p>
    </div>
  );
}