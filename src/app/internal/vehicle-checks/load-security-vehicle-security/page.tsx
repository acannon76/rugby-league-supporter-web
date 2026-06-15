import CategoryCheckPage from "../CategoryCheckPage";

const checks = [
  { number: 1, title: "Load insecure" },
  { number: 2, title: "Damaged or missing restraint straps" },
  { number: 3, title: "Risk of falling load" },
  { number: 4, title: "Doors insecure" },
  { number: 5, title: "Vehicle cannot be secured" },
  { number: 6, title: "Mail or load security risk" },
];

export default function LoadSecurityVehicleSecurityPage() {
  return (
    <CategoryCheckPage
      categoryNumber={6}
      categoryTitle="Load Security & Vehicle Security"
      checks={checks}
      storageKeyPrefix="hgv-load-security-vehicle-security"
    />
  );
}