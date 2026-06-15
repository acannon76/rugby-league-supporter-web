import CategoryCheckPage from "../CategoryCheckPage";

const checks = [
  { number: 1, title: "Faulty trailer connection" },
  { number: 2, title: "Unsafe 5th wheel connection" },
  { number: 3, title: "Trailer insecure" },
  { number: 4, title: "Trailer legs not stowed" },
  { number: 5, title: "Air or electrical lines disconnected" },
  { number: 6, title: "Trailer number plate missing" },
  { number: 7, title: "Coupling locking fault" },
];

export default function TrailerCouplingDefectsPage() {
  return (
    <CategoryCheckPage
      categoryNumber={5}
      categoryTitle="Trailer & Coupling Defects"
      checks={checks}
      storageKeyPrefix="hgv-trailer-coupling-defects"
    />
  );
}