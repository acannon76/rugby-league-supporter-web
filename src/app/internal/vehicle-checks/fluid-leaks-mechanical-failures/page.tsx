import CategoryCheckPage from "../CategoryCheckPage";

const checks = [
  { number: 1, title: "Fuel leaks" },
  { number: 2, title: "Oil leaks" },
  { number: 3, title: "Coolant leaks" },
  { number: 4, title: "Hydraulic leaks" },
  { number: 5, title: "Overheating engine" },
  { number: 6, title: "Serious engine defects" },
  { number: 7, title: "Air leaks affecting braking systems" },
];

export default function FluidLeaksMechanicalFailuresPage() {
  return (
    <CategoryCheckPage
      categoryNumber={7}
      categoryTitle="Fluid Leaks & Mechanical Failures"
      checks={checks}
      storageKeyPrefix="hgv-fluid-leaks-mechanical-failures"
    />
  );
}