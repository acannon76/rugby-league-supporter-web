import CategoryCheckPage from "../CategoryCheckPage";

const checks = [
  { number: 1, title: "Excessive steering free play" },
  { number: 2, title: "Steering pulling badly" },
  { number: 3, title: "Steering locking or stiffness" },
  { number: 4, title: "Defective hydraulic steering controls" },
  { number: 5, title: "Loss of vehicle control" },
];

export default function SteeringControlsPage() {
  return (
    <CategoryCheckPage
      categoryNumber={2}
      categoryTitle="Steering & Controls"
      checks={checks}
      storageKeyPrefix="hgv-steering-controls"
    />
  );
}