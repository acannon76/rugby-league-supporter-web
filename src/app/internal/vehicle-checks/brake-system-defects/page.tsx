import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Brake System Defects",
  description: "Hidden HGV vehicle check mockup page.",
  robots: {
    index: false,
    follow: false,
  },
};

const brakeChecks = [
  "Air pressure warning system",
  "Service brake operation",
  "Parking brake operation",
  "Brake pedal feel",
  "Brake lines or visible damage",
  "Air leaks or pressure loss",
];

export default function BrakeSystemDefectsPage() {
  return (
    <main className="min-h-screen bg-[#f4f1ec] font-sans text-[#111]">
      <header className="border-b border-white/20 bg-[#b00020] px-4 py-4 text-white sm:px-6 lg:px-10">
        <div className="mx-auto flex max-w-[900px] items-center justify-between gap-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border-2 border-white bg-[#7d0017] text-lg font-black text-white">
              1
            </div>

            <div>
              <p className="text-lg font-black leading-none text-white">
                Brake System Defects
              </p>
              <p className="text-sm font-black leading-none text-[#ffd9df]">
                Vehicle Checks
              </p>
            </div>
          </div>

          <Link
            href="/internal/vehicle-checks"
            className="text-sm font-black text-white no-underline"
          >
            Back
          </Link>
        </div>
      </header>

      <section className="bg-[#b00020] px-4 py-7 text-white sm:px-6 lg:px-10">
        <div className="mx-auto max-w-[900px]">
          <p className="mb-3 text-xs font-black uppercase tracking-[0.22em] text-[#ffd9df]">
            Vehicle check category 1
          </p>

          <h1 className="text-[42px] font-black leading-[0.95] sm:text-[64px]">
            Brake System Defects
          </h1>

          <p className="mt-4 max-w-[720px] text-sm font-bold leading-6 text-[#ffecef] sm:text-base">
            Mockup screen for brake-related checks and defect reporting.
          </p>
        </div>
      </section>

      <section className="px-4 py-6 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-[900px] space-y-4">
          {brakeChecks.map((check, index) => (
            <section
              key={check}
              className="rounded-[24px] border border-[#d6dce5] bg-white p-5 shadow-sm"
            >
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#b00020]">
                Check {index + 1}
              </p>

              <h2 className="mt-2 text-2xl font-black text-[#18243a]">
                {check}
              </h2>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <button className="rounded-2xl bg-[#078a3d] px-4 py-3 text-sm font-black text-white">
                  OK
                </button>

                <button className="rounded-2xl bg-[#b00020] px-4 py-3 text-sm font-black text-white">
                  Defect
                </button>
              </div>
            </section>
          ))}
        </div>
      </section>
    </main>
  );
}