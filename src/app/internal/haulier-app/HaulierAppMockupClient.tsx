"use client";

import { useEffect, useMemo, useState } from "react";
import DriverName from "../DriverName";
import { getStoredDriverUserId } from "../driverPdaSession";
import { getOperationalWeekNumberFromDisplayDate } from "../operationalWeek";

type LegStatus = "To do" | "In Progress" | "Completed";
type MockupType = "flex" | "mockup2";
type TaskType = "empty" | "repat" | "load" | "skip" | "flex";
type IssueMode = "arrival" | "skip";
type PendingIssueAction = "arrival-complete" | null;
type DctStatus = "Planned" | "In Progress" | "Complete" | "Skip";
type MessagePriority = "Normal" | "High" | "Critical";

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
  | "dct"
  | "messages";

type HaulierMessage = {
  id: string;
  priority: MessagePriority;
  subject: string;
  body: string;
  receivedAt: string;
  read: boolean;
  direction?: "incoming" | "sent";
};

type MessagePriorityConfig = {
  label: MessagePriority;
  icon: string;
  heading: string;
  body: string;
  borderClass: string;
  panelClass: string;
  textClass: string;
  mutedTextClass: string;
  buttonClass: string;
};

type DutyLeg = {
  number: number;
  etd: string;
  eta: string;
  from: string;
  to: string;
  plannedDepartureTs?: number;
  plannedArrivalTs?: number;
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
  vehicleReg: string;
  trailerId: string;
  userId: string;
  division: string;
  operator: string;
  dutyId: string;
  trailerType: string;
  planzCode: string;
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
  issueCategory: string;
  issues: string;
  liveTracking: string;
  loadAction: string;
};

const DEFAULT_VEHICLE_REG = "MX71ESN";
const DEFAULT_DCT_MOCKUP: MockupType = "mockup2";
const DEFAULT_DCT_DUTY_ID = "NWH254";
const HAULIER_MESSAGE_STORAGE_KEY = "haulier-app-incoming-messages-v1";

const messagePriorityConfigs: Record<MessagePriority, MessagePriorityConfig> = {
  Normal: {
    label: "Normal",
    icon: "✉",
    heading: "Normal Message From NWH Transport",
    body: "Routine operational message received. Please check the message when safe to do so.",
    borderClass: "border-[#1d4ed8]",
    panelClass: "bg-[#dbeafe]",
    textClass: "text-[#1d4ed8]",
    mutedTextClass: "text-[#1e3a8a]",
    buttonClass: "bg-[#1d4ed8] text-white",
  },
  High: {
    label: "High",
    icon: "▲",
    heading: "High Priority Message From NWH Transport",
    body: "High priority operational message received. Please review it before continuing your duty.",
    borderClass: "border-[#d97706]",
    panelClass: "bg-[#fef3c7]",
    textClass: "text-[#b45309]",
    mutedTextClass: "text-[#92400e]",
    buttonClass: "bg-[#d97706] text-white",
  },
  Critical: {
    label: "Critical",
    icon: "!",
    heading: "Critical Message From NWH Transport",
    body: "Critical operational message received. Stop when safe and contact the Transport Office immediately.",
    borderClass: "border-[#dc2626]",
    panelClass: "bg-[#fee2e2]",
    textClass: "text-[#b91c1c]",
    mutedTextClass: "text-[#7f1d1d]",
    buttonClass: "bg-[#dc2626] text-white",
  },
};

const mockup2RelativeTimingMinutes = [
  { departure: 0, arrival: 50 },
  { departure: 80, arrival: 120 },
  { departure: 180, arrival: 230 },
  { departure: 290, arrival: 340 },
  { departure: 450, arrival: 500 },
  { departure: 540, arrival: 585 },
] as const;

const mockup2PlanningDetails: Record<
  number,
  { trailerType: string; planzCode: string; dueToConvey: string }
> = {
  1: { trailerType: "49 Artic", planzCode: "NWH.M.3", dueToConvey: "1C 24 Mail" },
  2: { trailerType: "49 Artic T/L", planzCode: "M.NWH.7", dueToConvey: "1C 24 Mail" },
  3: { trailerType: "75 Artic DD", planzCode: "NWH.CH.4", dueToConvey: "1C 24 Mail" },
  4: { trailerType: "95 Artic DD", planzCode: "CH.NWH.3", dueToConvey: "1C 24 Mail" },
  5: { trailerType: "110 Artic DD", planzCode: "NWH.EH.4a", dueToConvey: "1C 24 Mail" },
  6: { trailerType: "95 Artic DD", planzCode: "G.MSH.3b", dueToConvey: "1C 24 Mail" },
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

const defaultMockup2Legs: DutyLeg[] = [
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
    text: "Clear entered journey data and restore the planned DCT rows.",
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

const issueCategoryOptions = [
  "Previous Leg Delay",
  "Traffic Delay",
  "Trailer Swap Delay",
  "Site Issue",
  "Breakdown",
  "CPC Hold Code",
  "Loading Delay",
  "Unloading Delay",
  "Other",
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
  const [issueCategory, setIssueCategory] = useState("");
  const [issueLocation, setIssueLocation] = useState("");
  const [issueManager, setIssueManager] = useState("");

  const [vehicleInput, setVehicleInput] = useState(DEFAULT_VEHICLE_REG);
  const [trailerInput, setTrailerInput] = useState("");
  const [vehicleNumber, setVehicleNumber] = useState(DEFAULT_VEHICLE_REG);
  const [trailerNumber, setTrailerNumber] = useState("");
  const [manualContainer, setManualContainer] = useState("");
  const [repatCount, setRepatCount] = useState("");
  const [containers, setContainers] = useState<string[]>([]);

  const [legStatuses, setLegStatuses] = useState<Record<number, LegStatus>>({
    1: "To do",
  });

  const [issueReports, setIssueReports] = useState<
    Record<number, LegIssueReport>
  >({});

  const [messages, setMessages] = useState<HaulierMessage[]>([]);
  const [messagesLoaded, setMessagesLoaded] = useState(false);
  const [messageSimulatorOpen, setMessageSimulatorOpen] = useState(false);
  const [messageComposerOpen, setMessageComposerOpen] = useState(false);

  const [simulationReferenceTs, setSimulationReferenceTs] = useState<
    number | null
  >(null);
  const mockup2Legs = useMemo(
    () =>
      simulationReferenceTs === null
        ? defaultMockup2Legs
        : buildMockup2Legs(simulationReferenceTs),
    [simulationReferenceTs]
  );

  const [dctRows, setDctRows] = useState<DctRow[]>(() =>
    buildPlannedDctRows(
      DEFAULT_DCT_MOCKUP,
      DEFAULT_DCT_DUTY_ID,
      defaultMockup2Legs
    )
  );
  const [dctSourceMockup, setDctSourceMockup] = useState<MockupType | null>(
    DEFAULT_DCT_MOCKUP
  );
  const [dctDutyId, setDctDutyId] = useState(DEFAULT_DCT_DUTY_ID);

  const today = useMemo(() => getTodayDateText(), []);
  const currentTimeTs = useLiveCurrentTime();
  const legs = mockup === "mockup2" ? mockup2Legs : flexLegs;
  const currentDctRow = dctRows.find(
    (row) => row.legNumber === selectedLeg
  );
  const dutyDate =
    mockup === "mockup2" && mockup2Legs[0]?.plannedDepartureTs
      ? formatDateOnly(mockup2Legs[0].plannedDepartureTs)
      : today;
  const currentLeg = legs.find((leg) => leg.number === selectedLeg) || legs[0];
  const isDctScreen = screen === "dct";
  const unreadMessages = messages.filter(
    (message) => message.direction !== "sent" && !message.read
  );
  const highestUnreadMessage = unreadMessages.reduce<HaulierMessage | null>(
    (highest, message) => {
      if (!highest) {
        return message;
      }

      return messagePriorityRank(message.priority) >
        messagePriorityRank(highest.priority)
        ? message
        : highest;
    },
    null
  );
  const highestUnreadConfig = highestUnreadMessage
    ? messagePriorityConfigs[highestUnreadMessage.priority]
    : null;

  useEffect(() => {
    const initialiseTimer = window.setTimeout(() => {
      const referenceTs = Date.now();
      const nextLegs = buildMockup2Legs(referenceTs);

      setSimulationReferenceTs(referenceTs);
      setDctRows(
        buildPlannedDctRows(
          DEFAULT_DCT_MOCKUP,
          DEFAULT_DCT_DUTY_ID,
          nextLegs
        )
      );
    }, 0);

    return () => window.clearTimeout(initialiseTimer);
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined" && screen === "dct") {
      window.scrollTo({ top: 0, behavior: "auto" });
    }
  }, [screen]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const loadMessagesTimer = window.setTimeout(() => {
      const savedMessages = window.localStorage.getItem(
        HAULIER_MESSAGE_STORAGE_KEY
      );

      if (savedMessages) {
        try {
          const parsedMessages = JSON.parse(savedMessages) as HaulierMessage[];
          setMessages(Array.isArray(parsedMessages) ? parsedMessages : []);
        } catch {
          window.localStorage.removeItem(HAULIER_MESSAGE_STORAGE_KEY);
        }
      }

      setMessagesLoaded(true);
    }, 0);

    return () => window.clearTimeout(loadMessagesTimer);
  }, []);

  useEffect(() => {
    if (!messagesLoaded || typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(
      HAULIER_MESSAGE_STORAGE_KEY,
      JSON.stringify(messages)
    );
  }, [messages, messagesLoaded]);

  function startMockup(nextMockup: MockupType) {
    const nextReferenceTs = Date.now();
    const nextMockup2Legs = buildMockup2Legs(nextReferenceTs);
    const nextLegs =
      nextMockup === "mockup2" ? nextMockup2Legs : flexLegs;
    const nextStatuses: Record<number, LegStatus> = {};

    if (nextMockup === "mockup2") {
      setSimulationReferenceTs(nextReferenceTs);
    }

    nextLegs.forEach((leg) => {
      nextStatuses[leg.number] = "To do";
    });

    const nextDutyId = getDutyIdForMockup(nextMockup);

    setMockup(nextMockup);
    setSelectedLeg(1);
    setSelectedTask("empty");
    setVehicleInput(DEFAULT_VEHICLE_REG);
    setTrailerInput("");
    setVehicleNumber(DEFAULT_VEHICLE_REG);
    setTrailerNumber("");
    setManualContainer("");
    setRepatCount("");
    setContainers([]);
    setLegStatuses(nextStatuses);
    setIssueReports({});
    setIssueCategory("");
    setDctSourceMockup(nextMockup);
    setDctDutyId(nextDutyId);
    setDctRows(buildPlannedDctRows(nextMockup, nextDutyId, nextLegs));
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
    setVehicleInput(DEFAULT_VEHICLE_REG);
    setTrailerInput("");
    setVehicleNumber(DEFAULT_VEHICLE_REG);
    setTrailerNumber("");
    setManualContainer("");
    setRepatCount("");
    setContainers([]);
    setLegStatuses({ 1: "To do" });
    setIssueReports({});
    setIssueCategory("");
    setIssueDetails("");
    setIssueCategory("");
    setIssueLocation("");
    setIssueManager("");
    setPendingIssueAction(null);
    const nextReferenceTs = Date.now();
    const nextMockup2Legs = buildMockup2Legs(nextReferenceTs);
    setSimulationReferenceTs(nextReferenceTs);
    setDctRows(
      buildPlannedDctRows(
        DEFAULT_DCT_MOCKUP,
        DEFAULT_DCT_DUTY_ID,
        nextMockup2Legs
      )
    );
    setDctSourceMockup(DEFAULT_DCT_MOCKUP);
    setDctDutyId(DEFAULT_DCT_DUTY_ID);
    setMessages([]);
    setMessageSimulatorOpen(false);
    setMessageComposerOpen(false);
    closeAllModals();
  }

  function handleCompleteReset() {
    resetAllData();
  }

  function simulateIncomingMessage(priority: MessagePriority) {
    const config = messagePriorityConfigs[priority];
    const now = new Date();
    const nextMessage: HaulierMessage = {
      id: `HAULIER-MSG-${Date.now()}`,
      priority,
      subject: config.heading,
      body: config.body,
      receivedAt: formatMessageDateTime(now),
      read: false,
      direction: "incoming",
    };

    setMessages((current) => [nextMessage, ...current]);
    setMessageSimulatorOpen(false);
    setScreen("duty");
  }

  function sendDriverMessage(
    priority: MessagePriority,
    subject: string,
    body: string
  ) {
    const now = new Date();
    const nextMessage: HaulierMessage = {
      id: `HAULIER-SENT-${Date.now()}`,
      priority,
      subject: subject.trim(),
      body: body.trim(),
      receivedAt: formatMessageDateTime(now),
      read: true,
      direction: "sent",
    };

    setMessages((current) => [nextMessage, ...current]);
    setMessageComposerOpen(false);
    setScreen("messages");
  }

  function markMessageRead(messageId: string) {
    setMessages((current) =>
      current.map((message) =>
        message.id === messageId ? { ...message, read: true } : message
      )
    );
  }

  function markAllMessagesRead() {
    setMessages((current) =>
      current.map((message) => ({ ...message, read: true }))
    );
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

    const existingRow = dctRows.find((row) => row.legNumber === legNumber);

    setSelectedLeg(legNumber);
    setVehicleInput(existingRow?.vehicleReg || DEFAULT_VEHICLE_REG);
    setTrailerInput(existingRow?.trailerId || "");
    setVehicleModalOpen(true);
  }

  function confirmVehicleNumber() {
    if (!vehicleInput.trim() || !trailerInput.trim()) {
      return;
    }

    const nextVehicle = vehicleInput.trim().toUpperCase();
    const nextTrailer = trailerInput.trim().toUpperCase();
    setVehicleNumber(nextVehicle);
    setTrailerNumber(nextTrailer);
    setDctRows((current) =>
      current.map((row) =>
        row.legNumber === selectedLeg
          ? {
              ...row,
              vehicleReg: nextVehicle,
              trailerId: nextTrailer,
            }
          : row
      )
    );
    setVehicleModalOpen(false);
    setScreen("origin");
  }

  function selectTask(task: TaskType) {
    setSelectedTask(task);
    setDctRows((current) =>
      current.map((row) =>
        row.legNumber === selectedLeg
          ? { ...row, loadAction: getLoadActionLabel(task) }
          : row
      )
    );

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
    setIssueCategory("");
    setIssueLocation("");
    setIssueManager("");
    setIssueModalOpen(true);
  }

  function saveIssueDetails() {
    const report = buildIssueReportText({
      selectedLeg,
      issueMode,
      issueCategory,
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
      setIssueCategory("");
      setIssueLocation("");
      setIssueManager("");
      setIssueModalOpen(false);
      completeLeg();
      return;
    }

    updateDctForCompletion(selectedLeg, report);
    setIssueDetails("");
    setIssueCategory("");
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
    setIssueCategory("");
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
        const departureActualTs =
          row.departureActualTs ?? actualTimes.departureActualTs;
        const departureVarianceTs =
          departureActualTs - row.plannedDepartureTs;

        return {
          ...row,
          status: "Complete",
          departureActualTs,
          arrivalActualTs: row.plannedArrivalTs + departureVarianceTs,
          issueCategory: issueText ? issueCategory : "",
          issues: issueText,
          liveTracking: "Yes",
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
          departureAssets: "",
          arrivalAssets: "",
          yorkBarCodes: "",
          liveTracking: "No",
          loadAction: getLoadActionLabel("skip"),
          issueCategory: issueCategory || "Other",
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
            today={dutyDate}
            title={currentTitle}
            dutyId={getDutyIdForMockup(mockup)}
            legs={legs}
            dctRows={dctRows}
            legStatus={legStatus}
            issueReports={issueReports}
            currentTimeTs={currentTimeTs}
            canOpenLeg={canOpenLeg}
            onOpenLeg={openLeg}
            onBack={() => setScreen("menu")}
            onBackToMenu={() => setScreen("menu")}
            unreadMessageCount={unreadMessages.length}
            highestUnreadMessage={highestUnreadMessage}
            highestUnreadConfig={highestUnreadConfig}
            onOpenMessages={() => setScreen("messages")}
            onOpenMessageSimulator={() => setMessageSimulatorOpen(true)}
          />
        )}

        {screen === "messages" && (
          <MessagesScreen
            dutyId={getDutyIdForMockup(mockup)}
            messages={messages}
            unreadMessageCount={unreadMessages.length}
            highestUnreadConfig={highestUnreadConfig}
            onOpenDuty={() => setScreen("duty")}
            onOpenMessageSimulator={() => setMessageSimulatorOpen(true)}
            onOpenComposer={() => setMessageComposerOpen(true)}
            onMarkRead={markMessageRead}
            onMarkAllRead={markAllMessagesRead}
          />
        )}

        {screen === "origin" && (
          <OriginScreen
            today={dutyDate}
            vehicleNumber={vehicleNumber}
            trailerNumber={trailerNumber}
            leg={currentLeg}
            status={legStatus(selectedLeg)}
            actualDepartureTs={currentDctRow?.departureActualTs ?? null}
            actualArrivalTs={currentDctRow?.arrivalActualTs ?? null}
            currentTimeTs={currentTimeTs}
            issueReport={issueReports[selectedLeg]}
            onBack={() => setScreen("duty")}
            onTask={selectTask}
            onBackToMenu={() => setScreen("menu")}
          />
        )}

        {screen === "load" && (
          <LoadScreen
            vehicleNumber={vehicleNumber}
            trailerNumber={trailerNumber}
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
            trailerNumber={trailerNumber}
            repatCount={repatCount}
            onRepatCountChange={setRepatCount}
            onBack={() => setScreen("origin")}
            onContinue={continueRepat}
            onBackToMenu={() => setScreen("menu")}
          />
        )}

        {screen === "destination" && (
          <DestinationScreen
            today={dutyDate}
            vehicleNumber={vehicleNumber}
            trailerNumber={trailerNumber}
            leg={currentLeg}
            status={legStatus(selectedLeg)}
            selectedTask={selectedTask}
            actualDepartureTs={currentDctRow?.departureActualTs ?? null}
            actualArrivalTs={currentDctRow?.arrivalActualTs ?? null}
            currentTimeTs={currentTimeTs}
            issueReport={issueReports[selectedLeg]}
            onBack={() => setScreen("origin")}
            onArriveIntoDepot={arriveIntoDepot}
            onBackToMenu={() => setScreen("menu")}
          />
        )}

        {screen === "unload" && (
          <UnloadScreen
            today={dutyDate}
            vehicleNumber={vehicleNumber}
            trailerNumber={trailerNumber}
            leg={currentLeg}
            status={legStatus(selectedLeg)}
            actualDepartureTs={currentDctRow?.departureActualTs ?? null}
            actualArrivalTs={currentDctRow?.arrivalActualTs ?? null}
            currentTimeTs={currentTimeTs}
            issueReport={issueReports[selectedLeg]}
            onBack={() => setScreen("destination")}
            onUnloadAll={() => setUnloadModalOpen(true)}
            onBackToMenu={() => setScreen("menu")}
          />
        )}

        {screen === "complete" && (
          <CompleteScreen
            today={dutyDate}
            vehicleNumber={vehicleNumber}
            trailerNumber={trailerNumber}
            leg={currentLeg}
            dutyId={getDutyIdForMockup(mockup)}
            status="Completed"
            actualDepartureTs={currentDctRow?.departureActualTs ?? null}
            actualArrivalTs={currentDctRow?.arrivalActualTs ?? null}
            currentTimeTs={currentTimeTs}
            issueReport={issueReports[selectedLeg]}
            onBackToMenu={() => setScreen("menu")}
          />
        )}

        {screen === "dct" && (
          <DctWebScreen
            rows={dctRows}
            sourceMockup={dctSourceMockup}
            dutyId={dctDutyId}
            onBack={() => setScreen("menu")}
            onReset={handleCompleteReset}
          />
        )}

        {vehicleModalOpen && (
          <VehicleModal
            vehicleInput={vehicleInput}
            trailerInput={trailerInput}
            onVehicleChange={setVehicleInput}
            onTrailerChange={setTrailerInput}
            onCancel={() => {
              setVehicleInput(DEFAULT_VEHICLE_REG);
              setTrailerInput("");
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
            category={issueCategory}
            details={issueDetails}
            location={issueLocation}
            manager={issueManager}
            onCategoryChange={setIssueCategory}
            onDetailsChange={setIssueDetails}
            onLocationChange={setIssueLocation}
            onManagerChange={setIssueManager}
            onCancel={() => setIssueModalOpen(false)}
            onSave={saveIssueDetails}
            onNoIssue={continueWithoutIssue}
          />
        )}

        {messageSimulatorOpen && (
          <MessageSimulatorModal
            onCancel={() => setMessageSimulatorOpen(false)}
            onSimulate={simulateIncomingMessage}
          />
        )}

        {messageComposerOpen && (
          <MessageComposerModal
            dutyId={getDutyIdForMockup(mockup)}
            onCancel={() => setMessageComposerOpen(false)}
            onSend={sendDriverMessage}
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
    <header className="flex min-h-[82px] items-center justify-between border-b border-[#e5e7eb] bg-white px-5 py-2">
      <div className="w-[90px] shrink-0">
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

      <div className="min-w-0 flex-1 text-center">
        <h1 className="text-xl font-black text-[#222]">{title}</h1>
        <LastRefreshedText />
      </div>

      <div className="w-[90px] shrink-0 text-right text-3xl font-black text-[#333]">
        ⋮
      </div>
    </header>
  );
}

function LastRefreshedText() {
  const [lastRefreshed] = useState(() => formatRefreshDateTime(new Date()));

  return (
    <p
      suppressHydrationWarning
      className="mt-1 text-[10px] font-bold uppercase tracking-[0.08em] text-[#6b7280]"
    >
      Last refreshed: {lastRefreshed}
    </p>
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
  dctRows,
  legStatus,
  issueReports,
  currentTimeTs,
  canOpenLeg,
  onOpenLeg,
  onBack,
  onBackToMenu,
  unreadMessageCount,
  highestUnreadMessage,
  highestUnreadConfig,
  onOpenMessages,
  onOpenMessageSimulator,
}: {
  today: string;
  title: string;
  dutyId: string;
  legs: DutyLeg[];
  dctRows: DctRow[];
  legStatus: (legNumber: number) => LegStatus;
  issueReports: Record<number, LegIssueReport>;
  currentTimeTs: number | null;
  canOpenLeg: (legNumber: number) => boolean;
  onOpenLeg: (legNumber: number) => void;
  onBack: () => void;
  onBackToMenu: () => void;
  unreadMessageCount: number;
  highestUnreadMessage: HaulierMessage | null;
  highestUnreadConfig: MessagePriorityConfig | null;
  onOpenMessages: () => void;
  onOpenMessageSimulator: () => void;
}) {
  return (
    <>
      <AppHeader title="Haulier Mock Up" left="Back" onBack={onBack} />

      <HaulierDutyMessageNavigation
        activeView="duty"
        unreadMessageCount={unreadMessageCount}
        highestUnreadConfig={highestUnreadConfig}
        onOpenDuty={() => undefined}
        onOpenMessages={onOpenMessages}
        onOpenMessageSimulator={onOpenMessageSimulator}
      />

      <section className="bg-white px-5 py-6">
        <OverviewCard dutyId={dutyId} />

        {highestUnreadMessage && highestUnreadConfig && (
          <IncomingMessageAlert
            message={highestUnreadMessage}
            config={highestUnreadConfig}
            unreadMessageCount={unreadMessageCount}
            onOpenMessages={onOpenMessages}
          />
        )}

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
              actualDepartureTs={
                dctRows.find((row) => row.legNumber === leg.number)
                  ?.departureActualTs ?? null
              }
              actualArrivalTs={
                dctRows.find((row) => row.legNumber === leg.number)
                  ?.arrivalActualTs ?? null
              }
              currentTimeTs={currentTimeTs}
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

function HaulierDutyMessageNavigation({
  activeView,
  unreadMessageCount,
  highestUnreadConfig,
  onOpenDuty,
  onOpenMessages,
  onOpenMessageSimulator,
}: {
  activeView: "duty" | "messages";
  unreadMessageCount: number;
  highestUnreadConfig: MessagePriorityConfig | null;
  onOpenDuty: () => void;
  onOpenMessages: () => void;
  onOpenMessageSimulator: () => void;
}) {
  const messageButtonClass = highestUnreadConfig
    ? highestUnreadConfig.buttonClass
    : activeView === "messages"
    ? "bg-[#001b3a] text-white"
    : "bg-[#e8f7ee] text-[#067a35]";

  return (
    <nav className="border-b border-[#e5e7eb] bg-white px-5 py-3" aria-label="Haulier app sections">
      <div className="grid grid-cols-[1fr_1fr_48px] gap-2">
        <button
          type="button"
          onClick={onOpenDuty}
          disabled={activeView === "duty"}
          className={`min-h-[44px] rounded-[14px] px-4 py-2 text-xs font-black uppercase tracking-[0.13em] transition ${
            activeView === "duty"
              ? "bg-[#001b3a] text-white"
              : "border border-[#cbd5e1] bg-white text-[#001b3a]"
          }`}
        >
          Duty
        </button>

        <button
          type="button"
          onClick={onOpenMessages}
          disabled={activeView === "messages"}
          className={`relative min-h-[44px] rounded-[14px] px-3 py-2 text-xs font-black uppercase tracking-[0.1em] transition ${messageButtonClass}`}
        >
          {highestUnreadConfig
            ? `${highestUnreadConfig.label} Message`
            : "Message"}
          {unreadMessageCount > 0 && (
            <span className="absolute -right-2 -top-2 flex h-6 min-w-6 items-center justify-center rounded-full border-2 border-white bg-[#001b3a] px-1 text-[10px] font-black text-white">
              {unreadMessageCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={onOpenMessageSimulator}
          title="Simulate an incoming message"
          aria-label="Simulate an incoming message"
          className="flex h-11 w-12 items-center justify-center rounded-[14px] border-2 border-dashed border-[#d6001c] bg-[#fff0f2] text-xl font-black text-[#d6001c] transition hover:bg-[#ffe1e6]"
        >
          +
        </button>
      </div>
      <p className="mt-1 text-right text-[9px] font-black uppercase tracking-[0.12em] text-[#9f1239]">
        + Test message
      </p>
    </nav>
  );
}

function IncomingMessageAlert({
  message,
  config,
  unreadMessageCount,
  onOpenMessages,
}: {
  message: HaulierMessage;
  config: MessagePriorityConfig;
  unreadMessageCount: number;
  onOpenMessages: () => void;
}) {
  return (
    <section
      className={`mt-4 rounded-[18px] border-2 p-4 shadow-sm ${config.borderClass} ${config.panelClass}`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] text-xl font-black ${config.buttonClass}`}
        >
          {config.icon}
        </div>

        <div className="min-w-0 flex-1">
          <p className={`text-xs font-black uppercase tracking-[0.12em] ${config.textClass}`}>
            {message.subject}
          </p>
          <p className={`mt-2 text-sm font-bold leading-5 ${config.mutedTextClass}`}>
            {message.body}
          </p>
          <p className={`mt-2 text-[10px] font-black uppercase tracking-[0.08em] ${config.textClass}`}>
            {unreadMessageCount} unread message{unreadMessageCount === 1 ? "" : "s"}
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={onOpenMessages}
        className={`mt-4 w-full rounded-[13px] px-4 py-3 text-xs font-black uppercase tracking-[0.13em] ${config.buttonClass}`}
      >
        Open Messages
      </button>
    </section>
  );
}

function MessagesScreen({
  dutyId,
  messages,
  unreadMessageCount,
  highestUnreadConfig,
  onOpenDuty,
  onOpenMessageSimulator,
  onOpenComposer,
  onMarkRead,
  onMarkAllRead,
}: {
  dutyId: string;
  messages: HaulierMessage[];
  unreadMessageCount: number;
  highestUnreadConfig: MessagePriorityConfig | null;
  onOpenDuty: () => void;
  onOpenMessageSimulator: () => void;
  onOpenComposer: () => void;
  onMarkRead: (messageId: string) => void;
  onMarkAllRead: () => void;
}) {
  return (
    <>
      <AppHeader title="Messages" left="Back" onBack={onOpenDuty} />

      <HaulierDutyMessageNavigation
        activeView="messages"
        unreadMessageCount={unreadMessageCount}
        highestUnreadConfig={highestUnreadConfig}
        onOpenDuty={onOpenDuty}
        onOpenMessages={() => undefined}
        onOpenMessageSimulator={onOpenMessageSimulator}
      />

      <section className="bg-white px-5 py-6">
        <OverviewCard dutyId={dutyId} />

        <div className="mt-7 flex items-end justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.15em] text-[#d6001c]">
              Driver messages
            </p>
            <h2 className="mt-2 text-2xl font-black text-[#222]">Messages</h2>
          </div>

          <button
            type="button"
            onClick={onOpenComposer}
            className="rounded-full bg-[#001b3a] px-4 py-2 text-[10px] font-black uppercase tracking-[0.1em] text-white"
          >
            Compose
          </button>
        </div>

        {unreadMessageCount > 0 && (
          <div className="mt-3 flex justify-end">
            <button
              type="button"
              onClick={onMarkAllRead}
              className="rounded-full border border-[#001b3a] bg-white px-3 py-2 text-[10px] font-black uppercase tracking-[0.1em] text-[#001b3a]"
            >
              Mark all read
            </button>
          </div>
        )}

        {messages.length === 0 ? (
          <section className="mt-4 rounded-[18px] border border-[#d0d7df] bg-[#f8fafc] p-5 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e8f7ee] text-xl font-black text-[#067a35]">
              ✉
            </div>
            <h3 className="mt-4 text-lg font-black text-[#222]">No messages</h3>
            <p className="mt-2 text-sm font-bold leading-6 text-[#64748b]">
              Press Compose to send a message to the Transport Office, or use the small + test button to replicate an incoming message.
            </p>
          </section>
        ) : (
          <div className="mt-4 space-y-3">
            {messages.map((message) => (
              <HaulierMessageCard
                key={message.id}
                message={message}
                onMarkRead={() => onMarkRead(message.id)}
              />
            ))}
          </div>
        )}
      </section>
    </>
  );
}

function HaulierMessageCard({
  message,
  onMarkRead,
}: {
  message: HaulierMessage;
  onMarkRead: () => void;
}) {
  const config = messagePriorityConfigs[message.priority];
  const isSent = message.direction === "sent";

  return (
    <article
      className={`rounded-[18px] border-2 p-4 shadow-sm ${config.borderClass} ${
        message.read ? "bg-white" : config.panelClass
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[13px] text-lg font-black ${config.buttonClass}`}
        >
          {isSent ? "➤" : config.icon}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className={`text-[10px] font-black uppercase tracking-[0.12em] ${config.textClass}`}>
              {isSent ? `Sent • ${message.priority} priority` : `${message.priority} priority`}
            </span>
            {!isSent && !message.read && (
              <span className="rounded-full bg-[#001b3a] px-2 py-1 text-[9px] font-black uppercase tracking-[0.1em] text-white">
                Unread
              </span>
            )}
          </div>

          <h3 className="mt-2 text-base font-black leading-5 text-[#222]">
            {message.subject}
          </h3>
          <p className="mt-2 text-sm font-bold leading-6 text-[#475569]">
            {message.body}
          </p>
          <p className="mt-3 text-[10px] font-bold uppercase tracking-[0.08em] text-[#64748b]">
            {isSent ? "Sent to NWH Transport Office" : "Received"} {message.receivedAt}
          </p>
        </div>
      </div>

      {!isSent && !message.read && (
        <button
          type="button"
          onClick={onMarkRead}
          className={`mt-4 w-full rounded-[13px] px-4 py-3 text-xs font-black uppercase tracking-[0.12em] ${config.buttonClass}`}
        >
          Mark as Read
        </button>
      )}
    </article>
  );
}


function MessageComposerModal({
  dutyId,
  onCancel,
  onSend,
}: {
  dutyId: string;
  onCancel: () => void;
  onSend: (priority: MessagePriority, subject: string, body: string) => void;
}) {
  const [priority, setPriority] = useState<MessagePriority>("Normal");
  const [subject, setSubject] = useState(`Duty ${dutyId} message`);
  const [body, setBody] = useState("");
  const [validationMessage, setValidationMessage] = useState("");
  const config = messagePriorityConfigs[priority];

  function handleSend() {
    if (!subject.trim() || !body.trim()) {
      setValidationMessage("Please enter a subject and message before sending.");
      return;
    }

    onSend(priority, subject, body);
  }

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 px-5 py-4">
      <section className="max-h-[92vh] w-full max-w-[460px] overflow-y-auto rounded-[20px] bg-white p-6 shadow-2xl">
        <p className="text-xs font-black uppercase tracking-[0.15em] text-[#d6001c]">
          Driver message
        </p>
        <h2 className="mt-2 text-2xl font-black text-[#111]">Compose message</h2>
        <p className="mt-3 text-sm font-bold leading-6 text-[#64748b]">
          Send a message for Duty {dutyId} to the NWH Transport Office.
        </p>

        <div className="mt-5">
          <label className="text-[10px] font-black uppercase tracking-[0.12em] text-[#64748b]">
            Priority
          </label>
          <div className="mt-2 grid grid-cols-3 gap-2">
            {(Object.keys(messagePriorityConfigs) as MessagePriority[]).map(
              (option) => {
                const optionConfig = messagePriorityConfigs[option];
                const selected = priority === option;

                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => {
                      setPriority(option);
                      setValidationMessage("");
                    }}
                    className={`rounded-[13px] border-2 px-2 py-3 text-[10px] font-black uppercase tracking-[0.08em] ${
                      selected
                        ? `${optionConfig.borderClass} ${optionConfig.panelClass} ${optionConfig.textClass}`
                        : "border-[#d0d7df] bg-white text-[#475569]"
                    }`}
                  >
                    {option}
                  </button>
                );
              }
            )}
          </div>
        </div>

        <label className="mt-5 block text-[10px] font-black uppercase tracking-[0.12em] text-[#64748b]">
          Subject
          <input
            type="text"
            value={subject}
            onChange={(event) => {
              setSubject(event.target.value);
              setValidationMessage("");
            }}
            maxLength={80}
            className="mt-2 w-full rounded-[13px] border border-[#cbd5e1] bg-white px-4 py-3 text-sm font-bold normal-case tracking-normal text-[#111] outline-none focus:border-[#001b3a]"
          />
        </label>

        <label className="mt-4 block text-[10px] font-black uppercase tracking-[0.12em] text-[#64748b]">
          Message
          <textarea
            value={body}
            onChange={(event) => {
              setBody(event.target.value);
              setValidationMessage("");
            }}
            rows={6}
            maxLength={500}
            placeholder="Type the message for the Transport Office..."
            className="mt-2 w-full resize-y rounded-[13px] border border-[#cbd5e1] bg-white px-4 py-3 text-sm font-bold leading-6 normal-case tracking-normal text-[#111] outline-none focus:border-[#001b3a]"
          />
        </label>

        <div className={`mt-4 rounded-[13px] border-2 p-3 ${config.borderClass} ${config.panelClass}`}>
          <p className={`text-[10px] font-black uppercase tracking-[0.1em] ${config.textClass}`}>
            {priority} priority
          </p>
          <p className={`mt-1 text-xs font-bold leading-5 ${config.mutedTextClass}`}>
            The sent message will use the same {priority.toLowerCase()} priority colour scheme.
          </p>
        </div>

        {validationMessage && (
          <p className="mt-3 rounded-[12px] border border-[#fecaca] bg-[#fef2f2] px-3 py-2 text-xs font-bold text-[#b91c1c]">
            {validationMessage}
          </p>
        )}

        <div className="mt-5 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-[14px] border-2 border-[#333] bg-white px-4 py-3 text-sm font-black text-[#333]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSend}
            className={`rounded-[14px] px-4 py-3 text-sm font-black ${config.buttonClass}`}
          >
            Send Message
          </button>
        </div>
      </section>
    </div>
  );
}

function MessageSimulatorModal({
  onCancel,
  onSimulate,
}: {
  onCancel: () => void;
  onSimulate: (priority: MessagePriority) => void;
}) {
  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 px-5 py-4">
      <section className="w-full max-w-[430px] rounded-[20px] bg-white p-6 shadow-2xl">
        <p className="text-xs font-black uppercase tracking-[0.15em] text-[#d6001c]">
          Test control
        </p>
        <h2 className="mt-2 text-2xl font-black text-[#111]">
          Simulate incoming message
        </h2>
        <p className="mt-3 text-sm font-bold leading-6 text-[#64748b]">
          Select a priority to show how the Haulier App alerts the driver.
        </p>

        <div className="mt-5 space-y-3">
          {(Object.keys(messagePriorityConfigs) as MessagePriority[]).map(
            (priority) => {
              const config = messagePriorityConfigs[priority];

              return (
                <button
                  key={priority}
                  type="button"
                  onClick={() => onSimulate(priority)}
                  className={`flex w-full items-center gap-3 rounded-[15px] border-2 p-4 text-left ${config.borderClass} ${config.panelClass}`}
                >
                  <span
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[13px] text-lg font-black ${config.buttonClass}`}
                  >
                    {config.icon}
                  </span>
                  <span>
                    <span className={`block text-sm font-black ${config.textClass}`}>
                      {priority} priority
                    </span>
                    <span className={`mt-1 block text-xs font-bold ${config.mutedTextClass}`}>
                      {config.body}
                    </span>
                  </span>
                </button>
              );
            }
          )}
        </div>

        <button
          type="button"
          onClick={onCancel}
          className="mt-5 w-full rounded-[14px] border-2 border-[#333] bg-white px-4 py-3 text-sm font-black text-[#333]"
        >
          Cancel
        </button>
      </section>
    </div>
  );
}

function OverviewCard({ dutyId = "NWH254" }: { dutyId?: string }) {
  return (
    <section className="rounded-[18px] bg-[#f0f0f0] p-5">
      <h2 className="text-2xl font-black text-[#222]">Overview</h2>

      <p className="mt-6 text-lg font-bold text-[#333]">
        <span className="font-black">Driver name:</span> <DriverName />
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
  actualDepartureTs = null,
  actualArrivalTs = null,
  currentTimeTs = null,
  issueReport,
  canOpen,
  onClick,
}: {
  leg: DutyLeg;
  status: LegStatus;
  actualDepartureTs?: number | null;
  actualArrivalTs?: number | null;
  currentTimeTs?: number | null;
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
        <div>
          <p>Planned Dep Time:</p>
          <p>{leg.etd}</p>
          <DepartureTimingStatus
            leg={leg}
            status={status}
            actualDepartureTs={actualDepartureTs}
            currentTimeTs={currentTimeTs}
          />
        </div>
        <div className="text-right">
          <p>Planned Arr Time:</p>
          <p>{leg.eta}</p>
          <ArrivalTimingStatus
            leg={leg}
            status={status}
            actualDepartureTs={actualDepartureTs}
            actualArrivalTs={actualArrivalTs}
            currentTimeTs={currentTimeTs}
          />
        </div>
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

function DepartureTimingStatus({
  leg,
  status,
  actualDepartureTs,
  currentTimeTs,
}: {
  leg: DutyLeg;
  status: LegStatus;
  actualDepartureTs: number | null;
  currentTimeTs: number | null;
}) {
  if (currentTimeTs === null) {
    return null;
  }

  const plannedDepartureTs =
    leg.plannedDepartureTs ??
    combineDateAndTime(new Date(currentTimeTs), leg.etd, 0);

  if (status === "Completed" && actualDepartureTs === null) {
    return (
      <p className="mt-1 text-xs font-black text-[#6b7280]">Leg skipped</p>
    );
  }

  const comparisonTs = actualDepartureTs ?? currentTimeTs;
  const differenceMinutes = Math.floor(
    (comparisonTs - plannedDepartureTs) / 60000
  );
  const isRecorded = actualDepartureTs !== null;

  let label = "On time / early";
  let className = "text-[#15803d]";

  if (differenceMinutes === 0 && !isRecorded) {
    label = "Due now";
    className = "text-[#b45309]";
  } else if (differenceMinutes > 0 && differenceMinutes <= 9) {
    label = `${differenceMinutes} min${differenceMinutes === 1 ? "" : "s"} late`;
    className = "text-[#b45309]";
  } else if (differenceMinutes >= 10) {
    label = `${differenceMinutes} mins late`;
    className = "text-[#dc2626]";
  }

  if (isRecorded) {
    label =
      differenceMinutes <= 0
        ? "Departed on time / early"
        : `Departed ${label}`;
  }

  return (
    <p className={`mt-1 text-xs font-black ${className}`}>{label}</p>
  );
}

function ArrivalTimingStatus({
  leg,
  status,
  actualDepartureTs,
  actualArrivalTs,
  currentTimeTs,
}: {
  leg: DutyLeg;
  status: LegStatus;
  actualDepartureTs: number | null;
  actualArrivalTs: number | null;
  currentTimeTs: number | null;
}) {
  if (currentTimeTs === null) {
    return null;
  }

  const plannedDepartureTs =
    leg.plannedDepartureTs ??
    combineDateAndTime(new Date(currentTimeTs), leg.etd, 0);

  let plannedArrivalTs =
    leg.plannedArrivalTs ??
    combineDateAndTime(new Date(plannedDepartureTs), leg.eta, 0);

  while (plannedArrivalTs < plannedDepartureTs) {
    plannedArrivalTs += 24 * 60 * 60 * 1000;
  }

  if (status === "Completed" && actualArrivalTs === null) {
    return (
      <p className="mt-1 text-xs font-black text-[#6b7280]">Leg skipped</p>
    );
  }

  const isRecorded = actualArrivalTs !== null;
  const departureComparisonTs = actualDepartureTs ?? currentTimeTs;
  const departureDifferenceMinutes = Math.floor(
    (departureComparisonTs - plannedDepartureTs) / 60000
  );
  const comparisonTs =
    actualArrivalTs ??
    plannedArrivalTs + departureDifferenceMinutes * 60 * 1000;
  const differenceMinutes = Math.floor(
    (comparisonTs - plannedArrivalTs) / 60000
  );

  let label = isRecorded
    ? "Arrived on time / early"
    : "Arriving on time / early";
  let className = "text-[#15803d]";

  if (differenceMinutes === 0 && !isRecorded) {
    label = "Arriving on time";
    className = "text-[#15803d]";
  } else if (differenceMinutes > 0 && differenceMinutes <= 9) {
    label = `${isRecorded ? "Arrived" : "Arriving"} ${formatLateMinutes(
      differenceMinutes
    )}`;
    className = "text-[#b45309]";
  } else if (differenceMinutes >= 10) {
    label = `${isRecorded ? "Arrived" : "Arriving"} ${formatLateMinutes(
      differenceMinutes
    )}`;
    className = "text-[#dc2626]";
  }

  return (
    <p className={`mt-1 text-xs font-black ${className}`}>{label}</p>
  );
}

function formatLateMinutes(differenceMinutes: number) {
  return `${differenceMinutes} min${differenceMinutes === 1 ? "" : "s"} late`;
}

function useLiveCurrentTime() {
  const [currentTimeTs, setCurrentTimeTs] = useState<number | null>(null);

  useEffect(() => {
    const updateTime = () => setCurrentTimeTs(Date.now());
    updateTime();
    const intervalId = window.setInterval(updateTime, 15_000);

    return () => window.clearInterval(intervalId);
  }, []);

  return currentTimeTs;
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
  trailerInput,
  onVehicleChange,
  onTrailerChange,
  onCancel,
  onConfirm,
}: {
  vehicleInput: string;
  trailerInput: string;
  onVehicleChange: (value: string) => void;
  onTrailerChange: (value: string) => void;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const canConfirm =
    vehicleInput.trim().length > 0 && trailerInput.trim().length > 0;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 px-5 py-4">
      <section className="w-full max-w-[390px] bg-white p-6 shadow-2xl">
        <h2 className="text-2xl font-black text-[#222]">
          Information Required
        </h2>

        <p className="mt-3 text-sm font-bold leading-6 text-[#444]">
          The vehicle registration is pre-populated for each leg. Confirm or
          change it if needed, then enter the trailer number to proceed.
        </p>

        <label
          htmlFor="vehicle-registration"
          className="mt-5 block text-sm font-black text-[#222]"
        >
          Vehicle Registration
        </label>

        <input
          id="vehicle-registration"
          value={vehicleInput}
          onChange={(event) => onVehicleChange(event.target.value.toUpperCase())}
          placeholder="Enter vehicle registration"
          className="mt-2 w-full border-2 border-[#888] px-4 py-3 text-base font-bold uppercase text-[#222] outline-none focus:border-[#d6001c]"
        />

        <label
          htmlFor="trailer-number"
          className="mt-4 block text-sm font-black text-[#222]"
        >
          Trailer Number
        </label>

        <input
          id="trailer-number"
          value={trailerInput}
          onChange={(event) => onTrailerChange(event.target.value.toUpperCase())}
          placeholder="Enter trailer number"
          className="mt-2 w-full border-2 border-[#888] px-4 py-3 text-base font-bold uppercase text-[#222] outline-none focus:border-[#d6001c]"
        />

        <p className="mt-2 text-xs font-bold text-[#666]">
          A trailer number is required for every leg.
        </p>

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
  trailerNumber,
  leg,
  status,
  actualDepartureTs,
  actualArrivalTs,
  currentTimeTs,
  issueReport,
  onBack,
  onTask,
  onBackToMenu,
}: {
  today: string;
  vehicleNumber: string;
  trailerNumber: string;
  leg: DutyLeg;
  status: LegStatus;
  actualDepartureTs: number | null;
  actualArrivalTs: number | null;
  currentTimeTs: number | null;
  issueReport?: LegIssueReport;
  onBack: () => void;
  onTask: (task: TaskType) => void;
  onBackToMenu: () => void;
}) {
  return (
    <>
      <AppHeader title="Origin Tasks" left="Back" onBack={onBack} />

      <section className="bg-white px-5 py-5">
        <VehicleNumberBanner vehicleNumber={vehicleNumber} trailerNumber={trailerNumber} />

        <p className="mt-6 text-lg font-bold text-[#333]">{today}</p>

        <div className="mt-3">
          <LegCard
            leg={leg}
            status={status}
            actualDepartureTs={actualDepartureTs}
            actualArrivalTs={actualArrivalTs}
            currentTimeTs={currentTimeTs}
            issueReport={issueReport}
          />
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
  trailerNumber,
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
  trailerNumber: string;
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
        <VehicleNumberBanner vehicleNumber={vehicleNumber} trailerNumber={trailerNumber} />

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
  trailerNumber,
  repatCount,
  onRepatCountChange,
  onBack,
  onContinue,
  onBackToMenu,
}: {
  vehicleNumber: string;
  trailerNumber: string;
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
        <VehicleNumberBanner vehicleNumber={vehicleNumber} trailerNumber={trailerNumber} />

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
  trailerNumber,
  leg,
  status,
  selectedTask,
  actualDepartureTs,
  actualArrivalTs,
  currentTimeTs,
  issueReport,
  onBack,
  onArriveIntoDepot,
  onBackToMenu,
}: {
  today: string;
  vehicleNumber: string;
  trailerNumber: string;
  leg: DutyLeg;
  status: LegStatus;
  selectedTask: TaskType;
  actualDepartureTs: number | null;
  actualArrivalTs: number | null;
  currentTimeTs: number | null;
  issueReport?: LegIssueReport;
  onBack: () => void;
  onArriveIntoDepot: () => void;
  onBackToMenu: () => void;
}) {
  return (
    <>
      <AppHeader title="Destination Tasks" left="Back" onBack={onBack} />

      <section className="bg-white px-5 py-5">
        <VehicleNumberBanner vehicleNumber={vehicleNumber} trailerNumber={trailerNumber} />

        <p className="mt-6 text-lg font-bold text-[#333]">{today}</p>

        <div className="mt-3">
          <LegCard
            leg={leg}
            status={status}
            actualDepartureTs={actualDepartureTs}
            actualArrivalTs={actualArrivalTs}
            currentTimeTs={currentTimeTs}
            issueReport={issueReport}
          />
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
  trailerNumber,
  leg,
  status,
  actualDepartureTs,
  actualArrivalTs,
  currentTimeTs,
  issueReport,
  onBack,
  onUnloadAll,
  onBackToMenu,
}: {
  today: string;
  vehicleNumber: string;
  trailerNumber: string;
  leg: DutyLeg;
  status: LegStatus;
  actualDepartureTs: number | null;
  actualArrivalTs: number | null;
  currentTimeTs: number | null;
  issueReport?: LegIssueReport;
  onBack: () => void;
  onUnloadAll: () => void;
  onBackToMenu: () => void;
}) {
  return (
    <>
      <AppHeader title="Destination Tasks" left="Back" onBack={onBack} />

      <section className="bg-white px-5 py-5">
        <VehicleNumberBanner vehicleNumber={vehicleNumber} trailerNumber={trailerNumber} />

        <p className="mt-6 text-lg font-bold text-[#333]">{today}</p>

        <div className="mt-3">
          <LegCard
            leg={leg}
            status={status}
            actualDepartureTs={actualDepartureTs}
            actualArrivalTs={actualArrivalTs}
            currentTimeTs={currentTimeTs}
            issueReport={issueReport}
          />
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
  trailerNumber,
  leg,
  dutyId,
  status,
  actualDepartureTs,
  actualArrivalTs,
  currentTimeTs,
  issueReport,
  onBackToMenu,
}: {
  today: string;
  vehicleNumber: string;
  trailerNumber: string;
  leg: DutyLeg;
  dutyId: string;
  status: LegStatus;
  actualDepartureTs: number | null;
  actualArrivalTs: number | null;
  currentTimeTs: number | null;
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
          <LegCard
            leg={leg}
            status={status}
            actualDepartureTs={actualDepartureTs}
            actualArrivalTs={actualArrivalTs}
            currentTimeTs={currentTimeTs}
            issueReport={issueReport}
          />
        </div>

        <VehicleNumberBanner vehicleNumber={vehicleNumber} trailerNumber={trailerNumber} />

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
  category,
  details,
  location,
  manager,
  onCategoryChange,
  onDetailsChange,
  onLocationChange,
  onManagerChange,
  onCancel,
  onSave,
  onNoIssue,
}: {
  mode: IssueMode;
  category: string;
  details: string;
  location: string;
  manager: string;
  onCategoryChange: (value: string) => void;
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
    : details.trim().length > 0 && category.trim().length > 0;

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

function VehicleNumberBanner({
  vehicleNumber,
  trailerNumber,
}: {
  vehicleNumber: string;
  trailerNumber: string;
}) {
  return (
    <div className="rounded-lg bg-[#f0f0f0] px-4 py-3 text-sm font-black text-[#444]">
      <p>Vehicle registration number: {vehicleNumber}</p>
      <p className="mt-1">Trailer number: {trailerNumber}</p>
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
  onBack,
  onReset,
}: {
  rows: DctRow[];
  sourceMockup: MockupType | null;
  dutyId: string;
  onBack: () => void;
  onReset: () => void;
}) {
  const sourceTitle =
    sourceMockup === "mockup2"
      ? "Mockup 2"
      : sourceMockup === "flex"
      ? "Flex Mock Up"
      : "No mock-up selected";

  const lateLegs = rows.filter((row) => rowHasLateTiming(row)).length;
  const skippedLegs = rows.filter((row) => row.status === "Skip").length;
  const issuesRecorded = rows.filter(
    (row) => row.issues.trim().length > 0
  ).length;
  const totalDelayMinutes = rows.reduce(
    (total, row) =>
      total +
      getPositiveDelayMinutes(row.plannedDepartureTs, row.departureActualTs) +
      getPositiveDelayMinutes(row.plannedArrivalTs, row.arrivalActualTs),
    0
  );

  const columns: {
    key: string;
    label: string;
    subLabel?: string;
    headerClass: string;
    widthClass: string;
    align?: "left" | "center";
  }[] = [
    { key: "status", label: "Leg Status", headerClass: "bg-[#cfeefa]", widthClass: "w-[90px]", align: "left" },
    { key: "startDate", label: "Duty Date", headerClass: "bg-[#cfeefa]", widthClass: "w-[95px]", align: "center" },
    { key: "weekNumber", label: "Week Number", headerClass: "bg-[#cfeefa]", widthClass: "w-[78px]", align: "center" },
    { key: "dutyOrder", label: "Duty Order", headerClass: "bg-[#cfeefa]", widthClass: "w-[68px]", align: "center" },
    { key: "vehicleReg", label: "Vehicle Reg", headerClass: "bg-[#cfeefa]", widthClass: "w-[92px]", align: "center" },
    { key: "trailerId", label: "Trailer Number", headerClass: "bg-[#cfeefa]", widthClass: "w-[96px]", align: "center" },
    { key: "userId", label: "UserId", headerClass: "bg-[#cfeefa]", widthClass: "w-[140px]", align: "center" },
    {
      key: "division",
      label: "Division",
      subLabel: "Letters/Network/Contractor",
      headerClass: "bg-[#cfeefa]",
      widthClass: "w-[150px]",
      align: "center",
    },
    { key: "operator", label: "Operator", headerClass: "bg-[#cfeefa]", widthClass: "w-[62px]", align: "center" },
    { key: "dutyId", label: "Duty ID", headerClass: "bg-[#cfeefa]", widthClass: "w-[82px]", align: "center" },
    { key: "trailerType", label: "Vehicle Type", headerClass: "bg-[#fde8c5]", widthClass: "w-[105px]", align: "center" },
    { key: "planzCode", label: "Planz Code", headerClass: "bg-[#fde8c5]", widthClass: "w-[92px]", align: "center" },
    { key: "dueToConvey", label: "Due To Convey", headerClass: "bg-[#fde8c5]", widthClass: "w-[108px]", align: "center" },
    { key: "departureLocation", label: "Departure location", headerClass: "bg-[#f2e8c9]", widthClass: "w-[112px]", align: "center" },
    { key: "plannedDeparture", label: "Planned Departure Time", headerClass: "bg-[#f2e8c9]", widthClass: "w-[132px]", align: "center" },
    { key: "departureActual", label: "Departure actual time", headerClass: "bg-[#f2e8c9]", widthClass: "w-[132px]", align: "center" },
    { key: "departureDiff", label: "Departure Diff hh:mm", headerClass: "bg-[#f2e8c9]", widthClass: "w-[92px]", align: "center" },
    { key: "dtt", label: "DTT", headerClass: "bg-[#f2e8c9]", widthClass: "w-[58px]", align: "center" },
    { key: "departureAssets", label: "Dep Assets", headerClass: "bg-[#f2e8c9]", widthClass: "w-[72px]", align: "center" },
    { key: "arrivalLocation", label: "Arrival Location", headerClass: "bg-[#d9f1d5]", widthClass: "w-[112px]", align: "center" },
    { key: "plannedArrival", label: "Planned Arrival Time", headerClass: "bg-[#d9f1d5]", widthClass: "w-[132px]", align: "center" },
    { key: "arrivalActual", label: "Arrival actual time", headerClass: "bg-[#d9f1d5]", widthClass: "w-[132px]", align: "center" },
    { key: "arrivalDiff", label: "Arrival Diff hh:mm", headerClass: "bg-[#d9f1d5]", widthClass: "w-[92px]", align: "center" },
    { key: "att", label: "ATT", headerClass: "bg-[#d9f1d5]", widthClass: "w-[58px]", align: "center" },
    { key: "arrivalAssets", label: "Arr Assets", headerClass: "bg-[#d9f1d5]", widthClass: "w-[72px]", align: "center" },
    { key: "issueCategory", label: "Issue Category", headerClass: "bg-[#fde7c7]", widthClass: "w-[120px]", align: "center" },
    { key: "issues", label: "Issues", headerClass: "bg-[#fde7c7]", widthClass: "w-[180px]", align: "left" },
    { key: "liveTracking", label: "Live Tracking", headerClass: "bg-[#dfe8fb]", widthClass: "w-[92px]", align: "center" },
    { key: "gpsDeparture", label: "GPS Departure", headerClass: "bg-[#ead5ea]", widthClass: "w-[140px]", align: "center" },
    { key: "gpsArrival", label: "GPS Arrival", headerClass: "bg-[#ead5ea]", widthClass: "w-[140px]", align: "center" },
    { key: "yorkBarCodes", label: "York Barcode", headerClass: "bg-[#f3d9ec]", widthClass: "w-[118px]", align: "center" },
    { key: "loadAction", label: "Load Action", headerClass: "bg-[#cfeefa]", widthClass: "w-[125px]", align: "center" },
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
            <SummaryCard label="Rows shown" value={String(rows.length)} />
            <SummaryCard
              label="Leg status completed"
              value={String(
                rows.filter((row) => row.status === "Complete").length
              )}
            />
            <SummaryCard label="Late legs" value={String(lateLegs)} />
            <SummaryCard label="Skipped legs" value={String(skippedLegs)} />
            <SummaryCard label="Issues recorded" value={String(issuesRecorded)} />
            <SummaryCard
              label="Total delay"
              value={formatDelayTotal(totalDelayMinutes)}
            />
          </div>

          <div className="mt-4 flex flex-wrap gap-2 text-[11px] font-black uppercase tracking-[0.12em]">
            <span className="rounded-full border border-[#1f7a34] bg-[#d9f7e5] px-3 py-2 text-[#166534]">
              Green = on time / early
            </span>
            <span className="rounded-full border border-[#d97706] bg-[#fef3c7] px-3 py-2 text-[#92400e]">
              Amber = up to 9 minutes late
            </span>
            <span className="rounded-full border border-[#c62828] bg-[#fecaca] px-3 py-2 text-[#7f1d1d]">
              Red = 10+ minutes late
            </span>
            <span className="rounded-full border border-[#6b7280] bg-[#e5e7eb] px-3 py-2 text-[#374151]">
              Grey = not yet populated
            </span>
          </div>
        </section>

        {rows.length === 0 ? (
          <section className="mt-5 rounded-[14px] border border-[#cfd8e3] bg-white p-8 shadow-sm">
            <p className="text-lg font-black text-[#172033]">
              Planned DCT data is being prepared.
            </p>
            <p className="mt-3 text-sm font-bold leading-6 text-[#4b5563]">
              Return to the mock-up options and reopen the DCT-style output.
            </p>
          </section>
        ) : (
          <section className="mt-5 rounded-[14px] border border-[#cfd8e3] bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-[3505px] border-collapse text-[10px] leading-[1.15] text-[#111827]">
                <thead className="sticky top-0 z-10">
                  <tr>
                    {columns.map((column) => (
                      <th
                        key={column.key}
                        className={`${column.headerClass} ${column.widthClass} border border-black px-1 py-2 align-bottom text-left font-normal text-black`}
                      >
                        <div className="whitespace-normal break-words">
                          <span>{column.label}</span>
                          {column.subLabel && (
                            <span className="mt-0.5 block font-semibold text-[#d6001c]">
                              {column.subLabel}
                            </span>
                          )}
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
                      <td className="border border-black px-1 py-2 text-center font-normal">{getOperationalWeekNumberFromDisplayDate(row.startDate)}</td>
                      <td className="border border-black px-1 py-2 text-center font-normal">{row.dutyOrder}</td>
                      <td className="border border-black px-1 py-2 text-center font-normal whitespace-nowrap">{row.vehicleReg || ""}</td>
                      <td className="border border-black px-1 py-2 text-center font-normal whitespace-nowrap">{row.trailerId || ""}</td>
                      <td className="border border-black px-1 py-2 text-center font-normal break-words">{row.userId}</td>
                      <td className="border border-black px-1 py-2 text-center font-normal break-words">{row.division}</td>
                      <td className="border border-black px-1 py-2 text-center font-normal">{row.operator}</td>
                      <td className="border border-black px-1 py-2 text-center font-normal whitespace-nowrap">{row.dutyId}</td>
                      <td className="border border-black px-1 py-2 text-center font-normal break-words">{row.trailerType}</td>
                      <td className="border border-black px-1 py-2 text-center font-normal whitespace-nowrap">{row.planzCode}</td>
                      <td className="border border-black px-1 py-2 text-center font-normal break-words">{row.dueToConvey || "-"}</td>
                      <td className="border border-black px-1 py-2 text-center font-normal uppercase break-words">{row.departureLocation}</td>
                      <td className="border border-black px-1 py-2 text-center font-normal whitespace-nowrap">{formatDateTime(row.plannedDepartureTs)}</td>
                      <td className={`${getTimingCellClass(row.plannedDepartureTs, row.departureActualTs)} border border-black px-1 py-2 text-center font-bold whitespace-nowrap`}>
                        {row.departureActualTs ? formatDateTime(row.departureActualTs) : "-"}
                      </td>
                      <td className={`${getTimingCellClass(row.plannedDepartureTs, row.departureActualTs)} border border-black px-1 py-2 text-center font-bold whitespace-nowrap`}>
                        {formatTimeDifference(row.plannedDepartureTs, row.departureActualTs)}
                      </td>
                      <td className={`${getTimingCellClass(row.plannedDepartureTs, row.departureActualTs)} border border-black px-1 py-2 text-center font-bold whitespace-nowrap`}>
                        {getTimingBand(row.plannedDepartureTs, row.departureActualTs)}
                      </td>
                      <td className="border border-black px-1 py-2 text-center font-normal">{row.departureAssets || "-"}</td>
                      <td className="border border-black px-1 py-2 text-center font-normal uppercase break-words">{row.arrivalLocation}</td>
                      <td className="border border-black px-1 py-2 text-center font-normal whitespace-nowrap">{formatDateTime(row.plannedArrivalTs)}</td>
                      <td className={`${getTimingCellClass(row.plannedArrivalTs, row.arrivalActualTs)} border border-black px-1 py-2 text-center font-bold whitespace-nowrap`}>
                        {row.arrivalActualTs ? formatDateTime(row.arrivalActualTs) : "-"}
                      </td>
                      <td className={`${getTimingCellClass(row.plannedArrivalTs, row.arrivalActualTs)} border border-black px-1 py-2 text-center font-bold whitespace-nowrap`}>
                        {formatTimeDifference(row.plannedArrivalTs, row.arrivalActualTs)}
                      </td>
                      <td className={`${getTimingCellClass(row.plannedArrivalTs, row.arrivalActualTs)} border border-black px-1 py-2 text-center font-bold whitespace-nowrap`}>
                        {getTimingBand(row.plannedArrivalTs, row.arrivalActualTs)}
                      </td>
                      <td className="border border-black px-1 py-2 text-center font-normal">{row.arrivalAssets || "-"}</td>
                      <td className="border border-black px-1 py-2 text-center font-normal break-words">{row.issueCategory || "-"}</td>
                      <td className="border border-black px-1 py-2 font-normal break-words">{row.issues || "-"}</td>
                      <td className="border border-black px-1 py-2 text-center font-normal whitespace-nowrap">{row.liveTracking || "-"}</td>
                      <td className="border border-black px-1 py-2 font-normal break-words">{row.gpsDeparture || "-"}</td>
                      <td className="border border-black px-1 py-2 font-normal break-words">{row.gpsArrival || "-"}</td>
                      <td className="border border-black px-1 py-2 font-normal break-words">{row.yorkBarCodes || "-"}</td>
                      <td className="border border-black px-1 py-2 text-center font-normal break-words">{row.loadAction || "-"}</td>
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
  issueCategory,
  issueDetails,
  issueLocation,
  issueManager,
}: {
  selectedLeg: number;
  issueMode: IssueMode;
  issueCategory: string;
  issueDetails: string;
  issueLocation: string;
  issueManager: string;
}) {
  if (issueMode === "arrival") {
    return [`Category: ${issueCategory.trim()}`, `Details: ${issueDetails.trim()}`].join(" | ");
  }

  const reportParts = [
    `Leg ${selectedLeg}`,
    `Category: ${issueCategory.trim() || "Other"}`,
    "Type: Skipped leg",
    issueDetails.trim() ? `Details: ${issueDetails.trim()}` : "",
    issueLocation.trim()
      ? `Location / route change: ${issueLocation.trim()}`
      : "",
    issueManager.trim() ? `Authorised by: ${issueManager.trim()}` : "",
  ].filter(Boolean);

  return reportParts.join(" | ");
}

function buildPlannedDctRows(
  mockupType: MockupType,
  dutyId: string,
  sourceLegsOverride?: DutyLeg[]
) {
  const sourceLegs =
    sourceLegsOverride ??
    (mockupType === "mockup2" ? defaultMockup2Legs : flexLegs);
  const baseDate = new Date(
    sourceLegs[0]?.plannedDepartureTs ?? Date.now()
  );
  baseDate.setHours(0, 0, 0, 0);

  let previousDepartureTs: number | null = null;

  return sourceLegs.map((leg) => {
    const planningDetails =
      mockupType === "mockup2"
        ? mockup2PlanningDetails[leg.number]
        : {
            trailerType: "49 Artic",
            planzCode: "NWH.FLEX.1",
            dueToConvey: "1C 24 Mail",
          };

    let departureTs =
      leg.plannedDepartureTs ?? combineDateAndTime(baseDate, leg.etd, 0);

    while (previousDepartureTs !== null && departureTs <= previousDepartureTs) {
      departureTs += 24 * 60 * 60 * 1000;
    }

    let arrivalTs =
      leg.plannedArrivalTs ??
      combineDateAndTime(new Date(departureTs), leg.eta, 0);

    while (arrivalTs < departureTs) {
      arrivalTs += 24 * 60 * 60 * 1000;
    }

    previousDepartureTs = departureTs;

    return {
      legNumber: leg.number,
      status: "Planned" as DctStatus,
      startDate: formatDateOnly(baseDate.getTime()),
      dutyOrder: leg.number,
      vehicleReg: "",
      trailerId: "",
      userId: getStoredDriverUserId(),
      division: "Pie Haulage",
      operator: "NWH",
      dutyId,
      trailerType: planningDetails.trailerType,
      planzCode: planningDetails.planzCode,
      departureLocation: leg.from,
      plannedDepartureTs: departureTs,
      departureActualTs: null,
      dueToConvey: planningDetails.dueToConvey,
      departureAssets: "",
      arrivalLocation: leg.to,
      plannedArrivalTs: arrivalTs,
      arrivalActualTs: null,
      arrivalAssets: "",
      gpsDeparture: locationCoordinates[leg.from] || "",
      gpsArrival: locationCoordinates[leg.to] || "",
      yorkBarCodes: "",
      issueCategory: "",
      issues: "",
      liveTracking: "No",
      loadAction: "",
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
        departureActualTs:
          context.currentMockup === "mockup2" && row.legNumber === 1
            ? Date.now()
            : actualTimes.departureActualTs,
        departureAssets: assetCount,
        arrivalAssets: assetCount,
        yorkBarCodes,
        liveTracking: "Yes",
        loadAction: getLoadActionLabel(taskType),
      };
    })
  );
}

function getLoadActionLabel(taskType: TaskType) {
  switch (taskType) {
    case "empty":
      return "Empty";
    case "repat":
      return "Repat / Pre-Loaded";
    case "load":
      return "Load";
    case "flex":
      return "Flex / As Directed";
    case "skip":
      return "Skip Leg";
  }
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

  const differenceMinutes = Math.round((actualTs - plannedTs) / 60000);

  if (differenceMinutes <= 0) {
    return "bg-[#bbf7d0] text-[#166534]";
  }

  if (differenceMinutes <= 9) {
    return "bg-[#fef3c7] text-[#92400e]";
  }

  return "bg-[#fecaca] text-[#7f1d1d]";
}

function getTimingBand(plannedTs: number, actualTs: number | null) {
  if (!actualTs) {
    return "-";
  }

  const differenceMinutes = Math.round((actualTs - plannedTs) / 60000);

  if (differenceMinutes >= -8 && differenceMinutes <= 8) {
    return "OT";
  }

  if (differenceMinutes <= -9 && differenceMinutes >= -30) {
    return "E";
  }

  if (differenceMinutes <= -31) {
    return "VE";
  }

  if (differenceMinutes >= 9 && differenceMinutes <= 30) {
    return "L";
  }

  if (differenceMinutes >= 31 && differenceMinutes < 120) {
    return "VL";
  }

  return "F";
}

function rowHasLateTiming(row: DctRow) {
  return (
    getPositiveDelayMinutes(row.plannedDepartureTs, row.departureActualTs) > 0 ||
    getPositiveDelayMinutes(row.plannedArrivalTs, row.arrivalActualTs) > 0
  );
}

function getPositiveDelayMinutes(plannedTs: number, actualTs: number | null) {
  if (!actualTs || actualTs <= plannedTs) {
    return 0;
  }

  return Math.round((actualTs - plannedTs) / 60000);
}

function formatDelayTotal(totalMinutes: number) {
  const hours = String(Math.floor(totalMinutes / 60)).padStart(2, "0");
  const minutes = String(totalMinutes % 60).padStart(2, "0");

  return `${hours}:${minutes}`;
}

function normaliseLocationName(value: string) {
  return value.trim().toLowerCase();
}

function buildMockup2Legs(referenceTs: number): DutyLeg[] {
  const currentMinute = new Date(referenceTs);
  currentMinute.setSeconds(0, 0);
  const firstDepartureTs = currentMinute.getTime() - 10 * 60 * 1000;

  return defaultMockup2Legs.map((leg, index) => {
    const relativeTiming = mockup2RelativeTimingMinutes[index];
    const plannedDepartureTs =
      firstDepartureTs + relativeTiming.departure * 60 * 1000;
    const plannedArrivalTs =
      firstDepartureTs + relativeTiming.arrival * 60 * 1000;

    return {
      ...leg,
      etd: formatTimeOnly(plannedDepartureTs),
      eta: formatTimeOnly(plannedArrivalTs),
      plannedDepartureTs,
      plannedArrivalTs,
    };
  });
}

function formatTimeOnly(timestamp: number) {
  const date = new Date(timestamp);
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}

function combineDateAndTime(baseDate: Date, timeText: string, dayOffset: number) {
  const [hours, minutes] = timeText.split(":").map(Number);
  const next = new Date(baseDate);
  next.setDate(next.getDate() + dayOffset);
  next.setHours(hours, minutes, 0, 0);
  return next.getTime();
}

function formatTimeDifference(plannedTs: number, actualTs: number | null) {
  if (!actualTs) {
    return "-";
  }

  const diffMinutes = Math.round((actualTs - plannedTs) / 60000);
  const sign = diffMinutes < 0 ? "-" : "";
  const absoluteMinutes = Math.abs(diffMinutes);
  const hours = String(Math.floor(absoluteMinutes / 60)).padStart(2, "0");
  const minutes = String(absoluteMinutes % 60).padStart(2, "0");

  return `${sign}${hours}:${minutes}`;
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

function formatRefreshDateTime(date: Date) {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");

  return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
}

function formatMessageDateTime(date: Date) {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${day}/${month}/${year} ${hours}:${minutes}`;
}

function messagePriorityRank(priority: MessagePriority) {
  if (priority === "Critical") {
    return 3;
  }

  if (priority === "High") {
    return 2;
  }

  return 1;
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
