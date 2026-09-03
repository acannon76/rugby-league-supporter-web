import {
  TIMING_CODES,
  TIMING_CODE_COLOURS,
  TIMING_CODE_LABELS,
  type TimingCode as SharedTimingCode,
} from "../../../timingProfile";

export type TimingCode = SharedTimingCode;
export type TimingCounts = Record<TimingCode, number>;
export type TimingPercentages = Record<TimingCode, number>;

export type NationalLocalPlanRow = {
  id: string;
  date: string;
  dayLabel: string;
  site: string;
  region: string;
  nationalDuties: number;
  localAgreedDuties: number;
  adjustedDuties: number;
  planRetainedPercent: number;
  adjustedPercent: number;
  timingCounts: TimingCounts;
  timingPercentages: TimingPercentages;
  timingProfile: TimingProfile;
  changeBand: ChangeBand;
  volumeBand: VolumeBand;
};

export type ChangeBand = "No change" | "Low change" | "Moderate change" | "High change";
export type VolumeBand = "Under 25" | "25 to 74" | "75 to 149" | "150 and over";
export type TimingProfile = "On-time led" | "Early weighted" | "Balanced" | "Late risk" | "Failed risk";

export type NationalLocalPlanRange = {
  today: string;
  startDate: string;
  endDate: string;
  dates: string[];
};

export const timingCodes: TimingCode[] = [...TIMING_CODES];
export const timingLabels: Record<TimingCode, string> = TIMING_CODE_LABELS;
export const timingColours: Record<TimingCode, string> = TIMING_CODE_COLOURS;

export const availableLocations = [
  "Aberdeen MC",
  "ABERDEEN VOC",
  "Atherstone VOC",
  "Belfast MC",
  "BELFAST VOC",
  "Birmingham MC (VOC)",
  "BIRMINGHAM VOC",
  "Bridgend VOC",
  "Bristol Mini VOC",
  "Carlisle VOC",
  "Chelmsford (SEAMAC) MC",
  "CHELMSFORD VOC",
  "CHORLEY NORTHERN HUB VOC",
  "Chorley VOC",
  "Coventry National Hub",
  "COVENTRY NATIONAL HUB VOC",
  "Croydon MC (VOC)",
  "CROYDON VOC",
  "Doncaster MC",
  "East London DC",
  "East Mids VOC",
  "Edinburgh MC (VOC)",
  "EDINBURGH VOC",
  "ELDCVOC",
  "Exeter VOC",
  "Gatwick MC (VOC)",
  "GATWICK VOC",
  "Glasgow MC",
  "GLASGOW VOC",
  "Greenford MC/VOC",
  "GREENFORD VOC",
  "HATFIELD PROCESSING CENTRE VOC",
  "HEATHROW WORLDWIDE DC VOC",
  "HWDC",
  "Inverness MC",
  "INVERNESS VOC",
  "Manchester VOC",
  "MIDLANDS SUPER HUB VOC",
  "NATIONAL DC VOC",
  "NDC",
  "NEDC",
  "NHCDC",
  "North West Hub",
  "NORTH WEST SUPER HUB VOC",
  "Norwich MC (VOC)",
  "NORWICH VOC",
  "Perth LD",
  "Peterborough MC (VOC)",
  "PETERBOROUGH VOC",
  "PRDC",
  "PRINCESS ROYAL DC VOC",
  "PRVOC",
  "Roborough VOC",
  "SCOTTISH DC VOC",
  "SDC",
  "Sheffield MC",
  "SOUTH EAST DC VOC",
  "South East WBC (Rochester)",
  "SOUTH WEST DC VOC",
  "Southampton VOC",
  "SWDC",
  "Swindon VOC",
  "Warrington VOC",
  "WOKING DC VOC",
  "Woking VOC",
  "Wolverhampton MC",
  "YDC",
  "YDC Stourton VOC",
  "YORKSHIRE DC VOC",
  "YPC VOC",
] as const;

export const regionOrder = [
  "Scotland",
  "Northern Ireland",
  "North",
  "Midlands",
  "London & South East",
  "South West & Wales",
  "National / Other",
] as const;

export function getCompletedDateRange(days = 7): NationalLocalPlanRange {
  const today = londonDate();
  const dates = Array.from({ length: days }, (_, index) => addDays(today, index - days));
  return {
    today,
    startDate: dates[0],
    endDate: dates[dates.length - 1],
    dates,
  };
}

export function buildNationalLocalPlanRows(
  dates: string[],
  locations: readonly string[] = availableLocations,
): NationalLocalPlanRow[] {
  return dates.flatMap((date, dayIndex) =>
    locations.map((site, siteIndex) => {
      // The calculations intentionally use the same deterministic mock-data logic as
      // the National vs Local Plan Report in Report 1, so the dashboard and source
      // report remain aligned for the same seven completed days and site selection.
      const nationalDuties = 1 + ((siteIndex * 17 + 3) % 282);
      const localAgreedDuties = Math.max(0, nationalDuties - ((dayIndex + siteIndex) % 4));
      const adjustedDuties = nationalDuties - localAgreedDuties;

      const rawTimingWeights = [
        3 + ((siteIndex + dayIndex) % 35),
        4 + ((siteIndex * 2 + dayIndex) % 20),
        12 + ((siteIndex * 3 + dayIndex) % 35),
        2 + ((siteIndex + dayIndex * 2) % 14),
        1 + ((siteIndex * 2 + dayIndex) % 10),
        4 + ((siteIndex * 5 + dayIndex) % 35),
      ];
      const weightTotal = rawTimingWeights.reduce((sum, value) => sum + value, 0);
      const percentageValues = rawTimingWeights.map((value) => Math.floor((value * 100) / weightTotal));
      percentageValues[5] += 100 - percentageValues.reduce((sum, value) => sum + value, 0);

      const timingPercentages = Object.fromEntries(
        timingCodes.map((code, index) => [code, percentageValues[index]]),
      ) as TimingPercentages;
      const timingCounts = Object.fromEntries(
        timingCodes.map((code, index) => [code, Math.round((nationalDuties * percentageValues[index]) / 100)]),
      ) as TimingCounts;
      const countDifference = nationalDuties - timingCodes.reduce((sum, code) => sum + timingCounts[code], 0);
      timingCounts.F += countDifference;

      const adjustedPercent = nationalDuties ? roundOne((adjustedDuties / nationalDuties) * 100) : 0;
      const planRetainedPercent = nationalDuties ? roundOne((localAgreedDuties / nationalDuties) * 100) : 0;

      return {
        id: `${date}-${siteIndex}`,
        date,
        dayLabel: formatLongDate(date),
        site,
        region: getRegion(site),
        nationalDuties,
        localAgreedDuties,
        adjustedDuties,
        planRetainedPercent,
        adjustedPercent,
        timingCounts,
        timingPercentages,
        timingProfile: getTimingProfile(timingPercentages),
        changeBand: getChangeBand(adjustedPercent),
        volumeBand: getVolumeBand(nationalDuties),
      };
    }),
  );
}

export function getRegion(site: string) {
  const value = site.toUpperCase();
  if (/(ABERDEEN|EDINBURGH|GLASGOW|INVERNESS|PERTH|SCOTTISH|\bSDC\b)/.test(value)) return "Scotland";
  if (/BELFAST/.test(value)) return "Northern Ireland";
  if (/(CARLISLE|CHORLEY|DONCASTER|MANCHESTER|NORTH WEST|SHEFFIELD|WARRINGTON|YORKSHIRE|\bYDC\b|YPC)/.test(value)) return "North";
  if (/(ATHERSTONE|BIRMINGHAM|COVENTRY|EAST MIDS|MIDLANDS|NATIONAL DC|\bNDC\b|NEDC|NHCDC|WOLVERHAMPTON)/.test(value)) return "Midlands";
  if (/(BRIDGEND|BRISTOL|EXETER|ROBOROUGH|SOUTH WEST|SOUTHAMPTON|\bSWDC\b|SWINDON)/.test(value)) return "South West & Wales";
  if (/(CHELMSFORD|CROYDON|EAST LONDON|ELDC|GATWICK|GREENFORD|HATFIELD|HEATHROW|HWDC|NORWICH|PETERBOROUGH|PRDC|PRINCESS ROYAL|PRVOC|SOUTH EAST|WOKING)/.test(value)) return "London & South East";
  return "National / Other";
}

export function getTimingProfile(percentages: TimingPercentages): TimingProfile {
  const lateRisk = percentages.L + percentages.VL + percentages.F;
  if (percentages.F >= 15) return "Failed risk";
  if (lateRisk >= 32) return "Late risk";
  if (percentages.OT >= Math.max(...timingCodes.map((code) => percentages[code]))) return "On-time led";
  if (percentages.VE + percentages.E > lateRisk) return "Early weighted";
  return "Balanced";
}

export function getChangeBand(adjustedPercent: number): ChangeBand {
  if (adjustedPercent === 0) return "No change";
  if (adjustedPercent <= 2) return "Low change";
  if (adjustedPercent <= 5) return "Moderate change";
  return "High change";
}

export function getVolumeBand(nationalDuties: number): VolumeBand {
  if (nationalDuties < 25) return "Under 25";
  if (nationalDuties < 75) return "25 to 74";
  if (nationalDuties < 150) return "75 to 149";
  return "150 and over";
}

export function addDays(value: string, amount: number) {
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  date.setUTCDate(date.getUTCDate() + amount);
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}-${String(date.getUTCDate()).padStart(2, "0")}`;
}

export function formatDate(value: string) {
  const [year, month, day] = value.split("-");
  return `${day}/${month}/${year}`;
}

export function formatLongDate(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${value}T00:00:00Z`));
}

export function roundOne(value: number) {
  return Math.round(value * 10) / 10;
}

function londonDate() {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/London",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const get = (type: string) => parts.find((part) => part.type === type)?.value ?? "01";
  return `${get("year")}-${get("month")}-${get("day")}`;
}
