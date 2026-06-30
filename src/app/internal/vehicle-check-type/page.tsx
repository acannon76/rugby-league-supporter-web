"use client";

import Link from "next/link";
import VehicleCheckTimer, { startVehicleCheckTimer } from "../vehicle-checks/VehicleCheckTimer";

const driverName = "Andrew Cannon";

export default function VehicleCheckTypePage() {
  return (
    <main className="min-h-screen bg-[#f4f1ec] font-sans text-[#111]">
      <header className="border-b border-white/20 bg-[#b00020] px-4 py-4 text-white sm:px-6 lg:px-10">
        <div className="mx-auto flex max-w-[900px] flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border-2 border-white bg-[#7d0017] text-lg font-black text-white">
              HGV
            </div>

            <div>
              <p className="text-lg font-black leading-none text-white">
                Check Type
              </p>
              <p className="text-sm font-black leading-none text-[#ffd9df]">
                Driver PDA Concept
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:ml-auto sm:flex-row sm:items-center">
            <VehicleCheckTimer />

            <div className="rounded-2xl border border-white/30 bg-white/10 px-4 py-2">
              <p className="text-xs font-black uppercase tracking-widest text-[#ffd9df]">
                Driver
              </p>
              <p className="text-base font-black text-white">{driverName}</p>
            </div>

            <Link
              href="/internal/app-ideas"
              className="text-sm font-black text-white no-underline"
            >
              Back
            </Link>
          </div>
        </div>
      </header>

      <section className="bg-[#b00020] px-4 py-6 text-white sm:px-6 lg:px-10">
        <div className="mx-auto max-w-[900px]">
          <p className="mb-3 text-xs font-black uppercase tracking-[0.22em] text-[#ffd9df]">
            Vehicle checks
          </p>

          <h1 className="text-[42px] font-black leading-[0.95] sm:text-[64px]">
            Check Type
          </h1>

          <p className="mt-4 max-w-[720px] text-sm font-bold leading-6 text-[#ffecef] sm:text-base">
            Select the vehicle check type. Motive Unit is active in this mockup;
            Rigid Vehicle and Trailers have been added ready for future build-out.
          </p>
        </div>
      </section>

      <section className="px-4 py-7 sm:px-6 lg:px-10">
        <div className="mx-auto grid max-w-[900px] grid-cols-1 gap-5 md:grid-cols-3">
          <Link
            href="/internal/vehicle-history"
            onClick={startVehicleCheckTimer}
            className="group flex min-h-[220px] flex-col rounded-[28px] border border-[#d0d7df] bg-white p-6 text-left text-[#001b3a] no-underline shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
          >
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-3xl bg-[#c4002f] text-2xl font-black text-white">
              1
            </div>

            <h2 className="text-3xl font-black leading-tight">Motive Unit</h2>

            <p className="mt-5 text-base font-bold leading-7 text-[#61748b]">
              Open the existing vehicle history and daily check mockup.
            </p>

            <div className="mt-auto pt-8 text-xs font-black uppercase tracking-[0.16em] text-[#c4002f]">
              Open <span className="transition group-hover:translate-x-1">→</span>
            </div>
          </Link>

          <button
            type="button"
            disabled
            className="flex min-h-[220px] cursor-not-allowed flex-col rounded-[28px] border border-[#d0d7df] bg-white p-6 text-left text-[#001b3a] opacity-80 shadow-sm"
          >
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-3xl bg-[#c4002f] text-2xl font-black text-white">
              2
            </div>

            <h2 className="text-3xl font-black leading-tight">Rigid Vehicle</h2>

            <p className="mt-5 text-base font-bold leading-7 text-[#61748b]">
              Button added for the future rigid vehicle check journey.
            </p>

            <div className="mt-auto pt-8 text-xs font-black uppercase tracking-[0.16em] text-[#c4002f]">
              To be added
            </div>
          </button>

          <button
            type="button"
            disabled
            className="flex min-h-[220px] cursor-not-allowed flex-col rounded-[28px] border border-[#d0d7df] bg-white p-6 text-left text-[#001b3a] opacity-80 shadow-sm"
          >
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-3xl bg-[#c4002f] text-2xl font-black text-white">
              3
            </div>

            <h2 className="text-3xl font-black leading-tight">Trailers</h2>

            <p className="mt-5 text-base font-bold leading-7 text-[#61748b]">
              Button added for the future trailer check journey.
            </p>

            <div className="mt-auto pt-8 text-xs font-black uppercase tracking-[0.16em] text-[#c4002f]">
              To be added
            </div>
          </button>
        </div>
      </section>
    </main>
  );
}
