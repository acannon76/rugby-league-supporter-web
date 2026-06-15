import CategoryCheckPage from "../CategoryCheckPage";

const checks = [
  { number: 1, title: "Headlights not working" },
  { number: 2, title: "Brake lights defective" },
  { number: 3, title: "Indicators defective" },
  { number: 4, title: "Trailer lights not working" },
  { number: 5, title: "Mirrors damaged or missing" },
  { number: 6, title: "Windscreen damage affecting vision" },
  { number: 7, title: "Wipers or washers not operating" },
  { number: 8, title: "Horn not working" },
];

export default function LightsVisibilityWarningDevicesPage() {
  return (
    <CategoryCheckPage
      categoryNumber={4}
      categoryTitle="Lights, Visibility & Warning Devices"
      checks={checks}
      storageKeyPrefix="hgv-lights-visibility-warning-devices"
    />
  );
}