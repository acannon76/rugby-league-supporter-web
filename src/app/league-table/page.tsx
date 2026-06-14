import Link from "next/link";
import { leagueTableData } from "@/data/leagueTableData";

export default function LeagueTablePage() {
  const sortedTable = [...leagueTableData].sort(
    (a, b) => a.position - b.position
  );

  return (
    <main className="min-h-screen bg-[#efe6d8] px-4 py-6 font-sans sm:px-6 lg:px-10">
      <div className="mx-auto max-w-[1180px]">
        <Link
          href="/"
          className="mb-5 inline-block text-sm font-black tracking-wide text-[#111] no-underline"
        >
          ← BACK HOME
        </Link>

        <section className="mb-6 grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-stretch">
          <div className="rounded-[34px] border-[3px] border-[#111] bg-[#d81e05] p-6 text-[#111] sm:p-8 lg:p-10">
            <p className="mb-3 text-xs font-black tracking-[0.18em]">
              SUPER LEAGUE
            </p>

            <h1 className="text-[46px] font-black leading-none sm:text-[70px] lg:text-[82px]">
              League Table
            </h1>

            <p className="mt-5 max-w-[620px] text-sm font-extrabold leading-6 sm:text-base">
              Current standings, league points and points difference.
            </p>
          </div>

          <div className="rounded-[34px] border-[3px] border-[#d81e05] bg-[#111] p-6 text-white sm:p-8 lg:p-10">
            <p className="text-xs font-black tracking-[0.18em] text-[#d81e05]">
  TABLE GUIDE
</p>

<h2 className="mt-4 text-[32px] font-black leading-none sm:text-[44px] lg:text-[52px]">
  Follow the Super League standings.
</h2>

<p className="mt-5 text-sm font-bold leading-6 text-[#efe6d8] sm:text-base">
  View each club’s position, games played, wins, losses, points scored,
  points conceded and total league points.
</p>
          </div>
        </section>

        <section className="overflow-x-auto rounded-[22px] border border-[#d0c7b8] bg-white shadow-sm">
          <table className="w-full min-w-[900px] border-collapse text-sm text-[#111]">
            <thead>
              <tr className="bg-[#f5f5f5] text-left text-xs font-black">
                <th className="w-[50px] px-4 py-3 text-center"></th>
                <th className="px-4 py-3">Team</th>
                <th className="px-4 py-3 text-center">Played</th>
                <th className="px-4 py-3 text-center">Won</th>
                <th className="px-4 py-3 text-center">Lost</th>
                <th className="px-4 py-3 text-center">Drawn</th>
                <th className="px-4 py-3 text-center">For</th>
                <th className="px-4 py-3 text-center">Against</th>
                <th className="px-4 py-3 text-center">Pts Diff</th>
                <th className="px-4 py-3 text-center">Points</th>
              </tr>
            </thead>

            <tbody>
              {sortedTable.map((row) => {
                const pointsDifference = row.pointsFor - row.pointsAgainst;

                return (
                  <tr
                    key={row.team}
                    className="border-t border-[#d9d9d9] hover:bg-[#fff5ef]"
                  >
                    <td className="px-4 py-3 text-center font-bold">
                      {row.position}
                    </td>

                    <td className="px-4 py-3 font-black">
                      <Link
                        href={`/team/${row.slug}`}
                        className="text-[#111] underline decoration-[#111] underline-offset-2"
                      >
                        {row.team}
                      </Link>
                    </td>

                    <td className="px-4 py-3 text-center">{row.played}</td>
                    <td className="px-4 py-3 text-center">{row.won}</td>
                    <td className="px-4 py-3 text-center">{row.lost}</td>
                    <td className="px-4 py-3 text-center">{row.drawn}</td>
                    <td className="px-4 py-3 text-center">{row.pointsFor}</td>
                    <td className="px-4 py-3 text-center">
                      {row.pointsAgainst}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {pointsDifference}
                    </td>
                    <td className="px-4 py-3 text-center text-base font-black">
                      {row.points}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </section>

        <section className="mt-5 rounded-[24px] border-[3px] border-[#111] bg-[#f5ede0] p-5">
  <p className="text-xs font-black tracking-[0.18em] text-[#d81e05]">
    SUPPORTER NOTE
  </p>

  <h2 className="mt-3 text-2xl font-black text-[#111]">
    Tap a team name to open the club guide.
  </h2>

  <p className="mt-2 text-sm font-bold leading-6 text-[#444]">
    Each club guide can include stadium details, parking, away end information,
    travel options, local pubs and matchday notes.
  </p>
</section>
      </div>
    </main>
  );
}
