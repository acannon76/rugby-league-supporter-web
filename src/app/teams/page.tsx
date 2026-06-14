import Link from "next/link";
import { teamsData } from "@/data/teamsData";

type TeamData = Record<string, unknown>;
type TeamsRecord = Record<string, TeamData>;

type DisplayTeam = {
  slug: string;
  name: string;
  stadium: string;
  city: string;
  imageSource: string;
};

const teams = teamsData as TeamsRecord;

export default function TeamsPage() {
  const allTeams = Object.entries(teams)
    .map(([slug, team]) => ({
      slug,
      name: readText(team, ["name", "team", "clubName"]) || slug,
      stadium: readText(team, ["stadium", "venue", "ground", "homeGround"]),
      city: readText(team, ["city", "town", "location"]),
      imageSource: getImageSource(
        team.image || team.stadiumImage || team.photo || team.groundImage
      ),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <main className="min-h-screen bg-[#eef1f5] font-sans text-[#111]">
      <SiteHeader />

      <section className="bg-[#18243a] px-4 py-8 text-white sm:px-6 lg:px-10 lg:py-12">
        <div className="mx-auto grid max-w-[1180px] gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div>
            <p className="mb-4 text-xs font-black uppercase tracking-[0.22em] text-[#35d6b4]">
              Club guides
            </p>

            <h1 className="max-w-[760px] text-[46px] font-black leading-[0.98] sm:text-[66px] lg:text-[82px]">
              Super League Teams
            </h1>

            <p className="mt-5 max-w-[700px] text-base font-bold leading-7 text-[#dce4f0] sm:text-lg">
              Browse every Super League club guide, including stadium details,
              venue information and supporter travel notes.
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

          <GuideIncludesCard />
        </div>
      </section>

      <section className="px-4 py-6 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-[1180px]">
          <SectionHeading
            eyebrow="Directory"
            title="Choose a team"
            text="Teams are listed alphabetically. Tap a club to open the full supporter guide."
          />

          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {allTeams.map((team) => (
              <TeamCard key={team.slug} team={team} />
            ))}
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
          <Link href="/results" className="text-white no-underline">
            Results
          </Link>
          <Link href="/league-table" className="text-white no-underline">
            League Table
          </Link>
          <Link href="/teams" className="text-[#35d6b4] no-underline">
            Teams
          </Link>
        </nav>
      </div>
    </header>
  );
}

function GuideIncludesCard() {
  const items = [
    "Stadium information",
    "Parking details",
    "Away end guidance",
    "Train station info",
    "Local pubs",
    "Google directions",
  ];

  return (
    <div className="rounded-[30px] border border-white/15 bg-white/8 p-5 shadow-2xl backdrop-blur">
      <p className="text-xs font-black uppercase tracking-[0.2em] text-[#35d6b4]">
        Supporter guide
      </p>

      <h2 className="mt-4 text-3xl font-black leading-tight text-white sm:text-4xl">
        Plan before you travel.
      </h2>

      <p className="mt-3 text-sm font-bold leading-6 text-[#dce4f0]">
        Each club page is built to help supporters quickly find useful matchday
        information.
      </p>

      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {items.map((item) => (
          <div
            key={item}
            className="flex items-center gap-3 rounded-2xl bg-[#111827] p-3"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#35d6b4] text-sm font-black text-[#111827]">
              ✓
            </div>

            <p className="text-sm font-black text-white">{item}</p>
          </div>
        ))}
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

function TeamCard({ team }: { team: DisplayTeam }) {
  const initial = team.name.charAt(0).toUpperCase();

  return (
    <Link
      href={`/team/${team.slug}`}
      className="group overflow-hidden rounded-[28px] border border-[#d6dce5] bg-white text-[#111] no-underline shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
    >
      {team.imageSource ? (
        <div className="relative h-[180px] overflow-hidden bg-[#18243a]">
          <img
            src={team.imageSource}
            alt={`${team.name} stadium`}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-[#111827] via-[#111827]/25 to-transparent" />

          <div className="absolute bottom-4 left-4 right-4">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-[#35d6b4]">
              {team.stadium || "Stadium guide"}
            </p>

            <h3 className="mt-1 text-2xl font-black leading-tight text-white">
              {team.name}
            </h3>
          </div>
        </div>
      ) : (
        <div className="flex h-[180px] items-center justify-center bg-[#18243a]">
          <div className="flex h-20 w-20 items-center justify-center rounded-3xl border-2 border-[#35d6b4] bg-[#111827] text-4xl font-black text-white">
            {initial}
          </div>
        </div>
      )}

      <div className="p-5">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#18243a] text-sm font-black text-white">
            {initial}
          </div>

          <div>
            <h3 className="text-xl font-black leading-tight text-[#18243a]">
              {team.name}
            </h3>

            <p className="mt-1 text-xs font-black uppercase tracking-[0.12em] text-[#d81e05]">
              {team.stadium || "Stadium information to be added"}
            </p>
          </div>
        </div>

        <p className="text-sm font-bold leading-6 text-[#64748b]">
          {team.city
            ? `${team.city} supporter guide, venue details and matchday information.`
            : "Supporter guide, venue details and matchday information."}
        </p>

        <div className="mt-5 flex items-center gap-2 text-xs font-black tracking-widest text-[#d81e05]">
          VIEW TEAM <span className="transition group-hover:translate-x-1">→</span>
        </div>
      </div>
    </Link>
  );
}

function readText(team: TeamData, keys: string[]) {
  for (const key of keys) {
    const value = team[key];

    if (typeof value === "string") {
      return value;
    }

    if (typeof value === "number") {
      return String(value);
    }
  }

  return "";
}

function getImageSource(value: unknown) {
  if (typeof value === "string") {
    return value;
  }

  if (value && typeof value === "object" && "src" in value) {
    const imageObject = value as { src?: unknown };

    if (typeof imageObject.src === "string") {
      return imageObject.src;
    }
  }

  if (value && typeof value === "object" && "default" in value) {
    const moduleObject = value as {
      default?: {
        src?: unknown;
      };
    };

    if (typeof moduleObject.default?.src === "string") {
      return moduleObject.default.src;
    }
  }

  return "";
}