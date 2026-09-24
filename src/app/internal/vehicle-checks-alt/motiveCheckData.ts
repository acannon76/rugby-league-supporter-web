export type MotiveCheckStatus = "none" | "ok" | "vehicleIssue" | "defect";

export type MotiveCategory = {
  number: number;
  title: string;
  storageKeyPrefix: string;
  checks: { number: number; title: string }[];
};

export type MotiveAnswer = {
  status: MotiveCheckStatus;
  description: string;
  photoName: string;
  photoDataUrl?: string;
};

export type MotiveAnswers = Record<string, MotiveAnswer>;
export const motiveAnswersStorageKey = "hgv-inline-motive-check-answers";
export const motiveLogbookHistoryStorageKey = "hgv-inline-motive-logbook-history";

export const motiveCheckCategories: MotiveCategory[] = [
  {
    number: 1,
    title: "Brake System Defects",
    storageKeyPrefix: "hgv-backup2-brake-system-defects",
    checks: [
      { number: 1, title: "Brake pedal not operating correctly" },
      { number: 2, title: "Handbrake not holding vehicle" },
      { number: 3, title: "Weak or failed brakes" },
      { number: 4, title: "Brake warning lights" },
      { number: 5, title: "Brake fluid leaks" },
      { number: 6, title: "Air brake pressure faults" },
      { number: 7, title: "Hydraulic brake defects" },
      { number: 8, title: "Fork-lift or pallet truck brake failure" },
    ],
  },
  {
    number: 2,
    title: "Steering & Controls",
    storageKeyPrefix: "hgv-backup2-steering-controls",
    checks: [
      { number: 1, title: "Excessive steering free play" },
      { number: 2, title: "Steering pulling badly" },
      { number: 3, title: "Steering locking or stiffness" },
      { number: 4, title: "Defective hydraulic steering controls" },
      { number: 5, title: "Loss of vehicle control" },
    ],
  },
  {
    number: 3,
    title: "Tyres Wheels & Suspension",
    storageKeyPrefix: "hgv-backup2-tyres-wheels-suspension",
    checks: [
      { number: 1, title: "Tyres below legal tread depth" },
      { number: 2, title: "Bulges, cuts or exposed cords" },
      { number: 3, title: "Unsafe tyre pressures" },
      { number: 4, title: "Loose or missing wheel nuts" },
      { number: 5, title: "Damaged wheels" },
      { number: 6, title: "Unsafe trailer tyres" },
      { number: 7, title: "Suspension defects affecting safety" },
    ],
  },
  {
    number: 4,
    title: "Light, Visibility & Warning Devices",
    storageKeyPrefix: "hgv-backup2-lights-visibility-warning-devices",
    checks: [
      { number: 1, title: "Headlights not working" },
      { number: 2, title: "Brake lights defective" },
      { number: 3, title: "Indicators defective" },
      { number: 4, title: "Trailer lights not working" },
      { number: 5, title: "Mirrors damaged or missing" },
      { number: 6, title: "Windscreen damage affecting vision" },
      { number: 7, title: "Wipers or washers not operating" },
      { number: 8, title: "Horn not working" },
    ],
  },
  {
    number: 5,
    title: "Trailer & Coupling Checks",
    storageKeyPrefix: "hgv-backup2-trailer-coupling-defects",
    checks: [
      { number: 1, title: "Faulty trailer connection" },
      { number: 2, title: "Unsafe 5th wheel connection" },
      { number: 3, title: "Trailer insecure" },
      { number: 4, title: "Trailer legs not stowed" },
      { number: 5, title: "Air or electrical lines disconnected" },
      { number: 6, title: "Trailer number plate missing" },
      { number: 7, title: "Coupling locking fault" },
    ],
  },
  {
    number: 6,
    title: "Load Security & Vehicle Security",
    storageKeyPrefix: "hgv-backup2-load-security-vehicle-security",
    checks: [
      { number: 1, title: "Load insecure" },
      { number: 2, title: "Damaged or missing restraint straps" },
      { number: 3, title: "Risk of falling load" },
      { number: 4, title: "Doors insecure" },
      { number: 5, title: "Vehicle cannot be secured" },
      { number: 6, title: "Mail or load security risk" },
    ],
  },
  {
    number: 7,
    title: "Fluid Leaks & Mech Failures",
    storageKeyPrefix: "hgv-backup2-fluid-leaks-mechanical-failures",
    checks: [
      { number: 1, title: "Fuel leaks" },
      { number: 2, title: "Oil leaks" },
      { number: 3, title: "Coolant leaks" },
      { number: 4, title: "Hydraulic leaks" },
      { number: 5, title: "Overheating engine" },
      { number: 6, title: "Serious engine defects" },
      { number: 7, title: "Air leaks affecting braking systems" },
    ],
  },
  {
    number: 8,
    title: "Legal & Compliance",
    storageKeyPrefix: "hgv-backup2-legal-compliance-failures",
    checks: [
      { number: 1, title: "Road fund licence expired or missing" },
      { number: 2, title: "O licence missing" },
      { number: 3, title: "Vehicle inspection or service overdue" },
      { number: 4, title: "Vehicle height not displayed in cab" },
      { number: 5, title: "Vehicle declared unroadworthy" },
      { number: 6, title: "Mandatory defect reporting not completed" },
    ],
  },
  {
    number: 9,
    title: "Safety Equipment & Emergency Systems",
    storageKeyPrefix: "hgv-backup2-safety-equipment-emergency-systems",
    checks: [
      { number: 1, title: "Seat belt defective" },
      { number: 2, title: "Emergency stop not working" },
      { number: 3, title: "Fire extinguisher missing" },
      { number: 4, title: "Emergency exits blocked" },
      { number: 5, title: "Driver safety systems defective" },
      { number: 6, title: "Fork-lift seat cut-out defective" },
    ],
  },
  {
    number: 10,
    title: "Structural & General Condition",
    storageKeyPrefix: "hgv-backup2-structural-general-vehicle-condition",
    checks: [
      { number: 1, title: "Dangerous bodywork damage" },
      { number: 2, title: "Sharp or protruding panels" },
      { number: 3, title: "Unsafe floors or trip hazards" },
      { number: 4, title: "Security cage damage" },
      { number: 5, title: "Severe vehicle damage after collision" },
      { number: 6, title: "Unsafe cleanliness affecting operation" },
      { number: 7, title: "Structural defects affecting safe use" },
    ],
  },
];
