import CategoryCheckPage from "../CategoryCheckPage";

const checks = [
  { number: 1, title: "Dangerous bodywork damage" },
  { number: 2, title: "Sharp or protruding panels" },
  { number: 3, title: "Unsafe floors or trip hazards" },
  { number: 4, title: "Security cage damage" },
  { number: 5, title: "Severe vehicle damage after collision" },
  { number: 6, title: "Unsafe cleanliness affecting operation" },
  { number: 7, title: "Structural defects affecting safe use" },
];

export default function StructuralGeneralVehicleConditionPage() {
  return (
    <CategoryCheckPage
      categoryNumber={10}
      categoryTitle="Structural & General Vehicle Condition"
      checks={checks}
      storageKeyPrefix="hgv-structural-general-vehicle-condition"
    />
  );
}