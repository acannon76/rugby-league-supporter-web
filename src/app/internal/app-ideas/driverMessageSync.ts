export type DriverMessagePriority = "Critical" | "High" | "Normal";
export type DriverMessageDirection = "Driver to office" | "Office to driver" | "System" | "Workshop";

export type DriverMessageThreadEntry = {
  id: string;
  sender: "Driver" | "Office" | "System" | "M5 Workshops";
  senderName: string;
  message: string;
  timestamp: string;
  priority: DriverMessagePriority;
  direction: DriverMessageDirection;
};

export type DriverCommsItem = {
  id: string;
  source: "RTC" | "Breakdown" | "Messaging" | "PMT Confirmation";
  priority: DriverMessagePriority;
  status: "New" | "Office review" | "Awaiting driver read" | "Actioned";
  duty: string;
  driver: string;
  vehicle: string;
  trailer: string;
  received: string;
  receivedDate: string;
  title: string;
  summary: string;
  message?: {
    messageText: string;
    route: string;
    direction?: "Driver to office" | "Office to driver";
  };
  breakdown?: {
    location: string;
    direction: string;
    fault: string;
    safeStatus: string;
    supportNeeded: string;
    photos: string;
  };
  messageThread?: DriverMessageThreadEntry[];
  retainUntilDriverRead?: boolean;
  driverReadConfirmed?: boolean;
  readConfirmedAt?: string;
  officeRead?: boolean;
  officeReadAt?: string;
};

export const COMMS_OPEN_STORAGE_KEY = "link-message-comms-open-items";
export const DRIVER_MESSAGE_READ_STORAGE_KEY = "driver-messaging-read-items";
export const DRIVER_MESSAGE_STORE_CHANGED_EVENT = "driver-message-store-changed";

export function readOpenCommsItems(): DriverCommsItem[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(COMMS_OPEN_STORAGE_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function writeOpenCommsItems(items: DriverCommsItem[]) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(COMMS_OPEN_STORAGE_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event(DRIVER_MESSAGE_STORE_CHANGED_EVENT));
}

export function readDriverReadKeys(): string[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(DRIVER_MESSAGE_READ_STORAGE_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((value) => typeof value === "string") : [];
  } catch {
    return [];
  }
}

export function writeDriverReadKeys(keys: string[]) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(DRIVER_MESSAGE_READ_STORAGE_KEY, JSON.stringify(keys));
  window.dispatchEvent(new Event(DRIVER_MESSAGE_STORE_CHANGED_EVENT));
}

export function getMessageThread(item: DriverCommsItem): DriverMessageThreadEntry[] {
  if (Array.isArray(item.messageThread) && item.messageThread.length) {
    return item.messageThread;
  }

  const direction = item.message?.direction || "Driver to office";
  return [
    {
      id: `${item.id}-fallback`,
      sender: direction === "Office to driver" ? "Office" : "Driver",
      senderName: direction === "Office to driver" ? "Transport office" : item.driver,
      message: item.message?.messageText || item.breakdown?.fault || item.summary,
      timestamp: `${normaliseDate(item.receivedDate)} ${item.received}`,
      priority: item.priority,
      direction,
    },
  ];
}

export function getLatestOfficeMessage(item: DriverCommsItem) {
  return [...getMessageThread(item)].reverse().find((entry) => entry.direction === "Office to driver");
}

export function getLatestDriverMessage(item: DriverCommsItem) {
  return [...getMessageThread(item)].reverse().find((entry) => entry.direction === "Driver to office");
}

export function getIncomingReadKey(item: DriverCommsItem) {
  return getLatestOfficeMessage(item)?.id || `${item.id}-office-message`;
}

export function isForDriverDuty(item: DriverCommsItem, driverName: string, duty: string) {
  return normalise(item.driver) === normalise(driverName) && normalise(item.duty) === normalise(duty);
}

export function getUnreadOfficeMessages(
  items: DriverCommsItem[],
  readKeys: string[],
  driverName: string,
  duty: string,
) {
  return items
    .filter((item) => isForDriverDuty(item, driverName, duty))
    .map((item) => ({ item, message: getLatestOfficeMessage(item), readKey: getIncomingReadKey(item) }))
    .filter((record): record is { item: DriverCommsItem; message: DriverMessageThreadEntry; readKey: string } =>
      Boolean(record.message) && !readKeys.includes(record.readKey),
    );
}

export function priorityRank(priority: DriverMessagePriority) {
  if (priority === "Critical") {
    return 3;
  }
  if (priority === "High") {
    return 2;
  }
  return 1;
}

export function normaliseDate(value: string) {
  const parts = value.split("/");
  if (parts.length !== 3) {
    return value;
  }

  return parts[2].length === 2 ? `${parts[0]}/${parts[1]}/20${parts[2]}` : value;
}

function normalise(value: string) {
  return value.trim().toLowerCase();
}
