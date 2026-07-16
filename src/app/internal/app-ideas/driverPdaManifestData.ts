export type LegStatus = "To do" | "In Progress" | "Completed";
export type DctStatus = "Planned" | "In Progress" | "Complete";

export type DutyLeg = {
  number: number;
  etd: string;
  eta: string;
  from: string;
  to: string;
  trailerType: string;
  planzCode: string;
  dueToConvey: string;
};

export type IssueCategory =
  | ""
  | "Traffic Delay"
  | "Trailer Swap Delay"
  | "Site Issue"
  | "Breakdown"
  | "Loading Delay"
  | "Unloading Delay"
  | "Previous Leg Delay"
  | "Other";

export type LegIssueReport = {
  category: IssueCategory;
  details: string;
};

export type StoredManifestState = {
  dutyId: string;
  trailerNumber: string;
  legStatuses: Record<number, LegStatus>;
  issueReports: Record<number, LegIssueReport>;
  dctRows: DctRow[];
};

export type DctRow = {
  legNumber: number;
  status: DctStatus;
  startDate: string;
  dutyOrder: number;
  trailerNumber: string;
  userId: string;
  contractorCompanyName: string;
  operator: string;
  dutyId: string;
  departureLocation: string;
  plannedDepartureTs: number;
  departureActualTs: number | null;
  departureDiff: string;
  arrivalLocation: string;
  plannedArrivalTs: number;
  arrivalActualTs: number | null;
  arrivalDiff: string;
  trailerType: string;
  planzCode: string;
  dueToConvey: string;
  gpsDeparture: string;
  gpsArrival: string;
  issueCategory: string;
  issues: string;
};

export const DRIVER_NAME = "Andrew Cannon";
export const DUTY_ID = "NWH254";
export const STORAGE_KEY = "hgv-driver-pda-manifest-dct-data-v3";

export const manifestLegs: DutyLeg[] = [
  {
    number: 1,
    etd: "20:00",
    eta: "20:50",
    from: "NORTH WEST HUB",
    to: "MANCHESTER MAIL CENTRE",
    trailerType: "49 Artic",
    planzCode: "NWH.M.3",
    dueToConvey: "1C 24 Mail",
  },
  {
    number: 2,
    etd: "21:20",
    eta: "22:00",
    from: "MANCHESTER MAIL CENTRE",
    to: "NORTH WEST HUB",
    trailerType: "49 Artic T/L",
    planzCode: "M.NWH.7",
    dueToConvey: "1C 24 Mail",
  },
  {
    number: 3,
    etd: "23:00",
    eta: "23:50",
    from: "NORTH WEST HUB",
    to: "CHESTER MAIL CENTRE",
    trailerType: "75 Artic DD",
    planzCode: "NWH.CH.4",
    dueToConvey: "1C 24 Mail",
  },
  {
    number: 4,
    etd: "00:50",
    eta: "01:40",
    from: "CHESTER MAIL CENTRE",
    to: "NORTH WEST HUB",
    trailerType: "95 Artic DD",
    planzCode: "CH.NWH.3",
    dueToConvey: "1C 24 Mail",
  },
  {
    number: 5,
    etd: "03:30",
    eta: "04:20",
    from: "NORTH WEST HUB",
    to: "PRESTON MAIL CENTRE",
    trailerType: "110 Artic DD",
    planzCode: "NWH.EH.4a",
    dueToConvey: "1C 24 Mail",
  },
  {
    number: 6,
    etd: "05:00",
    eta: "05:45",
    from: "PRESTON MAIL CENTRE",
    to: "NORTH WEST HUB",
    trailerType: "95 Artic DD",
    planzCode: "G.MSH.3b",
    dueToConvey: "1C 24 Mail",
  },
];

export const issueCategoryOptions: IssueCategory[] = [
  "Traffic Delay",
  "Trailer Swap Delay",
  "Site Issue",
  "Breakdown",
  "Loading Delay",
  "Unloading Delay",
  "Previous Leg Delay",
  "Other",
];

export const locationCoordinates: Record<string, string> = {
  "NORTH WEST HUB": "53.5184035675559, -2.65341021789611",
  "MANCHESTER MAIL CENTRE": "53.4746410000000, -2.24731400000000",
  "CHESTER MAIL CENTRE": "53.1947240000000, -2.88060500000000",
  "PRESTON MAIL CENTRE": "53.7725160000000, -2.68920400000000",
};

export const mockActualOffsets: Record<number, { dep: number; arr: number }> = {
  1: { dep: 5, arr: 14 },
  2: { dep: 8, arr: 13 },
  3: { dep: 4, arr: 9 },
  4: { dep: 6, arr: 11 },
  5: { dep: 9, arr: 12 },
  6: { dep: 10, arr: 16 },
};

export function buildStartingLegStatuses() {
  const nextStatuses: Record<number, LegStatus> = {};

  manifestLegs.forEach((leg) => {
    nextStatuses[leg.number] = "To do";
  });

  return nextStatuses;
}

export function buildInitialManifestState(): StoredManifestState {
  return {
    dutyId: DUTY_ID,
    trailerNumber: "",
    legStatuses: buildStartingLegStatuses(),
    issueReports: {},
    dctRows: buildPlannedDctRows(),
  };
}

export function buildPlannedDctRows() {
  const baseDate = new Date();
  baseDate.setHours(0, 0, 0, 0);

  let previousDepartureTs: number | null = null;

  return manifestLegs.map((leg) => {
    let departureTs = combineDateAndTime(baseDate, leg.etd, 0);

    while (previousDepartureTs !== null && departureTs <= previousDepartureTs) {
      departureTs += 24 * 60 * 60 * 1000;
    }

    let arrivalTs = combineDateAndTime(new Date(departureTs), leg.eta, 0);

    while (arrivalTs < departureTs) {
      arrivalTs += 24 * 60 * 60 * 1000;
    }

    previousDepartureTs = departureTs;

    return {
      legNumber: leg.number,
      status: "Planned" as DctStatus,
      startDate: formatDateOnly(baseDate.getTime()),
      dutyOrder: leg.number,
      trailerNumber: "",
      userId: "andrew.cannon1@royalmail.com",
      contractorCompanyName: leg.number <= 4 ? "Pie Haulage" : leg.number === 5 ? "Letters" : "Network",
      operator: "NWH",
      dutyId: DUTY_ID,
      departureLocation: leg.from,
      plannedDepartureTs: departureTs,
      departureActualTs: null,
      departureDiff: "-",
      arrivalLocation: leg.to,
      plannedArrivalTs: arrivalTs,
      arrivalActualTs: null,
      arrivalDiff: "-",
      trailerType: leg.trailerType,
      planzCode: leg.planzCode,
      dueToConvey: leg.dueToConvey,
      gpsDeparture: locationCoordinates[leg.from] || "",
      gpsArrival: locationCoordinates[leg.to] || "",
      issueCategory: "",
      issues: "",
    };
  });
}

export function updateRowsForLegStart(
  rows: DctRow[],
  legNumber: number,
  trailerNumber: string
) {
  return rows.map((row) => {
    if (row.legNumber !== legNumber) {
      return row;
    }

    const actualTimes = getActualTimesForRow(row);

    return {
      ...row,
      status: "In Progress" as DctStatus,
      trailerNumber,
      departureActualTs: actualTimes.departureActualTs,
      departureDiff: formatTimeDifference(row.plannedDepartureTs, actualTimes.departureActualTs),
    };
  });
}

export function updateRowsForLegComplete(
  rows: DctRow[],
  legNumber: number,
  issueText: string,
  issueCategory: string
) {
  return rows.map((row) => {
    if (row.legNumber !== legNumber) {
      return row;
    }

    const actualTimes = getActualTimesForRow(row);

    return {
      ...row,
      status: "Complete" as DctStatus,
      departureActualTs: row.departureActualTs ?? actualTimes.departureActualTs,
      departureDiff: formatTimeDifference(row.plannedDepartureTs, row.departureActualTs ?? actualTimes.departureActualTs),
      arrivalActualTs: actualTimes.arrivalActualTs,
      arrivalDiff: formatTimeDifference(row.plannedArrivalTs, actualTimes.arrivalActualTs),
      issueCategory: issueText ? issueCategory : "",
      issues: issueText,
    };
  });
}

export function getActualTimesForRow(row: DctRow) {
  const offsets = mockActualOffsets[row.legNumber] || {
    dep: 5,
    arr: 10,
  };

  return {
    departureActualTs: row.plannedDepartureTs + offsets.dep * 60 * 1000,
    arrivalActualTs: row.plannedArrivalTs + offsets.arr * 60 * 1000,
  };
}

export function getTimingCellClass(plannedTs: number, actualTs: number | null) {
  if (!actualTs) {
    return "bg-[#f3f4f6] text-[#374151]";
  }

  if (actualTs > plannedTs) {
    return "bg-[#fecaca] text-[#7f1d1d]";
  }

  return "bg-[#bbf7d0] text-[#166534]";
}

export function rowHasLateTiming(row: DctRow) {
  return (
    getPositiveDelayMinutes(row.plannedDepartureTs, row.departureActualTs) > 0 ||
    getPositiveDelayMinutes(row.plannedArrivalTs, row.arrivalActualTs) > 0
  );
}

export function getPositiveDelayMinutes(plannedTs: number, actualTs: number | null) {
  if (!actualTs || actualTs <= plannedTs) {
    return 0;
  }

  return Math.round((actualTs - plannedTs) / 60000);
}

export function formatDelayTotal(totalMinutes: number) {
  const hours = String(Math.floor(totalMinutes / 60)).padStart(2, "0");
  const minutes = String(totalMinutes % 60).padStart(2, "0");

  return `${hours}:${minutes}`;
}

export function combineDateAndTime(baseDate: Date, timeText: string, dayOffset: number) {
  const [hours, minutes] = timeText.split(":").map(Number);
  const next = new Date(baseDate);
  next.setDate(next.getDate() + dayOffset);
  next.setHours(hours, minutes, 0, 0);
  return next.getTime();
}

export function formatTimeDifference(plannedTs: number, actualTs: number | null) {
  if (!actualTs) {
    return "-";
  }

  const diffMinutes = Math.round((actualTs - plannedTs) / 60000);
  const sign = diffMinutes < 0 ? "-" : "";
  const absoluteMinutes = Math.abs(diffMinutes);
  const hours = String(Math.floor(absoluteMinutes / 60)).padStart(2, "0");
  const minutes = String(absoluteMinutes % 60).padStart(2, "0");

  return `${sign}${hours}:${minutes}`;
}

export function formatDateOnly(timestamp: number) {
  const date = new Date(timestamp);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

export function formatDateTime(timestamp: number) {
  const date = new Date(timestamp);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");
  return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
}

export function getTodayDateText() {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date());
}

export function getCurrentTimeText() {
  return new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date());
}

export function readStoredManifestState(): StoredManifestState {
  if (typeof window === "undefined") {
    return buildInitialManifestState();
  }

  const saved = window.localStorage.getItem(STORAGE_KEY);

  if (!saved) {
    const startingState = buildInitialManifestState();
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(startingState));
    return startingState;
  }

  try {
    return JSON.parse(saved) as StoredManifestState;
  } catch {
    const startingState = buildInitialManifestState();
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(startingState));
    return startingState;
  }
}

export function writeStoredManifestState(state: StoredManifestState) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function resetDriverPdaManifestMockup() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(STORAGE_KEY);
}
