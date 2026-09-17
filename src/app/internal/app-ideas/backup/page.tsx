import Link from "next/link";

type BackupButton = {
  title: string;
  text: string;
  href?: string;
  icon: string;
  actionText: string;
};

const backupButtons: BackupButton[] = [
  {
    title: "Vehicle Checks",
    text: "Copy of the current Vehicle Checks journey, kept separate for alternative design work.",
    href: "/internal/vehicle-check-type2",
    icon: "\u2713",
    actionText: "OPEN",
  },
  {
    title: "Backup 2",
    text: "Reserved for another backup design or alternative workflow.",
    icon: "2",
    actionText: "TO BE ADDED",
  },
  {
    title: "Backup 3",
    text: "Reserved for another backup design or alternative workflow.",
    icon: "3",
    actionText: "TO BE ADDED",
  },
  {
    title: "Backup 4",
    text: "Reserved for another backup design or alternative workflow.",
    icon: "4",
    actionText: "TO BE ADDED",
  },
  {
    title: "Backup 5",
    text: "Reserved for another backup design or alternative workflow.",
    icon: "5",
    actionText: "TO BE ADDED",
  },
  {
    title: "Backup 6",
    text: "Reserved for another backup design or alternative workflow.",
    icon: "6",
    actionText: "TO BE ADDED",
  },
  {
    title: "Backup 7",
    text: "Reserved for another backup design or alternative workflow.",
    icon: "7",
    actionText: "TO BE ADDED",
  },
  {
    title: "Backup 8",
    text: "Reserved for another backup design or alternative workflow.",
    icon: "8",
    actionText: "TO BE ADDED",
  },
];

export default function BackupDesignsPage() {
  return (
    <main className="min-h-screen bg-[#f4f1ec] font-sans text-[#001b3a]">
      <header className="bg-[#c4002f] px-4 py-5 text-white sm:px-6 lg:px-10">
        <div className="mx-auto flex max-w-[1280px] flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border-2 border-white text-sm font-black">
              BAK
            </div>
            <div>
              <h1 className="text-xl font-black leading-none sm:text-2xl">Backup</h1>
              <p className="mt-1 text-sm font-black leading-none text-white/80">
                DriverOS design backups
              </p>
            </div>
          </div>
          <Link
            href="/internal/app-ideas"
            className="inline-flex min-h-[44px] items-center justify-center rounded-2xl border border-white/30 bg-white/10 px-5 py-3 text-sm font-black text-white no-underline transition hover:bg-white/20"
          >
            Back to DriverOS
          </Link>
        </div>
      </header>

      <section className="px-4 py-7 sm:px-6 lg:px-10">
        <div className="mx-auto mb-6 max-w-[1280px] rounded-[24px] border border-[#d0d7df] bg-white p-5 shadow-sm">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-[#c4002f]">
            Safe design area
          </p>
          <h2 className="mt-2 text-2xl font-black">Backup designs</h2>
          <p className="mt-2 max-w-[850px] text-sm font-bold leading-6 text-[#61748b]">
            Use these copies to test alternative designs without changing the current live mockup.
            Vehicle Checks is a separate copy of the existing journey.
          </p>
        </div>

        <div className="mx-auto grid max-w-[1280px] grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {backupButtons.map((button) => {
            const cardClass =
              "group flex min-h-[250px] flex-col rounded-[28px] border border-[#d0d7df] bg-white p-6 text-left text-[#001b3a] shadow-sm";

            const content = (
              <>
                <div className="mb-7 flex h-16 w-16 items-center justify-center rounded-3xl bg-[#c4002f] text-2xl font-black text-white">
                  {button.icon}
                </div>
                <h2 className="text-3xl font-black leading-tight">{button.title}</h2>
                <p className="mt-5 text-base font-bold leading-7 text-[#61748b]">{button.text}</p>
                <div className="mt-auto pt-8 text-xs font-black uppercase tracking-[0.16em] text-[#c4002f]">
                  {button.actionText}
                  {button.href && <span className="ml-2 transition group-hover:translate-x-1">{"\u2192"}</span>}
                </div>
              </>
            );

            return button.href ? (
              <Link
                key={button.title}
                href={button.href}
                className={`${cardClass} no-underline transition hover:-translate-y-1 hover:shadow-lg`}
              >
                {content}
              </Link>
            ) : (
              <div key={button.title} className={`${cardClass} opacity-75`}>
                {content}
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}