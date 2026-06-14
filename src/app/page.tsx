import Link from "next/link";

type IconKey = "table" | "calendar" | "score" | "team";

type HomeCardData = {
  href: string;
  icon: IconKey;
  title: string;
  text: string;
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
  return (
    <main className="min-h-screen bg-[#efe6d8] px-4 py-5 font-sans sm:px-6 lg:px-10">
      <div className="mx-auto max-w-[1180px]">
        <section className="relative overflow-hidden rounded-[34px] border-[3px] border-[#d81e05] bg-[#111] p-6 text-white shadow-xl sm:p-8 lg:p-10">
          <div className="absolute right-[-80px] top-[-80px] h-[210px] w-[210px] rounded-full bg-[#d81e05] opacity-25" />
          <div className="absolute bottom-[-110px] left-[-90px] h-[240px] w-[240px] rounded-full bg-[#d81e05] opacity-20" />

          <div className="relative z-10">
            <p className="mb-4 text-xs font-black tracking-[0.2em] text-[#d81e05] sm:text-sm">
              INDEPENDENT SUPPORTER GUIDE
            </p>

            <h1 className="max-w-[850px] text-[42px] font-black leading-[0.95] sm:text-[70px] lg:text-[92px]">
              Rugby Super League
              <span className="block text-[#d81e05]">Supporter</span>
            </h1>

            <p className="mt-5 max-w-[720px] text-base font-bold leading-7 text-[#efe6d8] sm:text-lg lg:text-xl">
              Fixtures, results, league table and club guides for supporters
              following Super League.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <FeaturePill text="Fixtures" />
              <FeaturePill text="Results" />
              <FeaturePill text="League Table" />
              <FeaturePill text="Club Guides" />
            </div>
          </div>
        </section>

        <section className="mt-6 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-black tracking-[0.18em] text-[#d81e05]">
              MATCHDAY HUB
            </p>

            <h2 className="mt-1 text-2xl font-black text-[#111] sm:text-3xl">
              What do you need?
            </h2>
          </div>
        </section>

        <section className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {homeCards.map((card) => (
            <HomeCard
              key={card.href}
              href={card.href}
              icon={card.icon}
              title={card.title}
              text={card.text}
            />
          ))}
        </section>

        <section className="mt-6 rounded-[28px] border-[3px] border-[#111] bg-[#f5ede0] p-5">
          <p className="text-xs font-black tracking-[0.18em] text-[#d81e05]">
            QUICK UPDATE
          </p>

          <h2 className="mt-2 text-2xl font-black text-[#111]">
            Built for quick matchday checks.
          </h2>

          <p className="mt-2 text-sm font-bold leading-6 text-[#444]">
            Check the latest table, upcoming fixtures, recent results and team
            information from one simple homepage.
          </p>
        </section>
      </div>
    </main>
  );
}

function FeaturePill({ text }: { text: string }) {
  return (
    <span className="rounded-full border-2 border-[#d81e05] bg-[#1c1c1c] px-4 py-2 text-xs font-black tracking-wide text-white">
      {text}
    </span>
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
      className="group flex min-h-[155px] flex-col rounded-[28px] border-[3px] border-[#111] bg-[#f5ede0] p-5 text-[#111] no-underline transition hover:-translate-y-1 hover:bg-white hover:shadow-lg sm:min-h-[185px]"
    >
      <div className="mb-5 flex h-[52px] w-[52px] items-center justify-center rounded-full bg-[#111] text-white transition group-hover:bg-[#d81e05]">
        <CardIcon icon={icon} />
      </div>

      <h2 className="text-2xl font-black leading-tight text-[#111] lg:text-xl">
        {title}
      </h2>

      <p className="mt-2 text-sm font-extrabold leading-5 text-[#444]">
        {text}
      </p>

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