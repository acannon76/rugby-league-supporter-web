import Link from "next/link";
import { notFound } from "next/navigation";
import { teamsData } from "@/data/teamsData";

type TeamData = Record<string, unknown>;
type TeamsRecord = Record<string, TeamData>;

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
      title: "Parking",
      text: readDisplayValue(team, [
        "parking",
        "parkingInfo",
        "carParking",
        "parkingDetails",
      ]),
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
    <main className="min-h-screen bg-[#efe6d8] px-4 py-6 font-sans sm:px-6 lg:px-10">
      <div className="mx-auto max-w-[1180px]">
        <div className="mb-5 flex flex-wrap gap-4">
          <Link
            href="/teams"
            className="inline-block text-sm font-black tracking-wide text-[#111] no-underline"
          >
            ← BACK TO TEAMS
          </Link>

          <Link
            href="/"
            className="inline-block text-sm font-black tracking-wide text-[#111] no-underline"
          >
            HOME
          </Link>
        </div>

        <section className="mb-6 grid gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-stretch">
          <div className="rounded-[34px] border-[3px] border-[#111] bg-[#d81e05] p-6 text-[#111] sm:p-8 lg:p-10">
            <p className="mb-3 text-xs font-black tracking-[0.18em]">
              CLUB GUIDE
            </p>

            <h1 className="text-[46px] font-black leading-none sm:text-[68px] lg:text-[82px]">
              {name}
            </h1>

            <p className="mt-5 max-w-[700px] text-sm font-extrabold leading-6 sm:text-base lg:text-lg">
              {stadium
                ? `${stadium} supporter information, travel details and matchday guide.`
                : "Supporter information, travel details and matchday guide."}
            </p>

            {directionsUrl && (
              <a
                href={directionsUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-6 inline-block rounded-full border-[3px] border-[#111] bg-[#111] px-5 py-3 text-sm font-black tracking-wide text-white no-underline transition hover:bg-[#d81e05] hover:text-[#111]"
              >
                GET DIRECTIONS →
              </a>
            )}
          </div>

          <div className="overflow-hidden rounded-[34px] border-[3px] border-[#111] bg-[#111]">
            {imageSource ? (
              <img
                src={imageSource}
                alt={`${name} stadium`}
                className="h-full min-h-[280px] w-full object-cover sm:min-h-[360px] lg:min-h-[460px]"
              />
            ) : (
              <div className="flex min-h-[300px] items-center justify-center p-8 text-center">
                <div>
                  <p className="text-xs font-black tracking-[0.18em] text-[#d81e05]">
                    STADIUM IMAGE
                  </p>

                  <p className="mt-3 text-3xl font-black text-white">
                    Image to be added
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {infoCards.map((card) => (
            <InfoCard key={card.title} title={card.title} text={card.text} />
          ))}
        </section>
      </div>
    </main>
  );
}

function InfoCard({ title, text }: { title: string; text: string }) {
  return (
    <section className="rounded-[28px] border-[3px] border-[#111] bg-[#f5ede0] p-5 text-[#111]">
      <p className="text-xs font-black uppercase tracking-[0.16em] text-[#d81e05]">
        {title}
      </p>

      <p className="mt-3 text-sm font-bold leading-6 text-[#333]">
        {text || "Information to be added."}
      </p>
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