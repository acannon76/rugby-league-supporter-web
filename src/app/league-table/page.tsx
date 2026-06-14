import Link from "next/link";
import {
  leagueTableData,
  type LeagueTableRow,
} from "@/data/leagueTableData";

export default function LeagueTablePage() {
  const sortedTable = [...leagueTableData].sort(
    (a, b) => a.position - b.position
  );

  const leader = sortedTable[0];
  const bestPointsDifference = [...sortedTable].sort(
    (a, b) => getPointsDifference(b) - getPointsDifference(a)
  )[0];

  return (
    <main className="min-h-screen bg-[#eef1f5] font-sans text-[#111]">
      <SiteHeader />

      <section className="bg-[#18243a] px-4 py-8 text-white sm:px-6 lg:px-10 lg:py-12">
        <div className="mx-auto grid max-w-[1180px] gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div>
            <p className="mb-4 text-xs font-black uppercase tracking-[0.22em] text-[#35d6b4]">
              Standings
            </p>

            <h1 className="max-w-[760px] text-[46px] font-black leading-[0.98] sm:text-[66px] lg:text-[82px]">
              League Table
            </h1>

            <p className="mt-5 max-w-[700px] text-base font-bold leading-7 text-[#dce4f0] sm:text-lg">
              Current standings, wins, losses, points scored, points conceded
              and points difference.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="/fixtures"
                className="rounded-full bg-[#35d6b4] px-5 py-3 text-sm font-black text-[#111827] no-underline"
              >
                View Fixtures
              </Link>

              <Link
                href="/results"
                className="rounded-full border-2 border-white px-5 py-3 text-sm font-black text-white no-underline"
              >
                Results
              </Link>
            </div>
          </div>

          <HeroStandingsCard leader={leader} bestDiff={bestPointsDifference} />
        </div>
      </section>

      <section className="px-4 py-6 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-[1180px]">
          

          <SectionHeading
            eyebrow="Standings"
            title="Super League Table"
            text="Phone view is compact for quick checking. Tablet and desktop show the full table."
          />

          <MobileLeagueTable rows={sortedTable} />

          <DesktopLeagueTable rows={sortedTable} />

          
        </div>
      </section>
    </main>
  );
}

function SiteHeader() {
  return (
    <header className="border-b border-white/10 bg-[#18243a] px-4 py-4 text-white sm:px-6 lg:px-10">
      <div className="mx-auto flex max-w-[1180px] items-center justify-between gap-5">
        <Link href="/" className="flex items-center gap-3 no-underline">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border-2 border-[#35d6b4] bg-[#111827] text-lg font-black text-white">
            RL
          </div>

          <div>
            <p className="text-lg font-black leading-none text-white">
              Rugby League
            </p>
            <p className="text-sm font-black leading-none text-[#35d6b4]">
              Supporter Guide
            </p>
          </div>
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-black md:flex">
          <Link href="/fixtures" className="text-white no-underline">
            Fixtures
          </Link>
          <Link href="/results" className="text-white no-underline">
            Results
          </Link>
          <Link href="/league-table" className="text-[#35d6b4] no-underline">
            League Table
          </Link>
          <Link href="/teams" className="text-white no-underline">
            Teams
          </Link>
        </nav>
      </div>
    </header>
  );
}

function HeroStandingsCard({
  leader,
  bestDiff,
}: {
  leader?: LeagueTableRow;
  bestDiff?: LeagueTableRow;
}) {
  return (
    <div className="rounded-[30px] border border-white/15 bg-white/8 p-5 shadow-2xl backdrop-blur">
      <p className="text-xs font-black uppercase tracking-[0.2em] text-[#35d6b4]">
        Table Summary
      </p>

      <div className="mt-5 space-y-4">
        <div className="rounded-[24px] bg-[#111827] p-5">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-[#35d6b4]">
            Current Leader
          </p>

          <p className="mt-2 text-3xl font-black text-white">
            {leader?.team || "TBC"}
          </p>

          {leader && (
            <p className="mt-2 text-sm font-bold text-[#dce4f0]">
              {leader.points} points · {formatPointsDifference(
                getPointsDifference(leader)
              )} pts diff
            </p>
          )}
        </div>

        <div className="rounded-[24px] bg-white p-5 text-[#111827]">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-[#d81e05]">
            Best Points Difference
          </p>

          <p className="mt-2 text-2xl font-black">
            {bestDiff?.team || "TBC"}
          </p>

          {bestDiff && (
            <p className="mt-2 text-sm font-bold text-[#64748b]">
              {formatPointsDifference(getPointsDifference(bestDiff))}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}



function SectionHeading({
  eyebrow,
  title,
  text,
}: {
  eyebrow: string;
  title: string;
  text: string;
}) {
  return (
    <div className="mb-5">
      <p className="text-xs font-black uppercase tracking-[0.18em] text-[#d81e05]">
        {eyebrow}
      </p>

      <h2 className="mt-1 text-3xl font-black text-[#18243a] sm:text-4xl">
        {title}
      </h2>

      <p className="mt-2 max-w-[720px] text-sm font-bold leading-6 text-[#64748b]">
        {text}
      </p>
    </div>
  );
}

function MobileLeagueTable({ rows }: { rows: LeagueTableRow[] }) {
  return (
    <section className="overflow-hidden rounded-[26px] border border-[#d6dce5] bg-white shadow-sm md:hidden">
      <div className="grid grid-cols-[42px_1fr_64px_56px] bg-[#18243a] px-4 py-3 text-xs font-black uppercase tracking-[0.12em] text-white">
        <div>#</div>
        <div>Team</div>
        <div className="text-center">Diff</div>
        <div className="text-right">Pts</div>
      </div>

      {rows.map((row) => {
        const pointsDifference = getPointsDifference(row);

        return (
          <Link
            key={row.team}
            href={`/team/${row.slug}`}
            className="grid grid-cols-[42px_1fr_64px_56px] items-center border-b border-[#d6dce5] bg-[#f8fafc] px-4 py-4 text-[#111] no-underline last:border-b-0"
          >
            <p className="text-lg font-black text-[#d81e05]">
              {row.position}
            </p>

            <div>
              <p className="font-black leading-tight text-[#18243a] underline underline-offset-2">
                {row.team}
              </p>

              <p className="mt-1 text-xs font-bold text-[#64748b]">
                P {row.played} · W {row.won} · L {row.lost} · D {row.drawn}
              </p>

              <p className="mt-1 text-xs font-bold text-[#64748b]">
                F {row.pointsFor} · A {row.pointsAgainst}
              </p>
            </div>

            <p className="text-center text-sm font-black text-[#18243a]">
              {formatPointsDifference(pointsDifference)}
            </p>

            <p className="text-right text-xl font-black text-[#111827]">
              {row.points}
            </p>
          </Link>
        );
      })}
    </section>
  );
}

function DesktopLeagueTable({ rows }: { rows: LeagueTableRow[] }) {
  return (
    <section className="hidden overflow-x-auto rounded-[26px] border border-[#d6dce5] bg-white shadow-sm md:block">
      <table className="w-full min-w-[900px] border-collapse text-sm text-[#111]">
        <thead>
          <tr className="bg-[#18243a] text-left text-xs font-black uppercase tracking-[0.08em] text-white">
            <th className="w-[52px] px-4 py-4 text-center">#</th>
            <th className="px-4 py-4">Team</th>
            <th className="px-4 py-4 text-center">Played</th>
            <th className="px-4 py-4 text-center">Won</th>
            <th className="px-4 py-4 text-center">Lost</th>
            <th className="px-4 py-4 text-center">Drawn</th>
            <th className="px-4 py-4 text-center">For</th>
            <th className="px-4 py-4 text-center">Against</th>
            <th className="px-4 py-4 text-center">Pts Diff</th>
            <th className="px-4 py-4 text-center">Points</th>
          </tr>
        </thead>

        <tbody>
          {rows.map((row) => {
            const pointsDifference = getPointsDifference(row);

            return (
              <tr
                key={row.team}
                className="border-t border-[#d6dce5] bg-white hover:bg-[#f8fafc]"
              >
                <td className="px-4 py-4 text-center font-black text-[#d81e05]">
                  {row.position}
                </td>

                <td className="px-4 py-4 font-black">
                  <Link
                    href={`/team/${row.slug}`}
                    className="text-[#18243a] underline decoration-[#18243a] underline-offset-2"
                  >
                    {row.team}
                  </Link>
                </td>

                <td className="px-4 py-4 text-center">{row.played}</td>
                <td className="px-4 py-4 text-center">{row.won}</td>
                <td className="px-4 py-4 text-center">{row.lost}</td>
                <td className="px-4 py-4 text-center">{row.drawn}</td>
                <td className="px-4 py-4 text-center">{row.pointsFor}</td>
                <td className="px-4 py-4 text-center">{row.pointsAgainst}</td>
                <td className="px-4 py-4 text-center font-black">
                  {formatPointsDifference(pointsDifference)}
                </td>
                <td className="px-4 py-4 text-center text-lg font-black">
                  {row.points}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </section>
  );
}

function getPointsDifference(row: LeagueTableRow) {
  return row.pointsFor - row.pointsAgainst;
}

function formatPointsDifference(value: number) {
  if (value > 0) {
    return `+${value}`;
  }

  return String(value);
}