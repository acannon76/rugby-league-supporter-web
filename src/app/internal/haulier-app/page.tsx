import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Haulier App Mockup",
  description: "Hidden mockup page for a haulier app concept.",
  robots: {
    index: false,
    follow: false,
  },
};

const appButtons = [
  {
    title: "Available Jobs",
    text: "View available work, basic job information and job status.",
    icon: "●",
  },
  {
    title: "Accepted Jobs",
    text: "View confirmed jobs and key journey information.",
    icon: "✓",
  },
  {
    title: "Messages",
    text: "Read updates, instructions and operational notifications.",
    icon: "✉",
  },
  {
    title: "Help / Support",
    text: "Access guidance, contact routes and support information.",
    icon: "?",
  },
];

export default function HaulierAppMockupPage() {
  return (
    <main className="min-h-screen bg-[#f4f1ec] font-sans text-[#111]">
      <header className="border-b border-white/20 bg-[#b00020] px-4 py-4 text-white sm:px-6 lg:px-10">
        <div className="mx-auto flex max-w-[1180px] items-center justify-between gap-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border-2 border-white bg-[#7d0017] text-lg font-black text-white">
              HA
            </div>

            <div>
              <p className="text-lg font-black leading-none text-white">
                Haulier App
              </p>
              <p className="text-sm font-black leading-none text-[#ffd9df]">
                Hidden Concept Mockup
              </p>
            </div>
          </div>

          <p className="hidden text-sm font-black text-[#ffd9df] sm:block">
            Private mockup page
          </p>
        </div>
      </header>

      <section className="bg-[#b00020] px-4 py-8 text-white sm:px-6 lg:px-10 lg:py-12">
        <div className="mx-auto max-w-[1180px]">
          <p className="mb-4 text-xs font-black uppercase tracking-[0.22em] text-[#ffd9df]">
            Haulier App
          </p>

          <h1 className="max-w-[820px] text-[44px] font-black leading-[0.95] sm:text-[68px] lg:text-[84px]">
            A simple portal for haulier job visibility.
          </h1>

          <p className="mt-5 max-w-[760px] text-base font-bold leading-7 text-[#ffecef] sm:text-lg">
            Hidden mockup page for showing how hauliers could view available
            work, accepted jobs, updates and support information in one place.
          </p>
        </div>
      </section>

      <section className="px-4 py-6 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-[1180px]">
          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {appButtons.map((button) => (
              <ActionCard
                key={button.title}
                title={button.title}
                text={button.text}
                icon={button.icon}
              />
            ))}
          </section>

          <section className="mt-7 rounded-[30px] border border-[#d6dce5] bg-white p-6 shadow-sm">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#b00020]">
              Mockup note
            </p>

            <h2 className="mt-3 text-3xl font-black text-[#18243a]">
              Separate hidden concept page.
            </h2>

            <p className="mt-3 text-sm font-bold leading-6 text-[#64748b]">
              This page is not linked to the Rugby League supporter app or the
              Driver PDA mockup. It is intended as a standalone hidden concept
              page only.
            </p>
          </section>
        </div>
      </section>
    </main>
  );
}

function ActionCard({
  title,
  text,
  icon,
}: {
  title: string;
  text: string;
  icon: string;
}) {
  return (
    <div className="group flex min-h-[220px] flex-col rounded-[32px] border border-[#d6dce5] bg-white p-6 text-left text-[#111] shadow-sm transition hover:-translate-y-1 hover:shadow-lg sm:min-h-[260px] lg:min-h-[300px]">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-3xl bg-[#b00020] text-3xl font-black text-white transition group-hover:bg-[#7d0017]">
        {icon}
      </div>

      <h2 className="text-3xl font-black leading-tight text-[#18243a]">
        {title}
      </h2>

      <p className="mt-3 text-sm font-bold leading-6 text-[#64748b]">
        {text}
      </p>

      <div className="mt-auto flex items-center gap-2 pt-6 text-xs font-black uppercase tracking-widest text-[#b00020]">
        Mockup <span className="transition group-hover:translate-x-1">→</span>
      </div>
    </div>
  );
}