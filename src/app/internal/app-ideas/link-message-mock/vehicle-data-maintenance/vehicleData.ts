export type VehicleStatus = "Available" | "Allocated" | "VOR" | "Workshop";
export type VehicleHistoryStatus = "Closed" | "Open" | "Monitor";
export type VehicleHistoryType = "Vehicle Issue" | "Defect" | "Maintenance" | "Daily Check";

export type VehicleHistoryRecord = {
  id: string;
  checkDate: string;
  driver: string;
  mileage: string;
  outcome: "No defects" | "Vehicle issue" | "Defect";
  category: string;
  pmt: string;
  issue: string;
  type: VehicleHistoryType;
  status: VehicleHistoryStatus;
  notes: string;
};

export type VehicleRecord = {
  localId: string;
  vrn: string;
  cNumber: string;
  capacity: string;
  type: string;
  descriptionCode: string;
  model: string;
  m5Status: "A" | "V" | "W";
  linkStatus: VehicleStatus;
  owningVoc: string;
  lastKnownLocation: string;
  motDueDate: string;
  serviceDueDate: string;
  lastMileage: string;
  fuelType: string;
  vehicleHeight: string;
  deleted?: boolean;
  history: VehicleHistoryRecord[];
};

const names = [
  "A. Cannon",
  "J. Taylor",
  "S. Patel",
  "M. Hughes",
  "R. Evans",
  "K. Williams",
  "D. Morgan",
  "L. Brown",
  "T. Davies",
  "P. Wilson",
];

const vocs = [
  "North West VOC",
  "Warrington VOC",
  "Manchester VOC",
  "Midlands SH VOC",
  "Birmingham VOC",
  "Preston VOC",
];

const locations = [
  "North West Super Hub",
  "Warrington MC",
  "Manchester MC",
  "Midlands Super Hub",
  "Birmingham MC",
  "Preston MC",
  "Stourton VOC",
  "Atherstone VOC",
];

const vrns = [
  "DK20ZPB", "DE20EXA", "DE20FMZ", "DE20FSX", "DE20FNS", "DK20ZNE", "DK20ZKP", "DK20ZMX", "DE20FSC", "DK20ZMO",
  "PE68UHD", "PN21XHD", "MX70RHA", "DK19RHC", "YX72NWH", "PK68MTE", "PN74DKY", "PN74DLD", "PN74DPE", "PN74DKO",
  "PN74DKU", "PK67VFA", "PJ67LZN", "PJ67LZO", "PG66UEA", "PG66UFB", "PE17HMJ", "PE17HMO", "PE17HMG", "PE17HMA",
];

function ukDate(day: number, month: number, year = 2026) {
  return `${String(day).padStart(2, "0")}/${String(month).padStart(2, "0")}/${year}`;
}

function makeHistory(index: number, vrn: string, mileage: number): VehicleHistoryRecord[] {
  const issueCategory = [
    "Body & exterior",
    "Engine & warning systems",
    "Tyres & wheels",
    "Lights & electrical",
    "Brakes & air system",
  ][index % 5];
  const issueText = [
    "Nearside door dent",
    "Engine warning light / sensor fault",
    "Rear offside tyre wear",
    "Marker lamp intermittent",
    "Minor air pressure warning",
  ][index % 5];
  const openDefect = index % 7 === 0;
  const monitorIssue = !openDefect && index % 4 === 0;

  return [
    {
      id: `${vrn}-latest`,
      checkDate: ukDate(27 - (index % 5), 8),
      driver: names[index % names.length],
      mileage: `${(mileage + 320).toLocaleString("en-GB")} km`,
      outcome: openDefect ? "Defect" : monitorIssue ? "Vehicle issue" : "No defects",
      category: openDefect || monitorIssue ? issueCategory : "Daily vehicle check",
      pmt: openDefect ? `PMT20${String(7410 + index).padStart(4, "0")}` : "-",
      issue: openDefect ? issueText : monitorIssue ? `${issueText} - monitor` : "Daily check completed - NIL defects",
      type: openDefect ? "Defect" : monitorIssue ? "Vehicle Issue" : "Daily Check",
      status: openDefect ? "Open" : monitorIssue ? "Monitor" : "Closed",
      notes: openDefect
        ? "Defect recorded during driver daily vehicle check. Vehicle held for manager/workshop review."
        : monitorIssue
          ? "Driver recorded an amber vehicle issue. Vehicle remains roadworthy and is being monitored."
          : "All vehicle check categories completed. No defects or vehicle issues reported.",
    },
    {
      id: `${vrn}-previous-1`,
      checkDate: ukDate(18 - (index % 6), 8),
      driver: names[(index + 3) % names.length],
      mileage: `${(mileage - 540).toLocaleString("en-GB")} km`,
      outcome: "No defects",
      category: "Daily vehicle check",
      pmt: "-",
      issue: "Daily check completed - NIL defects",
      type: "Daily Check",
      status: "Closed",
      notes: "Routine pre-use check completed with no reportable defects.",
    },
    {
      id: `${vrn}-previous-2`,
      checkDate: ukDate(4 + (index % 8), 8),
      driver: names[(index + 5) % names.length],
      mileage: `${(mileage - 1280).toLocaleString("en-GB")} km`,
      outcome: index % 3 === 0 ? "Vehicle issue" : "No defects",
      category: index % 3 === 0 ? "Tyres & wheels" : "Daily vehicle check",
      pmt: "-",
      issue: index % 3 === 0 ? "Tyre tread noted for monitoring" : "Daily check completed - NIL defects",
      type: index % 3 === 0 ? "Vehicle Issue" : "Daily Check",
      status: index % 3 === 0 ? "Monitor" : "Closed",
      notes: index % 3 === 0 ? "Amber observation recorded; workshop inspection not required at this stage." : "No defects recorded.",
    },
    {
      id: `${vrn}-maintenance`,
      checkDate: ukDate(12 + (index % 8), 7),
      driver: "Fleet Workshop",
      mileage: `${(mileage - 3100).toLocaleString("en-GB")} km`,
      outcome: "No defects",
      category: "Scheduled maintenance",
      pmt: `PMT10${String(4300 + index).padStart(4, "0")}`,
      issue: index % 2 === 0 ? "Scheduled safety inspection" : "Brake / tyre inspection",
      type: "Maintenance",
      status: "Closed",
      notes: "Scheduled workshop inspection completed and vehicle returned to service.",
    },
  ];
}

export const vehicleRecords: VehicleRecord[] = vrns.map((vrn, index) => {
  const cNumber = String((index < 10 ? 19610207 : 20610120) + index * 13);
  const mileage = 278000 + index * 14783;
  const isTractor = index >= 10 && index % 3 !== 0;
  const isVor = index === 7 || index === 21;
  const isWorkshop = index === 14;
  const m5Status: VehicleRecord["m5Status"] = isVor ? "V" : isWorkshop ? "W" : "A";
  const linkStatus: VehicleStatus = isVor ? "VOR" : isWorkshop ? "Workshop" : index % 5 === 0 ? "Allocated" : "Available";

  return {
    localId: `RO${String(2100 + index).padStart(4, "0")}`,
    vrn,
    cNumber,
    capacity: isTractor ? "44t Tractor" : index % 4 === 0 ? "18t Rigid" : "15 7.5t Rigid",
    type: isTractor ? "HGVTRACT" : "HGV75BOX",
    descriptionCode: isTractor ? "TRC" : "HVS",
    model: isTractor ? (index % 2 ? "Actros 5" : "FM 460") : "8.160BB",
    m5Status,
    linkStatus,
    owningVoc: vocs[index % vocs.length],
    lastKnownLocation: locations[(index * 3) % locations.length],
    motDueDate: ukDate(2 + ((index * 7) % 26), 9 + (index % 3)),
    serviceDueDate: ukDate(3 + ((index * 5) % 25), 9 + ((index + 1) % 3)),
    lastMileage: `${mileage.toLocaleString("en-GB")} km`,
    fuelType: index % 9 === 0 ? "Gas" : "Diesel",
    vehicleHeight: isTractor ? "4.20 m" : "3.85 m",
    history: makeHistory(index, vrn, mileage),
  };
});

export function findVehicle(vrn: string | undefined) {
  if (!vrn) return undefined;
  return vehicleRecords.find((vehicle) => vehicle.vrn.toLowerCase() === decodeURIComponent(vrn).toLowerCase());
}
