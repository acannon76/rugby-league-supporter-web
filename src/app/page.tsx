import Link from "next/link";
import { fixturesData, type FixtureDay, type Game } from "@/data/fixturesData";
import { leagueTableData } from "@/data/leagueTableData";

type IconKey = "table" | "calendar" | "score" | "team";

type HomeCardData = {
  href: string;
  icon: IconKey;
  title: string;
  text: string;
};

type DisplayGame = Game & {
  date: string;
  sortDate: string;
  originalDayIndex: number;
  originalGameIndex: number;
};

const homeCards: HomeCardData[] = [
  {
    href: "/league-table",
    icon: "table",
    title: "League Table",
    text: "Current standings",
  },
  {
    href: "/fixtures",
    icon: "calendar",
    title: "Fixtures",
    text: "Upcoming matches",
  },
  {
    href: "/results",
    icon: "score",
    title: "Results",
    text: "Latest final scores",
  },
  {
    href: "/teams",
    icon: "team",
    title: "Teams",
    text: "Club and stadium guides",
  },
];

export default function Home() {
  const allGames = flattenFixtures(fixturesData);
  const liveGames = allGames.filter((game) => isLive(game));
  const upcomingGames = allGames
    .filter((game) => !isResult(game) && !isLive(game))
    .sort(sortUpcomingFixtures);

  const featuredGame = liveGames[0] || upcomingGames[0];

  const topFour = [...leagueTableData]
    .sort((a, b) => a.position - b.position)
    .slice(0, 4);

  return (
    <main className="min-h-screen bg-[#eef1f5] font-sans text-[#111]">
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
            <Link href="/league-table" className="text-white no-underline">
              League Table
            </Link>
            <Link href="/teams" className="text-white no-underline">
              Teams
            </Link>
          </nav>
        </div>
      </header>

      <section className="bg-[#18243a] px-4 py-8 text-white sm:px-6 lg:px-10 lg:py-12">
        <div className="mx-auto grid max-w-[1180px] gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <div>
            <p className="mb-4 text-xs font-black uppercase tracking-[0.22em] text-[#35d6b4]">
              Independent supporter guide
            </p>

            <h1 className="max-w-[760px] text-[42px] font-black leading-[0.98] sm:text-[64px] lg:text-[78px]">
              Your Super League matchday starts here.
            </h1>

            <p className="mt-5 max-w-[700px] text-base font-bold leading-7 text-[#dce4f0] sm:text-lg">
              Fixtures, results, league table, club guides, venue information
              and supporter travel details in one simple place.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="/fixtures"
                className="rounded-full bg-[#35d6b4] px-5 py-3 text-sm font-black text-[#111827] no-underline"
              >
                View Fixtures
              </Link>

              <Link
                href="/league-table"
                className="rounded-full border-2 border-white px-5 py-3 text-sm font-black text-white no-underline"
              >
                League Table
              </Link>
            </div>
          </div>

          <div className="rounded-[30px] border border-white/15 bg-white/8 p-5 shadow-2xl backdrop-blur">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#35d6b4]">
              Supporter tools
            </p>

            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-1">
              <FeatureItem title="Fixtures" text="Upcoming matches and kick-off times" />
              <FeatureItem title="Results" text="Latest final scores" />
              <FeatureItem title="League Table" text="Current standings and points difference" />
              <FeatureItem title="Club Guides" text="Stadium and matchday information" />
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-6 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-[1180px]">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {homeCards.map((card) => (
              <HomeCard
                key={card.href}
                href={card.href}
                icon={card.icon}
                title={card.title}
                text={card.text}
              />
            ))}
          </div>

          <div className="mt-7 grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
            <section className="rounded-[30px] border border-[#d6dce5] bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-[#d81e05]">
                    Match centre
                  </p>

                  <h2 className="mt-1 text-2xl font-black text-[#18243a]">
                    {featuredGame && isLive(featuredGame)
                      ? "Live now"
                      : "Next fixture"}
                  </h2>
                </div>

                {featuredGame && (
                  <span
                    className={
                      isLive(featuredGame)
                        ? "rounded-full bg-[#d81e05] px-4 py-2 text-xs font-black text-white"
                        : "rounded-full bg-[#18243a] px-4 py-2 text-xs font-black text-white"
                    }
                  >
                    {isLive(featuredGame) ? "LIVE" : featuredGame.kickOff}
                  </span>
                )}
              </div>

              {featuredGame ? (
                <div className="rounded-[24px] bg-[#f3f5f8] p-5">
                  <p className="text-sm font-black text-[#d81e05]">
                    {featuredGame.date}
                  </p>

                  <div className="mt-4 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                    <p className="text-left text-xl font-black leading-tight text-[#111]">
                      {featuredGame.home}
                    </p>

                    <div className="rounded-2xl bg-[#18243a] px-4 py-3 text-center text-white">
                      {hasScore(featuredGame) ? (
                        <p className="text-xl font-black">
                          {featuredGame.homeScore} - {featuredGame.awayScore}
                        </p>
                      ) : (
                        <p className="text-sm font-black">VS</p>
                      )}
                    </div>

                    <p className="text-right text-xl font-black leading-tight text-[#111]">
                      {featuredGame.away}
                    </p>
                  </div>

                  <p className="mt-4 text-sm font-bold text-[#4b5563]">
                    {featuredGame.venue}
                  </p>
                </div>
              ) : (
                <p className="font-bold text-[#4b5563]">
                  No upcoming fixture found.
                </p>
              )}

              <Link
                href="/fixtures"
                className="mt-4 inline-block text-sm font-black text-[#d81e05] no-underline"
              >
                View all fixtures →
              </Link>
            </section>

            <section className="rounded-[30px] border border-[#d6dce5] bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-[#d81e05]">
                    Standings
                  </p>

                  <h2 className="mt-1 text-2xl font-black text-[#18243a]">
                    Top of the table
                  </h2>
                </div>

                <Link
                  href="/league-table"
                  className="text-sm font-black text-[#d81e05] no-underline"
                >
                  Full table →
                </Link>
              </div>

              <div className="overflow-hidden rounded-[22px] border border-[#d6dce5]">
                {topFour.map((row) => {
                  const pointsDifference = row.pointsFor - row.pointsAgainst;

                  return (
                    <Link
                      key={row.team}
                      href={`/team/${row.slug}`}
                      className="grid grid-cols-[42px_1fr_58px_58px] items-center border-b border-[#d6dce5] bg-[#f8fafc] px-4 py-4 text-[#111] no-underline last:border-b-0"
                    >
                      <p className="text-lg font-black text-[#d81e05]">
                        {row.position}
                      </p>

                      <div>
                        <p className="font-black leading-tight">{row.team}</p>
                        <p className="mt-1 text-xs font-bold text-[#64748b]">
                          P {row.played} · W {row.won} · L {row.lost}
                        </p>
                      </div>

                      <p className="text-center text-sm font-black">
                        {pointsDifference > 0 ? `+${pointsDifference}` : pointsDifference}
                      </p>

                      <p className="text-right text-xl font-black">
                        {row.points}
                      </p>
                    </Link>
                  );
                })}
              </div>
            </section>
          </div>
        </div>
      </section>
    </main>
  );
}

function FeatureItem({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-2xl bg-white/10 p-4">
      <p className="text-sm font-black text-white">{title}</p>
      <p className="mt-1 text-sm font-bold leading-5 text-[#dce4f0]">{text}</p>
    </div>
  );
}

function HomeCard({
  href,
  icon,
  title,
  text,
}: {
  href: string;
  icon: IconKey;
  title: string;
  text: string;
}) {
  return (
    <Link
      href={href}
      className="group flex min-h-[155px] flex-col rounded-[26px] border border-[#d6dce5] bg-white p-5 text-[#111] no-underline shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
    >
      <div className="mb-5 flex h-[52px] w-[52px] items-center justify-center rounded-2xl bg-[#18243a] text-white transition group-hover:bg-[#d81e05]">
        <CardIcon icon={icon} />
      </div>

      <h2 className="text-xl font-black leading-tight text-[#18243a]">
        {title}
      </h2>

      <p className="mt-2 text-sm font-bold leading-5 text-[#64748b]">{text}</p>

      <div className="mt-auto flex items-center gap-2 pt-5 text-xs font-black tracking-widest text-[#d81e05]">
        OPEN <span className="transition group-hover:translate-x-1">→</span>
      </div>
    </Link>
  );
}

function CardIcon({ icon }: { icon: IconKey }) {
  if (icon === "table") return <TableIcon />;
  if (icon === "calendar") return <CalendarIcon />;
  if (icon === "score") return <ScoreIcon />;
  return <TeamIcon />;
}

function TableIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
      <rect x="4" y="11" width="3" height="8" fill="white" />
      <rect x="10.5" y="6" width="3" height="13" fill="white" />
      <rect x="17" y="9" width="3" height="10" fill="white" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
      <rect
        x="4"
        y="5"
        width="16"
        height="15"
        rx="2"
        stroke="white"
        strokeWidth="2"
      />
      <path d="M8 3v4M16 3v4M4 10h16" stroke="white" strokeWidth="2" />
      <path
        d="M8 14h2M12 14h2M16 14h2M8 17h2M12 17h2"
        stroke="white"
        strokeWidth="2"
      />
    </svg>
  );
}

function ScoreIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
      <rect
        x="3"
        y="5"
        width="18"
        height="14"
        rx="2"
        stroke="white"
        strokeWidth="2"
      />
      <path d="M8 9h2M14 9h2M8 15h2M14 15h2" stroke="white" strokeWidth="2" />
      <path d="M12 7v10" stroke="white" strokeWidth="2" />
    </svg>
  );
}

function TeamIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
      <circle cx="9" cy="8" r="3" fill="white" />
      <circle cx="16" cy="9" r="2.5" fill="white" />
      <path d="M4 19c.6-3.2 2.5-5 5-5s4.4 1.8 5 5" fill="white" />
      <path
        d="M13 19c.4-2.4 1.8-3.8 3.7-3.8 1.7 0 3 1.2 3.5 3.8"
        fill="white"
      />
    </svg>
  );
}

function flattenFixtures(fixtureDays: FixtureDay[]): DisplayGame[] {
  return fixtureDays.flatMap((day, dayIndex) =>
    day.games.map((game, gameIndex) => ({
      ...game,
      date: day.date,
      sortDate: day.sortDate,
      originalDayIndex: dayIndex,
      originalGameIndex: gameIndex,
    }))
  );
}

function isResult(game: Game) {
  return game.status.toUpperCase() === "FT";
}

function isLive(game: Game) {
  return game.status.toUpperCase() === "LIVE";
}

function hasScore(game: Game) {
  return typeof game.homeScore === "number" && typeof game.awayScore === "number";
}

function sortUpcomingFixtures(a: DisplayGame, b: DisplayGame) {
  const dateCompare = a.sortDate.localeCompare(b.sortDate);

  if (dateCompare !== 0) {
    return dateCompare;
  }

  return getKickOffSortValue(a.kickOff) - getKickOffSortValue(b.kickOff);
}

function getKickOffSortValue(kickOff: string) {
  if (!kickOff || kickOff.toUpperCase() === "TBC") {
    return 9999;
  }

  const [hours, minutes] = kickOff.split(":").map(Number);

  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
    return 9999;
  }

  return hours * 60 + minutes;
}