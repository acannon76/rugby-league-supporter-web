import Link from "next/link";

export default function ContactPage() {
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
        <div className="mx-auto max-w-[1180px]">
          <p className="mb-4 text-xs font-black uppercase tracking-[0.22em] text-[#35d6b4]">
            Contact us
          </p>

          <h1 className="max-w-[760px] text-[46px] font-black leading-[0.98] sm:text-[66px] lg:text-[82px]">
            Help improve the supporter guide.
          </h1>

          <p className="mt-5 max-w-[760px] text-base font-bold leading-7 text-[#dce4f0] sm:text-lg">
            This site is being built as an independent Rugby League supporter
            guide. In the future, you will be able to send fixture corrections,
            stadium updates, parking information and general feedback.
          </p>
        </div>
      </section>

      <section className="px-4 py-6 sm:px-6 lg:px-10">
        <div className="mx-auto grid max-w-[1180px] gap-5 lg:grid-cols-[0.9fr_1.1fr]">
          <section className="rounded-[30px] border border-[#d6dce5] bg-white p-6 shadow-sm">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#d81e05]">
              Email
            </p>

            <h2 className="mt-3 text-3xl font-black text-[#18243a]">
              Contact email coming soon
            </h2>

            <p className="mt-3 text-sm font-bold leading-6 text-[#64748b]">
              An email address has not been set up yet. Once available, this
              page will show the correct contact details for supporter feedback
              and updates.
            </p>
          </section>

          <section className="rounded-[30px] border border-[#d6dce5] bg-white p-6 shadow-sm">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#d81e05]">
              What to send
            </p>

            <h2 className="mt-3 text-3xl font-black text-[#18243a]">
              Useful updates
            </h2>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <ContactItem text="Fixture or result corrections" />
              <ContactItem text="Stadium information updates" />
              <ContactItem text="Parking and travel notes" />
              <ContactItem text="Away end information" />
              <ContactItem text="Local pub suggestions" />
              <ContactItem text="Broken links or errors" />
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}

function ContactItem({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-[#f3f5f8] p-4">
      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#35d6b4] text-sm font-black text-[#111827]">
        ✓
      </div>

      <p className="text-sm font-black text-[#18243a]">{text}</p>
    </div>
  );
}