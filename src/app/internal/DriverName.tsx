"use client";

import { useSyncExternalStore } from "react";
import {
  DEFAULT_DRIVER_NAME,
  DRIVER_PDA_SESSION_CHANGED_EVENT,
  getStoredDriverName,
  hasStoredDriverSession,
} from "./driverPdaSession";

function subscribeToDriverSession(onStoreChange: () => void) {
  window.addEventListener(DRIVER_PDA_SESSION_CHANGED_EVENT, onStoreChange);
  window.addEventListener("storage", onStoreChange);

  return () => {
    window.removeEventListener(DRIVER_PDA_SESSION_CHANGED_EVENT, onStoreChange);
    window.removeEventListener("storage", onStoreChange);
  };
}

function getDriverNameSnapshot() {
  return getStoredDriverName();
}

function getDriverSessionSnapshot() {
  return `${hasStoredDriverSession() ? "1" : "0"}|${getStoredDriverName()}`;
}

export function useDriverName() {
  return useSyncExternalStore(
    subscribeToDriverSession,
    getDriverNameSnapshot,
    () => DEFAULT_DRIVER_NAME,
  );
}

export function useDriverSession() {
  const snapshot = useSyncExternalStore(
    subscribeToDriverSession,
    getDriverSessionSnapshot,
    () => `0|${DEFAULT_DRIVER_NAME}`,
  );
  const separatorIndex = snapshot.indexOf("|");

  return {
    isLoggedIn: snapshot.slice(0, separatorIndex) === "1",
    driverName: snapshot.slice(separatorIndex + 1),
  };
}

export default function DriverName() {
  return <>{useDriverName()}</>;
}
