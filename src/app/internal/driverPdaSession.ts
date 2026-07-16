export const DRIVER_PDA_AUTH_SESSION_KEY = "driver-pda-mock-authenticated";
export const DRIVER_PDA_NAME_SESSION_KEY = "driver-pda-mock-driver-name";
export const DRIVER_PDA_SESSION_CHANGED_EVENT = "driver-pda-session-changed";
export const DEFAULT_DRIVER_NAME = "Mock Driver";
export const LEGACY_DRIVER_NAME = "Andrew" + " Cannon";
export const CURRENT_DRIVER_PLACEHOLDER = "__CURRENT_DRIVER__";

export function getStoredDriverName() {
  if (typeof window === "undefined") {
    return DEFAULT_DRIVER_NAME;
  }

  const storedName = window.sessionStorage
    .getItem(DRIVER_PDA_NAME_SESSION_KEY)
    ?.trim();

  return storedName || DEFAULT_DRIVER_NAME;
}

export function getStoredDriverUserId() {
  const driverName = getStoredDriverName();
  const userName = driverName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ".")
    .replace(/^\.+|\.+$/g, "") || "mock.driver";

  return `${userName}@mockup.local`;
}

export function hasStoredDriverSession() {
  if (typeof window === "undefined") {
    return false;
  }

  return (
    window.sessionStorage.getItem(DRIVER_PDA_AUTH_SESSION_KEY) === "true" &&
    Boolean(window.sessionStorage.getItem(DRIVER_PDA_NAME_SESSION_KEY)?.trim())
  );
}

export function saveDriverSession(driverName: string) {
  if (typeof window === "undefined") {
    return;
  }

  const cleanName = driverName.trim();
  window.sessionStorage.setItem(DRIVER_PDA_AUTH_SESSION_KEY, "true");
  window.sessionStorage.setItem(
    DRIVER_PDA_NAME_SESSION_KEY,
    cleanName || DEFAULT_DRIVER_NAME,
  );
  window.dispatchEvent(new Event(DRIVER_PDA_SESSION_CHANGED_EVENT));
}

export function clearDriverSession() {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.removeItem(DRIVER_PDA_AUTH_SESSION_KEY);
  window.sessionStorage.removeItem(DRIVER_PDA_NAME_SESSION_KEY);
  window.dispatchEvent(new Event(DRIVER_PDA_SESSION_CHANGED_EVENT));
}

export function resolveCurrentDriverName(value: string, driverName: string) {
  if (
    value === CURRENT_DRIVER_PLACEHOLDER ||
    value === LEGACY_DRIVER_NAME ||
    value === DEFAULT_DRIVER_NAME
  ) {
    return driverName;
  }

  return value;
}
