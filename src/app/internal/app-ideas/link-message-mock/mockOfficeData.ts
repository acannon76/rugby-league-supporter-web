export const trafficOptions = [
  "1C 24 Mail",
  "2C 48 Mail",
  "Empty",
  "PF 24 Parcels",
  "PF 48 Parcels",
  "Container Repatriation",
] as const;

export type TrafficOption = (typeof trafficOptions)[number];
export type MovementStatus = "Actual" | "Planned" | "ETD" | "ETA";

export type ArrivalDepartureRow = {
  departing: string;
  departureDateTime: string;
  departureStatus: MovementStatus;
  destination: string;
  arrivalDateTime: string;
  arrivalStatus: MovementStatus;
  jobReference: string;
  resources: string;
  traffic: TrafficOption;
  delay: string;
};

export type TrackingEvent = {
  time: string;
  duration: string;
  placeType: "Depot" | "On Route" | "Known Place" | "Break" | "Resource Moving";
  place: string;
  gisDetails: string;
  traffic: TrafficOption;
  status: "Completed" | "Current" | "Planned";
};

export type RoutePoint = {
  name: string;
  shortLabel: string;
  x: number;
  y: number;
  kind: "start" | "stop" | "destination" | "current";
  eta?: string;
  mph?: number;
};

export const arrivalDepartureRows: ArrivalDepartureRow[] = [
  {
    departing: "Midlands Super Hub",
    departureDateTime: "22/07/2026 02:02",
    departureStatus: "Actual",
    destination: "Preston MC",
    arrivalDateTime: "22/07/2026 15:53",
    arrivalStatus: "ETA",
    jobReference: "MSH913-2026-07-22",
    resources: "Rusu Ion • MSH074 (MX73BWW) • 0*DVS • 4318005 (DD98)",
    traffic: trafficOptions[0],
    delay: "+00:14",
  },
  {
    departing: "Midlands Super Hub",
    departureDateTime: "22/07/2026 02:05",
    departureStatus: "Planned",
    destination: "Gatwick MC (VOC)",
    arrivalDateTime: "22/07/2026 04:45",
    arrivalStatus: "Planned",
    jobReference: "MSH636B-2026-07-21",
    resources: "Eaton Benjamin • MSH001 24250218 (PN74CDY) • 3*DVS • 24316007 (DD95)",
    traffic: trafficOptions[1],
    delay: "00:00",
  },
  {
    departing: "Midlands Super Hub",
    departureDateTime: "22/07/2026 02:45",
    departureStatus: "ETD",
    destination: "Peterborough MC (VOC)",
    arrivalDateTime: "22/07/2026 04:25",
    arrivalStatus: "ETA",
    jobReference: "PEV618-2026-07-21",
    resources: "Whittenbury Daryl • PEL07 (PN74CFX) • 20316087 (DD95)",
    traffic: trafficOptions[2],
    delay: "-00:03",
  },
  {
    departing: "Midlands Super Hub",
    departureDateTime: "22/07/2026 03:30",
    departureStatus: "Planned",
    destination: "Warrington MC",
    arrivalDateTime: "22/07/2026 06:05",
    arrivalStatus: "Planned",
    jobReference: "WAVOC641-2026-07-21",
    resources: "Iacomi Silviu • MX74FDN Hire 441",
    traffic: trafficOptions[3],
    delay: "00:00",
  },
  {
    departing: "Midlands Super Hub",
    departureDateTime: "22/07/2026 04:00",
    departureStatus: "Planned",
    destination: "Croydon MC (VOC)",
    arrivalDateTime: "22/07/2026 06:30",
    arrivalStatus: "Planned",
    jobReference: "TPRDC649B-2026-07-21",
    resources: "Rutkowicz Rafal Adam • 63 (PN25BNA) • 25316183",
    traffic: trafficOptions[4],
    delay: "00:00",
  },
  {
    departing: "Midlands Super Hub",
    departureDateTime: "22/07/2026 04:00",
    departureStatus: "Planned",
    destination: "YDC",
    arrivalDateTime: "22/07/2026 06:15",
    arrivalStatus: "Planned",
    jobReference: "YDC540B-2026-07-21",
    resources: "Adam Evans • 4055 PN25BVL",
    traffic: trafficOptions[5],
    delay: "00:00",
  },
  {
    departing: "Midlands Super Hub",
    departureDateTime: "22/07/2026 04:30",
    departureStatus: "Planned",
    destination: "Home Counties North MC",
    arrivalDateTime: "22/07/2026 05:45",
    arrivalStatus: "Planned",
    jobReference: "TPRDC653-2026-07-22",
    resources: "Azevedo Freitas Joao Anastacio • 43 (PN25BWA) • 25316177 (DD95)",
    traffic: trafficOptions[0],
    delay: "00:00",
  },
  {
    departing: "Midlands Super Hub",
    departureDateTime: "22/07/2026 05:23",
    departureStatus: "Planned",
    destination: "Bournemouth (Dorset MC)",
    arrivalDateTime: "22/07/2026 08:45",
    arrivalStatus: "Planned",
    jobReference: "MSH014A-2026-07-22",
    resources: "Selwood Andy • MSH043 24250254 (PN74CHC) • 3*DVS • 26316023",
    traffic: trafficOptions[1],
    delay: "00:00",
  },
  {
    departing: "Midlands Super Hub",
    departureDateTime: "22/07/2026 06:01",
    departureStatus: "Actual",
    destination: "Manchester MC",
    arrivalDateTime: "22/07/2026 10:08",
    arrivalStatus: "Actual",
    jobReference: "MSH113B-2026-07-22",
    resources: "Henry Trevor Alan • ATH21 20250020 (PN70BLZ) • 1318078 (DD98)",
    traffic: trafficOptions[2],
    delay: "-00:06",
  },
  {
    departing: "Midlands Super Hub",
    departureDateTime: "22/07/2026 06:20",
    departureStatus: "Planned",
    destination: "London Central (Mount Pleasant)",
    arrivalDateTime: "22/07/2026 08:45",
    arrivalStatus: "Planned",
    jobReference: "MSH021-2026-07-22",
    resources: "Barrett Duncan • MSH021 (PO75YXH) • 26316006",
    traffic: trafficOptions[3],
    delay: "00:00",
  },
  {
    departing: "Midlands Super Hub",
    departureDateTime: "22/07/2026 07:05",
    departureStatus: "ETD",
    destination: "Preston VOC",
    arrivalDateTime: "22/07/2026 10:24",
    arrivalStatus: "ETA",
    jobReference: "VOC155-2026-07-22",
    resources: "Jones Sarah • PE68UHD • Trailer 7338014",
    traffic: trafficOptions[4],
    delay: "+00:08",
  },
  {
    departing: "Midlands Super Hub",
    departureDateTime: "22/07/2026 07:40",
    departureStatus: "Actual",
    destination: "North West Hub",
    arrivalDateTime: "22/07/2026 09:58",
    arrivalStatus: "ETA",
    jobReference: "NWH254-2026-07-22",
    resources: "Cannon Andrew • PE68UHD • Trailer 7338014",
    traffic: trafficOptions[5],
    delay: "+00:05",
  },
];

export const liveTrackingSummary = {
  title: "Vehicle live tracking",
  resource: "NW433 (PN70BUA)",
  duty: "NWH254",
  vehicle: "PE68UHD",
  trailer: "7338014",
  driver: "Andrew Cannon",
  route: "North West Hub → Warrington MC → Preston VOC",
  latestUpdate: "22/07/2026 14:20",
  currentStatus: "Moving northbound towards Preston VOC",
  eta: "14:49",
  speed: "57 mph",
  lastKnownPlace: "A59 corridor near Ormskirk",
};

export const liveTrackingEvents: TrackingEvent[] = [
  {
    time: "08:35",
    duration: "00:35",
    placeType: "On Route",
    place: "Warrington MC → North West Hub",
    gisDetails: "00:35 • 19.5 miles",
    traffic: trafficOptions[5],
    status: "Completed",
  },
  {
    time: "09:10",
    duration: "01:35",
    placeType: "Depot",
    place: "North West Hub",
    gisDetails: "Dock 14 • unload and reload",
    traffic: trafficOptions[5],
    status: "Completed",
  },
  {
    time: "10:46",
    duration: "00:02",
    placeType: "On Route",
    place: "North West Hub internal move",
    gisDetails: "0.3 miles",
    traffic: trafficOptions[0],
    status: "Completed",
  },
  {
    time: "10:48",
    duration: "00:38",
    placeType: "Depot",
    place: "Warrington MC",
    gisDetails: "Orion Boulevard, Warrington, WA5 3",
    traffic: trafficOptions[0],
    status: "Completed",
  },
  {
    time: "11:26",
    duration: "00:02",
    placeType: "On Route",
    place: "Warrington MC exit",
    gisDetails: "0.3 miles",
    traffic: trafficOptions[0],
    status: "Completed",
  },
  {
    time: "11:28",
    duration: "01:24",
    placeType: "Depot",
    place: "North West Hub",
    gisDetails: "Omega Boulevard, Warrington, WA5 7",
    traffic: trafficOptions[0],
    status: "Completed",
  },
  {
    time: "12:52",
    duration: "00:43",
    placeType: "On Route",
    place: "North West Hub → Preston VOC",
    gisDetails: "34.04 miles",
    traffic: trafficOptions[4],
    status: "Completed",
  },
  {
    time: "13:35",
    duration: "00:22",
    placeType: "Depot",
    place: "Preston VOC",
    gisDetails: "Pittman Way, Fulwood",
    traffic: trafficOptions[4],
    status: "Completed",
  },
  {
    time: "13:57",
    duration: "00:24",
    placeType: "On Route",
    place: "Preston VOC → Final handover",
    gisDetails: "0 miles • local manoeuvre",
    traffic: trafficOptions[2],
    status: "Current",
  },
  {
    time: "14:21",
    duration: "00:28",
    placeType: "Resource Moving",
    place: "Approaching Preston MC gatehouse",
    gisDetails: "ETA 14:49 • 7.8 miles remaining",
    traffic: trafficOptions[2],
    status: "Planned",
  },
];

export const liveTrackingRoute: RoutePoint[] = [
  { name: "Warrington MC", shortLabel: "WM", x: 84, y: 248, kind: "start" },
  { name: "North West Hub", shortLabel: "NWH", x: 112, y: 200, kind: "stop" },
  { name: "Skelmersdale", shortLabel: "SK", x: 72, y: 136, kind: "stop" },
  { name: "Current position", shortLabel: "GPS", x: 108, y: 96, kind: "current", eta: "14:49", mph: 57 },
  { name: "Preston VOC", shortLabel: "PV", x: 92, y: 44, kind: "destination" },
];
