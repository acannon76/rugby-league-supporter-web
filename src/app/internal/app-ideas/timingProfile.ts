export type TimingCode = "VE" | "E" | "OT" | "L" | "VL" | "F";

export type TimingProfileBand = {
  id: string;
  code: TimingCode;
  label: string;
  range: string;
  minutes: string;
  tone: "failed" | "early" | "ontime" | "late";
};

export const TIMING_CODES: TimingCode[] = ["VE", "E", "OT", "L", "VL", "F"];

export const TIMING_CODE_LABELS: Record<TimingCode, string> = {
  VE: "Very Early",
  E: "Early",
  OT: "On Time",
  L: "Late",
  VL: "Very Late",
  F: "Failed",
};

export const TIMING_CODE_COLOURS: Record<TimingCode, string> = {
  VE: "#f59e0b",
  E: "#fbbf24",
  OT: "#16a34a",
  L: "#ef4444",
  VL: "#dc2626",
  F: "#7f1d1d",
};

// Shared DriverOS mock timing profile. The source diagram uses boundaries at
// -120, -30, -15, +15, +30 and +120 minutes from planned time.
// Because the mock works in whole minutes, the display ranges below make the
// boundary ownership explicit (for example -15 and +15 are both On Time).
export const TIMING_PROFILE_BANDS: TimingProfileBand[] = [
  {
    id: "failed-early",
    code: "F",
    label: "Failed",
    range: "Earlier than -02:00",
    minutes: "< -120 min",
    tone: "failed",
  },
  {
    id: "very-early",
    code: "VE",
    label: "Very Early",
    range: "-02:00 to -00:31",
    minutes: "-120 to -31 min",
    tone: "early",
  },
  {
    id: "early",
    code: "E",
    label: "Early",
    range: "-00:30 to -00:16",
    minutes: "-30 to -16 min",
    tone: "early",
  },
  {
    id: "on-time",
    code: "OT",
    label: "On Time",
    range: "-00:15 to +00:15",
    minutes: "-15 to +15 min",
    tone: "ontime",
  },
  {
    id: "late",
    code: "L",
    label: "Late",
    range: "+00:16 to +00:30",
    minutes: "+16 to +30 min",
    tone: "late",
  },
  {
    id: "very-late",
    code: "VL",
    label: "Very Late",
    range: "+00:31 to +01:59",
    minutes: "+31 to +119 min",
    tone: "late",
  },
  {
    id: "failed-late",
    code: "F",
    label: "Failed",
    range: "+02:00 or later",
    minutes: "+120 min or later",
    tone: "failed",
  },
];

/**
 * Classify actual-minus-planned time against the shared MTT timing profile.
 * Negative values are early; positive values are late.
 */
export function classifyTimingDifference(minutes: number): TimingCode | null {
  if (!Number.isFinite(minutes)) return null;

  if (minutes < -120 || minutes >= 120) return "F";
  if (minutes < -30) return "VE";
  if (minutes < -15) return "E";
  if (minutes <= 15) return "OT";
  if (minutes <= 30) return "L";
  return "VL";
}

export function isLateTimingDifference(minutes: number) {
  return Number.isFinite(minutes) && minutes > 15;
}
