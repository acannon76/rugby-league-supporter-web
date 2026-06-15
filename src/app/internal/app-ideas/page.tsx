import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "App Ideas",
  description: "Private app idea notes.",
  robots: {
    index: false,
    follow: false,
  },
};

const ideas = [
  {
    title: "Simple dashboard",
    text: "A clear front page showing the key information users need straight away.",
  },
  {
    title: "User-friendly forms",
    text: "Reduce typing by using dropdowns, buttons, saved options and simple validation.",
  },
  {
    title: "Status tracking",
    text: "Show whether something is new, in progress, completed, delayed or needs attention.",
  },
  {
    title: "Reports and summaries",
    text: "Create easy-to-read summaries that can be viewed on phone, tablet or desktop.",
  },
  {
    title: "Notifications",
    text: "Future idea: notify users when something changes or needs action.",
  },
  {
    title: "Admin area",
    text: "Future idea: allow selected users to update data without touching code.",
  },
];

export default function AppIdeasPage() {
  return (
    <main className="min-h-screen bg-[#eef1f5] font-sans text-[#111]">
      <header className="border-b border-white/10 bg-[#18243a] px-4 py-4 text-white sm:px-6 lg:px-10">
        <div className="mx-auto flex max-w-[1180px] items-center justify-between gap-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border-2 border-[#35d6b4] bg-[#111827] text-lg font-black text-white">
              RL
            </div>

            <div>
              <p className="text-lg font-black leading-none text-white">
                Hidden Notes
              </p>
              <p className="text-sm font-black leading-none text-[#35d6b4]">
                App Ideas
              </p>
            </div>
          </div>

          <Link href="/" className="text-sm font-black text-white no-underline">
            Back to website
          </Link>
        </div>
      </header>

      <section className="bg-[#18243a] px-4 py-8 text-white sm:px-6 lg:px-10 lg:py-12">
        <div className="mx-auto max-w-[1180px]">
          <p className="mb-4 text-xs font-black uppercase tracking-[0.22em] text-[#35d6b4]">
            Hidden page
          </p>

          <h1 className="max-w-[800px] text-[46px] font-black leading-[0.98] sm:text-[66px] lg:text-[82px]">
            App ideas and future notes.
          </h1>

          <p className="mt-5 max-w-[760px] text-base font-bold leading-7 text-[#dce4f0] sm:text-lg">
            A simple private reference page for general app ideas, possible
            features and future development notes.
          </p>
        </div>
      </section>

      <section className="px-4 py-6 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-[1180px]">
          <section className="mb-7 rounded-[30px] border border-[#d6dce5] bg-white p-6 shadow-sm">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#d81e05]">
              Reminder
            </p>

            <h2 className="mt-3 text-3xl font-black text-[#18243a]">
              This page is hidden, not password protected.
            </h2>

            <p className="mt-3 text-sm font-bold leading-6 text-[#64748b]">
              It is not linked from the public website and is marked as
              no-index for search engines. Anyone with the direct URL could
              still view it, so avoid adding sensitive or confidential details.
            </p>
          </section>

          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {ideas.map((idea) => (
              <article
                key={idea.title}
                className="rounded-[26px] border border-[#d6dce5] bg-white p-5 shadow-sm"
              >
                <p className="text-xs font-black uppercase tracking-[0.18em] text-[#d81e05]">
                  Idea
                </p>

                <h2 className="mt-3 text-2xl font-black text-[#18243a]">
                  {idea.title}
                </h2>

                <p className="mt-3 text-sm font-bold leading-6 text-[#64748b]">
                  {idea.text}
                </p>
              </article>
            ))}
          </section>
        </div>
      </section>
    </main>
  );
}