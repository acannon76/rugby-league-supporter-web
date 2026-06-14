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

export default function FixturesPage() {
  const allGames = flattenFixtures(fixturesData);

  const upcomingFixtures = allGames
    .filter((game) => !isResult(game))
    .sort(sortUpcomingFixtures);

  const nextFixture = upcomingFixtures[0];

  return (
    <main className="min-h-screen bg-[#efe6d8] px-4 py-6 font-sans sm:px-6 lg:px-10">
      <div className="mx-auto max-w-[1180px]">
        <Link
          href="/"
          className="mb-5 inline-block text-sm font-black tracking-wide text-[#111] no-underline"
        >
          ← BACK HOME
        </Link>

        <section className="mb-6 rounded-[34px] border-[3px] border-[#111] bg-[#d81e05] p-6 text-[#111] sm:p-8 lg:p-10">
          <p className="mb-3 text-xs font-black tracking-[0.18em]">
            SUPER LEAGUE
          </p>

          <h1 className="max-w-[900px] text-[46px] font-black leading-none sm:text-[72px] lg:text-[92px]">
            Fixtures
          </h1>

          <p className="mt-5 max-w-[760px] text-sm font-extrabold leading-6 sm:text-base lg:text-lg">
            Upcoming matches, kick-off times and venue information for
            supporters.
          </p>
        </section>

        <section className="mb-8 grid gap-4 md:grid-cols-[0.8fr_1.2fr]">
          <SummaryBox title="Upcoming Fixtures" value={upcomingFixtures.length} />

          <NextFixtureBox game={nextFixture} />
        </section>

        <section>
          <SectionHeading
            eyebrow="UPCOMING"
            title="Upcoming Fixtures"
            text="Fixtures are grouped by match date and sorted from soonest to latest."
          />

          {upcomingFixtures.length > 0 ? (
            <div className="space-y-7">
              {groupByDate(upcomingFixtures).map((day) => (
                <FixtureDateGroup
                  key={day.sortDate}
                  date={day.date}
                  games={day.games}
                />
              ))}
            </div>
          ) : (
            <EmptyMessage text="No upcoming fixtures found." />
          )}
        </section>
      </div>
    </main>
  );
}

function FixtureDateGroup({
  date,
  games,
}: {
  date: string;
  games: DisplayGame[];
}) {
  return (
    <section>
      <div className="mb-3 flex items-center gap-3">
        <div className="h-[3px] flex-1 bg-[#111]" />

        <h3 className="rounded-full border-2 border-[#111] bg-[#f5ede0] px-4 py-2 text-center text-sm font-black uppercase tracking-[0.12em] text-[#111]">
          {date}
        </h3>

        <div className="h-[3px] flex-1 bg-[#111]" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {games.map((game) => (
          <FixtureCard key={gameKey(game)} game={game} />
        ))}
      </div>
    </section>
  );
}

function FixtureCard({ game }: { game: DisplayGame }) {
  const live = isLive(game);

  return (
    <article className="rounded-[28px] border-[3px] border-[#111] bg-[#f5ede0] p-5 text-[#111] transition hover:-translate-y-1 hover:shadow-lg">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-[#d81e05]">
            {game.date}
          </p>

          <p className="mt-1 text-sm font-extrabold text-[#444]">
            {kickOffText(game.kickOff)}
          </p>
        </div>

        <StatusBadge status={game.status} />
      </div>

      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        <TeamBlock team={game.home} align="left" />

       <div
  className={
    live
      ? "rounded-2xl bg-[#d81e05] px-4 py-3 text-center text-white"
      : "rounded-2xl bg-[#111] px-4 py-3 text-center text-white"
  }
>
  {typeof game.homeScore === "number" && typeof game.awayScore === "number" ? (
    <div className="text-xl font-black sm:text-2xl">
      {game.homeScore} - {game.awayScore}
    </div>
  ) : (
    <div className="text-sm font-black tracking-widest">VS</div>
  )}
</div>

        <TeamBlock team={game.away} align="right" />
      </div>

      <div className="mt-5 rounded-[18px] border-2 border-[#111] bg-white px-4 py-3">
        <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#d81e05]">
          Venue
        </p>

        <p className="mt-1 text-sm font-black text-[#111]">{game.venue}</p>
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
          className="text-lg font-black leading-tight text-[#111] underline decoration-[#111] underline-offset-2 sm:text-xl"
        >
          {team}
        </Link>
      ) : (
        <p className="text-lg font-black leading-tight sm:text-xl">{team}</p>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  if (status.toUpperCase() === "LIVE") {
    return (
      <span className="rounded-full bg-[#d81e05] px-4 py-2 text-xs font-black tracking-widest text-white">
        LIVE
      </span>
    );
  }

  if (status.toUpperCase() === "TBC") {
    return (
      <span className="rounded-full border-2 border-[#111] px-4 py-2 text-xs font-black tracking-widest text-[#111]">
        TBC
      </span>
    );
  }

  return (
    <span className="rounded-full border-2 border-[#111] px-4 py-2 text-xs font-black tracking-widest text-[#111]">
      {status}
    </span>
  );
}

function SummaryBox({ title, value }: { title: string; value: number }) {
  return (
    <div className="rounded-[24px] border-[3px] border-[#111] bg-[#f5ede0] p-5">
      <p className="text-xs font-black uppercase tracking-[0.16em] text-[#d81e05]">
        {title}
      </p>

      <p className="mt-2 text-4xl font-black text-[#111]">{value}</p>
    </div>
  );
}

function NextFixtureBox({ game }: { game?: DisplayGame }) {
  if (!game) {
    return (
      <div className="rounded-[24px] border-[3px] border-[#111] bg-[#111] p-5 text-white">
        <p className="text-xs font-black uppercase tracking-[0.16em] text-[#d81e05]">
          Next Fixture
        </p>

        <p className="mt-2 text-2xl font-black">No upcoming fixture found</p>
      </div>
    );
  }

  return (
    <div className="rounded-[24px] border-[3px] border-[#111] bg-[#111] p-5 text-white">
      <p className="text-xs font-black uppercase tracking-[0.16em] text-[#d81e05]">
        Next Fixture
      </p>

      <p className="mt-2 text-2xl font-black">
        {game.home} v {game.away}
      </p>

      <p className="mt-3 text-sm font-bold leading-6 text-[#efe6d8]">
        {game.date} · {kickOffText(game.kickOff)} · {game.venue}
      </p>
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
    <div className="mb-4">
      <p className="text-xs font-black uppercase tracking-[0.18em] text-[#d81e05]">
        {eyebrow}
      </p>

      <h2 className="mt-1 text-3xl font-black text-[#111] sm:text-4xl">
        {title}
      </h2>

      <p className="mt-2 max-w-[720px] text-sm font-bold leading-6 text-[#444]">
        {text}
      </p>
    </div>
  );
}

function EmptyMessage({ text }: { text: string }) {
  return (
    <div className="rounded-[24px] border-[3px] border-[#111] bg-[#f5ede0] p-5">
      <p className="font-black text-[#111]">{text}</p>
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

function isLive(game: Game) {
  return game.status.toUpperCase() === "LIVE";
}

function kickOffText(kickOff: string) {
  if (!kickOff || kickOff.toUpperCase() === "TBC") {
    return "Kick-off TBC";
  }

  return `Kick-off ${kickOff}`;
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