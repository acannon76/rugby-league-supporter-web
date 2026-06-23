"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  DRIVER_NAME,
  DUTY_ID,
  DutyLeg,
  IssueCategory,
  LegIssueReport,
  LegStatus,
  StoredManifestState,
  buildInitialManifestState,
  getCurrentTimeText,
  getTodayDateText,
  issueCategoryOptions,
  manifestLegs,
  readStoredManifestState,
  resetDriverPdaManifestMockup,
  updateRowsForLegComplete,
  updateRowsForLegStart,
  writeStoredManifestState,
} from "../driverPdaManifestData";

type Screen = "duty" | "destination" | "complete";

export default function ManifestMockupClient() {
  const [screen, setScreen] = useState<Screen>("duty");
  const [loaded, setLoaded] = useState(false);
  const [selectedLeg, setSelectedLeg] = useState(1);
  const [trailerModalOpen, setTrailerModalOpen] = useState(false);
  const [issueModalOpen, setIssueModalOpen] = useState(false);
  const [trailerInput, setTrailerInput] = useState("");
  const [issueCategory, setIssueCategory] = useState<IssueCategory>("");
  const [issueDetails, setIssueDetails] = useState("");
  const [state, setState] = useState<StoredManifestState>(buildInitialManifestState);

  const today = useMemo(() => getTodayDateText(), []);
  const currentLeg = manifestLegs.find((leg) => leg.number === selectedLeg) || manifestLegs[0];

  useEffect(() => {
    const savedState = readStoredManifestState();
    setState(savedState);
    setLoaded(true);
  }, []);

  function saveNextState(nextState: StoredManifestState) {
    setState(nextState);
    writeStoredManifestState(nextState);
  }

  function getLegStatus(legNumber: number) {
    return state.legStatuses[legNumber] || "To do";
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
      state.dctRows.find((row) => row.legNumber === legNumber)?.trailerNumber || "";

    setSelectedLeg(legNumber);
    setTrailerInput(existingTrailerForLeg || state.trailerNumber);
    setTrailerModalOpen(true);
  }

  function confirmTrailerNumber() {
    const nextTrailerNumber = trailerInput.trim().toUpperCase();

    if (!nextTrailerNumber) {
      return;
    }

    const nextLegStatuses = {
      ...state.legStatuses,
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

    const issueText = `Leg ${selectedLeg} Arrival Issue: Category: ${issueCategory.trim()} | Details: ${issueDetails.trim()}`;
    completeLeg(issueText, issueCategory.trim() as IssueCategory);
  }

  function completeWithNoIssue() {
    completeLeg("", "");
  }

  function completeLeg(issueText: string, category: IssueCategory | "") {
    const finalLeg = selectedLeg === manifestLegs[manifestLegs.length - 1].number;

    const nextLegStatuses = {
      ...state.legStatuses,
      [selectedLeg]: "Completed" as LegStatus,
    };

    const nextIssueReports = issueText
      ? {
          ...state.issueReports,
          [selectedLeg]: {
            category,
            details: issueDetails.trim(),
          },
        }
      : state.issueReports;

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

    setSelectedLeg(selectedLeg + 1);
    setScreen("duty");
  }

  function resetMockup() {
    resetDriverPdaManifestMockup();
    const startingState = buildInitialManifestState();
    saveNextState(startingState);
    setSelectedLeg(1);
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
      <div className="relative mx-auto min-h-screen w-full max-w-[1060px] bg-white shadow-2xl sm:my-6 sm:rounded-[34px]">
        <PhoneStatusBar />

        {screen === "duty" && (
          <DutyScreen
            today={today}
            legs={manifestLegs}
            legStatuses={state.legStatuses}
            issueReports={state.issueReports}
            canOpenLeg={canOpenLeg}
            onOpenLeg={openLeg}
            onReset={resetMockup}
          />
        )}

        {screen === "destination" && (
          <DestinationScreen
            today={today}
            trailerNumber={state.trailerNumber}
            leg={currentLeg}
            status={getLegStatus(selectedLeg)}
            issueReport={state.issueReports[selectedLeg]}
            onBack={() => setScreen("duty")}
            onArriveIntoDepot={openArrivalIssueModal}
          />
        )}

        {screen === "complete" && (
          <CompleteScreen
            today={today}
            trailerNumber={state.trailerNumber}
            legStatuses={state.legStatuses}
            issueReports={state.issueReports}
            onReset={resetMockup}
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
  onReset,
}: {
  today: string;
  legs: DutyLeg[];
  legStatuses: Record<number, LegStatus>;
  issueReports: Record<number, LegIssueReport>;
  canOpenLeg: (legNumber: number) => boolean;
  onOpenLeg: (legNumber: number) => void;
  onReset: () => void;
}) {
  return (
    <>
      <AppHeader title="Manifest" left="Back" onBack={() => window.history.back()} />

      <section className="bg-white px-5 py-6 sm:px-8">
        <div className="grid gap-5 md:grid-cols-2">
          <OverviewCard />
          <SpecialInstructionsCard />
        </div>

        <h2 className="mt-10 text-2xl font-black text-[#222]">Duty details</h2>

        <DutyDateHeader today={today} />

        <div className="mt-4 space-y-3">
          <DutyActivityBox time="19:30 - 20:00" title="Start Facility" />

          {legs.map((leg) => (
            <DutySequenceBlock
              key={leg.number}
              leg={leg}
              status={legStatuses[leg.number] || "To do"}
              issueReport={issueReports[leg.number]}
              canOpen={canOpenLeg(leg.number)}
              onOpenLeg={onOpenLeg}
            />
          ))}

          <DutyActivityBox time="05:45 - 06:00" title="End Facility" />
        </div>

        <BackToDashboardButton />
        <ResetButton onReset={onReset} />
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

        <div className="mt-3">
          <LegCard leg={leg} status={status} issueReport={issueReport} />
        </div>

        <h2 className="mt-8 text-2xl font-black text-[#222]">
          Destination task details
        </h2>

        <button
          type="button"
          onClick={onArriveIntoDepot}
          className="mt-4 flex w-full items-center justify-between rounded-lg border border-[#d9d9d9] border-l-4 border-l-[#d6001c] bg-white px-4 py-4 text-left text-sm font-black text-[#222] shadow-sm"
        >
          <span>Arrive into depot</span>
          <span className="text-2xl font-black text-[#d6001c]">›</span>
        </button>

        {issueReport && (
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
  legStatuses,
  issueReports,
  onReset,
}: {
  today: string;
  trailerNumber: string;
  legStatuses: Record<number, LegStatus>;
  issueReports: Record<number, LegIssueReport>;
  onReset: () => void;
}) {
  return (
    <>
      <AppHeader title="Manifest Complete" />

      <section className="bg-white px-5 py-6 sm:px-8">
        <div className="grid gap-5 md:grid-cols-2">
          <OverviewCard />
          <SpecialInstructionsCard />
        </div>

        <h2 className="mt-10 text-2xl font-black text-[#222]">Duty completed</h2>

        <DutyDateHeader today={today} extraTopMargin="mt-8" />

        <TrailerNumberBanner trailerNumber={trailerNumber} />

        <div className="mt-4 space-y-3">
          <DutyActivityBox time="19:30 - 20:00" title="Start Facility" />

          {manifestLegs.map((leg) => (
            <DutySequenceBlock
              key={leg.number}
              leg={leg}
              status={legStatuses[leg.number] || "Completed"}
              issueReport={issueReports[leg.number]}
            />
          ))}

          <DutyActivityBox time="05:45 - 06:00" title="End Facility" />
        </div>

        <section className="mt-6 rounded-[18px] bg-[#d9f7e5] p-5">
          <h2 className="text-2xl font-black text-[#067a35]">Duty completed</h2>
          <p className="mt-3 text-base font-bold leading-7 text-[#18243a]">
            Your duty has been completed. It is now OK to close the app completely.
          </p>
        </section>

        <BackToDashboardButton />
        <ResetButton onReset={onReset} />
      </section>
    </>
  );
}


function DutyDateHeader({
  today,
  extraTopMargin = "mt-6",
}: {
  today: string;
  extraTopMargin?: string;
}) {
  return (
    <div className={`${extraTopMargin} flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between`}>
      <p className="text-xl font-bold text-[#333]">{today}</p>

      <div className="rounded-[14px] border border-[#e5e7eb] bg-[#f8fafc] px-4 py-3 text-left sm:text-right">
        <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#64748b]">
          Start / End Time
        </p>
        <p className="mt-1 text-base font-black text-[#222]">19:30 - 06:00</p>
      </div>
    </div>
  );
}

function DutySequenceBlock({
  leg,
  status,
  issueReport,
  canOpen,
  onOpenLeg,
}: {
  leg: DutyLeg;
  status: LegStatus;
  issueReport?: LegIssueReport;
  canOpen?: boolean;
  onOpenLeg?: (legNumber: number) => void;
}) {
  const followingActivities = dutyActivitiesAfterLeg[leg.number] || [];

  return (
    <>
      <LegCard
        leg={leg}
        status={status}
        issueReport={issueReport}
        canOpen={canOpen}
        onClick={onOpenLeg ? () => onOpenLeg(leg.number) : undefined}
      />

      {followingActivities.map((activity) => (
        <DutyActivityBox
          key={`${leg.number}-${activity.time}-${activity.title}`}
          time={activity.time}
          title={activity.title}
        />
      ))}
    </>
  );
}

const dutyActivitiesAfterLeg: Record<number, { time: string; title: string }[]> = {
  1: [{ time: "20:50 - 21:20", title: "Load(Assist)" }],
  2: [
    { time: "22:00 - 22:30", title: "Unload(Assist)" },
    { time: "22:30 - 23:00", title: "Load(Assist)" },
  ],
  3: [
    { time: "23:50 - 00:10", title: "Meal Relief Whilst Vehicle Un/Loaded" },
    { time: "00:10 - 00:50", title: "Load(Assist)" },
  ],
  4: [
    { time: "01:40 - 02:10", title: "Unload(Assist)" },
    { time: "02:10 - 02:40", title: "Meal Relief" },
    { time: "02:40 - 03:30", title: "Load(Assist)" },
  ],
  5: [
    { time: "03:30 - 04:05", title: "As Directed" },
    { time: "04:05 - 04:20", title: "Xchange Trailer" },
  ],
};

function DutyActivityBox({ time, title }: { time: string; title: string }) {
  return (
    <div className="rounded-[14px] border border-[#e5e7eb] bg-[#f8fafc] px-4 py-3 shadow-sm">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
        <div className="shrink-0 rounded-full bg-[#fff0f2] px-4 py-2 text-sm font-black text-[#d6001c]">
          {time}
        </div>

        <p className="text-base font-black text-[#222]">{title}</p>

        <p className="sm:ml-auto text-[10px] font-black uppercase tracking-[0.16em] text-[#94a3b8]">
          Information only
        </p>
      </div>
    </div>
  );
}

function OverviewCard() {
  return (
    <section className="rounded-[18px] bg-[#f0f0f0] p-5">
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

function SpecialInstructionsCard() {
  return (
    <section className="rounded-[18px] border-2 border-[#d6001c] bg-[#fff0f2] p-5">
      <p className="text-xs font-black uppercase tracking-[0.16em] text-[#d6001c]">
        Special Instructions
      </p>
      <ul className="mt-4 space-y-3 text-sm font-black leading-6 text-[#222]">
        <li>Enter the trailer number before starting each leg.</li>
        <li>Complete legs in order from Leg 1 to Leg 6.</li>
        <li>Record any issue, route change or arrival delay before completing the leg.</li>
      </ul>
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
  const isInteractive =
    typeof canOpen === "boolean" && typeof onClick === "function";
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
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-[120px]">
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-lg font-black text-[#444]">Leg {leg.number}</p>
            <StatusPill status={status} />
          </div>
        </div>

        <div className="grid flex-1 gap-4 md:grid-cols-[1fr_80px_1fr] md:items-center">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.12em] text-[#64748b]">
              Depart
            </p>
            <p className="mt-2 text-base font-black uppercase leading-tight text-[#111] sm:text-lg">
              {leg.from}
            </p>
            <p className="mt-2 text-base font-bold text-[#666]">ETD: {leg.etd}</p>
          </div>

          <div className="hidden text-center text-3xl font-black text-[#d6d6d6] md:block">
            →
          </div>

          <div className="md:text-right">
            <p className="text-sm font-black uppercase tracking-[0.12em] text-[#64748b]">
              Arrive
            </p>
            <p className="mt-2 text-base font-black uppercase leading-tight text-[#111] sm:text-lg">
              {leg.to}
            </p>
            <p className="mt-2 text-base font-bold text-[#666]">ETA: {leg.eta}</p>
          </div>
        </div>
      </div>

      <div className="mt-5 grid gap-3 border-t border-[#e5e7eb] pt-4 sm:grid-cols-3">
        <InfoPill label="Trailer Type" value={leg.trailerType} />
        <InfoPill label="Planz Code" value={leg.planzCode} />
        <InfoPill label="Due to Convey" value={leg.dueToConvey} />
      </div>

      {issueReport && (
        <IssueSummaryOnLeg legNumber={leg.number} issueReport={issueReport} />
      )}

      {isLocked && (
        <p className="mt-4 text-xs font-black uppercase tracking-[0.12em] text-[#999]">
          Complete previous leg first
        </p>
      )}
    </button>
  );
}

function InfoPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[12px] bg-[#f8fafc] p-3">
      <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#64748b]">
        {label}
      </p>
      <p className="mt-1 text-sm font-black text-[#111]">{value}</p>
    </div>
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
      <section className="w-full max-w-[430px] bg-white p-6 shadow-2xl">
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
  category: IssueCategory;
  details: string;
  onCategoryChange: (value: IssueCategory) => void;
  onDetailsChange: (value: string) => void;
  onCancel: () => void;
  onSave: () => void;
  onNoIssue: () => void;
}) {
  const canSave = category.trim().length > 0 && details.trim().length > 0;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 px-5 py-4">
      <section className="max-h-[calc(100dvh-32px)] w-full max-w-[500px] overflow-y-auto rounded-sm bg-white p-6 shadow-2xl">
        <h2 className="text-2xl font-black text-[#111]">Issue / Route Change</h2>

        <p className="mt-3 text-sm font-bold leading-6 text-[#444]">
          Before completing this leg, record any issue, delay, different location,
          route change, or other information below. If there was no issue, select No Issue.
        </p>

        <label className="mt-5 block text-sm font-black text-[#222]">
          Issue category
        </label>

        <select
          value={category}
          onChange={(event) => onCategoryChange(event.target.value as IssueCategory)}
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
          className="mt-2 min-h-[140px] w-full border-2 border-[#888] px-4 py-3 text-base font-bold text-[#222] outline-none focus:border-[#d6001c]"
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
            className="w-full rounded-full border-2 border-[#999] bg-white px-5 py-3 text-sm font-black text-[#555]"
          >
            Cancel
          </button>
        </div>
      </section>
    </div>
  );
}

function TrailerNumberBanner({ trailerNumber }: { trailerNumber: string }) {
  return (
    <div className="rounded-lg bg-[#f0f0f0] px-4 py-3 text-sm font-black text-[#444]">
      Trailer number: {trailerNumber || "-"}
    </div>
  );
}

function IssueSummaryOnLeg({
  legNumber,
  issueReport,
}: {
  legNumber: number;
  issueReport: LegIssueReport;
}) {
  return (
    <section className="mt-4 rounded-[14px] border border-[#f59e0b] bg-[#fff7ed] p-3">
      <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#b45309]">
        Issue / route change recorded
      </p>

      <p className="mt-1 text-xs font-bold leading-5 text-[#7c2d12]">
        <span className="font-black">Leg {legNumber} Arrival Issue:</span>{" "}
        Category: {issueReport.category} | Details: {issueReport.details}
      </p>
    </section>
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
    <section className="mt-4 rounded-[16px] border-2 border-[#f59e0b] bg-[#fff7ed] p-4">
      <p className="text-xs font-black uppercase tracking-[0.16em] text-[#b45309]">
        Issue details recorded
      </p>

      <p className="mt-2 text-sm font-bold leading-6 text-[#7c2d12]">
        <span className="font-black">Leg {legNumber} Arrival Issue:</span>{" "}
        Category: {issueReport.category} | Details: {issueReport.details}
      </p>
    </section>
  );
}

function BackToDashboardButton() {
  return (
    <Link
      href="/internal/app-ideas"
      className="mt-7 block w-full rounded-[18px] border-2 border-[#d6001c] bg-white px-5 py-4 text-center text-sm font-black uppercase tracking-[0.16em] text-[#d6001c] no-underline"
    >
      Back to Dashboard
    </Link>
  );
}

function ResetButton({ onReset }: { onReset: () => void }) {
  return (
    <button
      type="button"
      onClick={onReset}
      className="mt-4 w-full rounded-[18px] bg-[#222] px-5 py-4 text-sm font-black uppercase tracking-[0.16em] text-white"
    >
      Mockup Reset
    </button>
  );
}
