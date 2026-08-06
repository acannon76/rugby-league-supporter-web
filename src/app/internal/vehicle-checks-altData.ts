export type AltCheckStatus = "none" | "ok" | "defect";

export type AltVehicleCheckCategory = {
  number: number;
  title: string;
  slug: string;
};

export type AltHistoryItem = {
  categoryNumber: number;
  categoryTitle: string;
  categorySlug: string;
  description: string;
  photoName: string;
  reported: string;
  mileageReported: string;
  pmt: string;
};

export const altVehicleDetails = [
  { label: "Registration", value: "PE68UHD" },
  { label: "Last Mileage", value: "684,218 km" },
  { label: "Weight", value: "41T" },
  { label: "Axle", value: "4x2" },
  { label: "Asset", value: "23301273" },
  { label: "Fuel", value: "Diesel" },
  { label: "Trailer", value: "7338014" },
  { label: "Type", value: "DD95" },
] as const;

export const altCheckCategories: AltVehicleCheckCategory[] = [
  { number: 1, title: "Axle", slug: "axle" },
  { number: 2, title: "Body", slug: "body" },
  { number: 3, title: "Brakes", slug: "brakes" },
  { number: 4, title: "Electrics", slug: "electrics" },
  { number: 5, title: "Engine", slug: "engine" },
  { number: 6, title: "Exhaust", slug: "exhaust" },
  { number: 7, title: "Gearbox", slug: "gearbox" },
  { number: 8, title: "Starting", slug: "starting" },
  { number: 9, title: "Steering", slug: "steering" },
  { number: 10, title: "Suspension", slug: "suspension" },
  { number: 11, title: "Tyres", slug: "tyres" },
  { number: 12, title: "Windows", slug: "windows" },
  { number: 13, title: "Other", slug: "other" },
];

export const altStatusStorageKey = "hgv-alt-vehicle-check-status";
export const altMileageStorageKey = "hgv-alt-current-mileage-km";
export const altHistoryStorageKey = "hgv-alt-vehicle-check-history-extra";

export function formatReportedDate(date = new Date()) {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

export function createAltPmt(categoryNumber: number) {
  const now = Date.now().toString();
  return `PMT2${categoryNumber}${now.slice(-5)}`;
}

export const altLogbookStorageKey = "hgv-alt-vehicle-check-logbook";

export type AltLogbookEntry = {
  startDateTime: string;
  endDateTime: string;
  startTimestamp: number;
  endTimestamp: number;
  completedAt?: string;
  driverName: string;
  mileageStart: string;
  mileageEnd: string;
  hasDefects: boolean;
  defectsSummary: string[];
  pmts: string[];
};

export function formatDateTime(date = new Date()) {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${day}/${month}/${year} ${hours}:${minutes}`;
}
