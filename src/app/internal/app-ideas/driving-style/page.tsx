import Link from "next/link";
import DriverName from "../../DriverName";
import VehicleCheckTimer from "../../vehicle-checks/VehicleCheckTimer";

type DrivingMetric = {
  title: string;
  dutyStartValue: number;
  sevenDayValue: number;
  note: string;
  rating: "Good" | "Watch" | "Improve";
};

const drivingMetrics: DrivingMetric[] = [
  {
    title: "Smooth acceleration",
    dutyStartValue: 88,
    sevenDayValue: 84,
    note: "Good throttle control with minimal harsh pull-away events.",
    rating: "Good",
  },
  {
    title: "Harsh braking",
    dutyStartValue: 76,
    sevenDayValue: 81,
    note: "A few sharper braking events detected; increase distance where possible.",
    rating: "Watch",
  },
  {
    title: "Speed compliance",
    dutyStartValue: 94,
    sevenDayValue: 91,
    note: "Very strong speed control across the journey.",
    rating: "Good",
  },
  {
    title: "Cornering control",
    dutyStartValue: 82,
    sevenDayValue: 85,
    note: "Generally smooth with one tighter cornering event recorded.",
    rating: "Good",
  },
  {
    title: "Idling management",
    dutyStartValue: 68,
    sevenDayValue: 72,
    note: "Idle time higher than expected during depot waiting time.",
    rating: "Watch",
  },
  {
    title: "Fuel efficient driving",
    dutyStartValue: 86,
    sevenDayValue: 83,
    note: "Good steady driving pattern and efficient gear use.",
    rating: "Good",
  },
  {
    title: "Engine over-revving",
    dutyStartValue: 91,
    sevenDayValue: 89,
    note: "Very low number of over-revving events.",
    rating: "Good",
  },
  {
    title: "Reversing events",
    dutyStartValue: 79,
    sevenDayValue: 82,
    note: "Normal level of reversing activity for depot work.",
    rating: "Watch",
  },
  {
    title: "Defensive driving",
    dutyStartValue: 90,
    sevenDayValue: 87,
    note: "Good anticipation and stable journey profile.",
    rating: "Good",
  },
  {
    title: "Overall journey score",
    dutyStartValue: 84,
    sevenDayValue: 85,
    note: "Strong overall driving style score for this mock duty.",
    rating: "Good",
  },
];

export default function DrivingStylePage() {
  return (
    <main className="min-h-screen bg-[#f4f1ec] font-sans text-[#001b3a]">
      <header className="bg-[#c4002f] px-4 py-5 text-white sm:px-6 lg:px-10">
        <div className="mx-auto flex max-w-[1280px] flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border-2 border-white text-base font-black">
              HGV
            </div>

            <div>
              <h1 className="text-xl font-black leading-none sm:text-2xl">
                Driving Style
              </h1>
              <p className="text-sm font-black leading-none sm:text-base">
                DriverOS Concept
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:ml-auto sm:flex-row sm:items-center">
            <VehicleCheckTimer />

            <div className="rounded-2xl border border-white/30 bg-white/10 px-5 py-3 text-right">
              <p className="text-xs font-black uppercase tracking-[0.16em]">
                Driver
              </p>
              <p className="text-base font-black"><DriverName /></p>
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

      <section className="px-4 py-7 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-[1280px]">
          <section className="rounded-[28px] border border-[#d0d7df] bg-white p-6 shadow-sm">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#c4002f]">
              Mock driving behaviour report
            </p>

            <h2 className="mt-3 text-4xl font-black leading-tight text-[#001b3a] sm:text-5xl">
              Driving style summary
            </h2>

            <p className="mt-4 max-w-[780px] text-base font-bold leading-7 text-[#61748b]">
              Compare performance from the start of the current duty with the rolling
              7-day score to quickly identify strengths and behaviours needing attention.
            </p>
          </section>

          <section className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-2">
            {drivingMetrics.map((metric) => (
              <DrivingMetricCard key={metric.title} metric={metric} />
            ))}
          </section>
        </div>
      </section>
    </main>
  );
}

function DrivingMetricCard({ metric }: { metric: DrivingMetric }) {
  const ratingClasses =
    metric.rating === "Good"
      ? "border-[#067a35] bg-[#d9f7e5] text-[#067a35]"
      : metric.rating === "Watch"
      ? "border-[#f59e0b] bg-[#fff7ed] text-[#92400e]"
      : "border-[#c4002f] bg-[#fff0f2] text-[#c4002f]";

  return (
    <article className="rounded-[24px] border border-[#d0d7df] bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-2xl font-black text-[#001b3a]">
            {metric.title}
          </h3>
          <p className="mt-2 text-sm font-bold leading-6 text-[#61748b]">
            {metric.note}
          </p>
        </div>

        <span
          className={`shrink-0 rounded-full border px-3 py-2 text-xs font-black uppercase tracking-[0.14em] ${ratingClasses}`}
        >
          {metric.rating}
        </span>
      </div>

      <div className="mt-5 space-y-3">
        <DrivingScoreBar label="Duty Start" value={metric.dutyStartValue} />
        <DrivingScoreBar label="7 Days" value={metric.sevenDayValue} />
      </div>
    </article>
  );
}


function DrivingScoreBar({ label, value }: { label: string; value: number }) {
  const barColour =
    value >= 85 ? "#067a35" : value >= 70 ? "#f59e0b" : "#c4002f";

  return (
    <div className="grid grid-cols-[88px_1fr_54px] items-center gap-3">
      <p className="text-xs font-black uppercase tracking-[0.1em] text-[#61748b]">
        {label}
      </p>
      <div className="h-4 overflow-hidden rounded-full bg-[#e5e7eb]">
        <div
          className="h-full rounded-full transition-[width]"
          style={{ width: `${value}%`, backgroundColor: barColour }}
        />
      </div>
      <p className="text-right text-lg font-black text-[#001b3a]">{value}%</p>
    </div>
  );
}
