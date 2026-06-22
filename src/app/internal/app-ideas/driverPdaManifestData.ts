export type LegStatus = "To do" | "In Progress" | "Completed";
export type DctStatus = "Planned" | "In Progress" | "Complete" | "Skip";

export type DutyLeg = {
  number: number;
  etd: string;
  eta: string;
  from: string;
  to: string;
};

export type LegIssueReport = {
  arrival?: string;
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
  vehicleId: string;
  userId: string;
  contractorCompanyName: string;
  operator: string;
  dutyId: string;
  departureLocation: string;
  plannedDepartureTs: number;
  departureActualTs: number | null;
  dueToConvey: string;
  departureAssets: string;
  arrivalLocation: string;
  plannedArrivalTs: number;
  arrivalActualTs: number | null;
  arrivalAssets: string;
  gpsDeparture: string;
  gpsArrival: string;
  yorkBarCodes: string;
  issueCategory: string;
  issues: string;
};

export const DRIVER_NAME = "Andrew Cannon";
export const DUTY_ID = "NWH254";
export const STORAGE_KEY = "hgv-driver-pda-manifest-dct-data";

export const manifestLegs: DutyLeg[] = [
  {
    number: 1,
    etd: "20:00",
    eta: "20:50",
    from: "NORTH WEST HUB",
    to: "MANCHESTER MAIL CENTRE",
  },
  {
    number: 2,
    etd: "21:20",
    eta: "22:00",
    from: "MANCHESTER MAIL CENTRE",
    to: "NORTH WEST HUB",
  },
  {
    number: 3,
    etd: "23:00",
    eta: "23:50",
    from: "NORTH WEST HUB",
    to: "CHESTER MAIL CENTRE",
  },
  {
    number: 4,
    etd: "00:50",
    eta: "01:40",
    from: "CHESTER MAIL CENTRE",
    to: "NORTH WEST HUB",
  },
  {
    number: 5,
    etd: "03:30",
    eta: "04:20",
    from: "NORTH WEST HUB",
    to: "PRESTON MAIL CENTRE",
  },
  {
    number: 6,
    etd: "05:00",
    eta: "05:45",
    from: "PRESTON MAIL CENTRE",
    to: "NORTH WEST HUB",
  },
];

export const issueCategoryOptions = [
  "Traffic Delay",
  "Previous Leg Delay",
  "Trailer Swap Delay",
  "Site Issue",
  "Breakdown",
  "Loading Delay",
  "Unloading Delay",
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
      vehicleId: "",
      userId: "andrew.cannon1@royalmail.com",
      contractorCompanyName: "Pie Haulage",
      operator: "NWH",
      dutyId: DUTY_ID,
      departureLocation: leg.from,
      plannedDepartureTs: departureTs,
      departureActualTs: null,
      dueToConvey: "MANIFEST",
      departureAssets: "",
      arrivalLocation: leg.to,
      plannedArrivalTs: arrivalTs,
      arrivalActualTs: null,
      arrivalAssets: "",
      gpsDeparture: locationCoordinates[leg.from] || "",
      gpsArrival: locationCoordinates[leg.to] || "",
      yorkBarCodes: "",
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
      vehicleId: trailerNumber,
      departureActualTs: actualTimes.departureActualTs,
      dueToConvey: "MANIFEST",
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
      arrivalActualTs: actualTimes.arrivalActualTs,
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

export function getTimingCellClass(
  plannedTs: number,
  actualTs: number | null
) {
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

export function getPositiveDelayMinutes(
  plannedTs: number,
  actualTs: number | null
) {
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

export function combineDateAndTime(
  baseDate: Date,
  timeText: string,
  dayOffset: number
) {
  const [hours, minutes] = timeText.split(":").map(Number);
  const next = new Date(baseDate);
  next.setDate(next.getDate() + dayOffset);
  next.setHours(hours, minutes, 0, 0);
  return next.getTime();
}

export function formatTimeDifference(
  plannedTs: number,
  actualTs: number | null
) {
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
