import { availableLocations } from "../option-4/nationalLocalPlanDashboardData";

export type FuelReportRow = {
  id: string;
  locationName: string;
  vehicleName: string;
  fuelUsed: number;
  distance: number;
  fuelConsumption: number;
  reportStartDate: string;
  reportEndDate: string;
};

export const fuelReportPeriod = {
  start: "2026-08-17T06:00:00",
  end: "2026-08-24T05:59:00",
} as const;

const sourceRows = [
  {"LocationName": "BIRMINGHAM VOC", "VehicleName": "BMC1600 DK20 ZRC", "FuelUsed": 90.6, "Distance": 1473.9, "FuelConsumption": 16.27, "ReportStartDate": "2026-08-17T06:00:00", "ReportEndDate": "2026-08-24T05:59:00"},
  {"LocationName": "BIRMINGHAM VOC", "VehicleName": "BMC1601 PN20 CUU", "FuelUsed": 44, "Distance": 521.6, "FuelConsumption": 11.87, "ReportStartDate": "2026-08-17T06:00:00", "ReportEndDate": "2026-08-24T05:59:00"},
  {"LocationName": "BIRMINGHAM VOC", "VehicleName": "BMC1602 PF66 YDC", "FuelUsed": 11.9, "Distance": 165.7, "FuelConsumption": 13.9, "ReportStartDate": "2026-08-17T06:00:00", "ReportEndDate": "2026-08-24T05:59:00"},
  {"LocationName": "BIRMINGHAM VOC", "VehicleName": "BMC1603 PF66 YCJ", "FuelUsed": 110.1, "Distance": 1537.4, "FuelConsumption": 13.96, "ReportStartDate": "2026-08-17T06:00:00", "ReportEndDate": "2026-08-24T05:59:00"},
  {"LocationName": "BIRMINGHAM VOC", "VehicleName": "BMC1604 PF66 YDE", "FuelUsed": 24.2, "Distance": 285.9, "FuelConsumption": 11.8, "ReportStartDate": "2026-08-17T06:00:00", "ReportEndDate": "2026-08-24T05:59:00"},
  {"LocationName": "BIRMINGHAM VOC", "VehicleName": "BMC1605 PJ70 UEW", "FuelUsed": 4.3, "Distance": 66.4, "FuelConsumption": 15.58, "ReportStartDate": "2026-08-17T06:00:00", "ReportEndDate": "2026-08-24T05:59:00"},
  {"LocationName": "BIRMINGHAM VOC", "VehicleName": "BMC1606 DK20 ZRV", "FuelUsed": 44.7, "Distance": 570.1, "FuelConsumption": 12.76, "ReportStartDate": "2026-08-17T06:00:00", "ReportEndDate": "2026-08-24T05:59:00"},
  {"LocationName": "BIRMINGHAM VOC", "VehicleName": "BMC1702 PF66 YAW", "FuelUsed": 30.2, "Distance": 405, "FuelConsumption": 13.41, "ReportStartDate": "2026-08-17T06:00:00", "ReportEndDate": "2026-08-24T05:59:00"},
  {"LocationName": "BIRMINGHAM VOC", "VehicleName": "BMC1705 PN20 CTX", "FuelUsed": 74.3, "Distance": 950.7, "FuelConsumption": 12.8, "ReportStartDate": "2026-08-17T06:00:00", "ReportEndDate": "2026-08-24T05:59:00"},
  {"LocationName": "BIRMINGHAM VOC", "VehicleName": "BMC201 PJ24 SRX", "FuelUsed": 67.2, "Distance": 790.9, "FuelConsumption": 11.76, "ReportStartDate": "2026-08-17T06:00:00", "ReportEndDate": "2026-08-24T05:59:00"},
  {"LocationName": "BIRMINGHAM VOC", "VehicleName": "BMC202 PJ24 SPZ", "FuelUsed": 47.3, "Distance": 661.7, "FuelConsumption": 13.99, "ReportStartDate": "2026-08-17T06:00:00", "ReportEndDate": "2026-08-24T05:59:00"},
  {"LocationName": "BIRMINGHAM VOC", "VehicleName": "BMC203 PK67 VDD", "FuelUsed": 74.1, "Distance": 829.1, "FuelConsumption": 11.18, "ReportStartDate": "2026-08-17T06:00:00", "ReportEndDate": "2026-08-24T05:59:00"},
  {"LocationName": "BIRMINGHAM VOC", "VehicleName": "BMC204 PJ24 SRO", "FuelUsed": 199.2, "Distance": 2175.4, "FuelConsumption": 10.92, "ReportStartDate": "2026-08-17T06:00:00", "ReportEndDate": "2026-08-24T05:59:00"},
  {"LocationName": "BIRMINGHAM VOC", "VehicleName": "BMC205 PK67 VDA", "FuelUsed": 74.5, "Distance": 916, "FuelConsumption": 12.29, "ReportStartDate": "2026-08-17T06:00:00", "ReportEndDate": "2026-08-24T05:59:00"},
  {"LocationName": "BIRMINGHAM VOC", "VehicleName": "BMC206 PK67 VDE", "FuelUsed": 98.5, "Distance": 1197.2, "FuelConsumption": 12.16, "ReportStartDate": "2026-08-17T06:00:00", "ReportEndDate": "2026-08-24T05:59:00"},
  {"LocationName": "BIRMINGHAM VOC", "VehicleName": "BMC207 PN74 DKY", "FuelUsed": 66.2, "Distance": 704.3, "FuelConsumption": 10.64, "ReportStartDate": "2026-08-17T06:00:00", "ReportEndDate": "2026-08-24T05:59:00"},
  {"LocationName": "BIRMINGHAM VOC", "VehicleName": "BMC208 PN74 DLD", "FuelUsed": 187.7, "Distance": 1992.6, "FuelConsumption": 10.61, "ReportStartDate": "2026-08-17T06:00:00", "ReportEndDate": "2026-08-24T05:59:00"},
  {"LocationName": "BIRMINGHAM VOC", "VehicleName": "BMC209 PN74 DPE", "FuelUsed": 100.7, "Distance": 1250.2, "FuelConsumption": 12.41, "ReportStartDate": "2026-08-17T06:00:00", "ReportEndDate": "2026-08-24T05:59:00"},
  {"LocationName": "BIRMINGHAM VOC", "VehicleName": "BMC210 PN74 DKO", "FuelUsed": 177.2, "Distance": 1846.2, "FuelConsumption": 10.42, "ReportStartDate": "2026-08-17T06:00:00", "ReportEndDate": "2026-08-24T05:59:00"},
  {"LocationName": "BIRMINGHAM VOC", "VehicleName": "BMC211 PN74 DKU", "FuelUsed": 224, "Distance": 2330.1, "FuelConsumption": 10.4, "ReportStartDate": "2026-08-17T06:00:00", "ReportEndDate": "2026-08-24T05:59:00"},
  {"LocationName": "BIRMINGHAM VOC", "VehicleName": "BMC300 PK67 VFA", "FuelUsed": 188.1, "Distance": 1919, "FuelConsumption": 10.2, "ReportStartDate": "2026-08-17T06:00:00", "ReportEndDate": "2026-08-24T05:59:00"},
  {"LocationName": "BIRMINGHAM VOC", "VehicleName": "BMC304 PJ67 LZN", "FuelUsed": 73.9, "Distance": 686.9, "FuelConsumption": 9.29, "ReportStartDate": "2026-08-17T06:00:00", "ReportEndDate": "2026-08-24T05:59:00"},
  {"LocationName": "BIRMINGHAM VOC", "VehicleName": "BMC312 PK67 VGZ", "FuelUsed": 109.5, "Distance": 1233.7, "FuelConsumption": 11.27, "ReportStartDate": "2026-08-17T06:00:00", "ReportEndDate": "2026-08-24T05:59:00"},
  {"LocationName": "BIRMINGHAM VOC", "VehicleName": "BMC314 PJ67 LZO", "FuelUsed": 74.2, "Distance": 837.5, "FuelConsumption": 11.28, "ReportStartDate": "2026-08-17T06:00:00", "ReportEndDate": "2026-08-24T05:59:00"},
  {"LocationName": "BIRMINGHAM VOC", "VehicleName": "BMC315 PG66 UEA", "FuelUsed": 60.4, "Distance": 719.6, "FuelConsumption": 11.91, "ReportStartDate": "2026-08-17T06:00:00", "ReportEndDate": "2026-08-24T05:59:00"},
  {"LocationName": "BIRMINGHAM VOC", "VehicleName": "BMC321 PG66 UFB", "FuelUsed": 59.5, "Distance": 610.6, "FuelConsumption": 10.26, "ReportStartDate": "2026-08-17T06:00:00", "ReportEndDate": "2026-08-24T05:59:00"},
  {"LocationName": "BIRMINGHAM VOC", "VehicleName": "BMC322 PE17 HMJ", "FuelUsed": 0.2, "Distance": 0, "FuelConsumption": 0.16, "ReportStartDate": "2026-08-17T06:00:00", "ReportEndDate": "2026-08-24T05:59:00"},
  {"LocationName": "BIRMINGHAM VOC", "VehicleName": "BMC323 PE17 HMO", "FuelUsed": 0, "Distance": 0, "FuelConsumption": 0, "ReportStartDate": "2026-08-17T06:00:00", "ReportEndDate": "2026-08-24T05:59:00"},
  {"LocationName": "BIRMINGHAM VOC", "VehicleName": "BMC324 PE17 HMG", "FuelUsed": 87.8, "Distance": 1005.4, "FuelConsumption": 11.45, "ReportStartDate": "2026-08-17T06:00:00", "ReportEndDate": "2026-08-24T05:59:00"},
  {"LocationName": "BIRMINGHAM VOC", "VehicleName": "BMC325 PE17 HMA", "FuelUsed": 39.4, "Distance": 506.7, "FuelConsumption": 12.85, "ReportStartDate": "2026-08-17T06:00:00", "ReportEndDate": "2026-08-24T05:59:00"},
  {"LocationName": "BIRMINGHAM VOC", "VehicleName": "BMC326 PE17 HMF", "FuelUsed": 111.2, "Distance": 1355.6, "FuelConsumption": 12.19, "ReportStartDate": "2026-08-17T06:00:00", "ReportEndDate": "2026-08-24T05:59:00"},
  {"LocationName": "BIRMINGHAM VOC", "VehicleName": "BMC327 PE17 HMK", "FuelUsed": 101.2, "Distance": 1298, "FuelConsumption": 12.83, "ReportStartDate": "2026-08-17T06:00:00", "ReportEndDate": "2026-08-24T05:59:00"},
  {"LocationName": "BIRMINGHAM VOC", "VehicleName": "BMC330 PK67 VFB", "FuelUsed": 84.4, "Distance": 982.3, "FuelConsumption": 11.63, "ReportStartDate": "2026-08-17T06:00:00", "ReportEndDate": "2026-08-24T05:59:00"},
  {"LocationName": "BIRMINGHAM VOC", "VehicleName": "BMC331 PJ67 LZL", "FuelUsed": 67.9, "Distance": 881.8, "FuelConsumption": 12.98, "ReportStartDate": "2026-08-17T06:00:00", "ReportEndDate": "2026-08-24T05:59:00"},
  {"LocationName": "BIRMINGHAM VOC", "VehicleName": "BMC333 PK67 VGY", "FuelUsed": 149.5, "Distance": 1493.6, "FuelConsumption": 9.99, "ReportStartDate": "2026-08-17T06:00:00", "ReportEndDate": "2026-08-24T05:59:00"},
  {"LocationName": "BIRMINGHAM VOC", "VehicleName": "BMC334 PJ67 LZK", "FuelUsed": 57.7, "Distance": 596.4, "FuelConsumption": 10.34, "ReportStartDate": "2026-08-17T06:00:00", "ReportEndDate": "2026-08-24T05:59:00"},
  {"LocationName": "BIRMINGHAM VOC", "VehicleName": "BMC335 PJ67 LZM", "FuelUsed": 67.6, "Distance": 671.8, "FuelConsumption": 9.94, "ReportStartDate": "2026-08-17T06:00:00", "ReportEndDate": "2026-08-24T05:59:00"},
  {"LocationName": "BIRMINGHAM VOC", "VehicleName": "BMC338 PE17 HNR", "FuelUsed": 89.5, "Distance": 997, "FuelConsumption": 11.13, "ReportStartDate": "2026-08-17T06:00:00", "ReportEndDate": "2026-08-24T05:59:00"},
  {"LocationName": "BIRMINGHAM VOC", "VehicleName": "BMCGAS1 BN21 AYU", "FuelUsed": 0, "Distance": 584, "FuelConsumption": 0, "ReportStartDate": "2026-08-17T06:00:00", "ReportEndDate": "2026-08-24T05:59:00"},
  {"LocationName": "BIRMINGHAM VOC", "VehicleName": "BMCGAS2 BN21 AYF", "FuelUsed": 0, "Distance": 739.9, "FuelConsumption": 0, "ReportStartDate": "2026-08-17T06:00:00", "ReportEndDate": "2026-08-24T05:59:00"},
  {"LocationName": "BIRMINGHAM VOC", "VehicleName": "BMCGAS3 BN21 AYH", "FuelUsed": 0, "Distance": 740.9, "FuelConsumption": 0, "ReportStartDate": "2026-08-17T06:00:00", "ReportEndDate": "2026-08-24T05:59:00"},
  {"LocationName": "BIRMINGHAM VOC", "VehicleName": "BMCGAS4 BN21 AYC", "FuelUsed": 0, "Distance": 151.8, "FuelConsumption": 0, "ReportStartDate": "2026-08-17T06:00:00", "ReportEndDate": "2026-08-24T05:59:00"},
  {"LocationName": "BIRMINGHAM VOC", "VehicleName": "BMCGAS5 BN21 AYJ", "FuelUsed": 0, "Distance": 1284.5, "FuelConsumption": 0, "ReportStartDate": "2026-08-17T06:00:00", "ReportEndDate": "2026-08-24T05:59:00"},
] as const;

const registrations = ["PN74 KLD", "PX25 HUA", "MX71 DCT", "PN25 BVL", "PX26 BRV", "PE68 UHD", "PN70 BLZ", "PK67 VGY"] as const;

export const fuelReportRows: FuelReportRow[] = [
  ...sourceRows.map((row, index) => ({
    id: `fuel-birmingham-${index + 1}`,
    locationName: row.LocationName,
    vehicleName: row.VehicleName,
    fuelUsed: row.FuelUsed,
    distance: row.Distance,
    fuelConsumption: row.FuelConsumption,
    reportStartDate: row.ReportStartDate,
    reportEndDate: row.ReportEndDate,
  })),
  ...availableLocations
    .filter((site) => site.toUpperCase() !== "BIRMINGHAM VOC")
    .flatMap((site, siteIndex) =>
      Array.from({ length: 5 }, (_, vehicleIndex) => buildMockFuelRow(site, siteIndex, vehicleIndex)),
    ),
];

export function formatFuelDateTime(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function buildMockFuelRow(site: string, siteIndex: number, vehicleIndex: number): FuelReportRow {
  const zeroReading = (siteIndex * 5 + vehicleIndex) % 31 === 0;
  const distance = roundOne(380 + ((siteIndex * 173 + vehicleIndex * 241) % 1950));
  const targetConsumption = roundTwo(8.8 + ((siteIndex * 13 + vehicleIndex * 17) % 83) / 10);
  const fuelUsed = zeroReading ? 0 : roundOne(distance / targetConsumption);
  const consumption = zeroReading ? 0 : roundTwo(distance / fuelUsed);
  const vehicleNumber = String(400 + siteIndex * 5 + vehicleIndex).padStart(3, "0");
  return {
    id: `fuel-${siteIndex}-${vehicleIndex}`,
    locationName: site,
    vehicleName: `${siteCode(site)}${vehicleNumber} ${registrations[(siteIndex + vehicleIndex) % registrations.length]}`,
    fuelUsed,
    distance,
    fuelConsumption: consumption,
    reportStartDate: fuelReportPeriod.start,
    reportEndDate: fuelReportPeriod.end,
  };
}

function roundOne(value: number) {
  return Math.round(value * 10) / 10;
}

function roundTwo(value: number) {
  return Math.round(value * 100) / 100;
}

function siteCode(site: string) {
  const words = site.replace(/\([^)]*\)/g, " ").split(/\s+/).filter(Boolean);
  const code = words.map((word) => word[0]).join("").toUpperCase().slice(0, 4);
  return code || "VEH";
}
