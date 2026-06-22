"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  DRIVER_NAME,
  DUTY_ID,
  DutyLeg,
  LegIssueReport,
  LegStatus,
  STORAGE_KEY,
  StoredManifestState,
  buildInitialManifestState,
  getCurrentTimeText,
  getTodayDateText,
  issueCategoryOptions,
  manifestLegs,
  updateRowsForLegComplete,
  updateRowsForLegStart,
} from "../driverPdaManifestData";

type Screen = "duty" | "destination" | "complete";

export default function ManifestMockupClient() {
  const [screen, setScreen] = useState<Screen>("duty");
  const [loaded, setLoaded] = useState(false);
  const [selectedLeg, setSelectedLeg] = useState(1);
  const [trailerModalOpen, setTrailerModalOpen] = useState(false);
  const [issueModalOpen, setIssueModalOpen] = useState(false);
  const [trailerInput, setTrailerInput] = useState("");
  const [trailerNumber, setTrailerNumber] = useState("");
  const [issueCategory, setIssueCategory] = useState("");
  const [issueDetails, setIssueDetails] = useState("");
  const [legStatuses, setLegStatuses] = useState<Record<number, LegStatus>>({});
  const [issueReports, setIssueReports] = useState<Record<number, LegIssueReport>>({});
  const [state, setState] = useState<StoredManifestState>(buildInitialManifestState);

  const today = useMemo(() => getTodayDateText(), []);
  const currentLeg = manifestLegs.find((leg) => leg.number === selectedLeg) || manifestLegs[0];

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);

    if (saved) {
      try {
        const parsed = JSON.parse(saved) as StoredManifestState;
        setState(parsed);
        setTrailerNumber(parsed.trailerNumber || "");
        setLegStatuses(parsed.legStatuses || buildInitialManifestState().legStatuses);
        setIssueReports(parsed.issueReports || {});
        setLoaded(true);
        return;
      } catch {
        const startingState = buildInitialManifestState();
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(startingState));
        setState(startingState);
        setLegStatuses(startingState.legStatuses);
        setIssueReports(startingState.issueReports);
        setLoaded(true);
        return;
      }
    }

    const startingState = buildInitialManifestState();
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(startingState));
    setState(startingState);
    setLegStatuses(startingState.legStatuses);
    setIssueReports(startingState.issueReports);
    setLoaded(true);
  }, []);

  function saveNextState(nextState: StoredManifestState) {
    setState(nextState);
    setTrailerNumber(nextState.trailerNumber);
    setLegStatuses(nextState.legStatuses);
    setIssueReports(nextState.issueReports);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextState));
  }

  function getLegStatus(legNumber: number) {
    return legStatuses[legNumber] || "To do";
  }

  function firstAvailableLeg() {
    const firstOpen = manifestLegs.find(
      (leg) => getLegStatus(leg.number) !== "Completed"
    );

    return firstOpen?.number || manifestLegs[manifestLegs.length - 1].number;
  }

  function canOpenLeg(legNumber: number) {
    return (
      legNumber === firstAvailableLeg() &&
      getLegStatus(legNumber) !== "Completed"
    );
  }

  function openLeg(legNumber: number) {
    if (!canOpenLeg(legNumber)) {
      return;
    }

    const existingTrailerForLeg =
      state.dctRows.find((row) => row.legNumber === legNumber)?.vehicleId || "";

    setSelectedLeg(legNumber);
    setTrailerInput(existingTrailerForLeg || trailerNumber);
    setTrailerModalOpen(true);
  }

  function confirmTrailerNumber() {
    const nextTrailerNumber = trailerInput.trim();

    if (!nextTrailerNumber) {
      return;
    }

    const nextLegStatuses = {
      ...legStatuses,
      [selectedLeg]: "In Progress" as LegStatus,
    };

    const nextDctRows = updateRowsForLegStart(
      state.dctRows,
      selectedLeg,
      nextTrailerNumber
    );

    saveNextState({
      ...state,
      trailerNumber: nextTrailerNumber,
      legStatuses: nextLegStatuses,
      dctRows: nextDctRows,
    });

    setTrailerModalOpen(false);
    setScreen("destination");
  }

  function openArrivalIssueModal() {
    setIssueCategory("");
    setIssueDetails("");
    setIssueModalOpen(true);
  }

  function saveIssueAndCompleteLeg() {
    if (!issueCategory.trim() || !issueDetails.trim()) {
      return;
    }

    const issueText = `Category: ${issueCategory.trim()} | Details: ${issueDetails.trim()}`;
    completeLeg(issueText, issueCategory.trim());
  }

  function completeWithNoIssue() {
    completeLeg("", "");
  }

  function completeLeg(issueText: string, category: string) {
    const finalLeg = selectedLeg === manifestLegs[manifestLegs.length - 1].number;

    const nextLegStatuses = {
      ...legStatuses,
      [selectedLeg]: "Completed" as LegStatus,
    };

    const existingIssueReport = issueReports[selectedLeg] || {};
    const nextIssueReports = {
      ...issueReports,
      [selectedLeg]: issueText
        ? {
            ...existingIssueReport,
            arrival: issueText,
          }
        : existingIssueReport,
    };

    const nextDctRows = updateRowsForLegComplete(
      state.dctRows,
      selectedLeg,
      issueText,
      category
    );

    saveNextState({
      ...state,
      legStatuses: nextLegStatuses,
      issueReports: nextIssueReports,
      dctRows: nextDctRows,
    });

    setIssueModalOpen(false);
    setIssueCategory("");
    setIssueDetails("");

    if (finalLeg) {
      setScreen("complete");
      return;
    }

    setScreen("duty");
  }

  if (!loaded) {
    return (
      <main className="min-h-screen bg-[#f4f1ec] font-sans text-[#222]">
        <section className="mx-auto flex min-h-screen max-w-[900px] items-center justify-center px-5">
          <p className="text-lg font-black text-[#222]">Loading manifest...</p>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f4f1ec] font-sans text-[#222]">
      <div className="relative mx-auto min-h-screen w-full max-w-[900px] bg-white shadow-2xl sm:my-6 sm:min-h-[900px] sm:rounded-[34px]">
        <PhoneStatusBar />

        {screen === "duty" && (
          <DutyScreen
            today={today}
            legs={manifestLegs}
            legStatuses={legStatuses}
            issueReports={issueReports}
            canOpenLeg={canOpenLeg}
            onOpenLeg={openLeg}
          />
        )}

        {screen === "destination" && (
          <DestinationScreen
            today={today}
            trailerNumber={trailerNumber}
            leg={currentLeg}
            status={getLegStatus(selectedLeg)}
            issueReport={issueReports[selectedLeg]}
            onBack={() => setScreen("duty")}
            onArriveIntoDepot={openArrivalIssueModal}
          />
        )}

        {screen === "complete" && (
          <CompleteScreen
            today={today}
            trailerNumber={trailerNumber}
            leg={currentLeg}
            status="Completed"
            issueReport={issueReports[selectedLeg]}
          />
        )}

        {trailerModalOpen && (
          <TrailerNumberModal
            trailerInput={trailerInput}
            onChange={setTrailerInput}
            onCancel={() => {
              setTrailerInput("");
              setTrailerModalOpen(false);
            }}
            onConfirm={confirmTrailerNumber}
          />
        )}

        {issueModalOpen && (
          <IssueModal
            category={issueCategory}
            details={issueDetails}
            onCategoryChange={setIssueCategory}
            onDetailsChange={setIssueDetails}
            onCancel={() => setIssueModalOpen(false)}
            onSave={saveIssueAndCompleteLeg}
            onNoIssue={completeWithNoIssue}
          />
        )}
      </div>
    </main>
  );
}

function PhoneStatusBar() {
  return (
    <div className="flex h-[54px] items-center justify-between bg-[#d6001c] px-7 text-white sm:rounded-t-[34px]">
      <div className="rounded-full bg-white/20 px-5 py-1 text-lg font-black">
        {getCurrentTimeText()}
      </div>

      <div className="flex items-center gap-2 text-lg font-black">
        <span>▮▮▮</span>
        <span>5G</span>
        <span className="rounded-md border-2 border-white px-2 text-sm">▰</span>
      </div>
    </div>
  );
}

function AppHeader({
  title,
  left,
  onBack,
}: {
  title: string;
  left?: string;
  onBack?: () => void;
}) {
  return (
    <header className="flex h-[72px] items-center justify-between border-b border-[#e5e7eb] bg-white px-5">
      <div className="w-[120px]">
        {left && onBack && (
          <button
            type="button"
            onClick={onBack}
            className="text-sm font-black text-[#d6001c]"
          >
            ‹ {left}
          </button>
        )}
      </div>

      <h1 className="text-xl font-black text-[#222]">{title}</h1>

      <div className="w-[120px] text-right text-3xl font-black text-[#333]">
        ⋮
      </div>
    </header>
  );
}

function DutyScreen({
  today,
  legs,
  legStatuses,
  issueReports,
  canOpenLeg,
  onOpenLeg,
}: {
  today: string;
  legs: DutyLeg[];
  legStatuses: Record<number, LegStatus>;
  issueReports: Record<number, LegIssueReport>;
  canOpenLeg: (legNumber: number) => boolean;
  onOpenLeg: (legNumber: number) => void;
}) {
  return (
    <>
      <AppHeader title="Manifest" left="Back" onBack={() => window.history.back()} />

      <section className="bg-white px-5 py-6 sm:px-8">
        <OverviewCard />

        <h2 className="mt-10 text-2xl font-black text-[#222]">Duty details</h2>

        <p className="mt-6 text-xl font-bold text-[#333]">{today}</p>

        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          {legs.map((leg) => (
            <LegCard
              key={leg.number}
              leg={leg}
              status={legStatuses[leg.number] || "To do"}
              issueReport={issueReports[leg.number]}
              canOpen={canOpenLeg(leg.number)}
              onClick={() => onOpenLeg(leg.number)}
            />
          ))}
        </div>

        <BackToDashboardButton />
      </section>
    </>
  );
}

function DestinationScreen({
  today,
  trailerNumber,
  leg,
  status,
  issueReport,
  onBack,
  onArriveIntoDepot,
}: {
  today: string;
  trailerNumber: string;
  leg: DutyLeg;
  status: LegStatus;
  issueReport?: LegIssueReport;
  onBack: () => void;
  onArriveIntoDepot: () => void;
}) {
  return (
    <>
      <AppHeader title="Destination Tasks" left="Back" onBack={onBack} />

      <section className="bg-white px-5 py-5 sm:px-8">
        <TrailerNumberBanner trailerNumber={trailerNumber} />

        <p className="mt-6 text-lg font-bold text-[#333]">{today}</p>

        <div className="mt-3 max-w-[720px]">
          <LegCard leg={leg} status={status} issueReport={issueReport} />
        </div>

        <h2 className="mt-8 text-2xl font-black text-[#222]">
          Destination task details
        </h2>

        <button
          type="button"
          onClick={onArriveIntoDepot}
          className="mt-4 flex w-full max-w-[720px] items-center justify-between rounded-lg border border-[#d9d9d9] border-l-4 border-l-[#d6001c] bg-white px-4 py-4 text-left text-sm font-black text-[#222] shadow-sm"
        >
          <span>Arrive into depot</span>
          <span className="text-2xl font-black text-[#d6001c]">›</span>
        </button>

        {issueReport && issueReport.arrival && (
          <IssueRecordedBox legNumber={leg.number} issueReport={issueReport} />
        )}

        <BackToDashboardButton />
      </section>
    </>
  );
}

function CompleteScreen({
  today,
  trailerNumber,
  leg,
  status,
  issueReport,
}: {
  today: string;
  trailerNumber: string;
  leg: DutyLeg;
  status: LegStatus;
  issueReport?: LegIssueReport;
}) {
  return (
    <>
      <AppHeader title="Manifest" />

      <section className="bg-white px-5 py-6 sm:px-8">
        <OverviewCard />

        <h2 className="mt-10 text-2xl font-black text-[#222]">Duty details</h2>

        <p className="mt-8 text-xl font-bold text-[#333]">{today}</p>

        <div className="mt-4 max-w-[720px]">
          <LegCard leg={leg} status={status} issueReport={issueReport} />
        </div>

        <TrailerNumberBanner trailerNumber={trailerNumber} />

        <section className="mt-6 max-w-[720px] rounded-[18px] bg-[#d9f7e5] p-5">
          <h2 className="text-2xl font-black text-[#067a35]">Duty completed</h2>

          <p className="mt-3 text-base font-bold leading-7 text-[#18243a]">
            Your duty has been completed. It is now OK to close the app
            completely.
          </p>
        </section>

        <BackToDashboardButton />
      </section>
    </>
  );
}

function OverviewCard() {
  return (
    <section className="max-w-[720px] rounded-[18px] bg-[#f0f0f0] p-5">
      <h2 className="text-2xl font-black text-[#222]">Overview</h2>

      <p className="mt-6 text-lg font-bold text-[#333]">
        <span className="font-black">Driver name:</span> {DRIVER_NAME}
      </p>

      <p className="mt-4 text-lg font-bold text-[#333]">
        <span className="font-black">Duty ID:</span> {DUTY_ID}
      </p>
    </section>
  );
}

function LegCard({
  leg,
  status,
  issueReport,
  canOpen,
  onClick,
}: {
  leg: DutyLeg;
  status: LegStatus;
  issueReport?: LegIssueReport;
  canOpen?: boolean;
  onClick?: () => void;
}) {
  const isInteractive = typeof canOpen === "boolean" && typeof onClick === "function";
  const isLocked = isInteractive && !canOpen && status !== "Completed";

  return (
    <button
      type="button"
      onClick={isInteractive && canOpen ? onClick : undefined}
      disabled={isInteractive ? !canOpen : false}
      className={`w-full rounded-[18px] border border-[#d0d0d0] p-4 text-left shadow-sm transition ${
        isInteractive && canOpen
          ? "bg-white hover:-translate-y-1 hover:shadow-md"
          : status === "Completed"
          ? "bg-[#f0f0f0]"
          : isLocked
          ? "bg-[#f4f4f4] opacity-55"
          : "bg-white"
      }`}
    >
      <div className="mb-5 flex items-center justify-between gap-3">
        <p className="text-lg font-black text-[#444]">Leg {leg.number}</p>
        <StatusPill status={status} />
      </div>

      <div className="grid grid-cols-2 gap-4 text-lg font-bold text-[#666]">
        <p>ETD: {leg.etd}</p>
        <p className="text-right">ETA: {leg.eta}</p>
      </div>

      <div className="mt-6 grid grid-cols-[1fr_42px_1fr] items-center gap-2">
        <p className="text-base font-black uppercase leading-tight text-[#333] sm:text-lg">
          {leg.from}
        </p>

        <div className="flex items-center justify-center text-2xl font-black text-[#d6d6d6] sm:text-3xl">
          →
        </div>

        <p className="text-right text-base font-black uppercase leading-tight text-[#333] sm:text-lg">
          {leg.to}
        </p>
      </div>

      {issueReport && issueReport.arrival && (
        <section className="mt-4 rounded-[14px] border border-[#f59e0b] bg-[#fff7ed] p-3">
          <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#b45309]">
            Issue / route change recorded
          </p>
          <p className="mt-1 text-xs font-bold leading-5 text-[#7c2d12]">
            <span className="font-black">Leg {leg.number} Arrival Issue:</span>{" "}
            {issueReport.arrival}
          </p>
        </section>
      )}

      {isLocked && (
        <p className="mt-4 text-xs font-black uppercase tracking-[0.12em] text-[#999]">
          Complete previous leg first
        </p>
      )}
    </button>
  );
}

function StatusPill({ status }: { status: LegStatus }) {
  const classes =
    status === "Completed"
      ? "bg-[#d9f7e5] text-[#067a35] border-[#067a35]"
      : status === "In Progress"
      ? "bg-[#ffe0d4] text-[#a23a00] border-[#e9581f]"
      : "bg-[#bde8ff] text-[#125a7c] border-[#2290c5]";

  const label = status === "Completed" ? "Done" : status;

  return (
    <span className={`rounded-full border-2 px-5 py-2 text-base font-black ${classes}`}>
      {label}
    </span>
  );
}

function TrailerNumberModal({
  trailerInput,
  onChange,
  onCancel,
  onConfirm,
}: {
  trailerInput: string;
  onChange: (value: string) => void;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const canConfirm = trailerInput.trim().length > 0;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 px-5 py-4">
      <section className="w-full max-w-[390px] bg-white p-6 shadow-2xl">
        <h2 className="text-2xl font-black text-[#222]">Information Required</h2>

        <p className="mt-3 text-sm font-bold leading-6 text-[#444]">
          Please provide your trailer number to proceed.
        </p>

        <label htmlFor="trailer-number" className="mt-5 block text-sm font-black text-[#222]">
          Trailer Number
        </label>

        <input
          id="trailer-number"
          value={trailerInput}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Enter trailer number"
          className="mt-2 w-full border-2 border-[#888] px-4 py-3 text-base font-bold text-[#222] outline-none focus:border-[#d6001c]"
        />

        <div className="mt-5 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full border-2 border-[#333] bg-white px-5 py-3 text-sm font-black text-[#333]"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={!canConfirm}
            className={`rounded-full px-5 py-3 text-sm font-black text-white ${
              canConfirm ? "bg-[#d6001c]" : "bg-[#cccccc]"
            }`}
          >
            Confirm
          </button>
        </div>
      </section>
    </div>
  );
}

function IssueModal({
  category,
  details,
  onCategoryChange,
  onDetailsChange,
  onCancel,
  onSave,
  onNoIssue,
}: {
  category: string;
  details: string;
  onCategoryChange: (value: string) => void;
  onDetailsChange: (value: string) => void;
  onCancel: () => void;
  onSave: () => void;
  onNoIssue: () => void;
}) {
  const canSave = category.trim().length > 0 && details.trim().length > 0;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 px-5 py-4">
      <section className="max-h-[calc(100dvh-32px)] w-full max-w-[430px] overflow-y-auto rounded-sm bg-white p-6 shadow-2xl">
        <h2 className="text-2xl font-black text-[#111]">Issue / Route Change</h2>

        <p className="mt-3 text-sm font-bold leading-6 text-[#444]">
          Before completing this leg, record any issue, delay, different location,
          route change, or other information in the box below. If there was no
          issue, select No Issue.
        </p>

        <label className="mt-5 block text-sm font-black text-[#222]">
          Issue category
        </label>

        <select
          value={category}
          onChange={(event) => onCategoryChange(event.target.value)}
          className="mt-2 w-full border-2 border-[#888] bg-white px-4 py-3 text-base font-bold text-[#222] outline-none focus:border-[#d6001c]"
        >
          <option value="">Select an issue category</option>
          {issueCategoryOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>

        <label className="mt-4 block text-sm font-black text-[#222]">
          Issue / route change details
        </label>

        <textarea
          value={details}
          onChange={(event) => onDetailsChange(event.target.value)}
          placeholder="Example: delayed arrival, traffic, gate queue, different location, route change, authorised by..."
          className="mt-2 min-h-[130px] w-full border-2 border-[#888] px-4 py-3 text-base font-bold text-[#222] outline-none focus:border-[#d6001c]"
        />

        <div className="mt-5 space-y-3">
          <button
            type="button"
            onClick={onSave}
            disabled={!canSave}
            className={`w-full rounded-full px-5 py-3 text-sm font-black text-white ${
              canSave ? "bg-[#d6001c]" : "bg-[#cccccc]"
            }`}
          >
            Save Details & Complete Leg
          </button>

          <button
            type="button"
            onClick={onNoIssue}
            className="w-full rounded-full border-2 border-[#333] bg-white px-5 py-3 text-sm font-black text-[#333]"
          >
            No Issue
          </button>

          <button
            type="button"
            onClick={onCancel}
            className="w-full rounded-full border-2 border-[#d6001c] bg-white px-5 py-3 text-sm font-black text-[#d6001c]"
          >
            Cancel
          </button>
        </div>
      </section>
    </div>
  );
}

function IssueRecordedBox({
  legNumber,
  issueReport,
}: {
  legNumber: number;
  issueReport: LegIssueReport;
}) {
  return (
    <section className="mt-4 max-w-[720px] rounded-[16px] border-2 border-[#f59e0b] bg-[#fff7ed] p-4">
      <p className="text-xs font-black uppercase tracking-[0.16em] text-[#b45309]">
        Issue details recorded
      </p>

      <p className="mt-2 text-sm font-bold leading-6 text-[#7c2d12]">
        <span className="font-black">Leg {legNumber} Arrival Issue:</span>{" "}
        {issueReport.arrival}
      </p>
    </section>
  );
}

function TrailerNumberBanner({ trailerNumber }: { trailerNumber: string }) {
  return (
    <div className="max-w-[720px] rounded-lg bg-[#f0f0f0] px-4 py-3 text-sm font-black text-[#444]">
      Trailer number: {trailerNumber}
    </div>
  );
}

function BackToDashboardButton() {
  return (
    <Link
      href="/internal/app-ideas"
      className="mt-7 block w-full max-w-[720px] rounded-[18px] border-2 border-[#d6001c] bg-white px-5 py-4 text-center text-sm font-black uppercase tracking-[0.16em] text-[#d6001c] no-underline"
    >
      Back to Dashboard
    </Link>
  );
}
