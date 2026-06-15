import CategoryCheckPage from "../CategoryCheckPage";

const checks = [
  { number: 1, title: "Tyres below legal tread depth" },
  { number: 2, title: "Bulges, cuts or exposed cords" },
  { number: 3, title: "Unsafe tyre pressures" },
  { number: 4, title: "Loose or missing wheel nuts" },
  { number: 5, title: "Damaged wheels" },
  { number: 6, title: "Unsafe trailer tyres" },
  { number: 7, title: "Suspension defects affecting safety" },
];

export default function TyresWheelsSuspensionPage() {
  return (
    <CategoryCheckPage
      categoryNumber={3}
      categoryTitle="Tyres, Wheels & Suspension"
      checks={checks}
      storageKeyPrefix="hgv-tyres-wheels-suspension"
    />
  );
}