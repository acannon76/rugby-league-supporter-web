"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { DRIVER_MESSAGE_STORE_CHANGED_EVENT } from "../../driverMessageSync";

type CommsSource = "RTC" | "Breakdown" | "Messaging" | "PMT Confirmation";
type CommsStatus = "New" | "Office review" | "Awaiting driver read" | "Actioned";
type Priority = "Critical" | "High" | "Normal";

type MessageThreadEntry = {
  id: string;
  sender: "Driver" | "Office" | "System" | "M5 Workshops";
  senderName: string;
  message: string;
  timestamp: string;
  priority: Priority;
  direction: "Driver to office" | "Office to driver" | "System" | "Workshop";
};
type PmtSeverity = "Vehicle Issue" | "Defect";
type ActionType =
  | "Reply sent"
  | "Marked actioned"
  | "Reply and actioned"
  | "Message driver and OK to continue"
  | "VOR vehicle / M5 workshops";

type PmtDetails = {
  pmt: string;
  issueTitle: string;
  severity: PmtSeverity;
  reported: string;
  fixed: string;
  mileage: string;
  pmtStatus: string;
  notes: string;
};

type RtcDetails = {
  incidentLocation: string;
  gpsCoordinates: string;
  incidentTime: string;
  injuries: string;
  policeReference: string;
  thirdPartyDetails: string;
  damageDetails: string;
  incidentDescription: string;
  photos: string;
};

type BreakdownDetails = {
  location: string;
  direction: string;
  fault: string;
  safeStatus: string;
  supportNeeded: string;
  photos: string;
};

type MessageDetails = {
  messageText: string;
  route: string;
  direction?: "Driver to office" | "Office to driver";
};

type CommsItem = {
  id: string;
  source: CommsSource;
  priority: Priority;
  status: CommsStatus;
  duty: string;
  driver: string;
  vehicle: string;
  trailer: string;
  received: string;
  receivedDate: string;
  title: string;
  summary: string;
  pmt?: PmtDetails;
  rtc?: RtcDetails;
  breakdown?: BreakdownDetails;
  message?: MessageDetails;
  messageThread?: MessageThreadEntry[];
  retainUntilDriverRead?: boolean;
  driverReadConfirmed?: boolean;
  readConfirmedAt?: string;
  pendingAction?: ActionType;
  pendingManager?: string;
  pendingReplyText?: string;
  pendingReplyPriority?: Priority;
  officeRead?: boolean;
  officeReadAt?: string;
};

type CommsHistoryRecord = {
  id: string;
  source: CommsSource;
  duty: string;
  driver: string;
  vehicle: string;
  trailer: string;
  priority: Priority;
  received: string;
  receivedDate: string;
  title: string;
  summary: string;
  manager: string;
  action: ActionType;
  replyToDriver: string;
  actionedAt: string;
  finalStatus: "Actioned";
  driverMessage: string;
  replyPriority: Priority;
  detailSummary: string;
  messageThread: MessageThreadEntry[];
  messageThreadSummary: string;
};

const COMMS_HISTORY_STORAGE_KEY = "link-message-comms-history";
const COMMS_OPEN_STORAGE_KEY = "link-message-comms-open-items";
const MANAGER_NAME = "Harry Smith";
const MOCK_DUTY_START_DATE = "22/07/2026";

const driverNames = [
  "Andrew Cannon",
  "Sarah Green",
  "John Smith",
  "Peter Jones",
  "Sarah Jane",
  "Michael Brown",
  "David Wilson",
  "Emma Taylor",
  "James Walker",
  "Laura Hughes",
  "Mark Davies",
  "Rachel Evans",
  "Chris Roberts",
  "Paul Thompson",
  "Kelly Morgan",
];

const initialCommsItems: CommsItem[] = [
  {
    id: "RTC-NWH426",
    source: "RTC",
    priority: "Critical",
    status: "New",
    duty: "NWH426",
    driver: "Andrew Cannon",
    vehicle: "PE68UHD",
    trailer: "7338014",
    received: "12:08",
    receivedDate: "01/07/26",
    title: "RTC report received",
    summary: "RTC report submitted with GPS, vehicle damage details and scene photos.",
    rtc: {
      incidentLocation: "M6 northbound near J23",
      gpsCoordinates: "53.516777, -2.672340",
      incidentTime: "12:04",
      injuries: "No injuries reported. Driver safe and away from carriageway.",
      policeReference: "Awaiting reference",
      thirdPartyDetails: "Third-party van involved. Registration mock: AB12 CDE.",
      damageDetails: "Minor rear bumper damage to tractor unit and possible trailer light damage.",
      incidentDescription: "Driver reported low-speed contact while leaving a congested slip road. Photos attached for office review.",
      photos: "4 photos attached",
    },
  },
  {
    id: "RTC-NWH634",
    source: "RTC",
    priority: "Critical",
    status: "New",
    duty: "NWH634",
    driver: "Sarah Green",
    vehicle: "PE68UHD",
    trailer: "7338014",
    received: "11:54",
    receivedDate: "01/07/26",
    title: "RTC mirror strike reported",
    summary: "Driver reported contact with street furniture while manoeuvring near delivery point.",
    rtc: {
      incidentLocation: "Bolton DO yard entrance",
      gpsCoordinates: "53.578200, -2.429900",
      incidentTime: "11:50",
      injuries: "No injuries or immediate risk.",
      policeReference: "Not required",
      thirdPartyDetails: "No third party involved.",
      damageDetails: "Nearside mirror housing cracked. Vehicle still mobile pending office decision.",
      incidentDescription: "Driver clipped a fixed post while turning into a tight entrance. Yard team aware.",
      photos: "2 photos attached",
    },
  },
  {
    id: "RTC-WAVOC016",
    source: "RTC",
    priority: "Critical",
    status: "Office review",
    duty: "WAVOC016",
    driver: "John Smith",
    vehicle: "PE68UHD",
    trailer: "7338014",
    received: "10:31",
    receivedDate: "01/07/26",
    title: "RTC report from WAVOC duty",
    summary: "RTC notification received for a Warrington VOC duty, office review needed.",
    rtc: {
      incidentLocation: "Warrington VOC exit gate",
      gpsCoordinates: "53.397100, -2.625500",
      incidentTime: "10:26",
      injuries: "No injuries reported.",
      policeReference: "Not required at this stage",
      thirdPartyDetails: "Site barrier arm involved. Site security informed.",
      damageDetails: "Scrape to trailer side panel and barrier arm damage reported.",
      incidentDescription: "Driver reported barrier arm came down while exiting site. Scene made safe and site office notified.",
      photos: "5 photos attached",
    },
  },
  {
    id: "RTC-TNW7034",
    source: "RTC",
    priority: "High",
    status: "New",
    duty: "TNW7034",
    driver: "Peter Jones",
    vehicle: "PE68UHD",
    trailer: "7338014",
    received: "09:48",
    receivedDate: "01/07/26",
    title: "RTC third-party details supplied",
    summary: "Driver captured third-party details and damage notes for office review.",
    rtc: {
      incidentLocation: "A580 lay-by, eastbound",
      gpsCoordinates: "53.490200, -2.447600",
      incidentTime: "09:41",
      injuries: "No injuries reported. Driver safe.",
      policeReference: "Not supplied",
      thirdPartyDetails: "Third-party HGV registration supplied in the driver notes.",
      damageDetails: "Minor trailer scuff and mudguard scrape.",
      incidentDescription: "Driver reported a low-speed scrape when pulling away from a lay-by. Third-party details exchanged.",
      photos: "3 photos attached",
    },
  },
  {
    id: "BD-TNWAMZ02",
    source: "Breakdown",
    priority: "High",
    status: "New",
    duty: "TNWAMZ02",
    driver: "Sarah Jane",
    vehicle: "PE68UHD",
    trailer: "7338014",
    received: "12:15",
    receivedDate: "01/07/26",
    title: "Breakdown support request",
    summary: "Vehicle warning light and reduced power reported by driver.",
    breakdown: {
      location: "M62 westbound services",
      direction: "Westbound",
      fault: "Engine warning light on dashboard and reduced power under acceleration.",
      safeStatus: "Yes - parked in services HGV area.",
      supportNeeded: "Office to advise whether to continue or arrange recovery support.",
      photos: "2 dashboard photos attached",
    },
  },
  {
    id: "BD-NWH813",
    source: "Breakdown",
    priority: "High",
    status: "Office review",
    duty: "NWH813",
    driver: "Michael Brown",
    vehicle: "PE68UHD",
    trailer: "7338014",
    received: "11:42",
    receivedDate: "01/07/26",
    title: "Trailer air issue",
    summary: "Driver reports slow trailer air build and requests support from office.",
    breakdown: {
      location: "North West Hub trailer park",
      direction: "Not on motorway",
      fault: "Trailer air slow to build. Audible air leak near rear axle area.",
      safeStatus: "Yes - vehicle parked on site.",
      supportNeeded: "Possible trailer swap or workshop check required before departure.",
      photos: "1 photo attached",
    },
  },
  {
    id: "BD-WAVOC427",
    source: "Breakdown",
    priority: "High",
    status: "New",
    duty: "WAVOC427",
    driver: "David Wilson",
    vehicle: "PE68UHD",
    trailer: "7338014",
    received: "10:22",
    receivedDate: "01/07/26",
    title: "Puncture reported",
    summary: "Driver has reported a suspected puncture and is waiting for office response.",
    breakdown: {
      location: "A49 southbound near Warrington",
      direction: "Southbound",
      fault: "Suspected nearside trailer tyre puncture. Driver stopped in safe location.",
      safeStatus: "Need Assistance - driver safe but vehicle cannot continue.",
      supportNeeded: "Tyre support / recovery required. Driver awaiting confirmation.",
      photos: "3 photos attached",
    },
  },
  {
    id: "BD-NWH8801",
    source: "Breakdown",
    priority: "Normal",
    status: "New",
    duty: "NWH8801",
    driver: "Emma Taylor",
    vehicle: "PE68UHD",
    trailer: "7338014",
    received: "08:58",
    receivedDate: "01/07/26",
    title: "Defect found before departure",
    summary: "Driver reports a suspected lighting fault during pre-departure checks.",
    breakdown: {
      location: "North West Hub loading bay 4",
      direction: "Not on motorway",
      fault: "Offside rear marker light intermittent on trailer.",
      safeStatus: "Yes - still on site.",
      supportNeeded: "Office to confirm whether trailer swap is required.",
      photos: "1 photo attached",
    },
  },
  {
    id: "MSG-NWH007A",
    source: "Messaging",
    priority: "Normal",
    status: "New",
    duty: "NWH007A",
    driver: "James Walker",
    vehicle: "PE68UHD",
    trailer: "7338014",
    received: "12:02",
    receivedDate: "01/07/26",
    title: "Driver message received",
    summary: "Driver asks for confirmation of the next collection point.",
    message: {
      route: "PDA Messaging > Other",
      messageText: "Can you confirm if I still need to go to Preston MC after unloading at NWH?",
    },
  },
  {
    id: "MSG-NWH603",
    source: "Messaging",
    priority: "Normal",
    status: "New",
    duty: "NWH603",
    driver: "Laura Hughes",
    vehicle: "PE68UHD",
    trailer: "7338014",
    received: "11:20",
    receivedDate: "01/07/26",
    title: "Driver running late message",
    summary: "Driver has sent a delay message for office awareness.",
    message: {
      route: "PDA Messaging > Other",
      messageText: "Traffic is heavy leaving Manchester. I may be around 20 minutes late arriving back at the Hub.",
    },
  },
  {
    id: "MSG-TNW1218",
    source: "Messaging",
    priority: "Normal",
    status: "Office review",
    duty: "TNW1218",
    driver: "Mark Davies",
    vehicle: "PE68UHD",
    trailer: "7338014",
    received: "10:05",
    receivedDate: "01/07/26",
    title: "Driver requesting site contact",
    summary: "Driver needs a contact number for the next site.",
    message: {
      route: "PDA Messaging > Other",
      messageText: "Please send the site contact for the Manchester drop. Gatehouse is not answering.",
    },
  },
  {
    id: "MSG-WAVOC607",
    source: "Messaging",
    priority: "Normal",
    status: "New",
    duty: "WAVOC607",
    driver: "Rachel Evans",
    vehicle: "PE68UHD",
    trailer: "7338014",
    received: "09:36",
    receivedDate: "01/07/26",
    title: "Trailer query from driver",
    summary: "Driver is querying whether to take the allocated trailer or wait for a swap.",
    message: {
      route: "PDA Messaging > Other",
      messageText: "Trailer 7338014 is still being loaded. Do you want me to wait or take the spare trailer?",
    },
  },
  {
    id: "PMT-TNW2156",
    source: "PMT Confirmation",
    priority: "High",
    status: "New",
    duty: "TNW2156",
    driver: "Chris Roberts",
    vehicle: "PE68UHD",
    trailer: "7338014",
    received: "12:26",
    receivedDate: "01/07/26",
    title: "PMT defect confirmation",
    summary: "Driver confirms a defect from vehicle history. Manager decision required.",
    pmt: {
      pmt: "PMT104231",
      issueTitle: "Engine warning light / sensor fault",
      severity: "Defect",
      reported: "03/05/2026",
      fixed: "04/05/2026",
      mileage: "679,886 km",
      pmtStatus: "Closed",
      notes: "Diagnostic check identified faulty pressure sensor. Sensor replaced and vehicle tested.",
    },
  },
  {
    id: "PMT-WAVOC455",
    source: "PMT Confirmation",
    priority: "Normal",
    status: "New",
    duty: "WAVOC455",
    driver: "Paul Thompson",
    vehicle: "PE68UHD",
    trailer: "7338014",
    received: "11:11",
    receivedDate: "01/07/26",
    title: "PMT vehicle issue confirmation",
    summary: "Driver has confirmed a vehicle issue for office review.",
    pmt: {
      pmt: "PMT104582",
      issueTitle: "Nearside door dent",
      severity: "Vehicle Issue",
      reported: "12/05/2026",
      fixed: "15/05/2026",
      mileage: "681,442 km",
      pmtStatus: "Closed",
      notes: "Minor bodywork dent reported on nearside cab door. Repaired by workshop panel team.",
    },
  },
  {
    id: "PMT-TNW6041",
    source: "PMT Confirmation",
    priority: "High",
    status: "Office review",
    duty: "TNW6041",
    driver: "Kelly Morgan",
    vehicle: "PE68UHD",
    trailer: "7338014",
    received: "10:44",
    receivedDate: "01/07/26",
    title: "PMT brake warning confirmation",
    summary: "Driver has confirmed a brake warning defect that needs a manager decision.",
    pmt: {
      pmt: "PMT104633",
      issueTitle: "Brake warning light intermittent",
      severity: "Defect",
      reported: "22/05/2026",
      fixed: "23/05/2026",
      mileage: "682,010 km",
      pmtStatus: "Closed",
      notes: "Workshop inspected brake sensor loom, cleaned connectors and completed road test.",
    },
  },
  {
    id: "PMT-WAVOC8834",
    source: "PMT Confirmation",
    priority: "Normal",
    status: "New",
    duty: "WAVOC8834",
    driver: "Andrew Cannon",
    vehicle: "PE68UHD",
    trailer: "7338014",
    received: "09:10",
    receivedDate: "01/07/26",
    title: "PMT oil leak note",
    summary: "Driver has confirmed a previous oil leak note for office review.",
    pmt: {
      pmt: "PMT104711",
      issueTitle: "Minor oil residue around engine tray",
      severity: "Vehicle Issue",
      reported: "28/05/2026",
      fixed: "30/05/2026",
      mileage: "682,874 km",
      pmtStatus: "Closed",
      notes: "Workshop cleaned the area and confirmed no active leak after inspection.",
    },
  },
];

const sourceCards: { source: CommsSource; icon: string; description: string }[] = [
  {
    source: "RTC",
    icon: "RTC",
    description: "Road traffic collision reports from the Driver PDA.",
  },
  {
    source: "Breakdown",
    icon: "🚛",
    description: "Vehicle fault and recovery support requests.",
  },
  {
    source: "Messaging",
    icon: "✉",
    description: "General driver-to-office messages.",
  },
  {
    source: "PMT Confirmation",
    icon: "PMT",
    description: "Driver PMT confirmations requiring manager review.",
  },
];

const sidebarItems = [
  { label: "Duty Execution", icon: "⚙", href: "/internal/app-ideas/link-message-mock" },
  { label: "Planning", icon: "⚙", href: "/internal/app-ideas/link-message-mock" },
  { label: "Vehicle view", icon: "🚛", href: "/internal/app-ideas/link-message-mock" },
  { label: "Trailer view", icon: "▰", href: "/internal/app-ideas/link-message-mock" },
  { label: "Fleet view", icon: "▱", href: "/internal/app-ideas/link-message-mock" },
  {
    label: "Comms",
    icon: "💬",
    href: "/internal/app-ideas/link-message-mock/comms",
    alertCount: 16,
    active: true,
  },
  { label: "Debrief", icon: "🧾", href: "/internal/app-ideas/link-message-mock/debrief" },
  { label: "RHC Team", icon: "RHC", href: "/internal/app-ideas/link-message-mock/rhc-team" },
  { label: "Live Tracking", icon: "GPS", href: "/internal/app-ideas/link-message-mock/live-tracking" },
  { label: "Reports", icon: "REP", href: "/internal/app-ideas/link-message-mock/reports" },
  { label: "A&D Dashboard", icon: "A&D", href: "/internal/app-ideas/link-message-mock/arrivals-departures" },
];

export default function LinkCommsDashboardPage() {
  const [items, setItems] = useState<CommsItem[]>(() => readOpenItems());
  const [selectedSource, setSelectedSource] = useState<CommsSource | "All" | "Unread messages">("All");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<CommsStatus | "All">("All");
  const [selectedPriorityFilter, setSelectedPriorityFilter] = useState<Priority | "All">("All");
  const [driverSearch, setDriverSearch] = useState("");
  const [dutySearch, setDutySearch] = useState("");
  const [showRetainedOnly, setShowRetainedOnly] = useState(false);
  const [activeItem, setActiveItem] = useState<CommsItem | null>(null);
  const [replyText, setReplyText] = useState("");
  const [replyPriority, setReplyPriority] = useState<Priority>("Normal");
  const [managerName, setManagerName] = useState(MANAGER_NAME);
  const [summaryPopup, setSummaryPopup] = useState<{ title: string; detail: string } | null>(null);
  const [newMessageModalOpen, setNewMessageModalOpen] = useState(false);
  const [newMessageDriver, setNewMessageDriver] = useState(driverNames[0]);
  const [newMessageDuty, setNewMessageDuty] = useState("NWH254");
  const [newMessageText, setNewMessageText] = useState("");
  const [newMessagePriority, setNewMessagePriority] = useState<Priority>("Normal");

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (selectedSource === "Unread messages" && !isUnreadOfficeMessage(item)) {
        return false;
      }

      if (selectedSource !== "All" && selectedSource !== "Unread messages" && item.source !== selectedSource) {
        return false;
      }

      if (selectedStatusFilter !== "All" && item.status !== selectedStatusFilter) {
        return false;
      }

      if (selectedPriorityFilter !== "All" && item.priority !== selectedPriorityFilter) {
        return false;
      }

      if (showRetainedOnly && !item.retainUntilDriverRead) {
        return false;
      }

      if (driverSearch.trim() && !item.driver.toLowerCase().includes(driverSearch.trim().toLowerCase())) {
        return false;
      }

      if (dutySearch.trim() && !item.duty.toLowerCase().includes(dutySearch.trim().toLowerCase())) {
        return false;
      }

      return true;
    });
  }, [items, selectedSource, selectedStatusFilter, selectedPriorityFilter, showRetainedOnly, driverSearch, dutySearch]);

  const openCount = items.filter((item) => item.status !== "Actioned").length;
  const unreadCount = items.filter((item) => isUnreadOfficeMessage(item)).length;

  function openCommunication(item: CommsItem) {
    const shouldMarkOfficeRead = item.message?.direction !== "Office to driver" && !item.officeRead;
    const nextItem = shouldMarkOfficeRead
      ? {
          ...item,
          officeRead: true,
          officeReadAt: new Date().toLocaleString("en-GB"),
        }
      : item;

    if (shouldMarkOfficeRead) {
      const nextItems = items.map((currentItem) =>
        currentItem.id === item.id ? nextItem : currentItem,
      );
      persistOpenItems(nextItems);
    }

    setActiveItem(nextItem);
    setReplyText(nextItem.pendingReplyText || defaultReplyForItem(nextItem));
    setReplyPriority(nextItem.pendingReplyPriority || "Normal");
    setManagerName(nextItem.pendingManager || MANAGER_NAME);
  }

  function persistOpenItems(nextItems: CommsItem[]) {
    setItems(nextItems);
    writeOpenItems(nextItems);
  }


  function clearFilters() {
    setSelectedSource("All");
    setSelectedStatusFilter("All");
    setSelectedPriorityFilter("All");
    setDriverSearch("");
    setDutySearch("");
    setShowRetainedOnly(false);
  }

  function queueAwaitingDriverRead(item: CommsItem, action: ActionType) {
    const actionedAt = new Date().toLocaleString("en-GB");
    const manager = managerName.trim() || MANAGER_NAME;
    const driverMessage = getDriverMessage(item, action, replyText);
    const messageThread = buildActionedThread(item, action, replyText, replyPriority, manager, actionedAt);
    const replyForHistory = getReplyTextForHistory(action, replyText, driverMessage);

    const nextItems = items.map((currentItem) =>
      currentItem.id === item.id
        ? {
            ...currentItem,
            status: "Awaiting driver read" as CommsStatus,
            summary:
              action === "Reply sent"
                ? "Office message sent and retained in Comms until the driver reads and confirms it."
                : "Action completed but retained in Comms until the driver reads and confirms the office message.",
            messageThread,
            retainUntilDriverRead: true,
            driverReadConfirmed: false,
            pendingAction: action,
            pendingManager: manager,
            pendingReplyText: replyForHistory,
            pendingReplyPriority: replyPriority,
          }
        : currentItem,
    );

    persistOpenItems(nextItems);
    setActiveItem(null);
    setSummaryPopup({
      title: `${item.duty} retained until driver read confirmation`,
      detail: `The office message has been kept in the Comms queue. It will remain visible even if the duty is completed until the driver confirms that the message has been read via the mock popup.`,
    });
  }

  function confirmDriverRead(item: CommsItem) {
    const confirmedAt = new Date().toLocaleString("en-GB");
    const threadWithConfirmation = [
      ...getMessageThread(item),
      createThreadEntry({
        sender: "Driver",
        senderName: item.driver,
        message: "Driver has confirmed that the office message has been read in the mockup.",
        priority: item.pendingReplyPriority || item.priority,
        direction: "Driver to office",
        timestamp: confirmedAt,
      }),
    ];

    const historyRecord = createHistoryRecord({
      item: { ...item, driverReadConfirmed: true, readConfirmedAt: confirmedAt, messageThread: threadWithConfirmation },
      action: item.pendingAction || "Reply sent",
      replyText: item.pendingReplyText || "",
      replyPriority: item.pendingReplyPriority || item.priority,
      manager: item.pendingManager || MANAGER_NAME,
      actionedAt: confirmedAt,
      messageThread: threadWithConfirmation,
    });

    const existing = readHistoryRecords();
    localStorage.setItem(COMMS_HISTORY_STORAGE_KEY, JSON.stringify([historyRecord, ...existing]));

    const nextItems = items.filter((currentItem) => currentItem.id !== item.id);
    persistOpenItems(nextItems);
    setActiveItem(null);
    setSummaryPopup({
      title: `${item.duty} read confirmation received`,
      detail: `The driver has confirmed the message has been read. The retained item has now been removed from the open Comms queue and moved into Comms History.`,
    });
  }

  function saveHistoryRecord(item: CommsItem, action: ActionType) {
    if (action !== "Marked actioned") {
      queueAwaitingDriverRead(item, action);
      return;
    }

    const actionedAt = new Date().toLocaleString("en-GB");
    const manager = managerName.trim() || MANAGER_NAME;
    const record = createHistoryRecord({
      item,
      action,
      replyText,
      replyPriority,
      manager,
      actionedAt,
    });

    const existing = readHistoryRecords();
    localStorage.setItem(COMMS_HISTORY_STORAGE_KEY, JSON.stringify([record, ...existing]));

    const nextItems = items.filter((currentItem) => currentItem.id !== item.id);
    persistOpenItems(nextItems);

    setActiveItem(null);
    setSummaryPopup({
      title: `${item.duty} actioned by ${record.manager}`,
      detail: `${item.source} item has been marked as Actioned, removed from the Comms queue, saved to Comms History and updated with the full message thread. ${record.driverMessage}`,
    });
  }

  function sendDriverReplyOnly(item: CommsItem) {
    queueAwaitingDriverRead(item, "Reply sent");
  }

  function createManualDriverMessage() {
    const now = new Date();
    const manualMessage = newMessageText.trim() || "Please contact the transport office when safe to do so.";
    const newItem: CommsItem = {
      id: `MANUAL-${Date.now()}`,
      source: "Messaging",
      priority: newMessagePriority,
      status: "Awaiting driver read",
      duty: newMessageDuty.trim() || "NWH254",
      driver: newMessageDriver,
      vehicle: "PE68UHD",
      trailer: "7338014",
      received: now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }),
      receivedDate: now.toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "2-digit" }),
      title: "Office message to driver",
      summary: `Mock office message created for ${newMessageDriver}. Awaiting driver read confirmation.`,
      message: {
        route: "Office Communications > Message Driver",
        direction: "Office to driver",
        messageText: manualMessage,
      },
      messageThread: [
        createThreadEntry({
          sender: "Office",
          senderName: MANAGER_NAME,
          message: manualMessage,
          priority: newMessagePriority,
          direction: "Office to driver",
        }),
      ],
      retainUntilDriverRead: true,
      driverReadConfirmed: false,
      pendingAction: "Reply sent",
      pendingManager: MANAGER_NAME,
      pendingReplyText: manualMessage,
      pendingReplyPriority: newMessagePriority,
      officeRead: true,
      officeReadAt: now.toLocaleString("en-GB"),
    };

    persistOpenItems([newItem, ...items]);
    setNewMessageModalOpen(false);
    setNewMessageText("");
    setNewMessagePriority("Normal");
    setSummaryPopup({
      title: `Message created for ${newMessageDriver}`,
      detail: `${newItem.duty} has been added to the Comms queue and will remain there until the driver has read the message.`,
    });
  }

  function resetMock() {
    localStorage.removeItem(COMMS_OPEN_STORAGE_KEY);
    localStorage.removeItem(COMMS_HISTORY_STORAGE_KEY);
    setItems(initialCommsItems);
    clearFilters();
    setActiveItem(null);
    setSummaryPopup({
      title: "Comms mock reset",
      detail: "The Comms queue has been restored to the original 16 mock examples and Comms History has been cleared.",
    });
  }

  return (
    <main className="min-h-screen bg-[#f4f6f9] font-sans text-[#1d2633]">
      <OfficeHeader title="MOCK UP" subtitle="Comms Dashboard" />

      <div className="flex">
        <OfficeSidebar />

        <section className="min-w-0 flex-1 p-4 lg:p-5">
          <section className="rounded-md border border-[#d9dee6] bg-white p-4 shadow-sm">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex items-center gap-4">
                <div className="relative flex h-14 w-14 items-center justify-center rounded-xl bg-[#e40000] text-3xl text-white">
                  💬
                  <span className="absolute -bottom-1 -right-1 flex h-6 min-w-6 items-center justify-center rounded-full bg-[#111827] px-1 text-xs font-black text-white ring-2 ring-white">
                    {openCount}
                  </span>
                </div>
                <div>
                  <h1 className="text-2xl font-black text-[#111827]">Office Communications</h1>
                  <p className="text-sm font-bold text-[#6b7280]">
                    Driver PDA messages, RTC reports, breakdown requests, PMT confirmations and retained unread office messages in one office queue.
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() => setNewMessageModalOpen(true)}
                  className="rounded-lg bg-[#e40000] px-4 py-2 text-sm font-black text-white transition hover:bg-[#b80000]"
                >
                  Message Driver
                </button>
                <button
                  type="button"
                  onClick={resetMock}
                  className="rounded-lg border border-[#e40000] bg-white px-4 py-2 text-sm font-black text-[#e40000] transition hover:bg-[#fff0f0]"
                >
                  Mock Reset
                </button>
                <Link
                  href="/internal/app-ideas/link-message-mock/comms/history"
                  className="rounded-lg border border-[#ccd5e2] bg-white px-4 py-2 text-sm font-black text-[#4b5563] no-underline transition hover:border-[#e40000]"
                >
                  Comms History
                </Link>
                <Link
                  href="/internal/app-ideas/link-message-mock"
                  className="rounded-lg border border-[#ccd5e2] bg-white px-4 py-2 text-sm font-black text-[#4b5563] no-underline transition hover:border-[#e40000]"
                >
                  ← Back to Duty Execution
                </Link>
              </div>
            </div>
          </section>

          <section className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-5">
            {sourceCards.map((card) => {
              const count = items.filter((item) => item.source === card.source && item.status !== "Actioned").length;
              return (
                <button
                  key={card.source}
                  type="button"
                  onClick={() => setSelectedSource((current) => (current === card.source ? "All" : card.source))}
                  className={`rounded-md border p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-[#e40000] hover:shadow-md ${
                    selectedSource === card.source ? "border-[#e40000] bg-[#fff5f5]" : "border-[#d9dee6] bg-white"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#111827] text-lg font-black text-white">
                      {card.icon}
                    </div>
                    <span className="rounded-full bg-[#e40000] px-3 py-1 text-xs font-black text-white">
                      {count}
                    </span>
                  </div>
                  <h2 className="mt-4 text-xl font-black text-[#111827]">{card.source}</h2>
                  <p className="mt-2 text-sm font-bold leading-6 text-[#6b7280]">{card.description}</p>
                </button>
              );
            })}
            <button
              type="button"
              onClick={() => setSelectedSource((current) => (current === "Unread messages" ? "All" : "Unread messages"))}
              className={`rounded-md border p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-[#e40000] hover:shadow-md ${
                selectedSource === "Unread messages" ? "border-[#e40000] bg-[#fff5f5]" : "border-[#d9dee6] bg-white"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#111827] text-lg font-black text-white">
                  ✓
                </div>
                <span className="rounded-full bg-[#e40000] px-3 py-1 text-xs font-black text-white">
                  {unreadCount}
                </span>
              </div>
              <h2 className="mt-4 text-xl font-black text-[#111827]">Unread messages</h2>
              <p className="mt-2 text-sm font-bold leading-6 text-[#6b7280]">Office messages retained in Comms until the driver reads and confirms them.</p>
            </button>
          </section>

          <section className="mt-4 overflow-hidden rounded-md border border-[#d9dee6] bg-white shadow-sm">
            <div className="flex flex-col gap-3 border-b border-[#d9dee6] bg-[#f8fafc] px-4 py-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-lg font-black text-[#111827]">Driver communications queue</h2>
                <p className="text-sm font-bold text-[#6b7280]">
                  Click any row to open the office action popup and respond to the driver. Retained messages stay in
                  the Comms queue until the driver confirms they have read the message, even if the duty has completed.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedSource("All")}
                  className="rounded-lg border border-[#ccd5e2] bg-white px-4 py-2 text-sm font-black text-[#4b5563] transition hover:border-[#e40000]"
                >
                  Show all open messages
                </button>
                <button
                  type="button"
                  onClick={clearFilters}
                  className="rounded-lg border border-[#ccd5e2] bg-white px-4 py-2 text-sm font-black text-[#4b5563] transition hover:border-[#e40000]"
                >
                  Clear filters
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 border-b border-[#d9dee6] bg-white px-4 py-4 md:grid-cols-2 xl:grid-cols-6">
              <label>
                <span className="text-xs font-black uppercase tracking-[0.12em] text-[#6b7280]">Status</span>
                <select
                  value={selectedStatusFilter}
                  onChange={(event) => setSelectedStatusFilter(event.target.value as CommsStatus | "All")}
                  className="mt-2 h-11 w-full rounded-lg border border-[#ccd5e2] bg-white px-3 text-sm font-bold text-[#111827] outline-none focus:border-[#e40000]"
                >
                  <option value="All">All statuses</option>
                  <option value="New">New</option>
                  <option value="Office review">Office review</option>
                  <option value="Awaiting driver read">Awaiting driver read</option>
                </select>
              </label>

              <label>
                <span className="text-xs font-black uppercase tracking-[0.12em] text-[#6b7280]">Priority</span>
                <select
                  value={selectedPriorityFilter}
                  onChange={(event) => setSelectedPriorityFilter(event.target.value as Priority | "All")}
                  className="mt-2 h-11 w-full rounded-lg border border-[#ccd5e2] bg-white px-3 text-sm font-bold text-[#111827] outline-none focus:border-[#e40000]"
                >
                  <option value="All">All priorities</option>
                  <option value="Critical">Critical</option>
                  <option value="High">High</option>
                  <option value="Normal">Normal</option>
                </select>
              </label>

              <label>
                <span className="text-xs font-black uppercase tracking-[0.12em] text-[#6b7280]">Driver</span>
                <input
                  value={driverSearch}
                  onChange={(event) => setDriverSearch(event.target.value)}
                  placeholder="Search driver"
                  className="mt-2 h-11 w-full rounded-lg border border-[#ccd5e2] bg-white px-3 text-sm font-bold text-[#111827] outline-none focus:border-[#e40000]"
                />
              </label>

              <label>
                <span className="text-xs font-black uppercase tracking-[0.12em] text-[#6b7280]">Duty</span>
                <input
                  value={dutySearch}
                  onChange={(event) => setDutySearch(event.target.value)}
                  placeholder="Search duty"
                  className="mt-2 h-11 w-full rounded-lg border border-[#ccd5e2] bg-white px-3 text-sm font-bold text-[#111827] outline-none focus:border-[#e40000]"
                />
              </label>

              <label className="flex items-end">
                <span className="flex h-11 w-full items-center gap-3 rounded-lg border border-[#ccd5e2] bg-[#f8fafc] px-3 text-sm font-bold text-[#111827]">
                  <input
                    type="checkbox"
                    checked={showRetainedOnly}
                    onChange={(event) => setShowRetainedOnly(event.target.checked)}
                    className="h-4 w-4 rounded border-[#ccd5e2]"
                  />
                  Retained / read-confirmation only
                </span>
              </label>

              <div className="flex items-end">
                <div className="w-full rounded-lg border border-[#d9dee6] bg-[#f8fafc] px-3 py-2 text-sm font-bold text-[#4b5563]">
                  Showing <span className="font-black text-[#111827]">{filteredItems.length}</span> filtered message(s)
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[1560px] border-collapse text-left text-sm">
                <thead className="bg-white text-xs uppercase tracking-[0.12em] text-[#6b7280]">
                  <tr>
                    <th className="border-b border-[#d9dee6] px-4 py-3">Source</th>
                    <th className="border-b border-[#d9dee6] px-4 py-3">Duty</th>
                    <th className="border-b border-[#d9dee6] px-4 py-3">Duty start date</th>
                    <th className="border-b border-[#d9dee6] px-4 py-3">Message flow</th>
                    <th className="border-b border-[#d9dee6] px-4 py-3">Driver</th>
                    <th className="border-b border-[#d9dee6] px-4 py-3">Priority</th>
                    <th className="border-b border-[#d9dee6] px-4 py-3">Status</th>
                    <th className="border-b border-[#d9dee6] px-4 py-3">Driver read</th>
                    <th className="border-b border-[#d9dee6] px-4 py-3">Received</th>
                    <th className="border-b border-[#d9dee6] px-4 py-3">Summary</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.map((item) => (
                    <tr
                      key={item.id}
                      onClick={() => openCommunication(item)}
                      className="cursor-pointer bg-white transition hover:bg-[#fff0f0]"
                    >
                      <td className="border-b border-[#edf0f4] px-4 py-3 font-black text-[#111827]">{item.source}</td>
                      <td className="border-b border-[#edf0f4] px-4 py-3 font-black text-[#374151]">{item.duty}</td>
                      <td className="border-b border-[#edf0f4] px-4 py-3 font-bold text-[#374151]">{MOCK_DUTY_START_DATE}</td>
                      <td className="border-b border-[#edf0f4] px-4 py-3"><FlowBadge flow={getMessageFlow(item)} /></td>
                      <td className="border-b border-[#edf0f4] px-4 py-3 font-bold text-[#374151]">{item.driver}</td>
                      <td className="border-b border-[#edf0f4] px-4 py-3"><PriorityBadge priority={item.priority} /></td>
                      <td className="border-b border-[#edf0f4] px-4 py-3"><StatusBadge status={item.status} /></td>
                      <td className="border-b border-[#edf0f4] px-4 py-3"><ReadConfirmationBadge item={item} /></td>
                      <td className="border-b border-[#edf0f4] px-4 py-3 font-bold text-[#374151]">{item.received}</td>
                      <td className="border-b border-[#edf0f4] px-4 py-3 font-bold text-[#4b5563]">{item.summary}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </section>
      </div>

      {activeItem && (
        <CommunicationModal
          item={activeItem}
          managerName={managerName}
          replyText={replyText}
          replyPriority={replyPriority}
          onManagerNameChange={setManagerName}
          onReplyTextChange={setReplyText}
          onReplyPriorityChange={setReplyPriority}
          onClose={() => setActiveItem(null)}
          onSaveHistory={saveHistoryRecord}
          onReplyOnly={sendDriverReplyOnly}
          onConfirmDriverRead={confirmDriverRead}
        />
      )}

      {newMessageModalOpen && (
        <NewDriverMessageModal
          driverNames={driverNames}
          selectedDriver={newMessageDriver}
          duty={newMessageDuty}
          message={newMessageText}
          priority={newMessagePriority}
          onDriverChange={setNewMessageDriver}
          onDutyChange={setNewMessageDuty}
          onMessageChange={setNewMessageText}
          onPriorityChange={setNewMessagePriority}
          onClose={() => setNewMessageModalOpen(false)}
          onCreate={createManualDriverMessage}
        />
      )}

      {summaryPopup && (
        <SummaryPopup
          title={summaryPopup.title}
          detail={summaryPopup.detail}
          onClose={() => setSummaryPopup(null)}
        />
      )}
    </main>
  );
}

function CommunicationModal({
  item,
  managerName,
  replyText,
  replyPriority,
  onManagerNameChange,
  onReplyTextChange,
  onReplyPriorityChange,
  onClose,
  onSaveHistory,
  onReplyOnly,
  onConfirmDriverRead,
}: {
  item: CommsItem;
  managerName: string;
  replyText: string;
  replyPriority: Priority;
  onManagerNameChange: (value: string) => void;
  onReplyTextChange: (value: string) => void;
  onReplyPriorityChange: (value: Priority) => void;
  onClose: () => void;
  onSaveHistory: (item: CommsItem, action: ActionType) => void;
  onReplyOnly: (item: CommsItem) => void;
  onConfirmDriverRead: (item: CommsItem) => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 px-4 py-8">
      <section className="w-full max-w-[1050px] rounded-2xl border border-[#d9dee6] bg-white shadow-2xl">
        <header className="flex flex-col gap-3 border-b border-[#d9dee6] p-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#e40000]">{item.source}</p>
            <h2 className="mt-2 text-3xl font-black text-[#111827]">{item.title}</h2>
            <p className="mt-2 text-sm font-bold leading-6 text-[#6b7280]">{item.summary}</p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-[#ccd5e2] bg-white px-4 py-2 text-sm font-black text-[#4b5563] transition hover:border-[#e40000]"
          >
            Close
          </button>
        </header>

        <div className="grid grid-cols-1 gap-5 p-5 xl:grid-cols-[1.15fr_0.85fr]">
          <section className="space-y-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <InfoBox label="Duty" value={item.duty} />
              <InfoBox label="Driver" value={item.driver} />
              <InfoBox label="Vehicle" value={item.vehicle} />
              <InfoBox label="Trailer" value={item.trailer} />
            </div>

            <ChatThreadPanel thread={getMessageThread(item)} />

            {item.pmt && <PmtDetailsPanel item={item} details={item.pmt} />}
            {item.breakdown && <BreakdownDetailsPanel details={item.breakdown} />}
            {item.rtc && <RtcDetailsPanel details={item.rtc} />}
          </section>

          <aside className="rounded-xl border border-[#d9dee6] bg-[#f8fafc] p-4">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#e40000]">Manager action</p>
            <h3 className="mt-2 text-2xl font-black text-[#111827]">Office response</h3>

            <label className="mt-4 block">
              <span className="text-xs font-black uppercase tracking-[0.14em] text-[#6b7280]">Manager name</span>
              <input
                value={managerName}
                onChange={(event) => onManagerNameChange(event.target.value)}
                className="mt-2 h-11 w-full rounded-lg border border-[#ccd5e2] bg-white px-3 text-sm font-bold text-[#111827] outline-none focus:border-[#e40000]"
              />
            </label>

            <label className="mt-4 block">
              <span className="text-xs font-black uppercase tracking-[0.14em] text-[#6b7280]">Message back to driver</span>
              <textarea
                value={replyText}
                onChange={(event) => onReplyTextChange(event.target.value)}
                rows={7}
                className="mt-2 w-full rounded-lg border border-[#ccd5e2] bg-white px-3 py-3 text-sm font-bold text-[#111827] outline-none focus:border-[#e40000]"
              />
            </label>

            <label className="mt-4 block">
              <span className="text-xs font-black uppercase tracking-[0.14em] text-[#6b7280]">Driver message importance</span>
              <select
                value={replyPriority}
                onChange={(event) => onReplyPriorityChange(event.target.value as Priority)}
                className="mt-2 h-11 w-full rounded-lg border border-[#ccd5e2] bg-white px-3 text-sm font-bold text-[#111827] outline-none focus:border-[#e40000]"
              >
                <option value="Normal">Normal</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </label>

            <div className="mt-4 rounded-lg border border-[#d9dee6] bg-white p-3 text-sm font-bold leading-6 text-[#4b5563]">
              Driver Comms will be retained until the driver has read the message.
            </div>

            {item.retainUntilDriverRead && !item.driverReadConfirmed ? (
              <div className="mt-4 rounded-lg border border-[#2c80e5] bg-[#eef6ff] p-3 text-sm font-bold leading-6 text-[#1d4ed8]">
                This item is currently being retained in Comms until the driver confirms that the office message has been read.
                <button
                  type="button"
                  onClick={() => onConfirmDriverRead(item)}
                  className="mt-3 w-full rounded-lg bg-[#2c80e5] px-4 py-3 text-sm font-black text-white transition hover:bg-[#1f66ba]"
                >
                  Mock driver has read and confirmed
                </button>
              </div>
            ) : null}

            {item.source === "PMT Confirmation" ? (
              <div className="mt-4 grid grid-cols-1 gap-3">
                <button
                  type="button"
                  onClick={() => onSaveHistory(item, "Message driver and OK to continue")}
                  className="rounded-lg bg-[#15803d] px-4 py-3 text-sm font-black text-white transition hover:bg-[#0f5f2d]"
                >
                  Message driver & OK to continue
                </button>
                <button
                  type="button"
                  onClick={() => onSaveHistory(item, "VOR vehicle / M5 workshops")}
                  className="rounded-lg bg-[#e40000] px-4 py-3 text-sm font-black text-white transition hover:bg-[#b80000]"
                >
                  VOR vehicle and send PMT to Workshops & Message Driver
                </button>
              </div>
            ) : (
              <div className="mt-4 grid grid-cols-1 gap-3">
                <button
                  type="button"
                  onClick={() => onReplyOnly(item)}
                  className="rounded-lg border border-[#e40000] bg-white px-4 py-3 text-sm font-black text-[#e40000] transition hover:bg-[#fff0f0]"
                >
                  Reply to driver
                </button>
                <button
                  type="button"
                  onClick={() => onSaveHistory(item, "Reply and actioned")}
                  className="rounded-lg bg-[#e40000] px-4 py-3 text-sm font-black text-white transition hover:bg-[#b80000]"
                >
                  Reply to driver and mark as actioned
                </button>
                <button
                  type="button"
                  onClick={() => onSaveHistory(item, "Marked actioned")}
                  className="rounded-lg border border-[#ccd5e2] bg-white px-4 py-3 text-sm font-black text-[#4b5563] transition hover:border-[#e40000]"
                >
                  Mark as actioned only
                </button>
              </div>
            )}

            <div className="mt-4 rounded-lg border border-[#d9dee6] bg-white px-4 py-3 text-sm font-bold leading-6 text-[#4b5563]">
              Actioned items will be removed from Comms, saved to Comms History with a timestamp, and record {managerName || MANAGER_NAME} as the manager. If the retain tick is used, the message will stay in Comms until the driver read confirmation is received.
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}

function ChatThreadPanel({ thread }: { thread: MessageThreadEntry[] }) {
  return (
    <section className="rounded-xl border border-[#d9dee6] bg-[#f8fafc] p-4 shadow-sm">
      <p className="text-xs font-black uppercase tracking-[0.18em] text-[#e40000]">Message history</p>
      <h3 className="mt-2 text-2xl font-black text-[#111827]">Conversation thread</h3>
      <div className="mt-4 max-h-[360px] space-y-3 overflow-y-auto rounded-xl border border-[#d9dee6] bg-white p-4">
        {thread.map((entry) => {
          const isOffice = entry.sender === "Office" || entry.sender === "M5 Workshops";
          return (
            <div key={entry.id} className={`flex ${isOffice ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[78%] rounded-2xl px-4 py-3 shadow-sm ${
                  isOffice ? "bg-[#e40000] text-white" : entry.sender === "System" ? "bg-[#fff7e6] text-[#111827]" : "bg-[#eef2f7] text-[#111827]"
                }`}
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-black uppercase tracking-[0.12em]">{entry.senderName}</span>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-black uppercase ${
                    entry.priority === "Critical"
                      ? "bg-white text-[#e40000]"
                      : entry.priority === "High"
                        ? "bg-[#fff7e6] text-[#a66900]"
                        : "bg-white/90 text-[#2c80e5]"
                  }`}>
                    {entry.priority}
                  </span>
                </div>
                <p className="mt-2 text-sm font-bold leading-6">{entry.message}</p>
                <p className={`mt-2 text-[11px] font-bold ${isOffice ? "text-white/80" : "text-[#6b7280]"}`}>
                  {entry.timestamp} · {entry.direction}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function PmtDetailsPanel({ item, details }: { item: CommsItem; details: PmtDetails }) {
  return (
    <section className="rounded-xl border border-[#d9dee6] bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[#e40000]">Past vehicle history</p>
          <h3 className="mt-2 text-2xl font-black text-[#111827]">{details.issueTitle}</h3>
          <p className="mt-2 text-sm font-black uppercase tracking-[0.18em] text-[#e40000]">{details.pmt}</p>
        </div>
        <PriorityBadge priority={item.priority} />
      </div>

      <p className="mt-3 text-sm font-bold leading-6 text-[#4b5563]">{details.notes}</p>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <InfoBox label="Issue type" value={details.severity} tone={details.severity === "Defect" ? "red" : "amber"} />
        <InfoBox label="Reported" value={details.reported} />
        <InfoBox label="Fixed" value={details.fixed} />
        <InfoBox label="Mileage" value={details.mileage} />
        <InfoBox label="Status" value={details.pmtStatus} />
        <InfoBox label="PMT" value={details.pmt} />
      </div>

      <div className="mt-4 rounded-lg border border-[#f5a400] bg-[#fff7e6] p-3 text-sm font-bold leading-6 text-[#7a4b00]">
        Manager must decide whether the vehicle is OK to continue or whether it should be VOR and sent to Workshops via M5. If VOR is selected, a mock message is sent to the driver stating that the vehicle has been de-allocated.
      </div>
    </section>
  );
}

function BreakdownDetailsPanel({ details }: { details: BreakdownDetails }) {
  return (
    <section className="rounded-xl border border-[#d9dee6] bg-white p-4 shadow-sm">
      <p className="text-xs font-black uppercase tracking-[0.18em] text-[#e40000]">Breakdown report form</p>
      <h3 className="mt-2 text-2xl font-black text-[#111827]">Breakdown support request</h3>
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <InfoBox label="Breakdown location" value={details.location} />
        <InfoBox label="Direction" value={details.direction} />
        <InfoBox label="Are you safe?" value={details.safeStatus} tone={details.safeStatus.includes("Need") ? "red" : "green"} />
        <InfoBox label="Photos" value={details.photos} />
      </div>
      <DetailBlock label="Breakdown fault" value={details.fault} />
      <DetailBlock label="Additional support needed" value={details.supportNeeded} />
    </section>
  );
}

function RtcDetailsPanel({ details }: { details: RtcDetails }) {
  return (
    <section className="rounded-xl border border-[#d9dee6] bg-white p-4 shadow-sm">
      <p className="text-xs font-black uppercase tracking-[0.18em] text-[#e40000]">RTC office report form</p>
      <h3 className="mt-2 text-2xl font-black text-[#111827]">RTC report data</h3>
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <InfoBox label="Incident location" value={details.incidentLocation} />
        <InfoBox label="GPS Coordinates" value={details.gpsCoordinates} />
        <InfoBox label="Incident time" value={details.incidentTime} />
        <InfoBox label="Police reference" value={details.policeReference} />
        <InfoBox label="Injuries / risk" value={details.injuries} />
        <InfoBox label="Photos" value={details.photos} />
      </div>
      <DetailBlock label="Third party details" value={details.thirdPartyDetails} />
      <DetailBlock label="Vehicle / trailer damage" value={details.damageDetails} />
      <DetailBlock label="Incident description" value={details.incidentDescription} />
    </section>
  );
}

function NewDriverMessageModal({
  driverNames,
  selectedDriver,
  duty,
  message,
  priority,
  onDriverChange,
  onDutyChange,
  onMessageChange,
  onPriorityChange,
  onClose,
  onCreate,
}: {
  driverNames: string[];
  selectedDriver: string;
  duty: string;
  message: string;
  priority: Priority;
  onDriverChange: (value: string) => void;
  onDutyChange: (value: string) => void;
  onMessageChange: (value: string) => void;
  onPriorityChange: (value: Priority) => void;
  onClose: () => void;
  onCreate: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <section className="w-full max-w-[680px] rounded-2xl border border-[#d9dee6] bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#e40000]">New office message</p>
            <h2 className="mt-2 text-2xl font-black text-[#111827]">Message any driver</h2>
            <p className="mt-2 text-sm font-bold leading-6 text-[#6b7280]">
              This creates a mock office-to-driver message. Driver Comms will be retained until the driver has read the message.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-[#ccd5e2] bg-white px-4 py-2 text-sm font-black text-[#4b5563] transition hover:border-[#e40000]"
          >
            Close
          </button>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label>
            <span className="text-xs font-black uppercase tracking-[0.14em] text-[#6b7280]">Driver</span>
            <select
              value={selectedDriver}
              onChange={(event) => onDriverChange(event.target.value)}
              className="mt-2 h-11 w-full rounded-lg border border-[#ccd5e2] bg-white px-3 text-sm font-bold text-[#111827] outline-none focus:border-[#e40000]"
            >
              {driverNames.map((driver) => (
                <option key={driver} value={driver}>{driver}</option>
              ))}
            </select>
          </label>

          <label>
            <span className="text-xs font-black uppercase tracking-[0.14em] text-[#6b7280]">Duty</span>
            <input
              value={duty}
              onChange={(event) => onDutyChange(event.target.value)}
              className="mt-2 h-11 w-full rounded-lg border border-[#ccd5e2] bg-white px-3 text-sm font-bold text-[#111827] outline-none focus:border-[#e40000]"
            />
          </label>
        </div>

        <label className="mt-4 block">
          <span className="text-xs font-black uppercase tracking-[0.14em] text-[#6b7280]">Message importance</span>
          <select
            value={priority}
            onChange={(event) => onPriorityChange(event.target.value as Priority)}
            className="mt-2 h-11 w-full rounded-lg border border-[#ccd5e2] bg-white px-3 text-sm font-bold text-[#111827] outline-none focus:border-[#e40000]"
          >
            <option value="Normal">Normal</option>
            <option value="High">High</option>
            <option value="Critical">Critical</option>
          </select>
        </label>

        <label className="mt-4 block">
          <span className="text-xs font-black uppercase tracking-[0.14em] text-[#6b7280]">Message to driver</span>
          <textarea
            value={message}
            onChange={(event) => onMessageChange(event.target.value)}
            rows={6}
            placeholder="Type the message that should be sent to the driver..."
            className="mt-2 w-full rounded-lg border border-[#ccd5e2] bg-white px-3 py-3 text-sm font-bold text-[#111827] outline-none focus:border-[#e40000]"
          />
        </label>

        <div className="mt-4 rounded-lg border border-[#d9dee6] bg-[#f8fafc] p-3 text-sm font-bold leading-6 text-[#4b5563]">
          Driver Comms will be retained until the driver has read the message.
        </div>

        <button
          type="button"
          onClick={onCreate}
          className="mt-5 w-full rounded-lg bg-[#e40000] px-4 py-3 text-sm font-black uppercase tracking-[0.12em] text-white transition hover:bg-[#b80000]"
        >
          Create message in Comms
        </button>
      </section>
    </div>
  );
}

function getMessageFlow(item: CommsItem): "Incoming" | "Outgoing" {
  if (item.message?.direction === "Office to driver") {
    return "Outgoing";
  }

  return "Incoming";
}

function FlowBadge({ flow }: { flow: "Incoming" | "Outgoing" }) {
  const classes =
    flow === "Outgoing"
      ? "border-[#2563eb] bg-[#eff6ff] text-[#1d4ed8]"
      : "border-[#16a34a] bg-[#f0fdf4] text-[#166534]";

  return <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-black uppercase tracking-[0.12em] ${classes}`}>{flow}</span>;
}

function SummaryPopup({ title, detail, onClose }: { title: string; detail: string; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <section className="w-full max-w-[560px] rounded-2xl border-2 border-[#15803d] bg-white p-6 shadow-2xl">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-[#15803d]">Successful mock action</p>
        <h2 className="mt-2 text-2xl font-black text-[#111827]">{title}</h2>
        <p className="mt-3 text-sm font-bold leading-6 text-[#4b5563]">{detail}</p>
        <button
          type="button"
          onClick={onClose}
          className="mt-5 rounded-lg bg-[#111827] px-5 py-3 text-sm font-black text-white transition hover:bg-[#000]"
        >
          Close summary
        </button>
      </section>
    </div>
  );
}

function OfficeHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <header className="flex min-h-[64px] items-center justify-between bg-[#e40000] text-white shadow-sm">
      <div className="flex h-full items-center">
        <Link
          href="/internal/app-ideas/link-message-mock"
          className="flex h-[64px] w-[68px] items-center justify-center border-r border-white/30 text-3xl font-black text-white no-underline transition hover:bg-white/10"
          aria-label="Back to Duty Execution"
        >
          ≡
        </Link>
        <div className="px-5">
          <p className="text-2xl font-black uppercase tracking-wide">{title}</p>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/80">{subtitle}</p>
        </div>
      </div>

      <div className="flex items-center gap-4 px-4">
        <Link
          href="/internal/app-ideas"
          className="hidden rounded-lg border border-white/70 px-4 py-2 text-sm font-black text-white no-underline transition hover:bg-white/15 sm:block"
        >
          ← Back to PDA Home
        </Link>
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-2xl text-[#e40000]">●</div>
        <div className="hidden text-right sm:block">
          <p className="text-base font-black">Andrew Cannon</p>
          <p className="text-xs font-bold text-white/80">Mock dashboard user</p>
        </div>
      </div>
    </header>
  );
}

function OfficeSidebar() {
  return (
    <aside className="flex min-h-[calc(100vh-64px)] w-[68px] flex-col bg-[#252c33] text-white">
      {sidebarItems.map((item) => (
        <Link
          key={item.label}
          href={item.href}
          aria-label={item.label}
          title={item.label}
          className={`relative flex h-[64px] items-center justify-center border-b border-white/10 no-underline transition ${
            item.icon.length > 2 ? "text-sm font-black" : "text-3xl"
          } ${item.active ? "bg-[#11171d] text-white" : "text-white/75 hover:bg-[#11171d] hover:text-white"}`}
        >
          <span>{item.icon}</span>
          {"alertCount" in item && item.alertCount ? (
            <span className="absolute bottom-2 right-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#e40000] px-1 text-[11px] font-black leading-none text-white ring-2 ring-[#252c33]">
              {item.alertCount}
            </span>
          ) : null}
        </Link>
      ))}
      <button
        type="button"
        className="mt-auto flex h-[64px] items-center justify-center border-t border-white/10 text-3xl text-white/80 transition hover:bg-[#11171d] hover:text-white"
        aria-label="Collapse sidebar"
      >
        »
      </button>
    </aside>
  );
}

function PriorityBadge({ priority }: { priority: Priority }) {
  const classes =
    priority === "Critical"
      ? "bg-[#fff0f0] text-[#e40000] border-[#e40000]"
      : priority === "High"
        ? "bg-[#fff7e6] text-[#a66900] border-[#f5a400]"
        : "bg-[#eef6ff] text-[#2c80e5] border-[#2c80e5]";

  return <span className={`rounded-full border px-3 py-1 text-xs font-black ${classes}`}>{priority}</span>;
}

function StatusBadge({ status }: { status: CommsStatus }) {
  const classes =
    status === "New"
      ? "bg-[#fff0f0] text-[#e40000]"
      : status === "Office review"
        ? "bg-[#fff7e6] text-[#a66900]"
        : status === "Awaiting driver read"
          ? "bg-[#eef6ff] text-[#2c80e5]"
          : "bg-[#ecfdf3] text-[#157347]";

  return <span className={`rounded-full px-3 py-1 text-xs font-black ${classes}`}>{status}</span>;
}


function ReadConfirmationBadge({ item }: { item: CommsItem }) {
  if (item.retainUntilDriverRead) {
    if (item.driverReadConfirmed) {
      return <span className="rounded-full bg-[#ecfdf3] px-3 py-1 text-xs font-black text-[#157347]">Read confirmed</span>;
    }

    return <span className="rounded-full bg-[#eef6ff] px-3 py-1 text-xs font-black text-[#2c80e5]">Unread / retain</span>;
  }

  return <span className="rounded-full bg-[#f3f4f6] px-3 py-1 text-xs font-black text-[#6b7280]">No read tick</span>;
}

function isUnreadOfficeMessage(item: CommsItem) {
  return Boolean(item.retainUntilDriverRead && !item.driverReadConfirmed);
}

function InfoBox({ label, value, tone }: { label: string; value: string; tone?: "red" | "amber" | "green" }) {
  const toneClass =
    tone === "red"
      ? "border-[#e40000] bg-[#fff0f0]"
      : tone === "amber"
        ? "border-[#f5a400] bg-[#fff7e6]"
        : tone === "green"
          ? "border-[#15803d] bg-[#ecfdf3]"
          : "border-[#d9dee6] bg-[#f8fafc]";

  return (
    <div className={`rounded-lg border p-3 ${toneClass}`}>
      <p className="text-xs font-black uppercase tracking-[0.14em] text-[#6b7280]">{label}</p>
      <p className="mt-1 text-sm font-black text-[#111827]">{value}</p>
    </div>
  );
}

function DetailBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="mt-3 rounded-lg border border-[#d9dee6] bg-[#f8fafc] p-3">
      <p className="text-xs font-black uppercase tracking-[0.14em] text-[#6b7280]">{label}</p>
      <p className="mt-2 text-sm font-bold leading-6 text-[#111827]">{value}</p>
    </div>
  );
}

function createHistoryRecord({
  item,
  action,
  replyText,
  replyPriority,
  manager,
  actionedAt,
  messageThread,
}: {
  item: CommsItem;
  action: ActionType;
  replyText: string;
  replyPriority: Priority;
  manager: string;
  actionedAt: string;
  messageThread?: MessageThreadEntry[];
}): CommsHistoryRecord {
  const driverMessage = getDriverMessage(item, action, replyText);
  const finalThread = messageThread || buildActionedThread(item, action, replyText, replyPriority, manager, actionedAt);

  return {
    id: `${item.id}-${Date.now()}`,
    source: item.source,
    duty: item.duty,
    driver: item.driver,
    vehicle: item.vehicle,
    trailer: item.trailer,
    priority: item.priority,
    received: item.received,
    receivedDate: item.receivedDate,
    title: item.title,
    summary: item.summary,
    manager,
    action,
    replyToDriver: getReplyTextForHistory(action, replyText, driverMessage),
    actionedAt,
    finalStatus: "Actioned",
    driverMessage,
    replyPriority,
    detailSummary: buildDetailSummary(item),
    messageThread: finalThread,
    messageThreadSummary: buildThreadSummary(finalThread),
  };
}

function defaultReplyForItem(item: CommsItem) {
  if (item.source === "PMT Confirmation") {
    return "Transport office has reviewed the PMT confirmation. Awaiting manager decision.";
  }

  if (item.source === "RTC") {
    return "RTC report received by the transport office. Please remain safe and await further instruction.";
  }

  if (item.source === "Breakdown") {
    return "Breakdown report received. Please remain in a safe location while the office reviews recovery options.";
  }

  return "Message received by the transport office. Thank you for the update.";
}

function getDriverMessage(item: CommsItem, action: ActionType, replyText: string) {
  if (action === "VOR vehicle / M5 workshops") {
    return "Vehicle has been de-allocated. Workshop data has been sent to M5 in the mockup.";
  }

  if (action === "Message driver and OK to continue") {
    return "Manager has confirmed the vehicle is OK to continue in the mockup.";
  }

  if (replyText.trim()) {
    return `Driver reply: ${replyText.trim()}`;
  }

  return `${item.source} item actioned with no additional driver message.`;
}

function createThreadEntry({
  sender,
  senderName,
  message,
  priority,
  direction,
  timestamp,
}: {
  sender: MessageThreadEntry["sender"];
  senderName: string;
  message: string;
  priority: Priority;
  direction: MessageThreadEntry["direction"];
  timestamp?: string;
}): MessageThreadEntry {
  return {
    id: `${sender}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    sender,
    senderName,
    message,
    timestamp: timestamp || new Date().toLocaleString("en-GB"),
    priority,
    direction,
  };
}

function getMessageThread(item: CommsItem): MessageThreadEntry[] {
  if (item.messageThread && item.messageThread.length > 0) {
    return item.messageThread;
  }

  return [createInitialThreadEntry(item)];
}

function createInitialThreadEntry(item: CommsItem): MessageThreadEntry {
  return {
    id: `${item.id}-initial`,
    sender: item.message?.direction === "Office to driver" ? "Office" : "Driver",
    senderName: item.message?.direction === "Office to driver" ? MANAGER_NAME : item.driver,
    message: initialThreadMessage(item),
    timestamp: `${item.receivedDate} ${item.received}`,
    priority: item.priority,
    direction: item.message?.direction || "Driver to office",
  };
}

function initialThreadMessage(item: CommsItem) {
  if (item.message) {
    return item.message.messageText;
  }

  if (item.pmt) {
    return `PMT confirmation submitted: ${item.pmt.issueTitle}. ${item.pmt.severity}. ${item.pmt.notes}`;
  }

  if (item.rtc) {
    return `RTC report submitted. Location: ${item.rtc.incidentLocation}. Incident time: ${item.rtc.incidentTime}. ${item.rtc.incidentDescription}`;
  }

  if (item.breakdown) {
    return `Breakdown report submitted. Location: ${item.breakdown.location}. Fault: ${item.breakdown.fault}. Safe status: ${item.breakdown.safeStatus}.`;
  }

  return item.summary;
}

function buildActionedThread(
  item: CommsItem,
  action: ActionType,
  replyText: string,
  replyPriority: Priority,
  manager: string,
  actionedAt: string,
) {
  const thread = [...getMessageThread(item)];
  const driverMessage = getDriverMessage(item, action, replyText);

  if (action === "Marked actioned") {
    thread.push({
      id: `${item.id}-actioned-${Date.now()}`,
      sender: "System",
      senderName: manager,
      message: `${item.source} item marked as actioned with no reply sent to the driver.`,
      timestamp: actionedAt,
      priority: replyPriority,
      direction: "System",
    });
    return thread;
  }

  thread.push({
    id: `${item.id}-reply-${Date.now()}`,
    sender: "Office",
    senderName: manager,
    message: driverMessage.replace(/^Driver reply: /, ""),
    timestamp: actionedAt,
    priority: replyPriority,
    direction: "Office to driver",
  });

  if (action === "VOR vehicle / M5 workshops") {
    thread.push({
      id: `${item.id}-m5-${Date.now()}`,
      sender: "M5 Workshops",
      senderName: "M5 Workshops",
      message: `Mock M5 workshop notification created for ${item.vehicle}, duty ${item.duty}. Vehicle set to VOR and driver told the vehicle has been de-allocated.`,
      timestamp: actionedAt,
      priority: "Critical",
      direction: "Workshop",
    });
  }

  return thread;
}

function buildThreadSummary(thread: MessageThreadEntry[]) {
  return thread
    .map((entry) => `${entry.timestamp} | ${entry.senderName} | ${entry.priority} | ${entry.message}`)
    .join("\n");
}

function getReplyTextForHistory(action: ActionType, replyText: string, driverMessage: string) {
  if (action === "Marked actioned") {
    return "No reply sent to driver.";
  }

  return replyText.trim() || driverMessage;
}

function normaliseCommsItem(item: CommsItem): CommsItem {
  return {
    ...item,
    messageThread: getMessageThread(item),
    retainUntilDriverRead: Boolean(item.retainUntilDriverRead),
    driverReadConfirmed: Boolean(item.driverReadConfirmed),
    pendingAction: item.pendingAction,
    pendingManager: item.pendingManager,
    pendingReplyText: item.pendingReplyText,
    pendingReplyPriority: item.pendingReplyPriority,
    officeRead: Boolean(item.officeRead),
    officeReadAt: item.officeReadAt,
  };
}

function readOpenItems(): CommsItem[] {
  if (typeof window === "undefined") {
    return initialCommsItems.map(normaliseCommsItem);
  }

  try {
    const rawItems = localStorage.getItem(COMMS_OPEN_STORAGE_KEY);
    if (!rawItems) {
      const actionedIds = new Set(readHistoryRecords().map((record) => record.id.split("-").slice(0, -1).join("-")));
      return initialCommsItems.filter((item) => !actionedIds.has(item.id)).map(normaliseCommsItem);
    }

    const parsed = JSON.parse(rawItems);

    if (!Array.isArray(parsed)) {
      return initialCommsItems.map(normaliseCommsItem);
    }

    return parsed.map((item, index) =>
      normaliseCommsItem({
        ...item,
        driver: getCurrentMockDriverName(item, index),
      }),
    );
  } catch {
    return initialCommsItems.map(normaliseCommsItem);
  }
}

function getCurrentMockDriverName(item: CommsItem, index: number) {
  const isDriverPdaMessage =
    item.id?.startsWith("DRV-") ||
    item.message?.direction === "Driver to office" ||
    (item.source === "Breakdown" && item.duty === "NWH254");

  if (item.id?.startsWith("MANUAL-") || isDriverPdaMessage) {
    return item.driver?.trim() || driverNames[0];
  }

  const matchingCurrentMock = initialCommsItems.find(
    (currentItem) =>
      currentItem.id === item.id ||
      (currentItem.source === item.source && currentItem.duty === item.duty),
  );

  return matchingCurrentMock?.driver || driverNames[index % driverNames.length];
}

function writeOpenItems(items: CommsItem[]) {
  localStorage.setItem(COMMS_OPEN_STORAGE_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event(DRIVER_MESSAGE_STORE_CHANGED_EVENT));
}

function readHistoryRecords(): CommsHistoryRecord[] {
  try {
    const rawHistory = localStorage.getItem(COMMS_HISTORY_STORAGE_KEY);
    if (!rawHistory) {
      return [];
    }

    const parsed = JSON.parse(rawHistory);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function buildDetailSummary(item: CommsItem) {
  if (item.pmt) {
    return `PMT ${item.pmt.pmt}: ${item.pmt.issueTitle}. ${item.pmt.severity}. Reported ${item.pmt.reported}; fixed ${item.pmt.fixed}; mileage ${item.pmt.mileage}. Notes: ${item.pmt.notes}`;
  }

  if (item.rtc) {
    return `RTC location ${item.rtc.incidentLocation}; GPS ${item.rtc.gpsCoordinates}; incident time ${item.rtc.incidentTime}; injuries/risk ${item.rtc.injuries}; police ref ${item.rtc.policeReference}; damage ${item.rtc.damageDetails}; description ${item.rtc.incidentDescription}; photos ${item.rtc.photos}.`;
  }

  if (item.breakdown) {
    return `Breakdown location ${item.breakdown.location}; direction ${item.breakdown.direction}; safe status ${item.breakdown.safeStatus}; fault ${item.breakdown.fault}; support needed ${item.breakdown.supportNeeded}; photos ${item.breakdown.photos}.`;
  }

  if (item.message) {
    return `${item.message.direction || "Driver to office"} message via ${item.message.route}: ${item.message.messageText}`;
  }

  return item.summary;
}
