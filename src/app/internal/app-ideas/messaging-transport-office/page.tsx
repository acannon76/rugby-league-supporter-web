"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import VehicleCheckTimer from "../../vehicle-checks/VehicleCheckTimer";

export default function MessagingTransportOfficePage() {
  const [message, setMessage] = useState("");
  const [showSentMessage, setShowSentMessage] = useState(false);

  function handleSend(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!message.trim()) {
      return;
    }

    setShowSentMessage(true);
    setMessage("");
  }

  return (
    <main className="min-h-screen bg-[#f4f1ec] font-sans text-[#001b3a]">
      <header className="bg-[#c4002f] px-4 py-5 text-white sm:px-6 lg:px-10">
        <div className="mx-auto flex max-w-[1280px] flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border-2 border-white text-base font-black">
              HGV
            </div>

            <div>
              <h1 className="text-xl font-black leading-none sm:text-2xl">
                Messaging Transport Office
              </h1>
              <p className="text-sm font-black leading-none sm:text-base">
                Driver PDA Concept
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:ml-auto sm:flex-row sm:items-center">
            <VehicleCheckTimer />

            <div className="rounded-2xl border border-white/30 bg-white/10 px-5 py-3 text-right">
              <p className="text-xs font-black uppercase tracking-[0.16em]">
                Driver
              </p>
              <p className="text-base font-black">Andrew Cannon</p>
            </div>

            <Link
              href="/internal/app-ideas/messaging"
              className="rounded-2xl border border-white/30 bg-white/10 px-5 py-3 text-sm font-black text-white no-underline transition hover:bg-white/20"
            >
              Back
            </Link>
          </div>
        </div>
      </header>

      <section className="px-4 py-7 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-[1280px]">
          <section className="rounded-[28px] border border-[#d0d7df] bg-white p-6 shadow-sm sm:p-8">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#c4002f]">
              Messaging mockup
            </p>
            <h2 className="mt-3 text-4xl font-black leading-tight text-[#001b3a] sm:text-5xl">
              Messaging Transport Office
            </h2>
            <p className="mt-4 max-w-[860px] text-base font-bold leading-7 text-[#61748b]">
              Enter your message below and press send to send the message to the transport office.
            </p>

            <form onSubmit={handleSend} className="mt-8 space-y-5">
              <div>
                <label
                  htmlFor="transport-office-message"
                  className="mb-3 block text-sm font-black uppercase tracking-[0.14em] text-[#001b3a]"
                >
                  Message to transport office
                </label>
                <textarea
                  id="transport-office-message"
                  value={message}
                  onChange={(event) => {
                    setMessage(event.target.value);
                    if (showSentMessage) {
                      setShowSentMessage(false);
                    }
                  }}
                  placeholder="Type your message here..."
                  autoFocus
                  rows={8}
                  className="w-full rounded-[20px] border border-[#d0d7df] bg-[#f9fafb] px-5 py-4 text-base font-semibold text-[#001b3a] outline-none transition focus:border-[#c4002f] focus:ring-2 focus:ring-[#c4002f]/20"
                />
              </div>

              <button
                type="submit"
                disabled={!message.trim()}
                className="inline-flex min-h-[50px] items-center justify-center rounded-[16px] bg-[#c4002f] px-8 py-3 text-sm font-black uppercase tracking-[0.14em] text-white transition hover:bg-[#9f0026] disabled:cursor-not-allowed disabled:bg-[#d78a9f]"
              >
                Send
              </button>
            </form>

            {showSentMessage && (
              <div className="mt-6 rounded-[20px] border-2 border-[#067a35] bg-[#d9f7e5] px-5 py-4 text-[#067a35] shadow-sm">
                <p className="text-xs font-black uppercase tracking-[0.16em]">
                  Message sent
                </p>
                <p className="mt-2 text-base font-black">
                  Your message has been sent to the transport office.
                </p>
              </div>
            )}
          </section>
        </div>
      </section>
    </main>
  );
}
