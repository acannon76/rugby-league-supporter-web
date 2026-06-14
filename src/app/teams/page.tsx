import Link from "next/link";
import { teamsData } from "@/data/teamsData";

export default function TeamsPage() {
  const teams = Object.entries(teamsData);

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

            <h1 className="text-[52px] font-black leading-none sm:text-[72px] lg:text-[86px]">
              Teams
            </h1>

            <p className="mt-5 max-w-[620px] text-sm font-extrabold leading-6 sm:text-base">
              Club directory, stadium information and supporter travel details
              for each Super League team.
            </p>
          </div>

          <div className="rounded-[34px] border-[3px] border-[#d81e05] bg-[#111] p-6 text-white sm:p-8 lg:p-10">
            <p className="text-xs font-black tracking-[0.18em] text-[#d81e05]">
              CLUB GUIDE
            </p>

            <h2 className="mt-4 text-[34px] font-black leading-none sm:text-[46px] lg:text-[54px]">
              Choose a team to view the full guide.
            </h2>

            <p className="mt-5 text-sm font-bold leading-6 text-[#efe6d8] sm:text-base">
              Each team page can include venue details, parking, away end,
              train station, local pubs and matchday notes.
            </p>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {teams.map(([slug, team]) => (
            <Link
              key={slug}
              href={`/team/${slug}`}
              className="group flex min-h-[210px] flex-col rounded-[28px] border-[3px] border-[#111] bg-[#f5ede0] p-5 text-[#111] no-underline transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="mb-5 flex h-[52px] w-[52px] items-center justify-center rounded-full bg-[#111] text-lg font-black text-white">
                {team.name.charAt(0)}
              </div>

              <h2 className="text-[30px] font-black leading-none sm:text-[32px]">
                {team.name}
              </h2>

              <p className="mt-3 text-sm font-black uppercase leading-5 text-[#d81e05]">
                {team.stadium}
              </p>

              <div className="mt-auto flex items-center gap-2 pt-6 text-xs font-black tracking-widest text-[#d81e05]">
                VIEW TEAM <span className="transition group-hover:translate-x-1">→</span>
              </div>
            </Link>
          ))}
        </section>
      </div>
    </main>
  );
}