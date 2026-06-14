import Link from "next/link";
import { fixturesData, type FixtureDay, type Game } from "@/data/fixturesData";
import { teamsData } from "@/data/teamsData";

type DisplayGame = Game & {
  date: string;
  sortDate: string;
  originalDayIndex: number;
  originalGameIndex: number;
};

type TeamRecord = Record<string, { name?: string }>;

const teamSlugsByName = buildTeamSlugs(teamsData as TeamRecord);

export default function ResultsPage() {
  const allGames = flattenFixtures(fixturesData);

  const results = allGames.filter((game) => isResult(game)).sort(sortResults);

  const latestResult = results[0];

  return (
    <main className="min-h-screen bg-[#eef1f5] font-sans text-[#111]">
      <SiteHeader />

      <section className="bg-[#18243a] px-4 py-8 text-white sm:px-6 lg:px-10 lg:py-12">
        <div className="mx-auto grid max-w-[1180px] gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div>
            <p className="mb-4 text-xs font-black uppercase tracking-[0.22em] text-[#35d6b4]">
              Match centre
            </p>

            <h1 className="max-w-[760px] text-[46px] font-black leading-[0.98] sm:text-[66px] lg:text-[82px]">
              Results
            </h1>

            <p className="mt-5 max-w-[700px] text-base font-bold leading-7 text-[#dce4f0] sm:text-lg">
              Completed Super League matches, final scores and venue details,
              with the latest results shown first.
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

          <HeroResultCard game={latestResult} />
        </div>
      </section>

      <section className="px-4 py-6 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-[1180px]">
          <section className="mb-7 grid gap-4 sm:grid-cols-3">
            <StatCard title="Results" value={results.length} />
            <StatCard title="Dates Listed" value={groupByDate(results).length} />
            <StatCard title="Latest Date" valueText={latestResult?.date || "None"} />
          </section>

          <section>
            <SectionHeading
              eyebrow="Latest"
              title="Latest Results"
              text="Results are grouped by match date, with the newest date shown first."
            />

            {results.length > 0 ? (
              <div className="space-y-8">
                {groupByDate(results).map((day) => (
                  <ResultDateGroup
                    key={day.sortDate}
                    date={day.date}
                    games={day.games}
                  />
                ))}
              </div>
            ) : (
              <EmptyMessage text="No results found yet." />
            )}
          </section>
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
          <Link href="/results" className="text-[#35d6b4] no-underline">
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
  );
}

function HeroResultCard({ game }: { game?: DisplayGame }) {
  if (!game) {
    return (
      <div className="rounded-[30px] border border-white/15 bg-white/8 p-5 shadow-2xl backdrop-blur">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-[#35d6b4]">
          Latest result
        </p>

        <p className="mt-4 text-2xl font-black text-white">
          No result found
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-[30px] border border-white/15 bg-white/8 p-5 shadow-2xl backdrop-blur">
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-[#35d6b4]">
            Latest result
          </p>

          <h2 className="mt-2 text-2xl font-black text-white">
            {game.date}
          </h2>
        </div>

        <span className="rounded-full bg-[#35d6b4] px-4 py-2 text-xs font-black tracking-widest text-[#111827]">
          FT
        </span>
      </div>

      <div className="rounded-[24px] bg-[#111827] p-5">
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
          <p className="text-left text-xl font-black leading-tight text-white">
            {game.home}
          </p>

          <div className="rounded-2xl bg-white px-4 py-3 text-center text-[#111827]">
            {hasScore(game) ? (
              <p className="text-xl font-black">
                {game.homeScore} - {game.awayScore}
              </p>
            ) : (
              <p className="text-sm font-black">FT</p>
            )}
          </div>

          <p className="text-right text-xl font-black leading-tight text-white">
            {game.away}
          </p>
        </div>

        <p className="mt-4 text-sm font-bold text-[#dce4f0]">{game.venue}</p>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  valueText,
}: {
  title: string;
  value?: number;
  valueText?: string;
}) {
  return (
    <section className="rounded-[26px] border border-[#d6dce5] bg-white p-5 shadow-sm">
      <p className="text-xs font-black uppercase tracking-[0.18em] text-[#d81e05]">
        {title}
      </p>

      <p className="mt-2 text-3xl font-black text-[#18243a] sm:text-4xl">
        {valueText ?? value}
      </p>
    </section>
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

function ResultDateGroup({
  date,
  games,
}: {
  date: string;
  games: DisplayGame[];
}) {
  return (
    <section>
      <div className="mb-4 flex items-center gap-3">
        <h3 className="rounded-full bg-[#18243a] px-4 py-2 text-sm font-black uppercase tracking-[0.12em] text-white">
          {date}
        </h3>

        <div className="h-[2px] flex-1 bg-[#d6dce5]" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {games.map((game) => (
          <ResultCard key={gameKey(game)} game={game} />
        ))}
      </div>
    </section>
  );
}

function ResultCard({ game }: { game: DisplayGame }) {
  return (
    <article className="rounded-[28px] border border-[#d6dce5] bg-white p-5 text-[#111] shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-[#d81e05]">
            {game.date}
          </p>

          <p className="mt-1 text-sm font-bold text-[#64748b]">
            Full time
          </p>
        </div>

        <span className="rounded-full bg-[#18243a] px-4 py-2 text-xs font-black tracking-widest text-white">
          FT
        </span>
      </div>

      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        <TeamBlock team={game.home} align="left" />

        <div className="rounded-2xl bg-[#18243a] px-4 py-3 text-center text-white">
          {hasScore(game) ? (
            <div className="text-xl font-black sm:text-2xl">
              {game.homeScore} - {game.awayScore}
            </div>
          ) : (
            <div className="text-sm font-black tracking-widest">FT</div>
          )}
        </div>

        <TeamBlock team={game.away} align="right" />
      </div>

      <div className="mt-5 rounded-[18px] bg-[#f3f5f8] px-4 py-3">
        <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#d81e05]">
          Venue
        </p>

        <p className="mt-1 text-sm font-black text-[#18243a]">{game.venue}</p>
      </div>
    </article>
  );
}

function TeamBlock({
  team,
  align,
}: {
  team: string;
  align: "left" | "right";
}) {
  const slug = getTeamSlug(team);

  return (
    <div className={align === "right" ? "text-right" : "text-left"}>
      {slug ? (
        <Link
          href={`/team/${slug}`}
          className="text-lg font-black leading-tight text-[#18243a] underline decoration-[#18243a] underline-offset-2 sm:text-xl"
        >
          {team}
        </Link>
      ) : (
        <p className="text-lg font-black leading-tight text-[#18243a] sm:text-xl">
          {team}
        </p>
      )}
    </div>
  );
}

function EmptyMessage({ text }: { text: string }) {
  return (
    <div className="rounded-[24px] border border-[#d6dce5] bg-white p-5 shadow-sm">
      <p className="font-black text-[#18243a]">{text}</p>
    </div>
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

function groupByDate(games: DisplayGame[]) {
  const groups: { date: string; sortDate: string; games: DisplayGame[] }[] = [];

  for (const game of games) {
    const existingGroup = groups.find((group) => group.date === game.date);

    if (existingGroup) {
      existingGroup.games.push(game);
    } else {
      groups.push({
        date: game.date,
        sortDate: game.sortDate,
        games: [game],
      });
    }
  }

  return groups;
}

function isResult(game: Game) {
  return game.status.toUpperCase() === "FT";
}

function hasScore(game: Game) {
  return typeof game.homeScore === "number" && typeof game.awayScore === "number";
}

function sortResults(a: DisplayGame, b: DisplayGame) {
  const dateCompare = b.sortDate.localeCompare(a.sortDate);

  if (dateCompare !== 0) {
    return dateCompare;
  }

  return getKickOffSortValue(b.kickOff) - getKickOffSortValue(a.kickOff);
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

function gameKey(game: DisplayGame) {
  return `${game.sortDate}-${game.home}-${game.away}-${game.originalGameIndex}`;
}

function buildTeamSlugs(teamRecord: TeamRecord) {
  const slugs: Record<string, string> = {};

  for (const [slug, team] of Object.entries(teamRecord)) {
    if (team.name) {
      slugs[team.name] = slug;
    }
  }

  slugs["Hull KR"] = slugs["Hull Kingston Rovers"] || "hull-kingston-rovers";
  slugs["Toulouse Olympique"] = slugs["Toulouse"] || "toulouse";

  return slugs;
}

function getTeamSlug(team: string) {
  if (team.toUpperCase() === "TBC") {
    return "";
  }

  return teamSlugsByName[team] || "";
}