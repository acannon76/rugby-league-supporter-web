import CategoryCheckPage from "../CategoryCheckPage";

const checks = [
  { number: 1, title: "Road fund licence expired or missing" },
  { number: 2, title: "O licence missing" },
  { number: 3, title: "Vehicle inspection or service overdue" },
  { number: 4, title: "Vehicle height not displayed in cab" },
  { number: 5, title: "Vehicle declared unroadworthy" },
  { number: 6, title: "Mandatory defect reporting not completed" },
];

export default function LegalComplianceFailuresPage() {
  return (
    <CategoryCheckPage
      categoryNumber={8}
      categoryTitle="Legal & Compliance Failures"
      checks={checks}
      storageKeyPrefix="hgv-legal-compliance-failures"
    />
  );
}