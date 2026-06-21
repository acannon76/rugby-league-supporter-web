"use client";

import { useEffect, useMemo, useState } from "react";

type LegStatus = "To do" | "In Progress" | "Completed";
type MockupType = "flex" | "mockup2";
type TaskType = "empty" | "repat" | "load" | "skip" | "flex";
type IssueMode = "arrival" | "skip";
type PendingIssueAction = "arrival-complete" | null;
type DctStatus = "Planned" | "In Progress" | "Complete" | "Skip";

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
  | "complete"
  | "dct";

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
  kind: "mockup" | "dct" | "reset";
  mockupType?: MockupType;
};

type LegIssueReport = {
  issue?: string;
  skip?: string;
};

type DctRow = {
  legNumber: number;
  status: DctStatus;
  startDate: string;
  dutyOrder: number;
  vehicleId: string;
  userId: string;
  contractorCompanyName: string;
  operator: string;
  dutyId: string;
  departureLocation: string;
  plannedDepartureTs: number;
  departureActualTs: number | null;
  dueToConvey: string;
  departureAssets: string;
  arrivalLocation: string;
  plannedArrivalTs: number;
  arrivalActualTs: number | null;
  arrivalAssets: string;
  gpsDeparture: string;
  gpsArrival: string;
  yorkBarCodes: string;
  issues: string;
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
    kind: "mockup",
    mockupType: "flex",
  },
  {
    title: "Mockup 2",
    text: "Open a six-leg duty completed in order.",
    icon: "2",
    active: true,
    kind: "mockup",
    mockupType: "mockup2",
  },
  {
    title: "DCT Web Mockup",
    text: "Open the DCT-style results page for the last selected mock-up.",
    icon: "3",
    active: true,
    kind: "dct",
  },
  {
    title: "Complete Reset",
    text: "Clear the journey mock-up and remove all DCT mockup data.",
    icon: "4",
    active: true,
    kind: "reset",
  },
];

const originTasks: { label: string; type: TaskType }[] = [
  { label: "Empty", type: "empty" },
  { label: "Repat / Pre-Loaded", type: "repat" },
  { label: "Load", type: "load" },
  { label: "Flex / As Directed", type: "flex" },
  { label: "Skip Leg", type: "skip" },
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

const locationCoordinates: Record<string, string> = {
  "NORTH WEST HUB": "53.5184035675559, -2.65341021789611",
  "MANCHESTER MAIL CENTRE": "53.4746410000000, -2.24731400000000",
  "CHESTER MAIL CENTRE": "53.1947240000000, -2.88060500000000",
  "PRESTON MAIL CENTRE": "53.7725160000000, -2.68920400000000",
};

const mockActualOffsets: Record<MockupType, Record<number, { dep: number; arr: number }>> = {
  flex: {
    1: { dep: 7, arr: 18 },
  },
  mockup2: {
    1: { dep: 5, arr: 14 },
    2: { dep: 8, arr: 13 },
    3: { dep: 4, arr: 9 },
    4: { dep: 6, arr: 11 },
    5: { dep: 9, arr: 12 },
    6: { dep: 10, arr: 16 },
  },
};

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

  const [issueMode, setIssueMode] = useState<IssueMode>("arrival");
  const [pendingIssueAction, setPendingIssueAction] =
    useState<PendingIssueAction>(null);

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

  const [issueReports, setIssueReports] = useState<
    Record<number, LegIssueReport>
  >({});

  const [dctRows, setDctRows] = useState<DctRow[]>([]);
  const [dctSourceMockup, setDctSourceMockup] = useState<MockupType | null>(null);
  const [dctDutyId, setDctDutyId] = useState("");

  const today = useMemo(() => getTodayDateText(), []);
  const legs = mockup === "mockup2" ? mockup2Legs : flexLegs;
  const currentLeg = legs.find((leg) => leg.number === selectedLeg) || legs[0];
  const isDctScreen = screen === "dct";

  useEffect(() => {
    if (typeof window !== "undefined" && screen === "dct") {
      window.scrollTo({ top: 0, behavior: "auto" });
    }
  }, [screen]);

  function startMockup(nextMockup: MockupType) {
    const nextLegs = nextMockup === "mockup2" ? mockup2Legs : flexLegs;
    const nextStatuses: Record<number, LegStatus> = {};

    nextLegs.forEach((leg) => {
      nextStatuses[leg.number] = "To do";
    });

    const nextDutyId = getDutyIdForMockup(nextMockup);

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
    setDctSourceMockup(nextMockup);
    setDctDutyId(nextDutyId);
    setDctRows(buildPlannedDctRows(nextMockup, nextDutyId));
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

  function resetAllData() {
    setScreen("no-duty");
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
    setPendingIssueAction(null);
    setDctRows([]);
    setDctSourceMockup(null);
    setDctDutyId("");
    closeAllModals();
  }

  function handleCompleteReset() {
    resetAllData();
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

    const nextVehicle = vehicleInput.trim();
    setVehicleNumber(nextVehicle);
    setDctRows((current) =>
      current.map((row) => ({
        ...row,
        vehicleId: nextVehicle,
      }))
    );
    setVehicleModalOpen(false);
    setScreen("origin");
  }

  function selectTask(task: TaskType) {
    setSelectedTask(task);

    if (task === "skip") {
      openIssueModal("skip", null);
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

    updateDctForDeparture(selectedLeg, selectedTask, {
      containers,
      repatCount,
      existingRows: dctRows,
      currentMockup: mockup,
      setRows: setDctRows,
    });

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

    updateDctForDeparture(selectedLeg, selectedTask, {
      containers,
      repatCount,
      existingRows: dctRows,
      currentMockup: mockup,
      setRows: setDctRows,
    });

    setScreen("destination");
  }

  function arriveIntoDepot() {
    if (selectedTask === "empty" || selectedTask === "flex") {
      openIssueModal("arrival", "arrival-complete");
      return;
    }

    setScreen("unload");
  }

  function confirmUnloadAll() {
    setUnloadModalOpen(false);
    openIssueModal("arrival", "arrival-complete");
  }

  function completeLeg() {
    const finalLeg = selectedLeg === legs[legs.length - 1].number;

    setLegStatuses((current) => ({
      ...current,
      [selectedLeg]: "Completed",
    }));

    closeAllModals();
    setPendingIssueAction(null);

    if (finalLeg) {
      setScreen("complete");
      return;
    }

    setScreen("duty");
  }

  function openIssueModal(mode: IssueMode, action: PendingIssueAction) {
    setIssueMode(mode);
    setPendingIssueAction(action);
    setIssueDetails("");
    setIssueLocation("");
    setIssueManager("");
    setIssueModalOpen(true);
  }

  function saveIssueDetails() {
    const report = buildIssueReportText({
      selectedLeg,
      issueMode,
      issueDetails,
      issueLocation,
      issueManager,
    });

    setIssueReports((current) => {
      const existing = current[selectedLeg] || {};
      const nextReport: LegIssueReport = {
        ...existing,
        [issueMode === "skip" ? "skip" : "issue"]: report,
      };

      return {
        ...current,
        [selectedLeg]: nextReport,
      };
    });

    if (issueMode === "skip") {
      updateDctForSkip(selectedLeg, report);
      setIssueDetails("");
      setIssueLocation("");
      setIssueManager("");
      setIssueModalOpen(false);
      completeLeg();
      return;
    }

    updateDctForCompletion(selectedLeg, report);
    setIssueDetails("");
    setIssueLocation("");
    setIssueManager("");
    setIssueModalOpen(false);
    finishPendingIssueAction();
  }

  function continueWithoutIssue() {
    if (issueMode === "arrival") {
      updateDctForCompletion(selectedLeg, "");
    }

    setIssueDetails("");
    setIssueLocation("");
    setIssueManager("");
    setIssueModalOpen(false);
    finishPendingIssueAction();
  }

  function finishPendingIssueAction() {
    const action = pendingIssueAction;
    setPendingIssueAction(null);

    if (action === "arrival-complete") {
      completeLeg();
    }
  }

  function updateDctForCompletion(legNumber: number, issueText: string) {
    setDctRows((current) =>
      current.map((row) => {
        if (row.legNumber !== legNumber) {
          return row;
        }

        const actualTimes = getActualTimesForRow(mockup, row);

        return {
          ...row,
          status: "Complete",
          departureActualTs: row.departureActualTs ?? actualTimes.departureActualTs,
          arrivalActualTs: actualTimes.arrivalActualTs,
          issues: issueText,
        };
      })
    );
  }

  function updateDctForSkip(legNumber: number, issueText: string) {
    setDctRows((current) =>
      current.map((row) => {
        if (row.legNumber !== legNumber) {
          return row;
        }

        return {
          ...row,
          status: "Skip",
          dueToConvey: "",
          departureAssets: "",
          arrivalAssets: "",
          yorkBarCodes: "",
          issues: issueText,
          departureActualTs: null,
          arrivalActualTs: null,
        };
      })
    );
  }

  const currentTitle = mockup === "mockup2" ? "Mockup 2" : "Flex Mock Up";

  return (
    <main
      className={`min-h-screen font-sans text-[#222] ${
        isDctScreen ? "bg-[#eef2f7]" : "bg-[#f4f1ec]"
      }`}
    >
      <div
        className={`relative mx-auto min-h-screen w-full bg-white shadow-2xl ${
          isDctScreen
            ? "max-w-[1500px]"
            : "max-w-[520px] sm:my-6 sm:min-h-[900px] sm:rounded-[34px]"
        }`}
      >
        {!isDctScreen && <PhoneStatusBar />}

        {screen === "no-duty" && (
          <NoDutyScreen onContinue={() => setScreen("menu")} />
        )}

        {screen === "menu" && (
          <MenuScreen
            onOpenMockup={startMockup}
            onOpenDct={() => setScreen("dct")}
            onCompleteReset={handleCompleteReset}
            onBack={() => setScreen("no-duty")}
          />
        )}

        {screen === "duty" && (
          <DutyScreen
            today={today}
            title={currentTitle}
            dutyId={getDutyIdForMockup(mockup)}
            legs={legs}
            legStatus={legStatus}
            issueReports={issueReports}
            canOpenLeg={canOpenLeg}
            onOpenLeg={openLeg}
            onBack={() => setScreen("menu")}
            onBackToMenu={() => setScreen("menu")}
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
            onBackToMenu={() => setScreen("menu")}
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
            onBackToMenu={() => setScreen("menu")}
          />
        )}

        {screen === "scan" && (
          <ScanScreen
            containers={containers}
            onBack={() => setScreen("load")}
            onRemoveContainer={removeContainer}
            onLoadComplete={() => setLoadModalOpen(true)}
            onBackToMenu={() => setScreen("menu")}
          />
        )}

        {screen === "repat" && (
          <RepatScreen
            vehicleNumber={vehicleNumber}
            repatCount={repatCount}
            onRepatCountChange={setRepatCount}
            onBack={() => setScreen("origin")}
            onContinue={continueRepat}
            onBackToMenu={() => setScreen("menu")}
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
            onBackToMenu={() => setScreen("menu")}
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
            onBackToMenu={() => setScreen("menu")}
          />
        )}

        {screen === "complete" && (
          <CompleteScreen
            today={today}
            vehicleNumber={vehicleNumber}
            leg={currentLeg}
            dutyId={getDutyIdForMockup(mockup)}
            status="Completed"
            issueReport={issueReports[selectedLeg]}
            onBackToMenu={() => setScreen("menu")}
          />
        )}

        {screen === "dct" && (
          <DctWebScreen
            rows={dctRows}
            sourceMockup={dctSourceMockup}
            dutyId={dctDutyId}
            vehicleNumber={vehicleNumber}
            onBack={() => setScreen("menu")}
            onReset={handleCompleteReset}
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
            onYes={confirmUnloadAll}
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
            onNoIssue={continueWithoutIssue}
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
            To load the duty, manually close the app to reload content. If the
            duty still does not appear, ensure that your haulier has added your
            correct email address to the Driver Details in Haulier Connect.
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
  onOpenDct,
  onCompleteReset,
  onBack,
}: {
  onOpenMockup: (mockupType: MockupType) => void;
  onOpenDct: () => void;
  onCompleteReset: () => void;
  onBack: () => void;
}) {
  return (
    <>
      <AppHeader title="Haulier Mock Up" left="Back" onBack={onBack} />

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
          {mockupOptions.map((option) => {
            let onClick: (() => void) | undefined;

            if (option.kind === "mockup" && option.mockupType) {
              onClick = () => onOpenMockup(option.mockupType as MockupType);
            }

            if (option.kind === "dct") {
              onClick = onOpenDct;
            }

            if (option.kind === "reset") {
              onClick = onCompleteReset;
            }

            return (
              <MockupOptionButton
                key={option.title}
                option={option}
                onClick={onClick}
              />
            );
          })}
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
  const isDanger = option.kind === "reset";

  return (
    <button
      type="button"
      disabled={!option.active}
      onClick={onClick}
      className={`flex w-full items-center gap-4 rounded-[18px] border p-4 text-left shadow-sm transition ${
        option.active
          ? isDanger
            ? "border-[#f4b1b9] bg-[#fff1f3] hover:-translate-y-1 hover:shadow-md"
            : "border-[#d0d0d0] bg-white hover:-translate-y-1 hover:shadow-md"
          : "border-transparent bg-[#f0f0f0] opacity-60"
      }`}
    >
      <div
        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-lg font-black text-white ${
          option.active
            ? isDanger
              ? "bg-[#d6001c]"
              : "bg-[#d6001c]"
            : "bg-[#999]"
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
  dutyId,
  legs,
  legStatus,
  issueReports,
  canOpenLeg,
  onOpenLeg,
  onBack,
  onBackToMenu,
}: {
  today: string;
  title: string;
  dutyId: string;
  legs: DutyLeg[];
  legStatus: (legNumber: number) => LegStatus;
  issueReports: Record<number, LegIssueReport>;
  canOpenLeg: (legNumber: number) => boolean;
  onOpenLeg: (legNumber: number) => void;
  onBack: () => void;
  onBackToMenu: () => void;
}) {
  return (
    <>
      <AppHeader title="Haulier Mock Up" left="Back" onBack={onBack} />

      <section className="bg-white px-5 py-6">
        <OverviewCard dutyId={dutyId} />

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
              issueReport={issueReports[leg.number]}
              canOpen={canOpenLeg(leg.number)}
              onClick={() => onOpenLeg(leg.number)}
            />
          ))}
        </div>

        <BackToMenuButton onBackToMenu={onBackToMenu} />
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
  const isFlexAsDirectedLeg =
    normaliseLocationName(leg.from) === normaliseLocationName(leg.to);

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

      {issueReport && hasAnyIssue(issueReport) && (
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

      <div className="mt-2 space-y-2 text-xs font-bold leading-5 text-[#7c2d12]">
        {issueReport.issue && (
          <p>
            <span className="font-black">Leg {legNumber} Issue / Route Change:</span>{" "}
            {issueReport.issue}
          </p>
        )}

        {issueReport.skip && (
          <p>
            <span className="font-black">Leg {legNumber} Skipped Leg Reason:</span>{" "}
            {issueReport.skip}
          </p>
        )}
      </div>
    </section>
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
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 px-5 py-4">
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
  onBackToMenu,
}: {
  today: string;
  vehicleNumber: string;
  leg: DutyLeg;
  status: LegStatus;
  issueReport?: LegIssueReport;
  onBack: () => void;
  onTask: (task: TaskType) => void;
  onBackToMenu: () => void;
}) {
  return (
    <>
      <AppHeader title="Origin Tasks" left="Back" onBack={onBack} />

      <section className="bg-white px-5 py-5">
        <VehicleNumberBanner vehicleNumber={vehicleNumber} />

        <p className="mt-6 text-lg font-bold text-[#333]">{today}</p>

        <div className="mt-3">
          <LegCard leg={leg} status={status} issueReport={issueReport} />
        </div>

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

        {issueReport && hasAnyIssue(issueReport) && (
          <IssueRecordedBox legNumber={leg.number} issueReport={issueReport} />
        )}

        <BackToMenuButton onBackToMenu={onBackToMenu} />
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
  onBackToMenu,
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
  onBackToMenu: () => void;
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

        <BackToMenuButton onBackToMenu={onBackToMenu} />
      </section>
    </>
  );
}

function ScanScreen({
  containers,
  onBack,
  onRemoveContainer,
  onLoadComplete,
  onBackToMenu,
}: {
  containers: string[];
  onBack: () => void;
  onRemoveContainer: (containerNumber: string) => void;
  onLoadComplete: () => void;
  onBackToMenu: () => void;
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

        <BackToMenuButton onBackToMenu={onBackToMenu} />
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
  onBackToMenu,
}: {
  vehicleNumber: string;
  repatCount: string;
  onRepatCountChange: (value: string) => void;
  onBack: () => void;
  onContinue: () => void;
  onBackToMenu: () => void;
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

        <BackToMenuButton onBackToMenu={onBackToMenu} />
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
  onBackToMenu,
}: {
  today: string;
  vehicleNumber: string;
  leg: DutyLeg;
  status: LegStatus;
  selectedTask: TaskType;
  issueReport?: LegIssueReport;
  onBack: () => void;
  onArriveIntoDepot: () => void;
  onBackToMenu: () => void;
}) {
  return (
    <>
      <AppHeader title="Destination Tasks" left="Back" onBack={onBack} />

      <section className="bg-white px-5 py-5">
        <VehicleNumberBanner vehicleNumber={vehicleNumber} />

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
          <span>
            {selectedTask === "flex"
              ? "Returned from & completed Flex / As Directed leg"
              : "Arrive into depot"}
          </span>
          <span className="text-2xl font-black text-[#d6001c]">›</span>
        </button>

        {issueReport && hasAnyIssue(issueReport) && (
          <IssueRecordedBox legNumber={leg.number} issueReport={issueReport} />
        )}

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

        <BackToMenuButton onBackToMenu={onBackToMenu} />
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
  onBackToMenu,
}: {
  today: string;
  vehicleNumber: string;
  leg: DutyLeg;
  status: LegStatus;
  issueReport?: LegIssueReport;
  onBack: () => void;
  onUnloadAll: () => void;
  onBackToMenu: () => void;
}) {
  return (
    <>
      <AppHeader title="Destination Tasks" left="Back" onBack={onBack} />

      <section className="bg-white px-5 py-5">
        <VehicleNumberBanner vehicleNumber={vehicleNumber} />

        <p className="mt-6 text-lg font-bold text-[#333]">{today}</p>

        <div className="mt-3">
          <LegCard leg={leg} status={status} issueReport={issueReport} />
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
        </div>

        {issueReport && hasAnyIssue(issueReport) && (
          <IssueRecordedBox legNumber={leg.number} issueReport={issueReport} />
        )}

        <BackToMenuButton onBackToMenu={onBackToMenu} />
      </section>
    </>
  );
}

function CompleteScreen({
  today,
  vehicleNumber,
  leg,
  dutyId,
  status,
  issueReport,
  onBackToMenu,
}: {
  today: string;
  vehicleNumber: string;
  leg: DutyLeg;
  dutyId: string;
  status: LegStatus;
  issueReport?: LegIssueReport;
  onBackToMenu: () => void;
}) {
  return (
    <>
      <AppHeader title="Haulier Mock Up" />

      <section className="bg-white px-5 py-6">
        <OverviewCard dutyId={dutyId} />

        <h2 className="mt-10 text-2xl font-black text-[#222]">
          Duty details
        </h2>

        <p className="mt-8 text-xl font-bold text-[#333]">{today}</p>

        <div className="mt-4">
          <LegCard leg={leg} status={status} issueReport={issueReport} />
        </div>

        <VehicleNumberBanner vehicleNumber={vehicleNumber} />

        {issueReport && hasAnyIssue(issueReport) && (
          <IssueRecordedBox legNumber={leg.number} issueReport={issueReport} />
        )}

        <section className="mt-6 rounded-[18px] bg-[#d9f7e5] p-5">
          <h2 className="text-2xl font-black text-[#067a35]">
            Duty completed
          </h2>

          <p className="mt-3 text-base font-bold leading-7 text-[#18243a]">
            Your duty has been completed. It is now OK to close the app
            completely.
          </p>
        </section>

        <BackToMenuButton onBackToMenu={onBackToMenu} />
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
  onNoIssue,
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
  onNoIssue: () => void;
}) {
  const isSkip = mode === "skip";

  const canSave = isSkip
    ? details.trim().length > 0 && manager.trim().length > 0
    : details.trim().length > 0;

  const title = isSkip ? "Skip Leg Reason" : "Issue / Route Change";

  const helperText = isSkip
    ? "Record why this leg is being skipped and which manager authorised the change."
    : "Before completing this leg, record any issue, delay, different location, route change, or other information in the box below. If there was no issue, select No Issue.";

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 px-5 py-4">
      <section className="max-h-[calc(100dvh-32px)] w-full max-w-[430px] overflow-y-auto rounded-sm bg-white p-6 shadow-2xl">
        <h2 className="text-2xl font-black text-[#111]">{title}</h2>

        <p className="mt-3 text-sm font-bold leading-6 text-[#444]">
          {helperText}
        </p>

        <label className="mt-5 block text-sm font-black text-[#222]">
          {isSkip ? "Details" : "Issue / route change details"}
        </label>

        <textarea
          value={details}
          onChange={(event) => onDetailsChange(event.target.value)}
          placeholder={
            isSkip
              ? "Example: Leg skipped due to operational change..."
              : "Example: delayed arrival, traffic, gate queue, different location, route change, authorised by..."
          }
          className="mt-2 min-h-[130px] w-full border-2 border-[#888] px-4 py-3 text-base font-bold text-[#222] outline-none focus:border-[#d6001c]"
        />

        {isSkip && (
          <>
            <label className="mt-4 block text-sm font-black text-[#222]">
              Different location / route change or N/A
            </label>

            <input
              value={location}
              onChange={(event) => onLocationChange(event.target.value)}
              placeholder="Add route change if applicable"
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

            <p className="mt-3 rounded-lg bg-[#fff7ed] p-3 text-xs font-black leading-5 text-[#7c2d12]">
              For skipped legs, a reason and authorising manager should be added
              before continuing.
            </p>
          </>
        )}

        {isSkip ? (
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
              Save & Skip Leg
            </button>
          </div>
        ) : (
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
          </div>
        )}
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
    <section className="mt-4 rounded-[16px] border-2 border-[#f59e0b] bg-[#fff7ed] p-4">
      <p className="text-xs font-black uppercase tracking-[0.16em] text-[#b45309]">
        Issue details recorded
      </p>

      <div className="mt-2 space-y-2 text-sm font-bold leading-6 text-[#7c2d12]">
        {issueReport.issue && (
          <p>
            <span className="font-black">Leg {legNumber} Issue / Route Change:</span>{" "}
            {issueReport.issue}
          </p>
        )}

        {issueReport.skip && (
          <p>
            <span className="font-black">Leg {legNumber} Skipped Leg Reason:</span>{" "}
            {issueReport.skip}
          </p>
        )}
      </div>
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
      ? "Are you sure you are performing a Flex or As Directed leg? If so, please add as much detail as possible in the issue / route change screen before completing the leg."
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
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 px-5 py-4">
      <section className="max-h-[calc(100dvh-32px)] w-full max-w-[430px] overflow-y-auto rounded-sm bg-white p-7 shadow-2xl">
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

function BackToMenuButton({
  onBackToMenu,
}: {
  onBackToMenu: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onBackToMenu}
      className="mt-7 w-full rounded-[18px] border-2 border-[#d6001c] bg-white px-5 py-4 text-sm font-black uppercase tracking-[0.16em] text-[#d6001c]"
    >
      Back to Mock-up Options
    </button>
  );
}

function DctWebScreen({
  rows,
  sourceMockup,
  dutyId,
  vehicleNumber,
  onBack,
  onReset,
}: {
  rows: DctRow[];
  sourceMockup: MockupType | null;
  dutyId: string;
  vehicleNumber: string;
  onBack: () => void;
  onReset: () => void;
}) {
  const sourceTitle =
    sourceMockup === "mockup2"
      ? "Mockup 2"
      : sourceMockup === "flex"
      ? "Flex Mock Up"
      : "No mock-up selected";

  const columns: {
    key: string;
    label: string;
    headerClass: string;
    widthClass: string;
    align?: "left" | "center";
  }[] = [
    { key: "status", label: "Leg Status", headerClass: "bg-[#cfeefa]", widthClass: "w-[90px]", align: "left" },
    { key: "startDate", label: "Start Date", headerClass: "bg-[#cfeefa]", widthClass: "w-[95px]", align: "center" },
    { key: "dutyOrder", label: "Duty Order", headerClass: "bg-[#cfeefa]", widthClass: "w-[68px]", align: "center" },
    { key: "vehicleId", label: "Vehicle Id", headerClass: "bg-[#cfeefa]", widthClass: "w-[88px]", align: "center" },
    { key: "userId", label: "UserId", headerClass: "bg-[#cfeefa]", widthClass: "w-[140px]", align: "center" },
    { key: "contractorCompanyName", label: "Contractor Company Name", headerClass: "bg-[#cfeefa]", widthClass: "w-[120px]", align: "center" },
    { key: "operator", label: "Operator", headerClass: "bg-[#cfeefa]", widthClass: "w-[62px]", align: "center" },
    { key: "dutyId", label: "DutyId", headerClass: "bg-[#cfeefa]", widthClass: "w-[82px]", align: "center" },
    { key: "departureLocation", label: "Departure location", headerClass: "bg-[#f2e8c9]", widthClass: "w-[112px]", align: "center" },
    { key: "plannedDeparture", label: "Planned_Departure_Time", headerClass: "bg-[#f2e8c9]", widthClass: "w-[132px]", align: "center" },
    { key: "departureActual", label: "DEPARTURE actual time", headerClass: "bg-[#f2e8c9]", widthClass: "w-[132px]", align: "center" },
    { key: "dueToConvey", label: "Due To Convey", headerClass: "bg-[#f7efd8]", widthClass: "w-[108px]", align: "center" },
    { key: "departureAssets", label: "DEPARTURE assets", headerClass: "bg-[#f2e8c9]", widthClass: "w-[68px]", align: "center" },
    { key: "arrivalLocation", label: "Arrival Location", headerClass: "bg-[#d9f1d5]", widthClass: "w-[112px]", align: "center" },
    { key: "plannedArrival", label: "Planned_Arrival_Time", headerClass: "bg-[#d9f1d5]", widthClass: "w-[132px]", align: "center" },
    { key: "arrivalActual", label: "ARRIVAL actual time", headerClass: "bg-[#d9f1d5]", widthClass: "w-[132px]", align: "center" },
    { key: "arrivalAssets", label: "ARRIVAL assets", headerClass: "bg-[#d9f1d5]", widthClass: "w-[68px]", align: "center" },
    { key: "gpsDeparture", label: "GPS Departure", headerClass: "bg-[#ead5ea]", widthClass: "w-[140px]", align: "center" },
    { key: "gpsArrival", label: "GPS Arrival", headerClass: "bg-[#ead5ea]", widthClass: "w-[140px]", align: "center" },
    { key: "yorkBarCodes", label: "York Bar Codes", headerClass: "bg-[#f3d9ec]", widthClass: "w-[118px]", align: "center" },
    { key: "issues", label: "Issues", headerClass: "bg-[#fde7c7]", widthClass: "w-[180px]", align: "left" },
  ];

  return (
    <>
      <AppHeader title="DCT Web Mockup" left="Back" onBack={onBack} />

      <section className="bg-[#f8fafc] px-3 py-4 sm:px-4 lg:px-5">
        <section className="rounded-[14px] border border-[#cfd8e3] bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#d6001c]">
                Web results mockup
              </p>
              <h2 className="mt-2 text-2xl font-black text-[#172033] sm:text-3xl">
                DCT-style output view
              </h2>
              <p className="mt-3 max-w-[980px] text-sm font-bold leading-6 text-[#4b5563]">
                This version is styled closer to the spreadsheet view, with tighter
                columns and Excel-style header colours. Planned values show first,
                and the actual values populate as the mock-up is run.
              </p>
            </div>

            <button
              type="button"
              onClick={onReset}
              className="rounded-full bg-[#d6001c] px-5 py-3 text-sm font-black uppercase tracking-[0.14em] text-white"
            >
              Complete Reset
            </button>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <SummaryCard label="Last selected mock-up" value={sourceTitle} />
            <SummaryCard label="Duty ID" value={dutyId || ""} />
            <SummaryCard
              label="Vehicle / trailer number"
              value={vehicleNumber || ""}
            />
            <SummaryCard label="Rows shown" value={String(rows.length)} />
          </div>

          <div className="mt-4 flex flex-wrap gap-2 text-[11px] font-black uppercase tracking-[0.12em]">
            <span className="rounded-full border border-[#1f7a34] bg-[#d9f7e5] px-3 py-2 text-[#166534]">
              Green = on time / early
            </span>
            <span className="rounded-full border border-[#c62828] bg-[#fecaca] px-3 py-2 text-[#7f1d1d]">
              Red = late
            </span>
            <span className="rounded-full border border-[#6b7280] bg-[#e5e7eb] px-3 py-2 text-[#374151]">
              Grey = not yet populated
            </span>
          </div>
        </section>

        {rows.length === 0 ? (
          <section className="mt-5 rounded-[14px] border border-[#cfd8e3] bg-white p-8 shadow-sm">
            <p className="text-lg font-black text-[#172033]">
              No DCT mockup data is available yet.
            </p>
            <p className="mt-3 text-sm font-bold leading-6 text-[#4b5563]">
              Run Flex Mock Up or Mockup 2 first, then return here to view the
              DCT-style output.
            </p>
          </section>
        ) : (
          <section className="mt-5 rounded-[14px] border border-[#cfd8e3] bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-[2250px] border-collapse text-[10px] leading-[1.15] text-[#111827]">
                <thead className="sticky top-0 z-10">
                  <tr>
                    {columns.map((column) => (
                      <th
                        key={column.key}
                        className={`${column.headerClass} ${column.widthClass} border border-black px-1 py-2 align-bottom text-left font-normal text-black`}
                      >
                        <div className="whitespace-normal break-words">
                          {column.label}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {rows.map((row, index) => (
                    <tr key={row.legNumber} className={index % 2 === 0 ? "bg-white" : "bg-[#fcfcfc]"}>
                      <td className={`${getDctStatusCellClass(row.status)} border border-black px-1 py-2 font-normal text-black`}>
                        {row.status}
                      </td>
                      <td className="border border-black px-1 py-2 text-center font-normal whitespace-nowrap">{row.startDate}</td>
                      <td className="border border-black px-1 py-2 text-center font-normal">{row.dutyOrder}</td>
                      <td className="border border-black px-1 py-2 text-center font-normal whitespace-nowrap">{row.vehicleId || ""}</td>
                      <td className="border border-black px-1 py-2 text-center font-normal break-words">{row.userId}</td>
                      <td className="border border-black px-1 py-2 text-center font-normal break-words">{row.contractorCompanyName}</td>
                      <td className="border border-black px-1 py-2 text-center font-normal">{row.operator}</td>
                      <td className="border border-black px-1 py-2 text-center font-normal whitespace-nowrap">{row.dutyId}</td>
                      <td className="border border-black px-1 py-2 text-center font-normal uppercase break-words">{row.departureLocation}</td>
                      <td className="border border-black px-1 py-2 text-center font-normal whitespace-nowrap">{formatDateTime(row.plannedDepartureTs)}</td>
                      <td className={`${getTimingCellClass(row.plannedDepartureTs, row.departureActualTs)} border border-black px-1 py-2 text-center font-bold whitespace-nowrap`}>
                        {row.departureActualTs ? formatDateTime(row.departureActualTs) : "-"}
                      </td>
                      <td className="border border-black px-1 py-2 text-center font-normal uppercase break-words">{row.dueToConvey || "-"}</td>
                      <td className="border border-black px-1 py-2 text-center font-normal">{row.departureAssets || "-"}</td>
                      <td className="border border-black px-1 py-2 text-center font-normal uppercase break-words">{row.arrivalLocation}</td>
                      <td className="border border-black px-1 py-2 text-center font-normal whitespace-nowrap">{formatDateTime(row.plannedArrivalTs)}</td>
                      <td className={`${getTimingCellClass(row.plannedArrivalTs, row.arrivalActualTs)} border border-black px-1 py-2 text-center font-bold whitespace-nowrap`}>
                        {row.arrivalActualTs ? formatDateTime(row.arrivalActualTs) : "-"}
                      </td>
                      <td className="border border-black px-1 py-2 text-center font-normal">{row.arrivalAssets || "-"}</td>
                      <td className="border border-black px-1 py-2 font-normal break-words">{row.gpsDeparture || "-"}</td>
                      <td className="border border-black px-1 py-2 font-normal break-words">{row.gpsArrival || "-"}</td>
                      <td className="border border-black px-1 py-2 font-normal break-words">{row.yorkBarCodes || "-"}</td>
                      <td className="border border-black px-1 py-2 font-normal break-words">{row.issues || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </section>
    </>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[12px] border border-[#d6dee8] bg-[#f8fafc] p-4">
      <p className="text-[11px] font-black uppercase tracking-[0.16em] text-[#64748b]">
        {label}
      </p>
      <p className="mt-2 text-lg font-black text-[#172033]">
        {value || "-"}
      </p>
    </div>
  );
}

function getDctStatusCellClass(status: DctStatus) {
  if (status === "Complete") {
    return "bg-[#d9f7e5]";
  }

  if (status === "In Progress") {
    return "bg-[#ffe9c8]";
  }

  if (status === "Skip") {
    return "bg-[#d1d5db]";
  }

  return "bg-[#dbeafe]";
}

function hasAnyIssue(issueReport: LegIssueReport) {
  return Boolean(issueReport.issue || issueReport.skip);
}

function buildIssueReportText({
  selectedLeg,
  issueMode,
  issueDetails,
  issueLocation,
  issueManager,
}: {
  selectedLeg: number;
  issueMode: IssueMode;
  issueDetails: string;
  issueLocation: string;
  issueManager: string;
}) {
  if (issueMode === "arrival") {
    return issueDetails.trim();
  }

  const reportParts = [
    `Leg ${selectedLeg}`,
    "Type: Skipped leg",
    issueDetails.trim() ? `Details: ${issueDetails.trim()}` : "",
    issueLocation.trim()
      ? `Location / route change: ${issueLocation.trim()}`
      : "",
    issueManager.trim() ? `Authorised by: ${issueManager.trim()}` : "",
  ].filter(Boolean);

  return reportParts.join(" | ");
}

function buildPlannedDctRows(mockupType: MockupType, dutyId: string) {
  const sourceLegs = mockupType === "mockup2" ? mockup2Legs : flexLegs;
  const baseDate = new Date();
  baseDate.setHours(0, 0, 0, 0);

  let previousDepartureTs: number | null = null;

  return sourceLegs.map((leg) => {
    let departureTs = combineDateAndTime(baseDate, leg.etd, 0);

    while (previousDepartureTs !== null && departureTs <= previousDepartureTs) {
      departureTs += 24 * 60 * 60 * 1000;
    }

    let arrivalTs = combineDateAndTime(new Date(departureTs), leg.eta, 0);

    while (arrivalTs < departureTs) {
      arrivalTs += 24 * 60 * 60 * 1000;
    }

    previousDepartureTs = departureTs;

    return {
      legNumber: leg.number,
      status: "Planned" as DctStatus,
      startDate: formatDateOnly(baseDate.getTime()),
      dutyOrder: leg.number,
      vehicleId: "",
      userId: "acannon76@live.co.uk",
      contractorCompanyName: "Contoso",
      operator: "NWH",
      dutyId,
      departureLocation: leg.from,
      plannedDepartureTs: departureTs,
      departureActualTs: null,
      dueToConvey: "",
      departureAssets: "",
      arrivalLocation: leg.to,
      plannedArrivalTs: arrivalTs,
      arrivalActualTs: null,
      arrivalAssets: "",
      gpsDeparture: locationCoordinates[leg.from] || "",
      gpsArrival: locationCoordinates[leg.to] || "",
      yorkBarCodes: "",
      issues: "",
    };
  });
}

function updateDctForDeparture(
  legNumber: number,
  taskType: TaskType,
  context: {
    containers: string[];
    repatCount: string;
    existingRows: DctRow[];
    currentMockup: MockupType;
    setRows: (updater: (current: DctRow[]) => DctRow[]) => void;
  }
) {
  const assetCount =
    taskType === "load"
      ? String(context.containers.length)
      : taskType === "repat"
      ? context.repatCount.trim()
      : "";

  const dueToConvey =
    taskType === "load"
      ? "SCANNED"
      : taskType === "repat"
      ? "REPAT / PRELOAD"
      : taskType === "flex"
      ? "AS DIRECTED"
      : taskType === "empty"
      ? "EMPTY VEHICLE"
      : "";

  const yorkBarCodes =
    taskType === "load" ? context.containers.join(", ") : "";

  context.setRows((current) =>
    current.map((row) => {
      if (row.legNumber !== legNumber) {
        return row;
      }

      const actualTimes = getActualTimesForRow(context.currentMockup, row);

      return {
        ...row,
        status: "In Progress" as DctStatus,
        departureActualTs: actualTimes.departureActualTs,
        dueToConvey,
        departureAssets: assetCount,
        arrivalAssets: assetCount,
        yorkBarCodes,
      };
    })
  );
}

function getActualTimesForRow(mockupType: MockupType, row: DctRow) {
  const offsets = mockActualOffsets[mockupType][row.legNumber] || {
    dep: 5,
    arr: 10,
  };

  return {
    departureActualTs: row.plannedDepartureTs + offsets.dep * 60 * 1000,
    arrivalActualTs: row.plannedArrivalTs + offsets.arr * 60 * 1000,
  };
}

function getDutyIdForMockup(mockupType: MockupType) {
  return mockupType === "mockup2" ? "NWH254" : "NWHFLEX01";
}

function getTimingCellClass(
  plannedTs: number,
  actualTs: number | null
) {
  if (!actualTs) {
    return "bg-[#f3f4f6] text-[#374151]";
  }

  if (actualTs > plannedTs) {
    return "bg-[#fecaca] text-[#7f1d1d]";
  }

  return "bg-[#bbf7d0] text-[#166534]";
}

function normaliseLocationName(value: string) {
  return value.trim().toLowerCase();
}

function combineDateAndTime(baseDate: Date, timeText: string, dayOffset: number) {
  const [hours, minutes] = timeText.split(":").map(Number);
  const next = new Date(baseDate);
  next.setDate(next.getDate() + dayOffset);
  next.setHours(hours, minutes, 0, 0);
  return next.getTime();
}

function formatDateOnly(timestamp: number) {
  const date = new Date(timestamp);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

function formatDateTime(timestamp: number) {
  const date = new Date(timestamp);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");
  return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
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
