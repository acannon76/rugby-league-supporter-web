import CategoryCheckPage from "../CategoryCheckPage";

const checks = [
  { number: 1, title: "Seat belt defective" },
  { number: 2, title: "Emergency stop not working" },
  { number: 3, title: "Fire extinguisher missing" },
  { number: 4, title: "Emergency exits blocked" },
  { number: 5, title: "Driver safety systems defective" },
  { number: 6, title: "Fork-lift seat cut-out defective" },
];

export default function SafetyEquipmentEmergencySystemsPage() {
  return (
    <CategoryCheckPage
      categoryNumber={9}
      categoryTitle="Safety Equipment & Emergency Systems"
      checks={checks}
      storageKeyPrefix="hgv-safety-equipment-emergency-systems"
    />
  );
}