"use client";

import { useEffect, useState } from "react";

const timerStartedAtStorageKey = "hgv-check-timer-started-at";
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
    "hgv-check-timer-started-at",
    "hgv-vehicle-check-status",
    "hgv-current-mileage-km",

    "hgv-brake-system-defects-status",
    "hgv-brake-system-defects-descriptions",
    "hgv-brake-system-defects-photo-names",

    "hgv-steering-controls-status",
    "hgv-steering-controls-descriptions",
    "hgv-steering-controls-photo-names",

    "hgv-tyres-wheels-suspension-status",
    "hgv-tyres-wheels-suspension-descriptions",
    "hgv-tyres-wheels-suspension-photo-names",

    "hgv-lights-visibility-warning-devices-status",
    "hgv-lights-visibility-warning-devices-descriptions",
    "hgv-lights-visibility-warning-devices-photo-names",

    "hgv-trailer-coupling-defects-status",
    "hgv-trailer-coupling-defects-descriptions",
    "hgv-trailer-coupling-defects-photo-names",

    "hgv-load-security-vehicle-security-status",
    "hgv-load-security-vehicle-security-descriptions",
    "hgv-load-security-vehicle-security-photo-names",

    "hgv-fluid-leaks-mechanical-failures-status",
    "hgv-fluid-leaks-mechanical-failures-descriptions",
    "hgv-fluid-leaks-mechanical-failures-photo-names",

    "hgv-legal-compliance-failures-status",
    "hgv-legal-compliance-failures-descriptions",
    "hgv-legal-compliance-failures-photo-names",

    "hgv-safety-equipment-emergency-systems-status",
    "hgv-safety-equipment-emergency-systems-descriptions",
    "hgv-safety-equipment-emergency-systems-photo-names",

    "hgv-structural-general-vehicle-condition-status",
    "hgv-structural-general-vehicle-condition-descriptions",
    "hgv-structural-general-vehicle-condition-photo-names",
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