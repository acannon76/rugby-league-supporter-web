
export const driverReportingSites = [
  "ABERDEEN VOC",
  "ATHERSTONE VOC",
  "BELFAST VOC",
  "BIRMINGHAM VOC",
  "BRIDGEND VOC",
  "CARLISLE VOC",
  "CHELMSFORD VOC",
  "CHORLEY VOC",
  "COVENTRY VOC",
  "CROYDON VOC",
  "EDINBURGH VOC",
  "ELDC VOC",
  "EMA VOC",
  "EXETER VOC",
  "GATWICK VOC",
  "GLASGOW VOC",
  "GREENFORD VOC",
  "HATFIELD VOC",
  "HWDC VOC",
  "INVERNESS VOC",
  "MANCHESTER VOC",
  "MIDLANDS SH VOC",
  "MK VOC",
  "NATIONAL PARCEL HUB",
  "NORTH EAST VOC",
  "NORTH WEST VOC",
  "NORWICH VOC",
  "PETERBOROUGH VOC",
  "PLYMOUTH VOC",
  "PRESTON VOC",
  "PRINCESS ROYAL VOC",
  "SCOTLAND VOC",
  "SOUTH EAST VOC",
  "SOUTH WEST VOC",
  "SOUTHAMPTON VOC",
  "STOURTON VOC",
  "SWINDON VOC",
  "WARRINGTON VOC",
  "WOKING VOC",
  "WOLVERHAMPTON VOC",
  "WRT VOC",
  "YORKSHIRE VOC",
] as const;

export type CoachingBand = "Priority coaching" | "Coaching review" | "Performing well";
export type AssuranceStatus = "Current" | "Due soon" | "Overdue";
export type ChangeoverStatus = "Complete" | "Review required";

export type DriverBehaviourRow = {
  id: string;
  employeeId: string;
  driverName: string;
  homeSite: string;
  region: string;
  duties: number;
  distanceMiles: number;
  drivingHours: number;
  vehiclesUsed: string[];
  harshAccelerationRate: number;
  harshBrakingRate: number;
  speedingRate: number;
  harshCorneringRate: number;
  idlingPercent: number;
  overRevvingRate: number;
  accelerationScore: number;
  brakingScore: number;
  speedScore: number;
  corneringScore: number;
  idlingScore: number;
  overRevvingScore: number;
  overallScore: number;
  coachingBand: CoachingBand;
  trainingStatus: AssuranceStatus;
  ssowStatus: AssuranceStatus;
  changeoverStatus: ChangeoverStatus;
  lastCoachingDate: string;
  nextReviewDate: string;
};

export type SiteBehaviourSummary = {
  site: string;
  region: string;
  drivers: number;
  overallScore: number;
  accelerationScore: number;
  brakingScore: number;
  speedScore: number;
  corneringScore: number;
  idlingScore: number;
  overRevvingScore: number;
  priorityDrivers: number;
  reviewDrivers: number;
};

const firstNames = [
  "Alex", "Amelia", "Ben", "Beth", "Callum", "Chloe", "Daniel", "Danielle",
  "Elliot", "Emma", "Farah", "George", "Grace", "Hannah", "Imran", "Jack",
  "Jade", "James", "Jordan", "Katie", "Lewis", "Lucy", "Marcus", "Megan",
  "Nathan", "Nicole", "Oliver", "Priya", "Ryan", "Samantha", "Thomas", "Zoe",
];

const surnames = [
  "Adams", "Baker", "Clarke", "Davies", "Edwards", "Foster", "Green", "Hall",
  "Iqbal", "Jones", "King", "Lewis", "Morris", "Nelson", "Owens", "Patel",
  "Quinn", "Roberts", "Singh", "Taylor", "Usher", "Vaughan", "Walker", "Young",
];

const registrations = [
  "MX71 ESN", "YX23 KVD", "PK72 LHF", "BD23 OXR", "SN72 UJP", "KT23 WLA",
  "NX71 RVO", "GF23 DME", "YP72 NCK", "WA23 HZT", "AJ72 PXM", "CV23 RKL",
];

export const behaviourMetricLabels = {
  accelerationScore: "Harsh acceleration",
  brakingScore: "Harsh braking",
  speedScore: "Speed compliance",
  corneringScore: "Cornering control",
  idlingScore: "Idling management",
  overRevvingScore: "Engine over-revving",
} as const;

export type BehaviourScoreKey = keyof typeof behaviourMetricLabels;

export const driverBehaviourRows: DriverBehaviourRow[] = driverReportingSites.flatMap((site, siteIndex) => {
  const driverCount = 4 + (siteIndex % 4);
  return Array.from({ length: driverCount }, (_, driverIndex) =>
    buildDriverBehaviourRow(site, siteIndex, driverIndex),
  );
});

export const nationalBehaviourSummary = summariseBehaviour(driverBehaviourRows);
export const siteBehaviourSummaries = buildSiteBehaviourSummaries(driverBehaviourRows);

export function buildSiteBehaviourSummaries(rows: DriverBehaviourRow[]): SiteBehaviourSummary[] {
  const grouped = new Map<string, DriverBehaviourRow[]>();
  rows.forEach((row) => grouped.set(row.homeSite, [...(grouped.get(row.homeSite) ?? []), row]));

  return [...grouped.entries()]
    .map(([site, siteRows]) => {
      const summary = summariseBehaviour(siteRows);
      return {
        site,
        region: getBehaviourRegion(site),
        drivers: siteRows.length,
        overallScore: summary.overallScore,
        accelerationScore: summary.accelerationScore,
        brakingScore: summary.brakingScore,
        speedScore: summary.speedScore,
        corneringScore: summary.corneringScore,
        idlingScore: summary.idlingScore,
        overRevvingScore: summary.overRevvingScore,
        priorityDrivers: siteRows.filter((row) => row.coachingBand === "Priority coaching").length,
        reviewDrivers: siteRows.filter((row) => row.coachingBand === "Coaching review").length,
      };
    })
    .sort((a, b) => a.site.localeCompare(b.site));
}

export function summariseBehaviour(rows: DriverBehaviourRow[]) {
  return {
    overallScore: average(rows.map((row) => row.overallScore)),
    accelerationScore: average(rows.map((row) => row.accelerationScore)),
    brakingScore: average(rows.map((row) => row.brakingScore)),
    speedScore: average(rows.map((row) => row.speedScore)),
    corneringScore: average(rows.map((row) => row.corneringScore)),
    idlingScore: average(rows.map((row) => row.idlingScore)),
    overRevvingScore: average(rows.map((row) => row.overRevvingScore)),
  };
}

export function coachingFocus(row: DriverBehaviourRow) {
  const metrics: { key: BehaviourScoreKey; score: number; label: string }[] = [
    { key: "accelerationScore", score: row.accelerationScore, label: "Harsh acceleration" },
    { key: "brakingScore", score: row.brakingScore, label: "Harsh braking" },
    { key: "speedScore", score: row.speedScore, label: "Speed compliance" },
    { key: "corneringScore", score: row.corneringScore, label: "Cornering control" },
    { key: "idlingScore", score: row.idlingScore, label: "Idling management" },
    { key: "overRevvingScore", score: row.overRevvingScore, label: "Engine over-revving" },
  ];
  return metrics.sort((a, b) => a.score - b.score);
}

export function scoreTone(score: number) {
  if (score >= 85) return "green" as const;
  if (score >= 70) return "amber" as const;
  return "red" as const;
}

function buildDriverBehaviourRow(site: string, siteIndex: number, driverIndex: number): DriverBehaviourRow {
  const seed = siteIndex * 29 + driverIndex * 17 + 11;
  const firstName = firstNames[(siteIndex * 3 + driverIndex * 5) % firstNames.length];
  const surname = surnames[(siteIndex * 5 + driverIndex * 7) % surnames.length];
  const employeeId = `D${String(11000 + siteIndex * 11 + driverIndex).padStart(5, "0")}`;
  const duties = 7 + (seed % 18);
  const distanceMiles = roundOne(620 + ((seed * 97) % 3150));
  const drivingHours = roundOne(Math.max(12, distanceMiles / (31 + (seed % 18))));

  // Rates are normalised so the dashboard compares driver-controllable behaviours
  // rather than raw totals. This avoids automatically favouring drivers who simply
  // complete fewer miles or different duty lengths.
  const harshAccelerationRate = roundTwo(0.25 + ((seed * 13) % 380) / 100);
  const harshBrakingRate = roundTwo(0.2 + ((seed * 17) % 340) / 100);
  const speedingRate = roundTwo(0.05 + ((seed * 19) % 245) / 100);
  const harshCorneringRate = roundTwo(0.15 + ((seed * 23) % 330) / 100);
  const idlingPercent = roundOne(3 + ((seed * 7) % 125) / 10);
  const overRevvingRate = roundTwo(0.1 + ((seed * 11) % 270) / 100);

  const accelerationScore = rateToScore(harshAccelerationRate, 8.5);
  const brakingScore = rateToScore(harshBrakingRate, 9.5);
  const speedScore = rateToScore(speedingRate, 13);
  const corneringScore = rateToScore(harshCorneringRate, 9);
  const idlingScore = clampScore(100 - Math.max(0, idlingPercent - 3) * 4.2);
  const overRevvingScore = rateToScore(overRevvingRate, 10.5);

  const overallScore = clampScore(
    accelerationScore * 0.15 +
      brakingScore * 0.25 +
      speedScore * 0.2 +
      corneringScore * 0.15 +
      idlingScore * 0.1 +
      overRevvingScore * 0.15,
  );

  const lowestScore = Math.min(
    accelerationScore,
    brakingScore,
    speedScore,
    corneringScore,
    idlingScore,
    overRevvingScore,
  );
  const coachingBand: CoachingBand =
    overallScore < 70 || lowestScore < 55
      ? "Priority coaching"
      : overallScore < 83 || lowestScore < 72
        ? "Coaching review"
        : "Performing well";

  const trainingRoll = (seed * 5) % 23;
  const ssowRoll = (seed * 7) % 29;
  const changeoverRoll = (seed * 11) % 31;
  const trainingStatus: AssuranceStatus = trainingRoll === 0 ? "Overdue" : trainingRoll < 4 ? "Due soon" : "Current";
  const ssowStatus: AssuranceStatus = ssowRoll === 0 ? "Overdue" : ssowRoll < 5 ? "Due soon" : "Current";
  const changeoverStatus: ChangeoverStatus = changeoverRoll < 4 ? "Review required" : "Complete";

  const vehicleCount = 2 + (seed % 4);
  const vehiclesUsed = Array.from({ length: vehicleCount }, (_, vehicleIndex) => {
    const unit = String(310 + ((siteIndex * 7 + driverIndex * 13 + vehicleIndex * 5) % 640)).padStart(3, "0");
    const registration = registrations[(siteIndex + driverIndex + vehicleIndex) % registrations.length];
    return `${siteCode(site)}${unit} ${registration}`;
  });

  const lastCoachingDate = mockDateFromSeed(seed, 12 + (seed % 70));
  const nextReviewDate = mockDateFromSeed(seed + 3, -(10 + (seed % 60)));

  return {
    id: `driver-${siteIndex}-${driverIndex}`,
    employeeId,
    driverName: `${firstName} ${surname}`,
    homeSite: site,
    region: getBehaviourRegion(site),
    duties,
    distanceMiles,
    drivingHours,
    vehiclesUsed,
    harshAccelerationRate,
    harshBrakingRate,
    speedingRate,
    harshCorneringRate,
    idlingPercent,
    overRevvingRate,
    accelerationScore,
    brakingScore,
    speedScore,
    corneringScore,
    idlingScore,
    overRevvingScore,
    overallScore,
    coachingBand,
    trainingStatus,
    ssowStatus,
    changeoverStatus,
    lastCoachingDate,
    nextReviewDate,
  };
}

function rateToScore(rate: number, multiplier: number) {
  return clampScore(100 - rate * multiplier);
}

function clampScore(value: number) {
  return Math.max(35, Math.min(99, Math.round(value)));
}

function average(values: number[]) {
  if (!values.length) return 0;
  return Math.round((values.reduce((sum, value) => sum + value, 0) / values.length) * 10) / 10;
}

function roundOne(value: number) {
  return Math.round(value * 10) / 10;
}

function roundTwo(value: number) {
  return Math.round(value * 100) / 100;
}

function getBehaviourRegion(site: string) {
  const value = site.toUpperCase();
  if (/(ABERDEEN|EDINBURGH|GLASGOW|INVERNESS|SCOTLAND)/.test(value)) return "Scotland";
  if (/BELFAST/.test(value)) return "Northern Ireland";
  if (/(CARLISLE|CHORLEY|MANCHESTER|NORTH EAST|NORTH WEST|PRESTON|WARRINGTON|WRT|YORKSHIRE)/.test(value)) return "North";
  if (/(ATHERSTONE|BIRMINGHAM|COVENTRY|EMA|MIDLANDS|MK|WOLVERHAMPTON)/.test(value)) return "Midlands";
  if (/(BRIDGEND|EXETER|PLYMOUTH|SOUTH WEST|SOUTHAMPTON|SWINDON)/.test(value)) return "South West & Wales";
  if (/(CHELMSFORD|CROYDON|ELDC|GATWICK|GREENFORD|HATFIELD|HWDC|NORWICH|PETERBOROUGH|PRINCESS ROYAL|SOUTH EAST|STOURTON|WOKING)/.test(value)) return "London & South East";
  return "National / Other";
}

function siteCode(site: string) {
  const words = site.replace(/\([^)]*\)/g, " ").split(/\s+/).filter(Boolean);
  const code = words.map((word) => word[0]).join("").toUpperCase().slice(0, 4);
  return code || "VEH";
}

function mockDateFromSeed(seed: number, daysAgo: number) {
  const date = new Date(Date.UTC(2026, 8, 3, 12, 0, 0));
  date.setUTCDate(date.getUTCDate() - daysAgo);
  date.setUTCDate(date.getUTCDate() - (seed % 4));
  return date.toISOString().slice(0, 10);
}
