/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { notFound } from "next/navigation";
import { teamsData } from "@/data/teamsData";
import { fixturesData, type FixtureDay, type Game } from "@/data/fixturesData";

type TeamData = Record<string, unknown>;
type TeamsRecord = Record<string, TeamData>;

type DisplayGame = Game & {
  date: string;
  sortDate: string;
  originalDayIndex: number;
  originalGameIndex: number;
};

type ParkingSpot = {
  name: string;
  note: string;
  latitude: number;
  longitude: number;
};

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

const teams = teamsData as TeamsRecord;

export function generateStaticParams() {
  return Object.keys(teams).map((slug) => ({
    slug,
  }));
}

export default async function TeamDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const team = teams[slug];

  if (!team) {
    notFound();
  }

  const name = readText(team, ["name", "team", "clubName"]) || "Team";
  const stadium = readText(team, ["stadium", "venue", "ground", "homeGround"]);
  const city = readText(team, ["city", "town", "location"]);
  const address = readText(team, ["address", "postcode", "fullAddress"]);
  const capacity = readText(team, ["capacity", "stadiumCapacity"]);

  const imageSource = getImageSource(
    team.image || team.stadiumImage || team.photo || team.groundImage
  );

  const latitude = readNumber(team, ["latitude", "lat"]);
  const longitude = readNumber(team, ["longitude", "lng", "lon"]);

  const directionsUrl = buildDirectionsUrl({
    latitude,
    longitude,
    stadium,
    address,
  });

  const allGames = flattenFixtures(fixturesData);
  const teamGames = allGames.filter((game) => teamAppearsInGame(name, game));

  const nextFixture = teamGames
    .filter((game) => !isResult(game) && !isLive(game))
    .sort(sortUpcomingFixtures)[0];

  const liveGame = teamGames
    .filter((game) => isLive(game))
    .sort(sortUpcomingFixtures)[0];

  const latestResult = teamGames
    .filter((game) => isResult(game))
    .sort(sortResults)[0];

  const featuredGame = liveGame || nextFixture;
  const parkingSpots = readParkingSpots(team);

  const infoCards = [
    {
      title: "Stadium",
      text: stadium || "Stadium information to be added.",
    },
    {
      title: "Location",
      text: buildLocationText(city, address),
    },
    {
      title: "Capacity",
      text: capacity || "Capacity information to be added.",
    },
    {
      title: "Away End",
      text: readDisplayValue(team, [
        "awayEnd",
        "awayStand",
        "awayFans",
        "awaySupporters",
      ]),
    },
    {
      title: "Train Station",
      text: readDisplayValue(team, [
        "trainStation",
        "nearestStation",
        "station",
        "rail",
      ]),
    },
    {
      title: "Local Pubs",
      text: readDisplayValue(team, [
        "pubs",
        "localPubs",
        "pubGuide",
        "nearbyPubs",
      ]),
    },
    {
      title: "Food & Drink",
      text: readDisplayValue(team, [
        "food",
        "foodDrink",
        "foodAndDrink",
        "refreshments",
      ]),
    },
    {
      title: "Matchday Notes",
      text: readDisplayValue(team, [
        "notes",
        "matchdayNotes",
        "supporterNotes",
        "travelNotes",
      ]),
    },
  ];

  return (
    <main className="min-h-screen bg-[#eef1f5] font-sans text-[#111]">
      <SiteHeader />

      <section className="bg-[#18243a] px-4 py-8 text-white sm:px-6 lg:px-10 lg:py-12">
        <div className="mx-auto max-w-[1180px]">
          <div className="mb-5 flex flex-wrap gap-4">
            <Link
              href="/teams"
              className="text-sm font-black tracking-wide text-[#35d6b4] no-underline"
            >
              ← Back to teams
            </Link>

            <Link
              href="/"
              className="text-sm font-black tracking-wide text-white no-underline"
            >
              Home
            </Link>
          </div>

          <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-stretch">
            <div>
              <p className="mb-4 text-xs font-black uppercase tracking-[0.22em] text-[#35d6b4]">
                Club guide
              </p>

              <h1 className="max-w-[780px] text-[46px] font-black leading-[0.98] sm:text-[66px] lg:text-[82px]">
                {name}
              </h1>

              <p className="mt-5 max-w-[700px] text-base font-bold leading-7 text-[#dce4f0] sm:text-lg">
                {stadium
                  ? `${stadium} supporter information, venue details, travel notes and matchday guide.`
                  : "Supporter information, venue details, travel notes and matchday guide."}
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                {directionsUrl && (
                  <a
                    href={directionsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-full bg-[#35d6b4] px-5 py-3 text-sm font-black text-[#111827] no-underline"
                  >
                    Get Directions
                  </a>
                )}

                <Link
                  href="/fixtures"
                  className="rounded-full border-2 border-white px-5 py-3 text-sm font-black text-white no-underline"
                >
                  View Fixtures
                </Link>
              </div>
            </div>

            <div className="overflow-hidden rounded-[30px] border border-white/15 bg-white/8 shadow-2xl backdrop-blur">
              {imageSource ? (
                <img
                  src={imageSource}
                  alt={`${name} stadium`}
                  className="h-full min-h-[280px] w-full object-cover sm:min-h-[360px] lg:min-h-[430px]"
                />
              ) : (
                <div className="flex min-h-[320px] items-center justify-center bg-[#111827] p-8 text-center">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-[#35d6b4]">
                      Stadium image
                    </p>

                    <p className="mt-3 text-3xl font-black text-white">
                      Image to be added
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-6 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-[1180px]">
          <section className="mb-7 grid gap-4 sm:grid-cols-3">
            <StatCard title="Stadium" valueText={stadium || "To add"} />
            <StatCard title="Capacity" valueText={capacity || "To add"} />
            <StatCard
              title="Location"
              valueText={city || address || "To add"}
            />
          </section>

          <section className="mb-8 grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
            <MatchCard
              title={liveGame ? "Live now" : "Next Fixture"}
              game={featuredGame}
              emptyText="No upcoming fixture found for this team."
            />

            <MatchCard
              title="Latest Result"
              game={latestResult}
              emptyText="No result found for this team yet."
            />
          </section>

          <SectionHeading
            eyebrow="Supporter guide"
            title="Matchday Information"
            text="Stadium information, travel details and supporter notes for this club."
          />

          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <ParkingCard
              fallbackText={readDisplayValue(team, [
                "parking",
                "parkingInfo",
                "carParking",
                "parkingDetails",
              ])}
              parkingSpots={parkingSpots}
            />

            {infoCards.map((card) => (
              <InfoCard key={card.title} title={card.title} text={card.text} />
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

function StatCard({
  title,
  valueText,
}: {
  title: string;
  valueText: string;
}) {
  return (
    <section className="rounded-[26px] border border-[#d6dce5] bg-white p-5 shadow-sm">
      <p className="text-xs font-black uppercase tracking-[0.18em] text-[#d81e05]">
        {title}
      </p>

      <p className="mt-2 text-xl font-black leading-tight text-[#18243a]">
        {valueText}
      </p>
    </section>
  );
}

function MatchCard({
  title,
  game,
  emptyText,
}: {
  title: string;
  game?: DisplayGame;
  emptyText: string;
}) {
  return (
    <section className="rounded-[30px] border border-[#d6dce5] bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[#d81e05]">
            Match centre
          </p>

          <h2 className="mt-1 text-2xl font-black text-[#18243a]">
            {title}
          </h2>
        </div>

        {game && (
          <span
            className={
              isLive(game)
                ? "rounded-full bg-[#d81e05] px-4 py-2 text-xs font-black tracking-widest text-white"
                : "rounded-full bg-[#18243a] px-4 py-2 text-xs font-black tracking-widest text-white"
            }
          >
            {isResult(game) ? "FT" : isLive(game) ? "LIVE" : game.kickOff}
          </span>
        )}
      </div>

      {game ? (
        <div className="rounded-[24px] bg-[#f3f5f8] p-5">
          <p className="text-sm font-black text-[#d81e05]">{game.date}</p>

          <div className="mt-4 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
            <p className="text-left text-lg font-black leading-tight text-[#18243a] sm:text-xl">
              {game.home}
            </p>

            <div
              className={
                isLive(game)
                  ? "rounded-2xl bg-[#d81e05] px-4 py-3 text-center text-white"
                  : "rounded-2xl bg-[#18243a] px-4 py-3 text-center text-white"
              }
            >
              {hasScore(game) ? (
                <p className="text-xl font-black">
                  {game.homeScore} - {game.awayScore}
                </p>
              ) : (
                <p className="text-sm font-black">VS</p>
              )}
            </div>

            <p className="text-right text-lg font-black leading-tight text-[#18243a] sm:text-xl">
              {game.away}
            </p>
          </div>

          <p className="mt-4 text-sm font-bold text-[#64748b]">
            {game.venue}
          </p>
        </div>
      ) : (
        <p className="rounded-[24px] bg-[#f3f5f8] p-5 text-sm font-bold leading-6 text-[#64748b]">
          {emptyText}
        </p>
      )}
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

function InfoCard({ title, text }: { title: string; text: string }) {
  return (
    <section className="rounded-[26px] border border-[#d6dce5] bg-white p-5 shadow-sm">
      <p className="text-xs font-black uppercase tracking-[0.18em] text-[#d81e05]">
        {title}
      </p>

      <p className="mt-3 text-sm font-bold leading-6 text-[#64748b]">
        {text || "Information to be added."}
      </p>
    </section>
  );
}

function ParkingCard({
  fallbackText,
  parkingSpots,
}: {
  fallbackText: string;
  parkingSpots: ParkingSpot[];
}) {
  return (
    <section className="rounded-[26px] border border-[#d6dce5] bg-white p-5 shadow-sm">
      <p className="text-xs font-black uppercase tracking-[0.18em] text-[#d81e05]">
        Parking
      </p>

      {parkingSpots.length > 0 ? (
        <div className="mt-3 space-y-3">
          {parkingSpots.slice(0, 2).map((spot) => (
            <a
              key={spot.name}
              href={`https://www.google.com/maps/dir/?api=1&destination=${spot.latitude},${spot.longitude}`}
              target="_blank"
              rel="noreferrer"
              className="block rounded-2xl bg-[#f3f5f8] p-4 text-[#18243a] no-underline transition hover:bg-[#e7edf5]"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-black">{spot.name}</p>

                  {spot.note && (
                    <p className="mt-1 text-xs font-bold leading-5 text-[#64748b]">
                      {spot.note}
                    </p>
                  )}
                </div>

                <span className="shrink-0 text-xs font-black text-[#d81e05]">
                  Directions →
                </span>
              </div>
            </a>
          ))}
        </div>
      ) : (
        <p className="mt-3 text-sm font-bold leading-6 text-[#64748b]">
          {fallbackText || "Parking information to be added."}
        </p>
      )}
    </section>
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

function readNumber(team: TeamData, keys: string[]) {
  for (const key of keys) {
    const value = team[key];

    if (typeof value === "number") {
      return value;
    }

    if (typeof value === "string") {
      const parsed = Number(value);

      if (!Number.isNaN(parsed)) {
        return parsed;
      }
    }
  }

  return null;
}

function readDisplayValue(team: TeamData, keys: string[]) {
  for (const key of keys) {
    const value = team[key];

    if (typeof value === "string" && value.trim() !== "") {
      return value;
    }

    if (Array.isArray(value)) {
      return value
        .map((item) => {
          if (typeof item === "string") {
            return item;
          }

          if (item && typeof item === "object" && "name" in item) {
            const objectItem = item as { name?: unknown };

            if (typeof objectItem.name === "string") {
              return objectItem.name;
            }
          }

          return "";
        })
        .filter(Boolean)
        .join(", ");
    }
  }

  return "Information to be added.";
}

function readParkingSpots(team: TeamData): ParkingSpot[] {
  const value = team.parkingSpots;

  if (!Array.isArray(value)) {
    return [];
  }

  const spots: ParkingSpot[] = [];

  for (const item of value) {
    if (!item || typeof item !== "object") {
      continue;
    }

    const parkingItem = item as {
      name?: unknown;
      note?: unknown;
      latitude?: unknown;
      longitude?: unknown;
    };

    const name = typeof parkingItem.name === "string" ? parkingItem.name : "";
    const note = typeof parkingItem.note === "string" ? parkingItem.note : "";

    const latitude = readSingleNumber(parkingItem.latitude);
    const longitude = readSingleNumber(parkingItem.longitude);

    if (!name || latitude === null || longitude === null) {
      continue;
    }

    spots.push({
      name,
      note,
      latitude,
      longitude,
    });
  }

  return spots;
}

function readSingleNumber(value: unknown) {
  if (typeof value === "number") {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number(value);

    if (!Number.isNaN(parsed)) {
      return parsed;
    }
  }

  return null;
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

function buildLocationText(city: string, address: string) {
  if (city && address) {
    return `${city} · ${address}`;
  }

  if (city) {
    return city;
  }

  if (address) {
    return address;
  }

  return "Location information to be added.";
}

function buildDirectionsUrl({
  latitude,
  longitude,
  stadium,
  address,
}: {
  latitude: number | null;
  longitude: number | null;
  stadium: string;
  address: string;
}) {
  if (latitude !== null && longitude !== null) {
    return `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
  }

  const destination = stadium || address;

  if (!destination) {
    return "";
  }

  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
    destination
  )}`;
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

function teamAppearsInGame(teamName: string, game: DisplayGame) {
  const teamNames = getTeamAliases(teamName);

  return (
    teamNames.includes(normaliseTeamName(game.home)) ||
    teamNames.includes(normaliseTeamName(game.away))
  );
}

function getTeamAliases(teamName: string) {
  const normalised = normaliseTeamName(teamName);
  const aliases = [normalised];

  if (normalised === "hull kingston rovers") {
    aliases.push("hull kr");
  }

  if (normalised === "hull kr") {
    aliases.push("hull kingston rovers");
  }

  if (normalised === "toulouse") {
    aliases.push("toulouse olympique");
  }

  if (normalised === "toulouse olympique") {
    aliases.push("toulouse");
  }

  return aliases;
}

function normaliseTeamName(name: string) {
  return name.trim().toLowerCase();
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