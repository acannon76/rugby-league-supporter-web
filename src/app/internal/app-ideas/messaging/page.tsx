"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { useDriverName } from "../../DriverName";
import VehicleCheckTimer from "../../vehicle-checks/VehicleCheckTimer";

type Priority = "Critical" | "High" | "Normal";
type CommsSource = "RTC" | "Breakdown" | "Messaging" | "PMT Confirmation";
type CommsStatus = "New" | "Office review" | "Awaiting driver read" | "Actioned";
type MessageDirection = "Driver to office" | "Office to driver" | "System" | "Workshop";
type MessageCategory = "Home VOC Message" | "Central Postal Control CPC" | "Breakdown";
type DriverView = "Inbox" | "Sent" | "Compose";
type InboxFilter = "All" | "Unread" | "Read";
type SentFilter = "All" | "Office unread" | "Office read";

type MessageThreadEntry = {
  id: string;
  sender: "Driver" | "Office" | "System" | "M5 Workshops";
  senderName: string;
  message: string;
  timestamp: string;
  priority: Priority;
  direction: MessageDirection;
};

type MessageDetails = {
  messageText: string;
  route: string;
  direction?: "Driver to office" | "Office to driver";
};

type BreakdownDetails = {
  location: string;
  direction: string;
  fault: string;
  safeStatus: string;
  supportNeeded: string;
  photos: string;
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
  message?: MessageDetails;
  breakdown?: BreakdownDetails;
  messageThread?: MessageThreadEntry[];
  retainUntilDriverRead?: boolean;
  driverReadConfirmed?: boolean;
  officeRead?: boolean;
  officeReadAt?: string;
};

const COMMS_OPEN_STORAGE_KEY = "link-message-comms-open-items";
const DRIVER_MESSAGE_READ_STORAGE_KEY = "driver-messaging-read-items";
const DUTY_NUMBER = "NWH254";
const VEHICLE_ID = "PE68UHD";
const TRAILER_ID = "7338014";

const categoryOptions: MessageCategory[] = [
  "Home VOC Message",
  "Central Postal Control CPC",
  "Breakdown",
];

export default function MessagingPage() {
  const driverName = useDriverName();
  const [activeView, setActiveView] = useState<DriverView>("Inbox");
  const [items, setItems] = useState<CommsItem[]>([]);
  const [readIds, setReadIds] = useState<string[]>([]);
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<MessageCategory | "All">("All");
  const [priorityFilter, setPriorityFilter] = useState<Priority | "All">("All");
  const [inboxFilter, setInboxFilter] = useState<InboxFilter>("Unread");
  const [sentFilter, setSentFilter] = useState<SentFilter>("All");
  const [composeCategory, setComposeCategory] = useState<MessageCategory>("Home VOC Message");
  const [composePriority, setComposePriority] = useState<Priority>("Normal");
  const [composeMessage, setComposeMessage] = useState("");
  const [composeNotice, setComposeNotice] = useState<string | null>(null);

  useEffect(() => {
    function refreshFromStorage() {
      setItems(readCommsItems());
      setReadIds(readDriverReadIds());
    }

    refreshFromStorage();
    window.addEventListener("storage", refreshFromStorage);
    window.addEventListener("focus", refreshFromStorage);

    return () => {
      window.removeEventListener("storage", refreshFromStorage);
      window.removeEventListener("focus", refreshFromStorage);
    };
  }, []);

  const inboxMessages = useMemo(() => {
    return items
      .filter((item) => isForCurrentDriver(item, driverName) && isIncomingForDriver(item))
      .filter((item) => matchesCommonFilters(item, search, categoryFilter, priorityFilter));
  }, [items, driverName, search, categoryFilter, priorityFilter]);

  const sentMessages = useMemo(() => {
    return items
      .filter((item) => isForCurrentDriver(item, driverName) && isOutgoingFromDriver(item))
      .filter((item) => matchesCommonFilters(item, search, categoryFilter, priorityFilter));
  }, [items, driverName, search, categoryFilter, priorityFilter]);

  const filteredInbox = useMemo(() => {
    return inboxMessages.filter((item) => {
      if (inboxFilter === "Unread") {
        return !readIds.includes(item.id);
      }
      if (inboxFilter === "Read") {
        return readIds.includes(item.id);
      }
      return true;
    });
  }, [inboxMessages, inboxFilter, readIds]);

  const filteredSent = useMemo(() => {
    return sentMessages.filter((item) => {
      if (sentFilter === "Office unread") {
        return !item.officeRead;
      }
      if (sentFilter === "Office read") {
        return Boolean(item.officeRead);
      }
      return true;
    });
  }, [sentMessages, sentFilter]);

  const unreadInboxCount = inboxMessages.filter((item) => !readIds.includes(item.id)).length;
  const readInboxCount = inboxMessages.filter((item) => readIds.includes(item.id)).length;
  const sentOfficeUnreadCount = sentMessages.filter((item) => !item.officeRead).length;
  const sentOfficeReadCount = sentMessages.filter((item) => item.officeRead).length;

  const displayMessages = activeView === "Inbox" ? filteredInbox : filteredSent;
  const selectedMessage = displayMessages.find((item) => item.id === selectedMessageId) ?? displayMessages[0] ?? null;

  useEffect(() => {
    if (activeView === "Compose") {
      return;
    }

    if (!selectedMessageId && displayMessages.length) {
      setSelectedMessageId(displayMessages[0].id);
      return;
    }

    if (selectedMessageId && !displayMessages.some((item) => item.id === selectedMessageId)) {
      setSelectedMessageId(displayMessages[0]?.id ?? null);
    }
  }, [activeView, displayMessages, selectedMessageId]);

  useEffect(() => {
    if (activeView === "Inbox" && selectedMessage && !readIds.includes(selectedMessage.id)) {
      const nextReadIds = Array.from(new Set([...readIds, selectedMessage.id]));
      setReadIds(nextReadIds);
      writeDriverReadIds(nextReadIds);
    }
  }, [activeView, selectedMessage, readIds]);

  function handleSelectMessage(item: CommsItem) {
    setSelectedMessageId(item.id);
  }

  function handleToggleDriverRead(item: CommsItem) {
    const nextReadIds = readIds.includes(item.id)
      ? readIds.filter((id) => id !== item.id)
      : [...readIds, item.id];

    setReadIds(nextReadIds);
    writeDriverReadIds(nextReadIds);
  }

  function handleSendMessage() {
    const cleanMessage = composeMessage.trim();

    if (!cleanMessage) {
      setComposeNotice("Please add a message before sending.");
      return;
    }

    const now = new Date();
    const timeStamp = now.toLocaleString("en-GB");
    const newItem: CommsItem = {
      id: `DRV-${Date.now()}`,
      source: composeCategory === "Breakdown" ? "Breakdown" : "Messaging",
      priority: composePriority,
      status: "New",
      duty: DUTY_NUMBER,
      driver: driverName,
      vehicle: VEHICLE_ID,
      trailer: TRAILER_ID,
      received: formatTime(now),
      receivedDate: formatDate(now),
      title: `${composeCategory} message sent`,
      summary: `${composeCategory}: ${cleanMessage}`,
      message:
        composeCategory === "Breakdown"
          ? undefined
          : {
              route: composeCategory,
              direction: "Driver to office",
              messageText: cleanMessage,
            },
      breakdown:
        composeCategory === "Breakdown"
          ? {
              location: "Driver PDA mock location",
              direction: "Driver generated message",
              fault: cleanMessage,
              safeStatus: "Driver has requested office support via the mock messaging screen.",
              supportNeeded: cleanMessage,
              photos: "No photos attached",
            }
          : undefined,
      messageThread: [
        {
          id: `DRV-THREAD-${Date.now()}`,
          sender: "Driver",
          senderName: driverName,
          message: cleanMessage,
          timestamp: timeStamp,
          priority: composePriority,
          direction: "Driver to office",
        },
      ],
      officeRead: false,
      officeReadAt: undefined,
      retainUntilDriverRead: false,
      driverReadConfirmed: false,
    };

    const nextItems = [newItem, ...items];
    setItems(nextItems);
    writeCommsItems(nextItems);
    setComposeMessage("");
    setComposePriority("Normal");
    setComposeCategory("Home VOC Message");
    setComposeNotice(`Message sent at ${timeStamp}. It will now appear in Office Communications.`);
    setActiveView("Sent");
    setSelectedMessageId(newItem.id);
  }

  return (
    <main className="min-h-screen bg-[#f4f1ec] font-sans text-[#001b3a]">
      <header className="bg-[#c4002f] px-4 py-5 text-white sm:px-6 lg:px-10">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border-2 border-white text-base font-black">
              HGV
            </div>

            <div>
              <h1 className="text-xl font-black leading-none sm:text-2xl">Messaging</h1>
              <p className="text-sm font-black leading-none sm:text-base">Driver PDA Concept</p>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:ml-auto sm:flex-row sm:items-center">
            <VehicleCheckTimer />

            <div className="rounded-2xl border border-white/30 bg-white/10 px-5 py-3 text-right">
              <p className="text-xs font-black uppercase tracking-[0.16em]">Driver</p>
              <p className="text-base font-black">{driverName}</p>
            </div>

            <Link
              href="/internal/app-ideas"
              className="rounded-2xl border border-white/30 bg-white/10 px-5 py-3 text-sm font-black text-white no-underline transition hover:bg-white/20"
            >
              Back
            </Link>
          </div>
        </div>
      </header>

      <section className="px-4 py-7 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-[1440px]">
          <section className="rounded-[28px] border border-[#d0d7df] bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
              <div className="max-w-[820px]">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-[#c4002f]">Messaging mockup</p>
                <h2 className="mt-3 text-4xl font-black leading-tight text-[#001b3a] sm:text-5xl">Driver message centre</h2>
                <p className="mt-4 text-base font-bold leading-7 text-[#61748b]">
                  This screen replaces the 8-button layout with a simpler message centre. The driver can see unread and read office messages, view sent messages, and create new messages for Home VOC, CPC or Breakdown. Messages written here will appear in Office Communications, and office messages will show here for the current driver.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 xl:min-w-[520px] xl:grid-cols-4">
                <SummaryCard label="Unread inbox" value={String(unreadInboxCount)} tone="red" />
                <SummaryCard label="Read inbox" value={String(readInboxCount)} tone="blue" />
                <SummaryCard label="Office unread" value={String(sentOfficeUnreadCount)} tone="amber" />
                <SummaryCard label="Office read" value={String(sentOfficeReadCount)} tone="green" />
              </div>
            </div>
          </section>

          <section className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-[1.15fr_0.85fr]">
            <section className="rounded-[28px] border border-[#d0d7df] bg-white p-5 shadow-sm">
              <div className="flex flex-col gap-4 border-b border-[#e5e7eb] pb-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="inline-flex flex-wrap gap-2 rounded-2xl bg-[#f4f6f8] p-2">
                  {(["Inbox", "Sent", "Compose"] as DriverView[]).map((view) => (
                    <button
                      key={view}
                      type="button"
                      onClick={() => {
                        setActiveView(view);
                        setComposeNotice(null);
                      }}
                      className={`rounded-2xl px-4 py-3 text-sm font-black transition ${
                        activeView === view ? "bg-[#001b3a] text-white" : "text-[#001b3a] hover:bg-white"
                      }`}
                    >
                      {view}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:min-w-[540px]">
                  <ContextCard label="Driver" value={driverName} />
                  <ContextCard label="Duty" value={DUTY_NUMBER} />
                  <ContextCard label="Vehicle ID" value={VEHICLE_ID} />
                  <ContextCard label="Trailer ID" value={TRAILER_ID} />
                </div>
              </div>

              {activeView !== "Compose" ? (
                <>
                  <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-5">
                    <label>
                      <span className="text-xs font-black uppercase tracking-[0.12em] text-[#61748b]">Search</span>
                      <input
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Search message text"
                        className="mt-2 h-11 w-full rounded-xl border border-[#d5dce4] px-3 text-sm font-bold text-[#001b3a] outline-none focus:border-[#c4002f]"
                      />
                    </label>

                    <label>
                      <span className="text-xs font-black uppercase tracking-[0.12em] text-[#61748b]">Category</span>
                      <select
                        value={categoryFilter}
                        onChange={(event) => setCategoryFilter(event.target.value as MessageCategory | "All")}
                        className="mt-2 h-11 w-full rounded-xl border border-[#d5dce4] px-3 text-sm font-bold text-[#001b3a] outline-none focus:border-[#c4002f]"
                      >
                        <option value="All">All categories</option>
                        {categoryOptions.map((option) => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                    </label>

                    <label>
                      <span className="text-xs font-black uppercase tracking-[0.12em] text-[#61748b]">Priority</span>
                      <select
                        value={priorityFilter}
                        onChange={(event) => setPriorityFilter(event.target.value as Priority | "All")}
                        className="mt-2 h-11 w-full rounded-xl border border-[#d5dce4] px-3 text-sm font-bold text-[#001b3a] outline-none focus:border-[#c4002f]"
                      >
                        <option value="All">All priorities</option>
                        <option value="Critical">Critical</option>
                        <option value="High">High</option>
                        <option value="Normal">Normal</option>
                      </select>
                    </label>

                    {activeView === "Inbox" ? (
                      <label>
                        <span className="text-xs font-black uppercase tracking-[0.12em] text-[#61748b]">Read status</span>
                        <select
                          value={inboxFilter}
                          onChange={(event) => setInboxFilter(event.target.value as InboxFilter)}
                          className="mt-2 h-11 w-full rounded-xl border border-[#d5dce4] px-3 text-sm font-bold text-[#001b3a] outline-none focus:border-[#c4002f]"
                        >
                          <option value="All">All messages</option>
                          <option value="Unread">Unread</option>
                          <option value="Read">Read</option>
                        </select>
                      </label>
                    ) : (
                      <label>
                        <span className="text-xs font-black uppercase tracking-[0.12em] text-[#61748b]">Office read</span>
                        <select
                          value={sentFilter}
                          onChange={(event) => setSentFilter(event.target.value as SentFilter)}
                          className="mt-2 h-11 w-full rounded-xl border border-[#d5dce4] px-3 text-sm font-bold text-[#001b3a] outline-none focus:border-[#c4002f]"
                        >
                          <option value="All">All messages</option>
                          <option value="Office unread">Office unread</option>
                          <option value="Office read">Office read</option>
                        </select>
                      </label>
                    )}

                    <div className="flex items-end">
                      <div className="w-full rounded-xl border border-[#d5dce4] bg-[#f8fafc] px-4 py-3 text-sm font-bold text-[#4b5563]">
                        Showing <span className="font-black text-[#001b3a]">{displayMessages.length}</span> message(s)
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 space-y-3">
                    {displayMessages.length ? (
                      displayMessages.map((item) => {
                        const category = resolveCategory(item);
                        const isSelected = selectedMessage?.id === item.id;
                        const isUnread = activeView === "Inbox" && !readIds.includes(item.id);

                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => handleSelectMessage(item)}
                            className={`w-full rounded-[24px] border p-4 text-left transition ${
                              isSelected
                                ? "border-[#c4002f] bg-[#fff7f8] shadow-sm"
                                : "border-[#dbe2ea] bg-white hover:border-[#c4002f]/50 hover:shadow-sm"
                            }`}
                          >
                            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                              <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                  <CategoryBadge category={category} />
                                  <PriorityBadge priority={item.priority} />
                                  {activeView === "Inbox" ? (
                                    <ReadBadge state={isUnread ? "Unread" : "Read"} />
                                  ) : (
                                    <ReadBadge state={item.officeRead ? "Office read" : "Office unread"} />
                                  )}
                                </div>
                                <h3 className="mt-3 text-xl font-black text-[#001b3a]">{item.title}</h3>
                                <p className="mt-2 text-sm font-bold leading-6 text-[#61748b]">{item.summary}</p>
                              </div>

                              <div className="grid grid-cols-2 gap-3 lg:min-w-[300px]">
                                <MetaBlock label="Received date" value={normaliseDate(item.receivedDate)} />
                                <MetaBlock label="Received time" value={item.received} />
                                <MetaBlock label="Duty" value={item.duty} />
                                <MetaBlock
                                  label={activeView === "Inbox" ? "Driver read" : "Office read"}
                                  value={
                                    activeView === "Inbox"
                                      ? isUnread
                                        ? "Unread"
                                        : "Read"
                                      : item.officeRead
                                        ? item.officeReadAt || "Read"
                                        : "Not yet"
                                  }
                                />
                              </div>
                            </div>
                          </button>
                        );
                      })
                    ) : (
                      <div className="rounded-[24px] border border-dashed border-[#d0d7df] bg-[#fafafa] px-5 py-10 text-center text-base font-bold text-[#61748b]">
                        No messages match the current filters.
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="mt-5 rounded-[24px] border border-[#e5e7eb] bg-[#fbfcfd] p-5">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <label>
                      <span className="text-xs font-black uppercase tracking-[0.12em] text-[#61748b]">Message type</span>
                      <select
                        value={composeCategory}
                        onChange={(event) => setComposeCategory(event.target.value as MessageCategory)}
                        className="mt-2 h-12 w-full rounded-xl border border-[#d5dce4] px-3 text-sm font-bold text-[#001b3a] outline-none focus:border-[#c4002f]"
                      >
                        {categoryOptions.map((option) => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                    </label>

                    <label>
                      <span className="text-xs font-black uppercase tracking-[0.12em] text-[#61748b]">Priority</span>
                      <select
                        value={composePriority}
                        onChange={(event) => setComposePriority(event.target.value as Priority)}
                        className="mt-2 h-12 w-full rounded-xl border border-[#d5dce4] px-3 text-sm font-bold text-[#001b3a] outline-none focus:border-[#c4002f]"
                      >
                        <option value="Critical">Critical</option>
                        <option value="High">High</option>
                        <option value="Normal">Normal</option>
                      </select>
                    </label>
                  </div>

                  <label className="mt-4 block">
                    <span className="text-xs font-black uppercase tracking-[0.12em] text-[#61748b]">Message</span>
                    <textarea
                      value={composeMessage}
                      onChange={(event) => setComposeMessage(event.target.value)}
                      rows={8}
                      placeholder="Type the message that should be sent to the transport office."
                      className="mt-2 w-full rounded-[20px] border border-[#d5dce4] px-4 py-4 text-base font-bold text-[#001b3a] outline-none focus:border-[#c4002f]"
                    />
                  </label>

                  <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
                    <ContextCard label="Driver" value={driverName} compact />
                    <ContextCard label="Duty" value={DUTY_NUMBER} compact />
                    <ContextCard label="Date / time" value={new Date().toLocaleString("en-GB")} compact />
                  </div>

                  {composeNotice ? (
                    <div className="mt-4 rounded-2xl border border-[#fecaca] bg-[#fff5f5] px-4 py-3 text-sm font-bold text-[#991b1b]">
                      {composeNotice}
                    </div>
                  ) : null}

                  <div className="mt-5 flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={handleSendMessage}
                      className="rounded-2xl bg-[#c4002f] px-5 py-3 text-sm font-black uppercase tracking-[0.12em] text-white transition hover:opacity-90"
                    >
                      Send message
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setComposeMessage("");
                        setComposePriority("Normal");
                        setComposeCategory("Home VOC Message");
                        setComposeNotice(null);
                      }}
                      className="rounded-2xl border border-[#d5dce4] bg-white px-5 py-3 text-sm font-black uppercase tracking-[0.12em] text-[#001b3a] transition hover:border-[#c4002f]"
                    >
                      Clear
                    </button>
                  </div>
                </div>
              )}
            </section>

            <section className="rounded-[28px] border border-[#d0d7df] bg-white p-5 shadow-sm">
              {activeView === "Compose" ? (
                <>
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-[#c4002f]">Compose guidance</p>
                  <h3 className="mt-3 text-3xl font-black text-[#001b3a]">What this screen now covers</h3>
                  <ul className="mt-4 space-y-3 text-sm font-bold leading-6 text-[#61748b]">
                    <li>• Read and unread office messages are separated using the Inbox filter.</li>
                    <li>• Sent items show whether the office has read the message.</li>
                    <li>• Message categories are fixed to Home VOC Message, Central Postal Control CPC or Breakdown.</li>
                    <li>• Driver name is taken from the signed-in mock driver, duty is fixed as NWH254 and timestamps are generated when the message is sent.</li>
                    <li>• Messages created here use the same storage as Office Communications so they appear on the office screen.</li>
                  </ul>
                </>
              ) : selectedMessage ? (
                <>
                  <div className="flex flex-col gap-3 border-b border-[#e5e7eb] pb-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <CategoryBadge category={resolveCategory(selectedMessage)} />
                      <PriorityBadge priority={selectedMessage.priority} />
                      {activeView === "Inbox" ? (
                        <ReadBadge state={readIds.includes(selectedMessage.id) ? "Read" : "Unread"} />
                      ) : (
                        <ReadBadge state={selectedMessage.officeRead ? "Office read" : "Office unread"} />
                      )}
                    </div>
                    <h3 className="text-3xl font-black text-[#001b3a]">{selectedMessage.title}</h3>
                    <p className="text-base font-bold leading-7 text-[#61748b]">{selectedMessage.summary}</p>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <ContextCard label="Received date" value={normaliseDate(selectedMessage.receivedDate)} compact />
                    <ContextCard label="Received time" value={selectedMessage.received} compact />
                    <ContextCard label="Vehicle ID" value={selectedMessage.vehicle} compact />
                    <ContextCard label="Trailer ID" value={selectedMessage.trailer} compact />
                    <ContextCard label="Office read" value={selectedMessage.officeRead ? selectedMessage.officeReadAt || "Yes" : "Not yet"} compact />
                    <ContextCard label="Direction" value={isIncomingForDriver(selectedMessage) ? "Office to driver" : "Driver to office"} compact />
                  </div>

                  <div className="mt-5">
                    <h4 className="text-sm font-black uppercase tracking-[0.16em] text-[#61748b]">Message thread</h4>
                    <div className="mt-3 space-y-3">
                      {getThread(selectedMessage).map((entry) => (
                        <div key={entry.id} className="rounded-[22px] border border-[#dbe2ea] bg-[#fbfcfd] px-4 py-4">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded-full bg-[#001b3a] px-3 py-1 text-xs font-black uppercase tracking-[0.12em] text-white">{entry.senderName}</span>
                            <PriorityBadge priority={entry.priority} />
                            <span className="text-xs font-black uppercase tracking-[0.12em] text-[#61748b]">{entry.timestamp}</span>
                          </div>
                          <p className="mt-3 text-base font-bold leading-7 text-[#001b3a]">{entry.message}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {activeView === "Inbox" ? (
                    <div className="mt-5 flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={() => handleToggleDriverRead(selectedMessage)}
                        className="rounded-2xl border border-[#d5dce4] bg-white px-5 py-3 text-sm font-black uppercase tracking-[0.12em] text-[#001b3a] transition hover:border-[#c4002f]"
                      >
                        {readIds.includes(selectedMessage.id) ? "Mark as unread" : "Mark as read"}
                      </button>
                    </div>
                  ) : null}
                </>
              ) : (
                <div className="rounded-[24px] border border-dashed border-[#d0d7df] bg-[#fafafa] px-5 py-12 text-center text-base font-bold text-[#61748b]">
                  Select a message to view the detail.
                </div>
              )}
            </section>
          </section>
        </div>
      </section>
    </main>
  );
}

function SummaryCard({ label, value, tone }: { label: string; value: string; tone: "red" | "blue" | "amber" | "green" }) {
  const classes = {
    red: "border-[#fecaca] bg-[#fff5f5] text-[#991b1b]",
    blue: "border-[#bfdbfe] bg-[#eff6ff] text-[#1d4ed8]",
    amber: "border-[#fde68a] bg-[#fffbeb] text-[#b45309]",
    green: "border-[#bbf7d0] bg-[#f0fdf4] text-[#166534]",
  }[tone];

  return (
    <div className={`rounded-[22px] border px-4 py-4 ${classes}`}>
      <p className="text-xs font-black uppercase tracking-[0.16em]">{label}</p>
      <p className="mt-2 text-3xl font-black">{value}</p>
    </div>
  );
}

function ContextCard({ label, value, compact = false }: { label: string; value: string; compact?: boolean }) {
  return (
    <div className={`rounded-2xl border border-[#dbe2ea] bg-[#f8fafc] ${compact ? "px-4 py-3" : "px-4 py-4"}`}>
      <p className="text-xs font-black uppercase tracking-[0.14em] text-[#61748b]">{label}</p>
      <p className={`mt-2 font-black text-[#001b3a] ${compact ? "text-sm" : "text-base"}`}>{value}</p>
    </div>
  );
}

function MetaBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[#e5e7eb] bg-[#f8fafc] px-3 py-3">
      <p className="text-[11px] font-black uppercase tracking-[0.12em] text-[#61748b]">{label}</p>
      <p className="mt-1 text-sm font-black text-[#001b3a]">{value}</p>
    </div>
  );
}

function CategoryBadge({ category }: { category: MessageCategory }) {
  const classes =
    category === "Breakdown"
      ? "border-[#fca5a5] bg-[#fff1f2] text-[#b91c1c]"
      : category === "Central Postal Control CPC"
        ? "border-[#bfdbfe] bg-[#eff6ff] text-[#1d4ed8]"
        : "border-[#fcd34d] bg-[#fffbeb] text-[#92400e]";

  return <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-black uppercase tracking-[0.12em] ${classes}`}>{category}</span>;
}

function PriorityBadge({ priority }: { priority: Priority }) {
  const classes =
    priority === "Critical"
      ? "border-[#ef4444] bg-[#fff1f2] text-[#b91c1c]"
      : priority === "High"
        ? "border-[#f59e0b] bg-[#fff7ed] text-[#b45309]"
        : "border-[#60a5fa] bg-[#eff6ff] text-[#2563eb]";

  return <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-black ${classes}`}>{priority}</span>;
}

function ReadBadge({ state }: { state: "Unread" | "Read" | "Office unread" | "Office read" }) {
  const classes =
    state === "Unread" || state === "Office unread"
      ? "border-[#ef4444] bg-[#fff1f2] text-[#b91c1c]"
      : "border-[#16a34a] bg-[#f0fdf4] text-[#166534]";

  return <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-black uppercase tracking-[0.12em] ${classes}`}>{state}</span>;
}

function readCommsItems(): CommsItem[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = localStorage.getItem(COMMS_OPEN_STORAGE_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeCommsItems(items: CommsItem[]) {
  localStorage.setItem(COMMS_OPEN_STORAGE_KEY, JSON.stringify(items));
}

function readDriverReadIds(): string[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = localStorage.getItem(DRIVER_MESSAGE_READ_STORAGE_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((value) => typeof value === "string") : [];
  } catch {
    return [];
  }
}

function writeDriverReadIds(ids: string[]) {
  localStorage.setItem(DRIVER_MESSAGE_READ_STORAGE_KEY, JSON.stringify(ids));
}

function isForCurrentDriver(item: CommsItem, driverName: string) {
  return normaliseString(item.driver) === normaliseString(driverName);
}

function isIncomingForDriver(item: CommsItem) {
  return item.message?.direction === "Office to driver";
}

function isOutgoingFromDriver(item: CommsItem) {
  return item.message?.direction === "Driver to office" || (item.source === "Breakdown" && !item.message);
}

function matchesCommonFilters(
  item: CommsItem,
  search: string,
  categoryFilter: MessageCategory | "All",
  priorityFilter: Priority | "All",
) {
  if (priorityFilter !== "All" && item.priority !== priorityFilter) {
    return false;
  }

  const category = resolveCategory(item);
  if (categoryFilter !== "All" && category !== categoryFilter) {
    return false;
  }

  if (search.trim()) {
    const haystack = `${item.title} ${item.summary} ${item.message?.messageText || ""} ${item.breakdown?.fault || ""}`.toLowerCase();
    if (!haystack.includes(search.trim().toLowerCase())) {
      return false;
    }
  }

  return true;
}

function resolveCategory(item: CommsItem): MessageCategory {
  if (item.source === "Breakdown") {
    return "Breakdown";
  }

  const route = item.message?.route?.toLowerCase() || "";
  const title = `${item.title} ${item.summary}`.toLowerCase();

  if (route.includes("cpc") || title.includes("cpc")) {
    return "Central Postal Control CPC";
  }

  return "Home VOC Message";
}

function getThread(item: CommsItem): MessageThreadEntry[] {
  if (Array.isArray(item.messageThread) && item.messageThread.length) {
    return item.messageThread;
  }

  return [
    {
      id: `${item.id}-fallback`,
      sender: isIncomingForDriver(item) ? "Office" : "Driver",
      senderName: isIncomingForDriver(item) ? "Transport office" : item.driver,
      message: item.message?.messageText || item.breakdown?.fault || item.summary,
      timestamp: `${normaliseDate(item.receivedDate)} ${item.received}`,
      priority: item.priority,
      direction: item.message?.direction || "Driver to office",
    },
  ];
}

function normaliseString(value: string) {
  return value.trim().toLowerCase();
}

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function formatDate(date: Date) {
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`;
}

function formatTime(date: Date) {
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function normaliseDate(value: string) {
  const parts = value.split("/");
  if (parts.length !== 3) {
    return value;
  }

  if (parts[2].length === 2) {
    return `${parts[0]}/${parts[1]}/20${parts[2]}`;
  }

  return value;
}
