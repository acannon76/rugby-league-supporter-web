import CategoryCheckPage from "../CategoryCheckPage";

const checks = [
  {
    number: 1,
    title: "Brake pedal not operating correctly",
  },
  {
    number: 2,
    title: "Handbrake not holding vehicle",
  },
  {
    number: 3,
    title: "Weak or failed brakes",
  },
  {
    number: 4,
    title: "Brake warning lights",
  },
  {
    number: 5,
    title: "Brake fluid leaks",
  },
  {
    number: 6,
    title: "Air brake pressure faults",
  },
  {
    number: 7,
    title: "Hydraulic brake defects",
  },
  {
    number: 8,
    title: "Fork-lift or pallet truck brake failure",
  },
];

export default function BrakeSystemDefectsPage() {
  return (
    <CategoryCheckPage
      categoryNumber={1}
      categoryTitle="Brake System Defects"
      checks={checks}
      storageKeyPrefix="hgv-brake-system-defects"
    />
  );
}