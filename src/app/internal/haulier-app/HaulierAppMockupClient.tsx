"use client";

import { useMemo, useState } from "react";

type LegStatus = "To do" | "In Progress" | "Completed";
type MockupType = "flex" | "mockup2";
type TaskType = "empty" | "repat" | "load" | "skip" | "flex";
type IssueMode = "delay" | "skip";

type Screen =
  | "no-duty"
  | "menu"
  | "duty"
  | "origin"
  | "load"
  | "scan"
  | "repat"
  | "destination"
  | "unload"
  | "complete";

type DutyLeg = {
  number: number;
  etd: string;
  eta: string;
  from: string;
  to: string;
};

type MockupOption = {
  title: string;
  text: string;
  icon: string;
  active: boolean;
  mockupType?: MockupType;
};

const flexLegs: DutyLeg[] = [
  {
    number: 1,
    etd: "20:00",
    eta: "06:00",
    from: "NORTH WEST HUB",
    to: "NORTH WEST HUB",
  },
];

const mockup2Legs: DutyLeg[] = [
  {
    number: 1,
    etd: "20:00",
    eta: "20:50",
    from: "NORTH WEST HUB",
    to: "MANCHESTER MAIL CENTRE",
  },
  {
    number: 2,
    etd: "21:20",
    eta: "22:00",
    from: "MANCHESTER MAIL CENTRE",
    to: "NORTH WEST HUB",
  },
  {
    number: 3,
    etd: "23:00",
    eta: "23:50",
    from: "NORTH WEST HUB",
    to: "CHESTER MAIL CENTRE",
  },
  {
    number: 4,
    etd: "00:50",
    eta: "01:40",
    from: "CHESTER MAIL CENTRE",
    to: "NORTH WEST HUB",
  },
  {
    number: 5,
    etd: "03:30",
    eta: "04:20",
    from: "NORTH WEST HUB",
    to: "PRESTON MAIL CENTRE",
  },
  {
    number: 6,
    etd: "05:00",
    eta: "05:45",
    from: "PRESTON MAIL CENTRE",
    to: "NORTH WEST HUB",
  },
];

const mockupOptions: MockupOption[] = [
  {
    title: "Flex Mock Up",
    text: "Open the flex duty journey mock-up.",
    icon: "1",
    active: true,
    mockupType: "flex",
  },
  {
    title: "Mockup 2",
    text: "Open a six-leg duty completed in order.",
    icon: "2",
    active: true,
    mockupType: "mockup2",
  },
  {
    title: "Mockup 3",
    text: "Future mock-up option.",
    icon: "3",
    active: false,
  },
  {
    title: "Mockup 4",
    text: "Future mock-up option.",
    icon: "4",
    active: false,
  },
];

const originTasks: { label: string; type: TaskType }[] = [
  { label: "Empty", type: "empty" },
  { label: "Repat / Pre-Loaded", type: "repat" },
  { label: "Load", type: "load" },
  { label: "Skip Leg", type: "skip" },
  { label: "Flex / As Directed", type: "flex" },
];

const mockContainers = [
  "YT12345678GB",
  "YT23456789GB",
  "YT34567890GB",
  "YT45678901GB",
  "YT56789012GB",
  "YT67890123GB",
  "YT78901234GB",
  "YT89012345GB",
  "YT90123456GB",
  "YT11223344GB",
];

export default function HaulierAppMockupClient() {
  const [screen, setScreen] = useState<Screen>("no-duty");
  const [mockup, setMockup] = useState<MockupType>("flex");
  const [selectedLeg, setSelectedLeg] = useState(1);
  const [selectedTask, setSelectedTask] = useState<TaskType>("empty");

  const [vehicleModalOpen, setVehicleModalOpen] = useState(false);
  const [departModalOpen, setDepartModalOpen] = useState(false);
  const [loadModalOpen, setLoadModalOpen] = useState(false);
  const [unloadModalOpen, setUnloadModalOpen] = useState(false);
  const [issueModalOpen, setIssueModalOpen] = useState(false);

  const [issueMode, setIssueMode] = useState<IssueMode>("delay");
  const [issueDetails, setIssueDetails] = useState("");
  const [issueLocation, setIssueLocation] = useState("");
  const [issueManager, setIssueManager] = useState("");

  const [vehicleInput, setVehicleInput] = useState("");
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [manualContainer, setManualContainer] = useState("");
  const [repatCount, setRepatCount] = useState("");
  const [containers, setContainers] = useState<string[]>([]);

  const [legStatuses, setLegStatuses] = useState<Record<number, LegStatus>>({
    1: "To do",
  });

  const [issueReports, setIssueReports] = useState<Record<number, string>>({});

  const today = useMemo(() => getTodayDateText(), []);
  const legs = mockup === "mockup2" ? mockup2Legs : flexLegs;
  const currentLeg = legs.find((leg) => leg.number === selectedLeg) || legs[0];

  function startMockup(nextMockup: MockupType) {
    const nextLegs = nextMockup === "mockup2" ? mockup2Legs : flexLegs;
    const nextStatuses: Record<number, LegStatus> = {};

    nextLegs.forEach((leg) => {
      nextStatuses[leg.number] = "To do";
    });

    setMockup(nextMockup);
    setSelectedLeg(1);
    setSelectedTask("empty");
    setVehicleInput("");
    setVehicleNumber("");
    setManualContainer("");
    setRepatCount("");
    setContainers([]);
    setLegStatuses(nextStatuses);
    setIssueReports({});
    closeAllModals();
    setScreen("duty");
  }

  function closeAllModals() {
    setVehicleModalOpen(false);
    setDepartModalOpen(false);
    setLoadModalOpen(false);
    setUnloadModalOpen(false);
    setIssueModalOpen(false);
  }

  function legStatus(legNumber: number) {
    return legStatuses[legNumber] || "To do";
  }

  function firstAvailableLeg() {
    const firstOpen = legs.find((leg) => legStatus(leg.number) !== "Completed");
    return firstOpen?.number || legs[legs.length - 1].number;
  }

  function canOpenLeg(legNumber: number) {
    return (
      legNumber === firstAvailableLeg() &&
      legStatus(legNumber) !== "Completed"
    );
  }

  function openLeg(legNumber: number) {
    if (!canOpenLeg(legNumber)) {
      return;
    }

    setSelectedLeg(legNumber);
    setVehicleInput(vehicleNumber);
    setVehicleModalOpen(true);
  }

  function confirmVehicleNumber() {
    if (!vehicleInput.trim()) {
      return;
    }

    setVehicleNumber(vehicleInput.trim());
    setVehicleModalOpen(false);
    setScreen("origin");
  }

  function selectTask(task: TaskType) {
    setSelectedTask(task);

    if (task === "skip") {
      openIssueModal("skip");
      return;
    }

    if (task === "load") {
      setContainers([]);
      setManualContainer("");
      setScreen("load");
      return;
    }

    if (task === "repat") {
      setRepatCount("");
      setScreen("repat");
      return;
    }

    setDepartModalOpen(true);
  }

  function confirmDepartDepot() {
    setDepartModalOpen(false);
    setLegStatuses((current) => ({
      ...current,
      [selectedLeg]: "In Progress",
    }));
    setScreen("destination");
  }

  function addManualContainer() {
    const containerNumber = manualContainer.trim().toUpperCase();

    if (!containerNumber) {
      return;
    }

    setContainers((current) => [...current, containerNumber]);
    setManualContainer("");
  }

  function openScanner() {
    setContainers(mockContainers);
    setScreen("scan");
  }

  function removeContainer(containerNumber: string) {
    setContainers((current) =>
      current.filter((item) => item !== containerNumber)
    );
  }

  function continueRepat() {
    if (!repatCount.trim()) {
      return;
    }

    setDepartModalOpen(true);
  }

  function confirmLoadDepart() {
    setLoadModalOpen(false);
    setLegStatuses((current) => ({
      ...current,
      [selectedLeg]: "In Progress",
    }));
    setScreen("destination");
  }

  function arriveIntoDepot() {
    if (selectedTask === "empty" || selectedTask === "flex") {
      completeLeg();
      return;
    }

    setScreen("unload");
  }

  function completeLeg() {
    const finalLeg = selectedLeg === legs[legs.length - 1].number;

    setLegStatuses((current) => ({
      ...current,
      [selectedLeg]: "Completed",
    }));

    closeAllModals();

    if (finalLeg) {
      setScreen("complete");
      return;
    }

    setScreen("duty");
  }

  function openIssueModal(mode: IssueMode) {
    setIssueMode(mode);
    setIssueDetails("");
    setIssueLocation("");
    setIssueManager("");
    setIssueModalOpen(true);
  }

  function saveIssueDetails() {
    const reportParts = [
      `Leg ${selectedLeg}`,
      `Type: ${issueMode === "skip" ? "Skipped leg" : "Delay / route change"}`,
      issueDetails.trim() ? `Details: ${issueDetails.trim()}` : "",
      issueLocation.trim()
        ? `Location / route change: ${issueLocation.trim()}`
        : "",
      issueManager.trim() ? `Authorised by: ${issueManager.trim()}` : "",
    ].filter(Boolean);

    setIssueReports((current) => ({
      ...current,
      [selectedLeg]: reportParts.join(" | "),
    }));

    setIssueDetails("");
    setIssueLocation("");
    setIssueManager("");
    setIssueModalOpen(false);

    if (issueMode === "skip") {
      completeLeg();
    }
  }

  function resetMockup() {
    setScreen("menu");
    setMockup("flex");
    setSelectedLeg(1);
    setSelectedTask("empty");
    setVehicleInput("");
    setVehicleNumber("");
    setManualContainer("");
    setRepatCount("");
    setContainers([]);
    setLegStatuses({ 1: "To do" });
    setIssueReports({});
    setIssueDetails("");
    setIssueLocation("");
    setIssueManager("");
    closeAllModals();
  }

  function openMockupMenu() {
    resetMockup();
    setScreen("menu");
  }

  return (
    <main className="min-h-screen bg-[#f4f1ec] font-sans text-[#222]">
      <div className="relative mx-auto min-h-screen w-full max-w-[520px] bg-white shadow-2xl sm:my-6 sm:min-h-[900px] sm:rounded-[34px]">
        <PhoneStatusBar />

        {screen === "no-duty" && (
          <NoDutyScreen onContinue={openMockupMenu} />
        )}

        {screen === "menu" && <MenuScreen onOpenMockup={startMockup} />}

        {screen === "duty" && (
          <DutyScreen
            today={today}
            title={mockup === "mockup2" ? "Mockup 2" : "Flex Mock Up"}
            legs={legs}
            legStatus={legStatus}
            canOpenLeg={canOpenLeg}
            onOpenLeg={openLeg}
            onBack={() => setScreen("menu")}
            onReset={resetMockup}
          />
        )}

        {screen === "origin" && (
          <OriginScreen
            today={today}
            vehicleNumber={vehicleNumber}
            leg={currentLeg}
            status={legStatus(selectedLeg)}
            issueReport={issueReports[selectedLeg]}
            onBack={() => setScreen("duty")}
            onTask={selectTask}
            onReset={resetMockup}
          />
        )}

        {screen === "load" && (
          <LoadScreen
            vehicleNumber={vehicleNumber}
            containers={containers}
            manualContainer={manualContainer}
            onManualContainerChange={setManualContainer}
            onAddManualContainer={addManualContainer}
            onOpenScanner={openScanner}
            onRemoveContainer={removeContainer}
            onBack={() => setScreen("origin")}
            onLoadComplete={() => setLoadModalOpen(true)}
            onReset={resetMockup}
          />
        )}

        {screen === "scan" && (
          <ScanScreen
            containers={containers}
            onBack={() => setScreen("load")}
            onRemoveContainer={removeContainer}
            onLoadComplete={() => setLoadModalOpen(true)}
            onReset={resetMockup}
          />
        )}

        {screen === "repat" && (
          <RepatScreen
            vehicleNumber={vehicleNumber}
            repatCount={repatCount}
            onRepatCountChange={setRepatCount}
            onBack={() => setScreen("origin")}
            onContinue={continueRepat}
            onReset={resetMockup}
          />
        )}

        {screen === "destination" && (
          <DestinationScreen
            today={today}
            vehicleNumber={vehicleNumber}
            leg={currentLeg}
            status={legStatus(selectedLeg)}
            selectedTask={selectedTask}
            issueReport={issueReports[selectedLeg]}
            onBack={() => setScreen("origin")}
            onArriveIntoDepot={arriveIntoDepot}
            onOpenIssue={() => openIssueModal("delay")}
            onReset={resetMockup}
          />
        )}

        {screen === "unload" && (
          <UnloadScreen
            today={today}
            vehicleNumber={vehicleNumber}
            leg={currentLeg}
            status={legStatus(selectedLeg)}
            issueReport={issueReports[selectedLeg]}
            onBack={() => setScreen("destination")}
            onUnloadAll={() => setUnloadModalOpen(true)}
            onOpenIssue={() => openIssueModal("delay")}
            onReset={resetMockup}
          />
        )}

        {screen === "complete" && (
          <CompleteScreen
            today={today}
            vehicleNumber={vehicleNumber}
            leg={currentLeg}
            status="Completed"
            issueReport={issueReports[selectedLeg]}
            onReset={resetMockup}
          />
        )}

        {vehicleModalOpen && (
          <VehicleModal
            vehicleInput={vehicleInput}
            onChange={setVehicleInput}
            onCancel={() => {
              setVehicleInput("");
              setVehicleModalOpen(false);
            }}
            onConfirm={confirmVehicleNumber}
          />
        )}

        {departModalOpen && (
          <DepartModal
            taskType={selectedTask}
            containerCount={repatCount || String(containers.length)}
            onCancel={() => setDepartModalOpen(false)}
            onDepart={confirmDepartDepot}
          />
        )}

        {loadModalOpen && (
          <LoadCompleteModal
            containerCount={containers.length}
            onCancel={() => setLoadModalOpen(false)}
            onDepart={confirmLoadDepart}
          />
        )}

        {unloadModalOpen && (
          <UnloadAllModal
            onCancel={() => setUnloadModalOpen(false)}
            onYes={completeLeg}
          />
        )}

        {issueModalOpen && (
          <IssueModal
            mode={issueMode}
            details={issueDetails}
            location={issueLocation}
            manager={issueManager}
            onDetailsChange={setIssueDetails}
            onLocationChange={setIssueLocation}
            onManagerChange={setIssueManager}
            onCancel={() => setIssueModalOpen(false)}
            onSave={saveIssueDetails}
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
        <span className="rounded-md border-2 border-white px-2 text-sm">
          ▰
        </span>
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
      <div className="w-[90px]">
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

      <div className="w-[90px] text-right text-3xl font-black text-[#333]">
        ⋮
      </div>
    </header>
  );
}

function NoDutyScreen({ onContinue }: { onContinue: () => void }) {
  return (
    <>
      <AppHeader title="Haulier Mock Up" />

      <section className="bg-white px-5 py-6">
        <OverviewCard dutyId="" />

        <h2 className="mt-10 text-2xl font-black text-[#222]">
          Duty details
        </h2>

        <section className="mt-6 rounded-[18px] border-2 border-[#d6001c] bg-[#fff0f2] p-5">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-[#d6001c]">
            No duty currently loaded
          </p>

          <p className="mt-4 text-base font-black leading-7 text-[#222]">
            To load the duty, please ensure that your haulier has added your
            correct email address to the Transport Office Haulier Connect System
            and then manually close the app to reload
                      </p>
        </section>

        <button
          type="button"
          onClick={onContinue}
          className="mt-8 w-full rounded-[18px] bg-[#d6001c] px-5 py-4 text-sm font-black uppercase tracking-[0.16em] text-white"
        >
          Continue
        </button>
      </section>
    </>
  );
}

function MenuScreen({
  onOpenMockup,
}: {
  onOpenMockup: (mockupType: MockupType) => void;
}) {
  return (
    <>
      <AppHeader title="Haulier Mock Up" />

      <section className="bg-white px-5 py-6">
        <section className="rounded-[18px] bg-[#f0f0f0] p-5">
          <h2 className="text-2xl font-black text-[#222]">Overview</h2>

          <p className="mt-5 text-base font-bold leading-6 text-[#333]">
            Select which haulier mock-up journey you want to run.
          </p>
        </section>

        <h2 className="mt-10 text-2xl font-black text-[#222]">
          Mock-up options
        </h2>

        <div className="mt-5 space-y-4">
          {mockupOptions.map((option) => (
            <MockupOptionButton
              key={option.title}
              option={option}
              onClick={
                option.active && option.mockupType
                  ? () => onOpenMockup(option.mockupType as MockupType)
                  : undefined
              }
            />
          ))}
        </div>
      </section>
    </>
  );
}

function MockupOptionButton({
  option,
  onClick,
}: {
  option: MockupOption;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      disabled={!option.active}
      onClick={onClick}
      className={`flex w-full items-center gap-4 rounded-[18px] border p-4 text-left shadow-sm transition ${
        option.active
          ? "border-[#d0d0d0] bg-white hover:-translate-y-1 hover:shadow-md"
          : "border-transparent bg-[#f0f0f0] opacity-60"
      }`}
    >
      <div
        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-lg font-black text-white ${
          option.active ? "bg-[#d6001c]" : "bg-[#999]"
        }`}
      >
        {option.icon}
      </div>

      <div className="min-w-0 flex-1">
        <h3 className="text-lg font-black leading-tight text-[#222]">
          {option.title}
        </h3>

        <p className="mt-1 text-sm font-bold leading-5 text-[#666]">
          {option.text}
        </p>
      </div>

      <div
        className={`text-3xl font-black ${
          option.active ? "text-[#d6001c]" : "text-[#aaa]"
        }`}
      >
        ›
      </div>
    </button>
  );
}

function DutyScreen({
  today,
  title,
  legs,
  legStatus,
  canOpenLeg,
  onOpenLeg,
  onBack,
  onReset,
}: {
  today: string;
  title: string;
  legs: DutyLeg[];
  legStatus: (legNumber: number) => LegStatus;
  canOpenLeg: (legNumber: number) => boolean;
  onOpenLeg: (legNumber: number) => void;
  onBack: () => void;
  onReset: () => void;
}) {
  return (
    <>
      <AppHeader title="Haulier Mock Up" left="Back" onBack={onBack} />

      <section className="bg-white px-5 py-6">
        <OverviewCard />

        <h2 className="mt-10 text-2xl font-black text-[#222]">
          Duty details
        </h2>

        <p className="mt-2 text-sm font-black uppercase tracking-[0.14em] text-[#d6001c]">
          {title}
        </p>

        <p className="mt-6 text-xl font-bold text-[#333]">{today}</p>

        <div className="mt-4 space-y-4">
          {legs.map((leg) => (
            <LegCard
              key={leg.number}
              leg={leg}
              status={legStatus(leg.number)}
              canOpen={canOpenLeg(leg.number)}
              onClick={() => onOpenLeg(leg.number)}
            />
          ))}
        </div>

        <MockResetButton onReset={onReset} />
      </section>
    </>
  );
}

function OverviewCard({ dutyId = "NWH254" }: { dutyId?: string }) {
  return (
    <section className="rounded-[18px] bg-[#f0f0f0] p-5">
      <h2 className="text-2xl font-black text-[#222]">Overview</h2>

      <p className="mt-6 text-lg font-bold text-[#333]">
        <span className="font-black">Driver name:</span> Andrew Cannon
      </p>

      <p className="mt-4 text-lg font-bold text-[#333]">
        <span className="font-black">Duty ID:</span> {dutyId}
      </p>
    </section>
  );
}

function LegCard({
  leg,
  status,
  canOpen,
  onClick,
}: {
  leg: DutyLeg;
  status: LegStatus;
  canOpen?: boolean;
  onClick?: () => void;
}) {
  const isLocked = !canOpen && status !== "Completed";
  const isFlexAsDirectedLeg =
    normaliseLocationName(leg.from) === normaliseLocationName(leg.to);

  return (
    <button
      type="button"
      onClick={canOpen ? onClick : undefined}
      disabled={!canOpen}
      className={`w-full rounded-[18px] border border-[#d0d0d0] p-4 text-left shadow-sm transition ${
        canOpen
          ? "bg-white hover:-translate-y-1 hover:shadow-md"
          : status === "Completed"
          ? "bg-[#f0f0f0]"
          : "bg-[#f4f4f4] opacity-55"
      }`}
    >
      <div className="mb-5 flex items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-lg font-black text-[#444]">Leg {leg.number}</p>

          {isFlexAsDirectedLeg && (
            <span className="rounded-full bg-[#fff0f2] px-3 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-[#d6001c]">
              Flex / As Directed
            </span>
          )}
        </div>

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
    <span
      className={`rounded-full border-2 px-5 py-2 text-base font-black ${classes}`}
    >
      {label}
    </span>
  );
}

function VehicleModal({
  vehicleInput,
  onChange,
  onCancel,
  onConfirm,
}: {
  vehicleInput: string;
  onChange: (value: string) => void;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const canConfirm = vehicleInput.trim().length > 0;

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 px-5">
      <section className="w-full max-w-[390px] bg-white p-6 shadow-2xl">
        <h2 className="text-2xl font-black text-[#222]">
          Information Required
        </h2>

        <p className="mt-3 text-sm font-bold leading-6 text-[#444]">
          Please provide your vehicle registration or trailer number to proceed.
        </p>

        <label
          htmlFor="vehicle-number"
          className="mt-5 block text-sm font-black text-[#222]"
        >
          Vehicle Registration / Trailer Number
        </label>

        <input
          id="vehicle-number"
          value={vehicleInput}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Enter registration or trailer number"
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

function OriginScreen({
  today,
  vehicleNumber,
  leg,
  status,
  issueReport,
  onBack,
  onTask,
  onReset,
}: {
  today: string;
  vehicleNumber: string;
  leg: DutyLeg;
  status: LegStatus;
  issueReport?: string;
  onBack: () => void;
  onTask: (task: TaskType) => void;
  onReset: () => void;
}) {
  return (
    <>
      <AppHeader title="Origin Tasks" left="Back" onBack={onBack} />

      <section className="bg-white px-5 py-5">
        <VehicleNumberBanner vehicleNumber={vehicleNumber} />

        <p className="mt-6 text-lg font-bold text-[#333]">{today}</p>

        <div className="mt-3">
          <LegCard leg={leg} status={status} />
        </div>

        {issueReport && <IssueRecordedBox issueReport={issueReport} />}

        <h2 className="mt-7 text-xl font-black text-[#222]">
          Origin task details
        </h2>

        <div className="mt-4 space-y-3">
          {originTasks.map((task) => (
            <button
              key={task.label}
              type="button"
              onClick={() => onTask(task.type)}
              className="flex w-full items-center justify-between rounded-lg border border-[#d9d9d9] border-l-4 border-l-[#d6001c] bg-white px-4 py-4 text-left text-sm font-black text-[#222] shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              <span>{task.label}</span>
              <span className="text-2xl font-black text-[#d6001c]">›</span>
            </button>
          ))}
        </div>

        <MockResetButton onReset={onReset} />
      </section>
    </>
  );
}

function LoadScreen({
  vehicleNumber,
  containers,
  manualContainer,
  onManualContainerChange,
  onAddManualContainer,
  onOpenScanner,
  onRemoveContainer,
  onBack,
  onLoadComplete,
  onReset,
}: {
  vehicleNumber: string;
  containers: string[];
  manualContainer: string;
  onManualContainerChange: (value: string) => void;
  onAddManualContainer: () => void;
  onOpenScanner: () => void;
  onRemoveContainer: (containerNumber: string) => void;
  onBack: () => void;
  onLoadComplete: () => void;
  onReset: () => void;
}) {
  return (
    <>
      <AppHeader title="Load" left="Back" onBack={onBack} />

      <section className="bg-white px-5 py-5">
        <VehicleNumberBanner vehicleNumber={vehicleNumber} />

        <h2 className="mt-6 text-xl font-black text-[#222]">
          Scanned {containers.length} Container (s)
        </h2>

        <div className="mt-3 flex items-center border border-[#cfcfcf]">
          <input
            value={manualContainer}
            onChange={(event) => onManualContainerChange(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                onAddManualContainer();
              }
            }}
            placeholder="Add a container manually"
            className="min-h-[58px] flex-1 px-4 text-base font-bold outline-none"
          />

          <button
            type="button"
            onClick={onOpenScanner}
            className="h-[58px] w-[58px] text-2xl font-black text-[#555]"
            aria-label="Open barcode scanner mockup"
          >
            ▥
          </button>
        </div>

        {manualContainer.trim() && (
          <button
            type="button"
            onClick={onAddManualContainer}
            className="mt-3 w-full rounded-[16px] bg-[#222] px-4 py-3 text-sm font-black text-white"
          >
            Add Manual Container
          </button>
        )}

        <ContainerList
          containers={containers}
          onRemoveContainer={onRemoveContainer}
        />

        {containers.length > 0 && (
          <button
            type="button"
            onClick={onLoadComplete}
            className="mt-6 w-full rounded-full bg-[#d6001c] px-5 py-5 text-base font-black text-white"
          >
            Load Complete
          </button>
        )}

        <MockResetButton onReset={onReset} />
      </section>
    </>
  );
}

function ScanScreen({
  containers,
  onBack,
  onRemoveContainer,
  onLoadComplete,
  onReset,
}: {
  containers: string[];
  onBack: () => void;
  onRemoveContainer: (containerNumber: string) => void;
  onLoadComplete: () => void;
  onReset: () => void;
}) {
  return (
    <>
      <AppHeader title="Scan Container" left="Back" onBack={onBack} />

      <section className="bg-white px-5 py-5">
        <div className="mx-auto flex h-[300px] max-w-[330px] items-center justify-center border-4 border-[#d6001c] bg-[#f0f0f0] p-4 text-center">
          <p className="text-3xl font-black leading-tight text-[#222]">
            Bar Code of the York
          </p>
        </div>

        <h2 className="mt-8 text-xl font-black text-[#222]">
          Scanned {containers.length} Container (s)
        </h2>

        <ContainerList
          containers={containers}
          onRemoveContainer={onRemoveContainer}
        />

        <button
          type="button"
          onClick={onLoadComplete}
          className="mt-6 w-full rounded-full bg-[#d6001c] px-5 py-5 text-base font-black text-white"
        >
          Load Complete
        </button>

        <MockResetButton onReset={onReset} />
      </section>
    </>
  );
}

function ContainerList({
  containers,
  onRemoveContainer,
}: {
  containers: string[];
  onRemoveContainer: (containerNumber: string) => void;
}) {
  if (containers.length === 0) {
    return null;
  }

  return (
    <div className="mt-5 space-y-3">
      {containers.map((container) => (
        <div
          key={container}
          className="flex items-center justify-between rounded-lg border border-[#d9d9d9] bg-white px-4 py-4 text-base font-black text-[#222] shadow-sm"
        >
          <span>{container}</span>

          <button
            type="button"
            onClick={() => onRemoveContainer(container)}
            className="text-2xl font-black text-[#666]"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}

function RepatScreen({
  vehicleNumber,
  repatCount,
  onRepatCountChange,
  onBack,
  onContinue,
  onReset,
}: {
  vehicleNumber: string;
  repatCount: string;
  onRepatCountChange: (value: string) => void;
  onBack: () => void;
  onContinue: () => void;
  onReset: () => void;
}) {
  return (
    <>
      <AppHeader title="Repat / Pre-Loaded" left="Back" onBack={onBack} />

      <section className="bg-white px-5 py-5">
        <VehicleNumberBanner vehicleNumber={vehicleNumber} />

        <label className="mt-6 block text-xl font-black text-[#222]">
          Container count
        </label>

        <input
          value={repatCount}
          onChange={(event) =>
            onRepatCountChange(event.target.value.replace(/\D/g, ""))
          }
          inputMode="numeric"
          className="mt-3 h-[60px] w-full border-2 border-[#777] px-4 text-xl font-black outline-none focus:border-[#d6001c]"
        />

        <button
          type="button"
          onClick={onContinue}
          disabled={!repatCount.trim()}
          className={`mt-8 w-full rounded-full px-5 py-5 text-base font-black text-white ${
            repatCount.trim() ? "bg-[#d6001c]" : "bg-[#cccccc]"
          }`}
        >
          Continue
        </button>

        <MockResetButton onReset={onReset} />
      </section>
    </>
  );
}

function DestinationScreen({
  today,
  vehicleNumber,
  leg,
  status,
  selectedTask,
  issueReport,
  onBack,
  onArriveIntoDepot,
  onOpenIssue,
  onReset,
}: {
  today: string;
  vehicleNumber: string;
  leg: DutyLeg;
  status: LegStatus;
  selectedTask: TaskType;
  issueReport?: string;
  onBack: () => void;
  onArriveIntoDepot: () => void;
  onOpenIssue: () => void;
  onReset: () => void;
}) {
  return (
    <>
      <AppHeader title="Destination Tasks" left="Back" onBack={onBack} />

      <section className="bg-white px-5 py-5">
        <VehicleNumberBanner vehicleNumber={vehicleNumber} />

        <p className="mt-6 text-lg font-bold text-[#333]">{today}</p>

        <div className="mt-3">
          <LegCard leg={leg} status={status} />
        </div>

        <h2 className="mt-8 text-2xl font-black text-[#222]">
          Destination task details
        </h2>

        <button
          type="button"
          onClick={onArriveIntoDepot}
          className="mt-4 flex w-full items-center justify-between rounded-lg border border-[#d9d9d9] border-l-4 border-l-[#d6001c] bg-white px-4 py-4 text-left text-sm font-black text-[#222] shadow-sm"
        >
          <span>
            {selectedTask === "flex"
              ? "Returned from & completed Flex / As Directed leg"
              : "Arrive into depot"}
          </span>
          <span className="text-2xl font-black text-[#d6001c]">›</span>
        </button>

        <button
          type="button"
          onClick={onOpenIssue}
          className="mt-3 flex w-full items-center justify-between rounded-lg border border-[#f59e0b] border-l-4 border-l-[#f59e0b] bg-[#fff7ed] px-4 py-4 text-left text-sm font-black text-[#7c2d12] shadow-sm"
        >
          <span>Report issue / delay</span>
          <span className="text-2xl font-black text-[#f59e0b]">!</span>
        </button>

        {issueReport && <IssueRecordedBox issueReport={issueReport} />}

        <section className="mt-6 rounded-[18px] border-2 border-[#d6001c] bg-[#fff0f2] p-5">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-[#d6001c]">
            Important
          </p>

          <p className="mt-3 text-base font-black leading-7 text-[#222]">
            It is important that you keep the app open until the end of your
            shift. Closing the app early will result in app non-compliance being
            recorded for this duty.
          </p>
        </section>

        <MockResetButton onReset={onReset} />
      </section>
    </>
  );
}

function UnloadScreen({
  today,
  vehicleNumber,
  leg,
  status,
  issueReport,
  onBack,
  onUnloadAll,
  onOpenIssue,
  onReset,
}: {
  today: string;
  vehicleNumber: string;
  leg: DutyLeg;
  status: LegStatus;
  issueReport?: string;
  onBack: () => void;
  onUnloadAll: () => void;
  onOpenIssue: () => void;
  onReset: () => void;
}) {
  return (
    <>
      <AppHeader title="Destination Tasks" left="Back" onBack={onBack} />

      <section className="bg-white px-5 py-5">
        <VehicleNumberBanner vehicleNumber={vehicleNumber} />

        <p className="mt-6 text-lg font-bold text-[#333]">{today}</p>

        <div className="mt-3">
          <LegCard leg={leg} status={status} />
        </div>

        <h2 className="mt-8 text-2xl font-black text-[#222]">
          Destination task details
        </h2>

        <div className="mt-4 space-y-3">
          <button
            type="button"
            className="flex w-full items-center justify-between rounded-lg border border-[#d9d9d9] border-l-4 border-l-[#d6001c] bg-white px-4 py-4 text-left text-sm font-black text-[#999] shadow-sm"
          >
            <span>Part unload</span>
            <span className="text-2xl font-black text-[#d6001c]">›</span>
          </button>

          <button
            type="button"
            onClick={onUnloadAll}
            className="flex w-full items-center justify-between rounded-lg border border-[#d9d9d9] border-l-4 border-l-[#d6001c] bg-white px-4 py-4 text-left text-sm font-black text-[#222] shadow-sm"
          >
            <span>Unload all</span>
            <span className="text-2xl font-black text-[#d6001c]">›</span>
          </button>

          <button
            type="button"
            onClick={onOpenIssue}
            className="flex w-full items-center justify-between rounded-lg border border-[#f59e0b] border-l-4 border-l-[#f59e0b] bg-[#fff7ed] px-4 py-4 text-left text-sm font-black text-[#7c2d12] shadow-sm"
          >
            <span>Report issue / delay</span>
            <span className="text-2xl font-black text-[#f59e0b]">!</span>
          </button>
        </div>

        {issueReport && <IssueRecordedBox issueReport={issueReport} />}

        <MockResetButton onReset={onReset} />
      </section>
    </>
  );
}

function CompleteScreen({
  today,
  vehicleNumber,
  leg,
  status,
  issueReport,
  onReset,
}: {
  today: string;
  vehicleNumber: string;
  leg: DutyLeg;
  status: LegStatus;
  issueReport?: string;
  onReset: () => void;
}) {
  return (
    <>
      <AppHeader title="Haulier Mock Up" />

      <section className="bg-white px-5 py-6">
        <OverviewCard />

        <h2 className="mt-10 text-2xl font-black text-[#222]">
          Duty details
        </h2>

        <p className="mt-8 text-xl font-bold text-[#333]">{today}</p>

        <div className="mt-4">
          <LegCard leg={leg} status={status} />
        </div>

        <VehicleNumberBanner vehicleNumber={vehicleNumber} />

        {issueReport && <IssueRecordedBox issueReport={issueReport} />}

        <section className="mt-6 rounded-[18px] bg-[#d9f7e5] p-5">
          <h2 className="text-2xl font-black text-[#067a35]">
            Duty completed
          </h2>

          <p className="mt-3 text-base font-bold leading-7 text-[#18243a]">
            Your duty has been completed. It is now OK to close the app
            completely.
          </p>
        </section>

        <MockResetButton onReset={onReset} />
      </section>
    </>
  );
}

function IssueModal({
  mode,
  details,
  location,
  manager,
  onDetailsChange,
  onLocationChange,
  onManagerChange,
  onCancel,
  onSave,
}: {
  mode: IssueMode;
  details: string;
  location: string;
  manager: string;
  onDetailsChange: (value: string) => void;
  onLocationChange: (value: string) => void;
  onManagerChange: (value: string) => void;
  onCancel: () => void;
  onSave: () => void;
}) {
  const isSkip = mode === "skip";
  const canSave = isSkip
    ? details.trim().length > 0 && manager.trim().length > 0
    : details.trim().length > 0 ||
      location.trim().length > 0 ||
      manager.trim().length > 0;

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 px-5">
      <section className="max-h-[88vh] w-full max-w-[430px] overflow-y-auto rounded-sm bg-white p-6 shadow-2xl">
        <h2 className="text-2xl font-black text-[#111]">
          {isSkip ? "Skip Leg Reason" : "Issue / Delay Details"}
        </h2>

        <p className="mt-3 text-sm font-bold leading-6 text-[#444]">
          {isSkip
            ? "Record why this leg is being skipped and which manager authorised the change."
            : "Record any issue that could delay departure or arrival, or explain if the duty is going to a different location than planned."}
        </p>

        <label className="mt-5 block text-sm font-black text-[#222]">
          Details
        </label>

        <textarea
          value={details}
          onChange={(event) => onDetailsChange(event.target.value)}
          placeholder={
            isSkip
              ? "Example: Leg skipped due to operational change..."
              : "Example: delayed leaving site, waiting for load, traffic issue..."
          }
          className="mt-2 min-h-[110px] w-full border-2 border-[#888] px-4 py-3 text-base font-bold text-[#222] outline-none focus:border-[#d6001c]"
        />

        <label className="mt-4 block text-sm font-black text-[#222]">
          Different location / route change or N/A
        </label>

        <input
          value={location}
          onChange={(event) => onLocationChange(event.target.value)}
          placeholder="Add different location if applicable"
          className="mt-2 w-full border-2 border-[#888] px-4 py-3 text-base font-bold text-[#222] outline-none focus:border-[#d6001c]"
        />

        <label className="mt-4 block text-sm font-black text-[#222]">
          Manager authorising change or N/A
        </label>

        <input
          value={manager}
          onChange={(event) => onManagerChange(event.target.value)}
          placeholder="Manager name"
          className="mt-2 w-full border-2 border-[#888] px-4 py-3 text-base font-bold text-[#222] outline-none focus:border-[#d6001c]"
        />

        {isSkip && (
          <p className="mt-3 rounded-lg bg-[#fff7ed] p-3 text-xs font-black leading-5 text-[#7c2d12]">
            For skipped legs, a reason and authorising manager should be added
            before continuing.
          </p>
        )}

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
            onClick={onSave}
            disabled={!canSave}
            className={`rounded-full px-5 py-3 text-sm font-black text-white ${
              canSave ? "bg-[#d6001c]" : "bg-[#cccccc]"
            }`}
          >
            {isSkip ? "Save & Skip Leg" : "Save Details"}
          </button>
        </div>
      </section>
    </div>
  );
}

function IssueRecordedBox({ issueReport }: { issueReport: string }) {
  return (
    <section className="mt-4 rounded-[16px] border-2 border-[#f59e0b] bg-[#fff7ed] p-4">
      <p className="text-xs font-black uppercase tracking-[0.16em] text-[#b45309]">
        Issue details recorded
      </p>

      <p className="mt-2 text-sm font-bold leading-6 text-[#7c2d12]">
        {issueReport}
      </p>
    </section>
  );
}

function DepartModal({
  taskType,
  containerCount,
  onCancel,
  onDepart,
}: {
  taskType: TaskType;
  containerCount: string;
  onCancel: () => void;
  onDepart: () => void;
}) {
  const message =
    taskType === "flex"
      ? "Are you sure you are performing a Flex or As Directed leg? If so, please add as much detail as possible regarding your leg in the Report issue / delay section."
      : taskType === "empty"
      ? "Are you sure you are taking an empty vehicle and ready to depart from depot?"
      : `Are you sure you have added all ${containerCount} containers and are ready to depart from depot?`;

  return (
    <AlertShell
      message={message}
      leftLabel="Cancel"
      rightLabel="Depart Depot"
      onLeft={onCancel}
      onRight={onDepart}
    />
  );
}

function LoadCompleteModal({
  containerCount,
  onCancel,
  onDepart,
}: {
  containerCount: number;
  onCancel: () => void;
  onDepart: () => void;
}) {
  return (
    <AlertShell
      message={`Are you sure you have scanned and loaded ${containerCount} containers and are ready to depart from depot?`}
      leftLabel="Scan More"
      rightLabel="Depart Depot"
      onLeft={onCancel}
      onRight={onDepart}
    />
  );
}

function UnloadAllModal({
  onCancel,
  onYes,
}: {
  onCancel: () => void;
  onYes: () => void;
}) {
  return (
    <AlertShell
      message="Are you sure you are unloading all the containers? Please click yes to confirm."
      leftLabel="Cancel"
      rightLabel="Yes"
      onLeft={onCancel}
      onRight={onYes}
    />
  );
}

function AlertShell({
  message,
  leftLabel,
  rightLabel,
  onLeft,
  onRight,
}: {
  message: string;
  leftLabel: string;
  rightLabel: string;
  onLeft: () => void;
  onRight: () => void;
}) {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 px-5">
      <section className="w-full max-w-[430px] rounded-sm bg-white p-7 shadow-2xl">
        <h2 className="text-3xl font-black text-[#111]">Alert</h2>

        <p className="mt-5 text-xl font-bold leading-8 text-[#222]">
          {message}
        </p>

        <div className="mt-7 grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={onLeft}
            className="rounded-full border-2 border-[#333] bg-white px-5 py-4 text-base font-black text-[#333]"
          >
            {leftLabel}
          </button>

          <button
            type="button"
            onClick={onRight}
            className="rounded-full bg-[#d6001c] px-5 py-4 text-base font-black text-white"
          >
            {rightLabel}
          </button>
        </div>
      </section>
    </div>
  );
}

function VehicleNumberBanner({ vehicleNumber }: { vehicleNumber: string }) {
  return (
    <div className="rounded-lg bg-[#f0f0f0] px-4 py-3 text-sm font-black text-[#444]">
      Vehicle registration number: {vehicleNumber}
    </div>
  );
}

function MockResetButton({ onReset }: { onReset: () => void }) {
  return (
    <button
      type="button"
      onClick={onReset}
      className="mt-7 w-full rounded-[18px] bg-[#222] px-5 py-4 text-sm font-black uppercase tracking-[0.16em] text-white"
    >
      MOCKUP Reset
    </button>
  );
}

function normaliseLocationName(value: string) {
  return value.trim().toLowerCase();
}

function getTodayDateText() {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date());
}

function getCurrentTimeText() {
  return new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date());
}
