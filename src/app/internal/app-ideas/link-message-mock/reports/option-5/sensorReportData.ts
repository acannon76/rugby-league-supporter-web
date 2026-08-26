import { availableLocations } from "../option-4/nationalLocalPlanDashboardData";

export type RagStatus = "G" | "A" | "R" | "-";

export type SensorReportRow = {
  id: string;
  resourceName: string;
  locationName: string;
  deviceDetails: string;
  gpsEventTime: string | null;
  gpsRagStatus: RagStatus;
  canbusEventTime: string | null;
  canbusRagStatus: RagStatus;
  digiTachoEventTime: string | null;
  digiTachoRagStatus: RagStatus;
  overallRagStatus: Exclude<RagStatus, "-">;
};

export const sensorReferenceTime = "2026-08-26T10:45:00";

const sourceRows = [
  {"ResourceName": "BMC1600 DK20 ZRC", "LocationName": "BIRMINGHAM VOC", "DeviceDetails": "JPod CANbus Report (SENJPODCAN004) (CalAmp JPod)", "GPS_EventTime": "2026-08-26T07:36:36", "GPS_RAGStatus": "G", "CANbus_EventTime": "2026-08-25T22:21:03", "CANbus_RAGStatus": "G", "DigiTacho_EventTime": "2026-08-24T16:57:12", "DigiTacho_RAGStatus": "A", "Vehicle_OverallRAGStatus": "A"},
  {"ResourceName": "BMC1601 PN20 CUU", "LocationName": "BIRMINGHAM VOC", "DeviceDetails": "JPod CANbus Report (SENJPODCAN004) (CalAmp JPod)", "GPS_EventTime": "2026-08-26T08:13:39", "GPS_RAGStatus": "G", "CANbus_EventTime": "2026-08-26T07:58:29", "CANbus_RAGStatus": "G", "DigiTacho_EventTime": "2026-08-25T20:09:42", "DigiTacho_RAGStatus": "G", "Vehicle_OverallRAGStatus": "G"},
  {"ResourceName": "BMC1602 PF66 YDC", "LocationName": "BIRMINGHAM VOC", "DeviceDetails": "CANbus with idle threshold (Squarell)", "GPS_EventTime": "2026-08-26T10:39:07", "GPS_RAGStatus": "G", "CANbus_EventTime": "2026-08-26T10:34:24", "CANbus_RAGStatus": "G", "DigiTacho_EventTime": "2026-08-26T10:27:55", "DigiTacho_RAGStatus": "G", "Vehicle_OverallRAGStatus": "G"},
  {"ResourceName": "BMC1603 PF66 YCJ", "LocationName": "BIRMINGHAM VOC", "DeviceDetails": "#SEN019 (Squarell)", "GPS_EventTime": "2026-08-26T04:58:15", "GPS_RAGStatus": "G", "CANbus_EventTime": "2026-08-26T04:58:15", "CANbus_RAGStatus": "G", "DigiTacho_EventTime": "2026-08-25T21:55:25", "DigiTacho_RAGStatus": "G", "Vehicle_OverallRAGStatus": "G"},
  {"ResourceName": "BMC1604 PF66 YDE", "LocationName": "BIRMINGHAM VOC", "DeviceDetails": "CANbus with idle threshold (Squarell)", "GPS_EventTime": "2026-08-26T08:32:42", "GPS_RAGStatus": "G", "CANbus_EventTime": "2026-08-26T08:28:49", "CANbus_RAGStatus": "G", "DigiTacho_EventTime": "2026-08-25T21:29:46", "DigiTacho_RAGStatus": "G", "Vehicle_OverallRAGStatus": "G"},
  {"ResourceName": "BMC1605 PJ70 UEW", "LocationName": "BIRMINGHAM VOC", "DeviceDetails": "JPod CANbus Report (SENJPODCAN004) (CalAmp JPod)", "GPS_EventTime": "2026-08-26T06:09:15", "GPS_RAGStatus": "G", "CANbus_EventTime": "2026-08-20T14:46:34", "CANbus_RAGStatus": "A", "DigiTacho_EventTime": "2026-08-04T15:43:25", "DigiTacho_RAGStatus": "R", "Vehicle_OverallRAGStatus": "R"},
  {"ResourceName": "BMC1606 DK20 ZRV", "LocationName": "BIRMINGHAM VOC", "DeviceDetails": "JPod CANbus Report (SENJPODCAN004) (CalAmp JPod)", "GPS_EventTime": "2026-08-26T10:27:08", "GPS_RAGStatus": "G", "CANbus_EventTime": "2026-08-26T10:11:57", "CANbus_RAGStatus": "G", "DigiTacho_EventTime": "2026-08-26T10:27:08", "DigiTacho_RAGStatus": "G", "Vehicle_OverallRAGStatus": "G"},
  {"ResourceName": "BMC1702 PF66 YAW", "LocationName": "BIRMINGHAM VOC", "DeviceDetails": "JPod CANbus Report (SENJPODCAN004) (CalAmp JPod)", "GPS_EventTime": "2026-08-26T10:42:04", "GPS_RAGStatus": "G", "CANbus_EventTime": "2026-08-26T10:41:57", "CANbus_RAGStatus": "G", "DigiTacho_EventTime": "2026-08-26T10:38:17", "DigiTacho_RAGStatus": "G", "Vehicle_OverallRAGStatus": "G"},
  {"ResourceName": "BMC1705 PN20 CTX", "LocationName": "BIRMINGHAM VOC", "DeviceDetails": "JPod CANbus Report (SENJPODCAN004) (CalAmp JPod)", "GPS_EventTime": "2026-08-26T10:26:19", "GPS_RAGStatus": "G", "CANbus_EventTime": "2026-08-26T10:26:04", "CANbus_RAGStatus": "G", "DigiTacho_EventTime": "2026-08-26T10:26:19", "DigiTacho_RAGStatus": "G", "Vehicle_OverallRAGStatus": "G"},
  {"ResourceName": "BMC201 PJ24 SRX", "LocationName": "BIRMINGHAM VOC", "DeviceDetails": "JPod CANbus Report (SENJPODCAN004) (CalAmp JPod)", "GPS_EventTime": "2026-08-26T10:07:28", "GPS_RAGStatus": "G", "CANbus_EventTime": "2026-08-26T09:52:18", "CANbus_RAGStatus": "G", "DigiTacho_EventTime": null, "DigiTacho_RAGStatus": "-", "Vehicle_OverallRAGStatus": "G"},
  {"ResourceName": "BMC202 PJ24 SPZ", "LocationName": "BIRMINGHAM VOC", "DeviceDetails": "-", "GPS_EventTime": "2026-08-26T10:31:44", "GPS_RAGStatus": "G", "CANbus_EventTime": "2026-08-26T10:24:26", "CANbus_RAGStatus": "G", "DigiTacho_EventTime": "2026-08-25T21:34:57", "DigiTacho_RAGStatus": "G", "Vehicle_OverallRAGStatus": "G"},
  {"ResourceName": "BMC203 PK67 VDD", "LocationName": "BIRMINGHAM VOC", "DeviceDetails": "-", "GPS_EventTime": "2026-08-26T06:43:57", "GPS_RAGStatus": "G", "CANbus_EventTime": "2026-08-26T06:43:57", "CANbus_RAGStatus": "G", "DigiTacho_EventTime": "2026-08-26T00:36:24", "DigiTacho_RAGStatus": "G", "Vehicle_OverallRAGStatus": "G"},
  {"ResourceName": "BMC204 PJ24 SRO", "LocationName": "BIRMINGHAM VOC", "DeviceDetails": "JPod CANbus Report (SENJPODCAN004) (CalAmp JPod)", "GPS_EventTime": "2026-08-26T06:57:02", "GPS_RAGStatus": "G", "CANbus_EventTime": "2026-08-26T06:08:55", "CANbus_RAGStatus": "G", "DigiTacho_EventTime": "2026-08-26T06:09:18", "DigiTacho_RAGStatus": "G", "Vehicle_OverallRAGStatus": "G"},
  {"ResourceName": "BMC205 PK67 VDA", "LocationName": "BIRMINGHAM VOC", "DeviceDetails": "-", "GPS_EventTime": "2026-08-26T05:45:05", "GPS_RAGStatus": "G", "CANbus_EventTime": "2026-08-26T05:45:05", "CANbus_RAGStatus": "G", "DigiTacho_EventTime": "2026-08-25T23:38:22", "DigiTacho_RAGStatus": "G", "Vehicle_OverallRAGStatus": "G"},
  {"ResourceName": "BMC206 PK67 VDE", "LocationName": "BIRMINGHAM VOC", "DeviceDetails": "-", "GPS_EventTime": "2026-08-26T05:57:39", "GPS_RAGStatus": "G", "CANbus_EventTime": "2026-08-26T05:57:39", "CANbus_RAGStatus": "G", "DigiTacho_EventTime": "2026-08-25T23:49:34", "DigiTacho_RAGStatus": "G", "Vehicle_OverallRAGStatus": "G"},
  {"ResourceName": "BMC207 PN74 DKY", "LocationName": "BIRMINGHAM VOC", "DeviceDetails": "JPod CANbus Report (SENJPODCAN004) (CalAmp JPod)", "GPS_EventTime": "2026-08-26T10:41:48", "GPS_RAGStatus": "G", "CANbus_EventTime": "2026-08-26T10:41:48", "CANbus_RAGStatus": "G", "DigiTacho_EventTime": "2026-08-26T10:38:38", "DigiTacho_RAGStatus": "G", "Vehicle_OverallRAGStatus": "G"},
  {"ResourceName": "BMC208 PN74 DLD", "LocationName": "BIRMINGHAM VOC", "DeviceDetails": "JPod CANbus Report (SENJPODCAN004) (CalAmp JPod)", "GPS_EventTime": "2026-08-26T10:38:14", "GPS_RAGStatus": "G", "CANbus_EventTime": "2026-08-26T10:38:14", "CANbus_RAGStatus": "G", "DigiTacho_EventTime": "2026-08-26T10:21:32", "DigiTacho_RAGStatus": "G", "Vehicle_OverallRAGStatus": "G"},
  {"ResourceName": "BMC209 PN74 DPE", "LocationName": "BIRMINGHAM VOC", "DeviceDetails": "JPod CANbus Report (SENJPODCAN004) (CalAmp JPod)", "GPS_EventTime": "2026-08-26T01:44:42", "GPS_RAGStatus": "G", "CANbus_EventTime": "2026-08-26T01:29:32", "CANbus_RAGStatus": "G", "DigiTacho_EventTime": "2026-08-26T01:27:37", "DigiTacho_RAGStatus": "G", "Vehicle_OverallRAGStatus": "G"},
  {"ResourceName": "BMC210 PN74 DKO", "LocationName": "BIRMINGHAM VOC", "DeviceDetails": "JPod CANbus Report (SENJPODCAN004) (CalAmp JPod)", "GPS_EventTime": "2026-08-26T00:37:42", "GPS_RAGStatus": "G", "CANbus_EventTime": "2026-08-26T00:13:46", "CANbus_RAGStatus": "G", "DigiTacho_EventTime": "2026-08-26T00:14:08", "DigiTacho_RAGStatus": "G", "Vehicle_OverallRAGStatus": "G"},
  {"ResourceName": "BMC211 PN74 DKU", "LocationName": "BIRMINGHAM VOC", "DeviceDetails": "JPod CANbus Report (SENJPODCAN004) (CalAmp JPod)", "GPS_EventTime": "2026-08-26T02:35:06", "GPS_RAGStatus": "G", "CANbus_EventTime": "2026-08-26T01:37:27", "CANbus_RAGStatus": "G", "DigiTacho_EventTime": "2026-08-26T01:52:37", "DigiTacho_RAGStatus": "G", "Vehicle_OverallRAGStatus": "G"},
  {"ResourceName": "BMC300 PK67 VFA", "LocationName": "BIRMINGHAM VOC", "DeviceDetails": "-", "GPS_EventTime": "2026-08-26T05:31:05", "GPS_RAGStatus": "G", "CANbus_EventTime": "2026-08-26T05:31:05", "CANbus_RAGStatus": "G", "DigiTacho_EventTime": "2026-08-25T15:51:08", "DigiTacho_RAGStatus": "G", "Vehicle_OverallRAGStatus": "G"},
  {"ResourceName": "BMC304 PJ67 LZN", "LocationName": "BIRMINGHAM VOC", "DeviceDetails": "CANbus with idle threshold (Squarell)", "GPS_EventTime": "2026-08-26T10:38:19", "GPS_RAGStatus": "G", "CANbus_EventTime": "2026-08-26T10:35:24", "CANbus_RAGStatus": "G", "DigiTacho_EventTime": "2026-08-26T10:38:19", "DigiTacho_RAGStatus": "G", "Vehicle_OverallRAGStatus": "G"},
  {"ResourceName": "BMC312 PK67 VGZ", "LocationName": "BIRMINGHAM VOC", "DeviceDetails": "-", "GPS_EventTime": "2026-08-26T10:41:55", "GPS_RAGStatus": "G", "CANbus_EventTime": "2026-08-26T09:18:30", "CANbus_RAGStatus": "G", "DigiTacho_EventTime": "2026-08-26T09:18:34", "DigiTacho_RAGStatus": "G", "Vehicle_OverallRAGStatus": "G"},
  {"ResourceName": "BMC314 PJ67 LZO", "LocationName": "BIRMINGHAM VOC", "DeviceDetails": "-", "GPS_EventTime": "2026-08-26T07:55:22", "GPS_RAGStatus": "G", "CANbus_EventTime": "2026-08-26T07:51:35", "CANbus_RAGStatus": "G", "DigiTacho_EventTime": "2026-08-26T07:53:12", "DigiTacho_RAGStatus": "G", "Vehicle_OverallRAGStatus": "G"},
  {"ResourceName": "BMC315 PG66 UEA", "LocationName": "BIRMINGHAM VOC", "DeviceDetails": "Event Data Report (#CALEVT001) (CalAmp)", "GPS_EventTime": "2026-08-26T04:40:06", "GPS_RAGStatus": "G", "CANbus_EventTime": "2026-08-26T04:40:06", "CANbus_RAGStatus": "G", "DigiTacho_EventTime": "2026-08-25T22:32:40", "DigiTacho_RAGStatus": "G", "Vehicle_OverallRAGStatus": "G"},
  {"ResourceName": "BMC321 PG66 UFB", "LocationName": "BIRMINGHAM VOC", "DeviceDetails": "#SEN019 (Squarell)", "GPS_EventTime": "2026-08-26T05:03:31", "GPS_RAGStatus": "G", "CANbus_EventTime": "2026-08-26T04:48:21", "CANbus_RAGStatus": "G", "DigiTacho_EventTime": "2026-08-25T14:28:37", "DigiTacho_RAGStatus": "G", "Vehicle_OverallRAGStatus": "G"},
  {"ResourceName": "BMC324 PE17 HMG", "LocationName": "BIRMINGHAM VOC", "DeviceDetails": "JPod CANbus Report (SENJPODCAN004) (CalAmp JPod)", "GPS_EventTime": "2026-08-26T00:31:46", "GPS_RAGStatus": "G", "CANbus_EventTime": "2026-08-26T00:14:12", "CANbus_RAGStatus": "G", "DigiTacho_EventTime": "2026-08-26T00:13:52", "DigiTacho_RAGStatus": "G", "Vehicle_OverallRAGStatus": "G"},
  {"ResourceName": "BMC325 PE17 HMA", "LocationName": "BIRMINGHAM VOC", "DeviceDetails": "JPod CANbus Report (SENJPODCAN004) (CalAmp JPod)", "GPS_EventTime": "2026-08-26T09:43:01", "GPS_RAGStatus": "G", "CANbus_EventTime": "2026-08-26T00:24:42", "CANbus_RAGStatus": "G", "DigiTacho_EventTime": "2026-08-26T00:24:57", "DigiTacho_RAGStatus": "G", "Vehicle_OverallRAGStatus": "G"},
  {"ResourceName": "BMC326 PE17 HMF", "LocationName": "BIRMINGHAM VOC", "DeviceDetails": "JPod CANbus Report (SENJPODCAN004) (CalAmp JPod)", "GPS_EventTime": "2026-08-26T07:57:38", "GPS_RAGStatus": "G", "CANbus_EventTime": "2026-08-26T07:42:28", "CANbus_RAGStatus": "G", "DigiTacho_EventTime": "2026-08-26T04:52:21", "DigiTacho_RAGStatus": "G", "Vehicle_OverallRAGStatus": "G"},
  {"ResourceName": "BMC327 PE17 HMK", "LocationName": "BIRMINGHAM VOC", "DeviceDetails": "-", "GPS_EventTime": "2026-08-26T07:32:30", "GPS_RAGStatus": "G", "CANbus_EventTime": "2026-08-26T01:00:06", "CANbus_RAGStatus": "G", "DigiTacho_EventTime": "2026-08-26T00:31:36", "DigiTacho_RAGStatus": "G", "Vehicle_OverallRAGStatus": "G"},
  {"ResourceName": "BMC330 PK67 VFB", "LocationName": "BIRMINGHAM VOC", "DeviceDetails": "#SEN019 (Squarell)", "GPS_EventTime": "2026-08-26T10:27:50", "GPS_RAGStatus": "G", "CANbus_EventTime": "2026-08-26T10:05:19", "CANbus_RAGStatus": "G", "DigiTacho_EventTime": "2026-08-26T10:04:49", "DigiTacho_RAGStatus": "G", "Vehicle_OverallRAGStatus": "G"},
  {"ResourceName": "BMC331 PJ67 LZL", "LocationName": "BIRMINGHAM VOC", "DeviceDetails": "#SEN019 (Squarell)", "GPS_EventTime": "2026-08-26T05:22:40", "GPS_RAGStatus": "G", "CANbus_EventTime": "2026-08-25T23:17:24", "CANbus_RAGStatus": "G", "DigiTacho_EventTime": "2026-08-25T23:15:22", "DigiTacho_RAGStatus": "G", "Vehicle_OverallRAGStatus": "G"},
  {"ResourceName": "BMC333 PK67 VGY", "LocationName": "BIRMINGHAM VOC", "DeviceDetails": "-", "GPS_EventTime": "2026-08-26T10:42:05", "GPS_RAGStatus": "G", "CANbus_EventTime": "2026-08-26T10:40:51", "CANbus_RAGStatus": "G", "DigiTacho_EventTime": "2026-08-26T10:40:56", "DigiTacho_RAGStatus": "G", "Vehicle_OverallRAGStatus": "G"},
  {"ResourceName": "BMC334 PJ67 LZK", "LocationName": "BIRMINGHAM VOC", "DeviceDetails": "-", "GPS_EventTime": "2026-08-26T09:14:16", "GPS_RAGStatus": "G", "CANbus_EventTime": "2026-08-26T09:10:29", "CANbus_RAGStatus": "G", "DigiTacho_EventTime": "2026-08-26T09:00:13", "DigiTacho_RAGStatus": "G", "Vehicle_OverallRAGStatus": "G"},
  {"ResourceName": "BMC335 PJ67 LZM", "LocationName": "BIRMINGHAM VOC", "DeviceDetails": "#SEN019 (Squarell)", "GPS_EventTime": "2026-08-26T07:22:32", "GPS_RAGStatus": "G", "CANbus_EventTime": "2026-08-26T07:18:46", "CANbus_RAGStatus": "G", "DigiTacho_EventTime": "2026-08-26T01:47:40", "DigiTacho_RAGStatus": "G", "Vehicle_OverallRAGStatus": "G"},
  {"ResourceName": "BMC338 PE17 HNR", "LocationName": "BIRMINGHAM VOC", "DeviceDetails": "#SEN019 (Squarell)", "GPS_EventTime": "2026-08-26T06:27:05", "GPS_RAGStatus": "G", "CANbus_EventTime": "2026-08-26T06:27:05", "CANbus_RAGStatus": "G", "DigiTacho_EventTime": "2026-08-26T00:20:17", "DigiTacho_RAGStatus": "G", "Vehicle_OverallRAGStatus": "G"},
  {"ResourceName": "BMCGAS1 BN21 AYU", "LocationName": "BIRMINGHAM VOC", "DeviceDetails": "-", "GPS_EventTime": "2026-08-26T00:47:58", "GPS_RAGStatus": "G", "CANbus_EventTime": "2026-08-26T00:44:57", "CANbus_RAGStatus": "G", "DigiTacho_EventTime": "2026-08-26T00:45:12", "DigiTacho_RAGStatus": "G", "Vehicle_OverallRAGStatus": "G"},
  {"ResourceName": "BMCGAS2 BN21 AYF", "LocationName": "BIRMINGHAM VOC", "DeviceDetails": "JPod CANbus Report (SENJPODCAN004) (CalAmp JPod)", "GPS_EventTime": "2026-08-26T08:03:23", "GPS_RAGStatus": "G", "CANbus_EventTime": "2026-08-26T08:03:08", "CANbus_RAGStatus": "G", "DigiTacho_EventTime": "2026-08-26T02:15:00", "DigiTacho_RAGStatus": "G", "Vehicle_OverallRAGStatus": "G"},
  {"ResourceName": "BMCGAS3 BN21 AYH", "LocationName": "BIRMINGHAM VOC", "DeviceDetails": "JPod CANbus Report (SENJPODCAN004) (CalAmp JPod)", "GPS_EventTime": "2026-08-26T09:35:38", "GPS_RAGStatus": "G", "CANbus_EventTime": "2026-08-26T00:17:46", "CANbus_RAGStatus": "G", "DigiTacho_EventTime": "2026-08-26T00:18:01", "DigiTacho_RAGStatus": "G", "Vehicle_OverallRAGStatus": "G"},
  {"ResourceName": "BMCGAS4 BN21 AYC", "LocationName": "BIRMINGHAM VOC", "DeviceDetails": "JPod CANbus Report (SENJPODCAN004) (CalAmp JPod)", "GPS_EventTime": "2026-08-26T00:29:33", "GPS_RAGStatus": "G", "CANbus_EventTime": "2026-08-26T00:13:40", "CANbus_RAGStatus": "G", "DigiTacho_EventTime": "2026-08-26T00:13:55", "DigiTacho_RAGStatus": "G", "Vehicle_OverallRAGStatus": "G"},
  {"ResourceName": "BMCGAS5 BN21 AYJ", "LocationName": "BIRMINGHAM VOC", "DeviceDetails": "JPod CANbus Report (SENJPODCAN004) (CalAmp JPod)", "GPS_EventTime": "2026-08-24T11:38:27", "GPS_RAGStatus": "A", "CANbus_EventTime": "2026-08-24T11:38:12", "CANbus_RAGStatus": "A", "DigiTacho_EventTime": "2026-08-20T23:45:14", "DigiTacho_RAGStatus": "A", "Vehicle_OverallRAGStatus": "A"},
] as const;

const registrations = ["PN74 KLD", "PX25 HUA", "MX71 DCT", "PN25 BVL", "PX26 BRV", "PE68 UHD", "PN70 BLZ", "PK67 VGY"] as const;
const deviceTypes = [
  "JPod CANbus Report (SENJPODCAN004) (CalAmp JPod)",
  "CANbus with idle threshold (Squarell)",
  "#SEN019 (Squarell)",
  "Event Data Report (#CALEVT001) (CalAmp)",
] as const;
const agePatterns = [
  [0.2, 0.3, 0.6],
  [1.1, 4.8, 0.5],
  [5.4, 0.4, 5.8],
  [8.3, 2.2, 0.7],
] as const;

export const sensorReportRows: SensorReportRow[] = [
  ...sourceRows.map((row, index) => normaliseSourceRow(row, index)),
  ...availableLocations
    .filter((site) => site.toUpperCase() !== "BIRMINGHAM VOC")
    .flatMap((site, siteIndex) =>
      Array.from({ length: 4 }, (_, vehicleIndex) => buildMockSensorRow(site, siteIndex, vehicleIndex)),
    ),
];

export function ragLabel(status: RagStatus) {
  if (status === "G") return "Green";
  if (status === "A") return "Amber";
  if (status === "R") return "Red";
  return "Not fitted";
}

export function ragFromEventTime(value: string | null): RagStatus {
  if (!value) return "-";
  const ageDays = (new Date(sensorReferenceTime).getTime() - new Date(value).getTime()) / 86_400_000;
  if (ageDays > 7) return "R";
  if (ageDays > 4) return "A";
  return "G";
}

export function overallRag(statuses: RagStatus[]): Exclude<RagStatus, "-"> {
  if (statuses.includes("R")) return "R";
  if (statuses.includes("A")) return "A";
  return "G";
}

export function formatSensorDateTime(value: string | null) {
  if (!value) return "Not fitted";
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function ageText(value: string | null) {
  if (!value) return "N/A";
  const ageHours = Math.max(0, (new Date(sensorReferenceTime).getTime() - new Date(value).getTime()) / 3_600_000);
  if (ageHours < 24) return `${Math.round(ageHours)}h ago`;
  const days = ageHours / 24;
  return `${days.toFixed(days >= 10 ? 0 : 1)}d ago`;
}

function normaliseSourceRow(row: (typeof sourceRows)[number], index: number): SensorReportRow {
  const gps = ragFromEventTime(row.GPS_EventTime);
  const canbus = ragFromEventTime(row.CANbus_EventTime);
  const tacho = ragFromEventTime(row.DigiTacho_EventTime);
  return {
    id: `sensor-birmingham-${index + 1}`,
    resourceName: row.ResourceName,
    locationName: row.LocationName,
    deviceDetails: row.DeviceDetails,
    gpsEventTime: row.GPS_EventTime,
    gpsRagStatus: gps,
    canbusEventTime: row.CANbus_EventTime,
    canbusRagStatus: canbus,
    digiTachoEventTime: row.DigiTacho_EventTime,
    digiTachoRagStatus: tacho,
    overallRagStatus: overallRag([gps, canbus, tacho]),
  };
}

function buildMockSensorRow(site: string, siteIndex: number, vehicleIndex: number): SensorReportRow {
  const pattern = agePatterns[(siteIndex + vehicleIndex) % agePatterns.length];
  const suffix = String(200 + siteIndex * 4 + vehicleIndex).padStart(3, "0");
  const resourceName = `${siteCode(site)}${suffix} ${registrations[(siteIndex + vehicleIndex) % registrations.length]}`;
  const tachoNotFitted = (siteIndex + vehicleIndex) % 13 === 0;
  const gpsEventTime = dateDaysAgo(pattern[0]);
  const canbusEventTime = dateDaysAgo(pattern[1]);
  const digiTachoEventTime = tachoNotFitted ? null : dateDaysAgo(pattern[2]);
  const gps = ragFromEventTime(gpsEventTime);
  const canbus = ragFromEventTime(canbusEventTime);
  const tacho = ragFromEventTime(digiTachoEventTime);

  return {
    id: `sensor-${siteIndex}-${vehicleIndex}`,
    resourceName,
    locationName: site,
    deviceDetails: deviceTypes[(siteIndex + vehicleIndex) % deviceTypes.length],
    gpsEventTime,
    gpsRagStatus: gps,
    canbusEventTime,
    canbusRagStatus: canbus,
    digiTachoEventTime,
    digiTachoRagStatus: tacho,
    overallRagStatus: overallRag([gps, canbus, tacho]),
  };
}

function dateDaysAgo(days: number) {
  const date = new Date(sensorReferenceTime);
  date.setTime(date.getTime() - days * 86_400_000);
  return date.toISOString().slice(0, 19);
}

function siteCode(site: string) {
  const words = site.replace(/\([^)]*\)/g, " ").split(/\s+/).filter(Boolean);
  const code = words.map((word) => word[0]).join("").toUpperCase().slice(0, 4);
  return code || "VEH";
}
