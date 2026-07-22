"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { useDriverName } from "../../DriverName";
import VehicleCheckTimer from "../../vehicle-checks/VehicleCheckTimer";
import {
  DRIVER_MESSAGE_STORE_CHANGED_EVENT,
  getIncomingReadKey,
  getLatestDriverMessage,
  getLatestOfficeMessage,
  getMessageThread,
  isForDriverDuty,
  normaliseDate,
  readDriverReadKeys,
  readOpenCommsItems,
  type DriverCommsItem,
  type DriverMessagePriority,
  writeDriverReadKeys,
  writeOpenCommsItems,
} from "../driverMessageSync";

type MessageCategory = "Home VOC Message" | "Central Postal Control CPC" | "Breakdown";
type DriverView = "Inbox" | "Sent" | "Compose";
type InboxFilter = "Unread" | "Read" | "All";

type ClearedMessageRecord = {
  itemId: string;
  readKey: string;
  item: DriverCommsItem;
  clearedAt: number;
  expiresAt: number;
};
type SentFilter = "All" | "Office unread" | "Office read";

const DUTY_NUMBER = "NWH254";
const VEHICLE_ID = "PE68UHD";
const TRAILER_ID = "7338014";
const DRIVER_CLEARED_MESSAGE_STORAGE_KEY = "driver-messaging-cleared-history";
const UNREAD_RETENTION_MS = 7 * 24 * 60 * 60 * 1000;
const CLEARED_HISTORY_RETENTION_MS = 24 * 60 * 60 * 1000;
const categories: MessageCategory[] = ["Home VOC Message", "Central Postal Control CPC", "Breakdown"];

export default function MessagingPage() {
  const driverName = useDriverName();
  const [activeView, setActiveView] = useState<DriverView>("Inbox");
  const [items, setItems] = useState<DriverCommsItem[]>([]);
  const [readKeys, setReadKeys] = useState<string[]>([]);
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<MessageCategory | "All">("All");
  const [priorityFilter, setPriorityFilter] = useState<DriverMessagePriority | "All">("All");
  const [inboxFilter, setInboxFilter] = useState<InboxFilter>("Unread");
  const [sentFilter, setSentFilter] = useState<SentFilter>("All");
  const [composeCategory, setComposeCategory] = useState<MessageCategory>("Home VOC Message");
  const [composePriority, setComposePriority] = useState<DriverMessagePriority>("Normal");
  const [composeMessage, setComposeMessage] = useState("");
  const [notice, setNotice] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [replyNotice, setReplyNotice] = useState<string | null>(null);
  const [clearedRecords, setClearedRecords] = useState<ClearedMessageRecord[]>([]);
  const [clock, setClock] = useState(() => Date.now());

  useEffect(() => {
    function refresh() {
      setItems(readOpenCommsItems());
      setReadKeys(readDriverReadKeys());
      setClearedRecords(readClearedMessageRecords());
      setClock(Date.now());
    }

    refresh();
    const clockTimer = window.setInterval(() => setClock(Date.now()), 60000);
    window.addEventListener("storage", refresh);
    window.addEventListener("focus", refresh);
    window.addEventListener(DRIVER_MESSAGE_STORE_CHANGED_EVENT, refresh);

    return () => {
      window.clearInterval(clockTimer);
      window.removeEventListener("storage", refresh);
      window.removeEventListener("focus", refresh);
      window.removeEventListener(DRIVER_MESSAGE_STORE_CHANGED_EVENT, refresh);
    };
  }, []);

  const allItems = useMemo(() => {
    const activeHistoryItems = clearedRecords
      .filter((record) => record.expiresAt > clock)
      .map((record) => record.item);
    const byId = new Map<string, DriverCommsItem>();

    activeHistoryItems.forEach((item) => byId.set(item.id, item));
    items.forEach((item) => byId.set(item.id, item));

    return Array.from(byId.values());
  }, [items, clearedRecords, clock]);

  const inboxItems = useMemo(() => {
    return allItems
      .filter((item) => isForDriverDuty(item, driverName, DUTY_NUMBER) && Boolean(getLatestOfficeMessage(item)))
      .filter((item) => shouldShowInboxItem(item, readKeys, clearedRecords, clock))
      .filter((item) => matchesFilters(item, "Inbox", search, categoryFilter, priorityFilter))
      .sort((a, b) => getMessageTime(b, "Inbox") - getMessageTime(a, "Inbox"));
  }, [allItems, driverName, search, categoryFilter, priorityFilter, readKeys, clearedRecords, clock]);

  const sentItems = useMemo(() => {
    return allItems
      .filter((item) => isForDriverDuty(item, driverName, DUTY_NUMBER) && Boolean(getLatestDriverMessage(item)))
      .filter((item) => matchesFilters(item, "Sent", search, categoryFilter, priorityFilter))
      .sort((a, b) => getMessageTime(b, "Sent") - getMessageTime(a, "Sent"));
  }, [allItems, driverName, search, categoryFilter, priorityFilter]);

  const visibleInbox = useMemo(() => {
    return inboxItems.filter((item) => {
      const isRead = readKeys.includes(getIncomingReadKey(item));
      if (inboxFilter === "Unread") return !isRead || item.id === selectedMessageId;
      if (inboxFilter === "Read") return isRead;
      return true;
    });
  }, [inboxItems, inboxFilter, readKeys, selectedMessageId]);

  const visibleSent = useMemo(() => {
    return sentItems.filter((item) => {
      if (sentFilter === "Office unread") return !item.officeRead;
      if (sentFilter === "Office read") return Boolean(item.officeRead);
      return true;
    });
  }, [sentItems, sentFilter]);

  const unreadCount = inboxItems.filter((item) => !readKeys.includes(getIncomingReadKey(item))).length;
  const readCount = inboxItems.length - unreadCount;
  const officeUnreadCount = sentItems.filter((item) => !item.officeRead).length;
  const officeReadCount = sentItems.length - officeUnreadCount;
  const displayedItems = activeView === "Inbox" ? visibleInbox : visibleSent;
  const selectedMessage =
    displayedItems.find((item) => item.id === selectedMessageId) ||
    allItems.find((item) => item.id === selectedMessageId) ||
    null;

  function openMessage(item: DriverCommsItem) {
    setSelectedMessageId((current) => (current === item.id ? null : item.id));
    setReplyText("");
    setReplyNotice(null);

    if (activeView === "Inbox") {
      const readKey = getIncomingReadKey(item);
      if (!readKeys.includes(readKey)) {
        const readAt = new Date().toLocaleString("en-GB");
        const nextKeys = [...readKeys, readKey];
        const nextItems = items.map((currentItem) =>
          currentItem.id === item.id
            ? { ...currentItem, driverReadConfirmed: true, readConfirmedAt: readAt }
            : currentItem,
        );

        setReadKeys(nextKeys);
        setItems(nextItems);
        writeDriverReadKeys(nextKeys);
        writeOpenCommsItems(nextItems);
      }
    }
  }

  function changeView(view: DriverView) {
    setActiveView(view);
    setSelectedMessageId(null);
    setNotice(null);
    if (view === "Inbox") setInboxFilter("Unread");
    setReplyText("");
    setReplyNotice(null);
  }

  function replyToMessage(item: DriverCommsItem) {
    const cleanReply = replyText.trim();
    if (!cleanReply) {
      setReplyNotice("Please type a reply before sending.");
      return;
    }

    const now = new Date();
    const latestOfficeMessage = getLatestOfficeMessage(item);
    const replyPriority = latestOfficeMessage?.priority || item.priority;
    const replyEntry = {
      id: `${item.id}-driver-reply-${Date.now()}`,
      sender: "Driver" as const,
      senderName: driverName,
      message: cleanReply,
      timestamp: now.toLocaleString("en-GB"),
      priority: replyPriority,
      direction: "Driver to office" as const,
    };
    const updatedItem: DriverCommsItem = {
      ...item,
      status: "New",
      priority: replyPriority,
      summary: `Driver reply: ${cleanReply}`,
      message: {
        messageText: cleanReply,
        route: resolveCategory(item),
        direction: "Driver to office",
      },
      messageThread: [...getMessageThread(item), replyEntry],
      retainUntilDriverRead: false,
      driverReadConfirmed: true,
      readConfirmedAt: now.toLocaleString("en-GB"),
      officeRead: false,
      officeReadAt: undefined,
    };
    const nextItems = items.some((currentItem) => currentItem.id === item.id)
      ? items.map((currentItem) => (currentItem.id === item.id ? updatedItem : currentItem))
      : [updatedItem, ...items];
    const nextClearedRecords = clearedRecords.filter((record) => record.itemId !== item.id);

    setItems(nextItems);
    setClearedRecords(nextClearedRecords);
    writeOpenCommsItems(nextItems);
    writeClearedMessageRecords(nextClearedRecords);
    setReplyText("");
    setReplyNotice(`Reply sent at ${now.toLocaleString("en-GB")}. It is now visible in Office Communications.`);
  }

  function clearMessage(item: DriverCommsItem) {
    const now = Date.now();
    const readKey = getIncomingReadKey(item);
    const readAt = new Date(now).toLocaleString("en-GB");
    const readItem: DriverCommsItem = {
      ...item,
      driverReadConfirmed: true,
      readConfirmedAt: item.readConfirmedAt || readAt,
    };
    const nextKeys = readKeys.includes(readKey) ? readKeys : [...readKeys, readKey];
    const nextItems = items.map((currentItem) => (currentItem.id === item.id ? readItem : currentItem));
    const nextRecord: ClearedMessageRecord = {
      itemId: item.id,
      readKey,
      item: readItem,
      clearedAt: now,
      expiresAt: now + CLEARED_HISTORY_RETENTION_MS,
    };
    const nextClearedRecords = [nextRecord, ...clearedRecords.filter((record) => record.itemId !== item.id)];

    setReadKeys(nextKeys);
    setItems(nextItems);
    setClearedRecords(nextClearedRecords);
    writeDriverReadKeys(nextKeys);
    writeOpenCommsItems(nextItems);
    writeClearedMessageRecords(nextClearedRecords);
    setSelectedMessageId(null);
    setReplyText("");
    setReplyNotice(null);
    setNotice("Message cleared. It remains available under Read / All Messages for 24 hours.");
  }

  function sendMessage() {
    const text = composeMessage.trim();
    if (!text) {
      setNotice("Please type a message before sending.");
      return;
    }

    const now = new Date();
    const id = `DRV-${Date.now()}`;
    const newItem: DriverCommsItem = {
      id,
      source: composeCategory === "Breakdown" ? "Breakdown" : "Messaging",
      priority: composePriority,
      status: "New",
      duty: DUTY_NUMBER,
      driver: driverName,
      vehicle: VEHICLE_ID,
      trailer: TRAILER_ID,
      received: formatTime(now),
      receivedDate: formatDate(now),
      title: composeCategory,
      summary: text,
      message:
        composeCategory === "Breakdown"
          ? undefined
          : { messageText: text, route: composeCategory, direction: "Driver to office" },
      breakdown:
        composeCategory === "Breakdown"
          ? {
              location: "Driver PDA mock location",
              direction: "Driver generated message",
              fault: text,
              safeStatus: "Driver has requested office support.",
              supportNeeded: text,
              photos: "No photos attached",
            }
          : undefined,
      messageThread: [
        {
          id: `${id}-driver`,
          sender: "Driver",
          senderName: driverName,
          message: text,
          timestamp: now.toLocaleString("en-GB"),
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
    writeOpenCommsItems(nextItems);
    setComposeMessage("");
    setComposePriority("Normal");
    setComposeCategory("Home VOC Message");
    setNotice(`Message sent at ${now.toLocaleString("en-GB")}. It is now visible in Office Communications.`);
    setActiveView("Sent");
    setSelectedMessageId(null);
  }

  return (
    <main className="min-h-screen bg-[#f4f1ec] font-sans text-[#001b3a]">
      <header className="bg-[#c4002f] px-4 py-5 text-white sm:px-6 lg:px-10">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border-2 border-white text-base font-black">HGV</div>
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
            <Link href="/internal/app-ideas" className="rounded-2xl border border-white/30 bg-white/10 px-5 py-3 text-sm font-black text-white no-underline transition hover:bg-white/20">Back</Link>
          </div>
        </div>
      </header>

      <section className="px-4 py-7 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-[1440px]">
          <section className="rounded-[28px] border border-[#d0d7df] bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-[#c4002f]">Messaging mockup</p>
                <h2 className="mt-3 text-4xl font-black leading-tight text-[#001b3a] sm:text-5xl">Driver message centre</h2>
                <p className="mt-4 max-w-[760px] text-base font-bold leading-7 text-[#61748b]">
                  View unread and read office messages, check whether the office has read sent messages, or write a new message.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
                <SummaryCard label="Unread" value={String(unreadCount)} tone="red" />
                <SummaryCard label="Read" value={String(readCount)} tone="blue" />
                <SummaryCard label="Office unread" value={String(officeUnreadCount)} tone="amber" />
                <SummaryCard label="Office read" value={String(officeReadCount)} tone="green" />
              </div>
            </div>
          </section>

          <section className="mt-5 rounded-[28px] border border-[#d0d7df] bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-4 border-b border-[#e5e7eb] pb-4 xl:flex-row xl:items-center xl:justify-between">
              <div className="inline-flex flex-wrap gap-2 rounded-2xl bg-[#f4f6f8] p-2">
                {(["Inbox", "Sent", "Compose"] as DriverView[]).map((view) => (
                  <button key={view} type="button" onClick={() => changeView(view)} className={`rounded-2xl px-5 py-3 text-sm font-black transition ${activeView === view ? "bg-[#001b3a] text-white" : "text-[#001b3a] hover:bg-white"}`}>
                    {view}{view === "Inbox" && unreadCount ? ` (${unreadCount})` : ""}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <InfoTile label="Duty" value={DUTY_NUMBER} />
                <InfoTile label="Vehicle ID" value={VEHICLE_ID} />
                <InfoTile label="Trailer ID" value={TRAILER_ID} />
              </div>
            </div>

            {activeView === "Compose" ? (
              <ComposePanel
                category={composeCategory}
                priority={composePriority}
                message={composeMessage}
                notice={notice}
                driverName={driverName}
                onCategoryChange={setComposeCategory}
                onPriorityChange={setComposePriority}
                onMessageChange={setComposeMessage}
                onSend={sendMessage}
                onClear={() => {
                  setComposeMessage("");
                  setComposePriority("Normal");
                  setComposeCategory("Home VOC Message");
                  setNotice(null);
                }}
              />
            ) : (
              <>
                <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-5">
                  <FilterInput label="Search" value={search} onChange={setSearch} />
                  <FilterSelect label="Category" value={categoryFilter} onChange={(value) => setCategoryFilter(value as MessageCategory | "All")} options={["All", ...categories]} />
                  <FilterSelect label="Priority" value={priorityFilter} onChange={(value) => setPriorityFilter(value as DriverMessagePriority | "All")} options={["All", "Critical", "High", "Normal"]} />
                  {activeView === "Inbox" ? (
                    <FilterSelect label="Read status" value={inboxFilter} onChange={(value) => setInboxFilter(value as InboxFilter)} options={["All", "Unread", "Read"]} />
                  ) : (
                    <FilterSelect label="Office read" value={sentFilter} onChange={(value) => setSentFilter(value as SentFilter)} options={["All", "Office unread", "Office read"]} />
                  )}
                  <div className="flex items-end"><div className="w-full rounded-xl border border-[#d5dce4] bg-[#f8fafc] px-4 py-3 text-sm font-bold text-[#4b5563]">Showing <span className="font-black text-[#001b3a]">{displayedItems.length}</span> message(s)</div></div>
                </div>

                {notice ? (
                  <div className="mt-4 rounded-2xl border border-[#bfdbfe] bg-[#eff6ff] px-4 py-3 text-sm font-bold text-[#1e3a8a]">{notice}</div>
                ) : null}

                <MessageTable
                  items={displayedItems}
                  mode={activeView}
                  readKeys={readKeys}
                  selectedMessageId={selectedMessageId}
                  onOpen={openMessage}
                />

                {selectedMessage ? (
                  <ConversationPanel
                    item={selectedMessage}
                    mode={activeView}
                    replyText={replyText}
                    replyNotice={replyNotice}
                    onReplyTextChange={setReplyText}
                    onReply={() => replyToMessage(selectedMessage)}
                    onClear={() => clearMessage(selectedMessage)}
                  />
                ) : null}
              </>
            )}
          </section>
        </div>
      </section>
    </main>
  );
}

function MessageTable({
  items,
  mode,
  readKeys,
  selectedMessageId,
  onOpen,
}: {
  items: DriverCommsItem[];
  mode: "Inbox" | "Sent";
  readKeys: string[];
  selectedMessageId: string | null;
  onOpen: (item: DriverCommsItem) => void;
}) {
  return (
    <div className="mt-5 overflow-x-auto rounded-[22px] border border-[#dbe2ea]">
      <table className="w-full min-w-[1050px] border-collapse text-left text-sm">
        <thead className="bg-[#f8fafc] text-xs font-black uppercase tracking-[0.14em] text-[#61748b]">
          <tr>
            <th className="px-4 py-4">Category</th>
            <th className="px-4 py-4">Priority</th>
            <th className="px-4 py-4">Message</th>
            <th className="px-4 py-4">Received</th>
            <th className="px-4 py-4">{mode === "Inbox" ? "Driver read" : "Office read"}</th>
          </tr>
        </thead>
        <tbody>
          {items.length ? items.map((item) => {
            const officeMessage = getLatestOfficeMessage(item);
            const driverMessage = getLatestDriverMessage(item);
            const displayMessage = mode === "Inbox" ? officeMessage : driverMessage;
            const isRead = mode === "Inbox" ? readKeys.includes(getIncomingReadKey(item)) : Boolean(item.officeRead);
            const selected = selectedMessageId === item.id;

            return (
              <tr
                key={item.id}
                onClick={() => onOpen(item)}
                className={`cursor-pointer border-t border-[#e5e7eb] transition ${selected ? "bg-[#fff3f5]" : isRead ? "bg-white hover:bg-[#fafafa]" : "bg-[#eff6ff] hover:bg-[#e6f0ff]"}`}
              >
                <td className="px-4 py-4"><CategoryBadge category={resolveCategory(item)} /></td>
                <td className="px-4 py-4"><PriorityBadge priority={displayMessage?.priority || item.priority} /></td>
                <td className="px-4 py-4">
                  <p className="max-w-[620px] truncate text-base font-black text-[#001b3a]">{displayMessage?.message || item.summary}</p>
                  <p className="mt-1 text-xs font-bold text-[#61748b]">Duty {item.duty} • {item.vehicle} / {item.trailer}</p>
                </td>
                <td className="whitespace-nowrap px-4 py-4 font-black text-[#001b3a]">{displayMessage?.timestamp || `${normaliseDate(item.receivedDate)} ${item.received}`}</td>
                <td className="px-4 py-4"><ReadBadge state={mode === "Inbox" ? (isRead ? "Read" : "Unread") : (isRead ? "Office read" : "Office unread")} /></td>
              </tr>
            );
          }) : (
            <tr><td colSpan={5} className="px-5 py-12 text-center text-base font-bold text-[#61748b]">No messages match the current filters.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function ConversationPanel({
  item,
  mode,
  replyText,
  replyNotice,
  onReplyTextChange,
  onReply,
  onClear,
}: {
  item: DriverCommsItem;
  mode: "Inbox" | "Sent";
  replyText: string;
  replyNotice: string | null;
  onReplyTextChange: (value: string) => void;
  onReply: () => void;
  onClear: () => void;
}) {
  return (
    <section className="mt-5 rounded-[24px] border border-[#dbe2ea] bg-[#f8fafc] p-5">
      <div className="flex flex-wrap items-center gap-2">
        <CategoryBadge category={resolveCategory(item)} />
        <PriorityBadge priority={(mode === "Inbox" ? getLatestOfficeMessage(item)?.priority : getLatestDriverMessage(item)?.priority) || item.priority} />
      </div>
      <h3 className="mt-4 text-2xl font-black text-[#001b3a]">Conversation</h3>
      <div className="mt-4 space-y-3">
        {getMessageThread(item).map((entry) => {
          const fromDriver = entry.direction === "Driver to office";
          return (
            <div key={entry.id} className={`flex ${fromDriver ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[78%] rounded-[22px] px-4 py-3 shadow-sm ${fromDriver ? "bg-[#c4002f] text-white" : "border border-[#dbe2ea] bg-white text-[#001b3a]"}`}>
                <p className="text-xs font-black uppercase tracking-[0.12em] opacity-75">{entry.senderName} • {entry.timestamp}</p>
                <p className="mt-2 text-base font-bold leading-6">{entry.message}</p>
              </div>
            </div>
          );
        })}
      </div>

      {mode === "Inbox" ? (
        <div className="mt-5 border-t border-[#dbe2ea] pt-5">
          <label className="block">
            <span className="text-xs font-black uppercase tracking-[0.12em] text-[#61748b]">Reply to message</span>
            <textarea
              value={replyText}
              onChange={(event) => onReplyTextChange(event.target.value)}
              rows={3}
              placeholder="Type a reply to the transport office."
              className="mt-2 w-full rounded-[20px] border border-[#d5dce4] bg-white px-4 py-4 text-base font-bold text-[#001b3a] outline-none focus:border-[#c4002f]"
            />
          </label>
          {replyNotice ? (
            <div className="mt-3 rounded-2xl border border-[#bbf7d0] bg-[#f0fdf4] px-4 py-3 text-sm font-bold text-[#166534]">{replyNotice}</div>
          ) : null}
          <div className="mt-4 flex flex-wrap gap-3">
            <button type="button" onClick={onReply} className="rounded-2xl bg-[#c4002f] px-5 py-3 text-sm font-black uppercase tracking-[0.12em] text-white">
              Reply to message
            </button>
            <button type="button" onClick={onClear} className="rounded-2xl border border-[#d5dce4] bg-white px-5 py-3 text-sm font-black uppercase tracking-[0.12em] text-[#001b3a]">
              Clear message
            </button>
          </div>
          <p className="mt-3 text-sm font-bold text-[#61748b]">Cleared messages remain available in Read / All Messages for 24 hours. Unread messages remain visible for up to 7 days.</p>
        </div>
      ) : null}
    </section>
  );
}

function ComposePanel({
  category,
  priority,
  message,
  notice,
  driverName,
  onCategoryChange,
  onPriorityChange,
  onMessageChange,
  onSend,
  onClear,
}: {
  category: MessageCategory;
  priority: DriverMessagePriority;
  message: string;
  notice: string | null;
  driverName: string;
  onCategoryChange: (value: MessageCategory) => void;
  onPriorityChange: (value: DriverMessagePriority) => void;
  onMessageChange: (value: string) => void;
  onSend: () => void;
  onClear: () => void;
}) {
  return (
    <div className="mt-5 rounded-[24px] border border-[#e5e7eb] bg-[#fbfcfd] p-5">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <FilterSelect label="Message type" value={category} onChange={(value) => onCategoryChange(value as MessageCategory)} options={categories} />
        <FilterSelect label="Priority" value={priority} onChange={(value) => onPriorityChange(value as DriverMessagePriority)} options={["Critical", "High", "Normal"]} />
      </div>
      <label className="mt-4 block">
        <span className="text-xs font-black uppercase tracking-[0.12em] text-[#61748b]">Message</span>
        <textarea value={message} onChange={(event) => onMessageChange(event.target.value)} rows={7} placeholder="Type your message to the transport office." className="mt-2 w-full rounded-[20px] border border-[#d5dce4] px-4 py-4 text-base font-bold text-[#001b3a] outline-none focus:border-[#c4002f]" />
      </label>
      <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
        <InfoTile label="Driver" value={driverName} />
        <InfoTile label="Duty" value={DUTY_NUMBER} />
        <InfoTile label="Date / time" value={new Date().toLocaleString("en-GB")} />
      </div>
      {notice ? <div className="mt-4 rounded-2xl border border-[#fecaca] bg-[#fff5f5] px-4 py-3 text-sm font-bold text-[#991b1b]">{notice}</div> : null}
      <div className="mt-5 flex flex-wrap gap-3">
        <button type="button" onClick={onSend} className="rounded-2xl bg-[#c4002f] px-5 py-3 text-sm font-black uppercase tracking-[0.12em] text-white">Send message</button>
        <button type="button" onClick={onClear} className="rounded-2xl border border-[#d5dce4] bg-white px-5 py-3 text-sm font-black uppercase tracking-[0.12em] text-[#001b3a]">Clear</button>
      </div>
    </div>
  );
}

function shouldShowInboxItem(
  item: DriverCommsItem,
  readKeys: string[],
  clearedRecords: ClearedMessageRecord[],
  now: number,
) {
  const readKey = getIncomingReadKey(item);
  const clearRecord = clearedRecords.find((record) => record.itemId === item.id);

  if (clearRecord && clearRecord.readKey === readKey) {
    return clearRecord.expiresAt > now;
  }

  if (readKeys.includes(readKey)) {
    return true;
  }

  const latestOfficeMessage = getLatestOfficeMessage(item);
  const receivedAt = latestOfficeMessage ? parseMessageTimestamp(latestOfficeMessage.timestamp) : getMessageTime(item, "Inbox");
  return receivedAt === 0 || receivedAt >= now - UNREAD_RETENTION_MS;
}

function readClearedMessageRecords(): ClearedMessageRecord[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(DRIVER_CLEARED_MESSAGE_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter(
          (record): record is ClearedMessageRecord =>
            Boolean(record) &&
            typeof record.itemId === "string" &&
            typeof record.readKey === "string" &&
            typeof record.clearedAt === "number" &&
            typeof record.expiresAt === "number" &&
            Boolean(record.item),
        )
      : [];
  } catch {
    return [];
  }
}

function writeClearedMessageRecords(records: ClearedMessageRecord[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(DRIVER_CLEARED_MESSAGE_STORAGE_KEY, JSON.stringify(records));
  window.dispatchEvent(new Event(DRIVER_MESSAGE_STORE_CHANGED_EVENT));
}

function parseMessageTimestamp(timestamp: string) {
  const ukMatch = timestamp.match(/(\d{1,2})\/(\d{1,2})\/(\d{2,4})[, ]+\s*(\d{1,2}):(\d{2})(?::(\d{2}))?/);
  if (ukMatch) {
    const [, dayText, monthText, yearText, hourText, minuteText, secondText = "0"] = ukMatch;
    const year = Number(yearText.length === 2 ? `20${yearText}` : yearText);
    return new Date(year, Number(monthText) - 1, Number(dayText), Number(hourText), Number(minuteText), Number(secondText)).getTime();
  }

  const parsed = Date.parse(timestamp);
  return Number.isNaN(parsed) ? 0 : parsed;
}

function matchesFilters(item: DriverCommsItem, mode: "Inbox" | "Sent", search: string, category: MessageCategory | "All", priority: DriverMessagePriority | "All") {
  const displayMessage = mode === "Inbox" ? getLatestOfficeMessage(item) : getLatestDriverMessage(item);
  if (!displayMessage) return false;
  if (priority !== "All" && displayMessage.priority !== priority) return false;
  if (category !== "All" && resolveCategory(item) !== category) return false;
  if (search.trim()) {
    const haystack = `${displayMessage.message} ${item.summary} ${item.title}`.toLowerCase();
    if (!haystack.includes(search.trim().toLowerCase())) return false;
  }
  return true;
}

function getMessageTime(item: DriverCommsItem, mode: "Inbox" | "Sent") {
  const entry = mode === "Inbox" ? getLatestOfficeMessage(item) : getLatestDriverMessage(item);
  if (!entry) return 0;

  const ukMatch = entry.timestamp.match(/(\d{1,2})\/(\d{1,2})\/(\d{2,4})[, ]+\s*(\d{1,2}):(\d{2})(?::(\d{2}))?/);
  if (ukMatch) {
    const [, dayText, monthText, yearText, hourText, minuteText, secondText = "0"] = ukMatch;
    const year = Number(yearText.length === 2 ? `20${yearText}` : yearText);
    return new Date(year, Number(monthText) - 1, Number(dayText), Number(hourText), Number(minuteText), Number(secondText)).getTime();
  }

  const parsed = Date.parse(entry.timestamp);
  return Number.isNaN(parsed) ? 0 : parsed;
}

function resolveCategory(item: DriverCommsItem): MessageCategory {
  if (item.source === "Breakdown") return "Breakdown";
  const text = `${item.message?.route || ""} ${item.title} ${item.summary}`.toLowerCase();
  return text.includes("cpc") ? "Central Postal Control CPC" : "Home VOC Message";
}

function SummaryCard({ label, value, tone }: { label: string; value: string; tone: "red" | "blue" | "amber" | "green" }) {
  const classes = { red: "border-[#fecaca] bg-[#fff5f5] text-[#991b1b]", blue: "border-[#bfdbfe] bg-[#eff6ff] text-[#1d4ed8]", amber: "border-[#fde68a] bg-[#fffbeb] text-[#b45309]", green: "border-[#bbf7d0] bg-[#f0fdf4] text-[#166534]" }[tone];
  return <div className={`rounded-[22px] border px-4 py-4 ${classes}`}><p className="text-xs font-black uppercase tracking-[0.16em]">{label}</p><p className="mt-2 text-3xl font-black">{value}</p></div>;
}

function InfoTile({ label, value }: { label: string; value: string }) {
  return <div className="rounded-2xl border border-[#dbe2ea] bg-[#f8fafc] px-4 py-3"><p className="text-xs font-black uppercase tracking-[0.14em] text-[#61748b]">{label}</p><p className="mt-2 text-sm font-black text-[#001b3a]">{value}</p></div>;
}

function FilterInput({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return <label><span className="text-xs font-black uppercase tracking-[0.12em] text-[#61748b]">{label}</span><input value={value} onChange={(event) => onChange(event.target.value)} placeholder="Search message text" className="mt-2 h-11 w-full rounded-xl border border-[#d5dce4] px-3 text-sm font-bold text-[#001b3a] outline-none focus:border-[#c4002f]" /></label>;
}

function FilterSelect({ label, value, options, onChange }: { label: string; value: string; options: readonly string[]; onChange: (value: string) => void }) {
  return <label><span className="text-xs font-black uppercase tracking-[0.12em] text-[#61748b]">{label}</span><select value={value} onChange={(event) => onChange(event.target.value)} className="mt-2 h-11 w-full rounded-xl border border-[#d5dce4] px-3 text-sm font-bold text-[#001b3a] outline-none focus:border-[#c4002f]">{options.map((option) => {
    const optionLabel = option === "All" && label === "Read status" ? "All Messages" : option === "All" ? `All ${label.toLowerCase()}` : option;
    return <option key={option} value={option}>{optionLabel}</option>;
  })}</select></label>;
}

function CategoryBadge({ category }: { category: MessageCategory }) {
  const classes = category === "Breakdown" ? "border-[#fca5a5] bg-[#fff1f2] text-[#b91c1c]" : category === "Central Postal Control CPC" ? "border-[#bfdbfe] bg-[#eff6ff] text-[#1d4ed8]" : "border-[#fcd34d] bg-[#fffbeb] text-[#92400e]";
  return <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-black uppercase tracking-[0.12em] ${classes}`}>{category}</span>;
}

function PriorityBadge({ priority }: { priority: DriverMessagePriority }) {
  const classes = priority === "Critical" ? "border-[#ef4444] bg-[#fff1f2] text-[#b91c1c]" : priority === "High" ? "border-[#f59e0b] bg-[#fff7ed] text-[#b45309]" : "border-[#60a5fa] bg-[#eff6ff] text-[#2563eb]";
  return <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-black ${classes}`}>{priority}</span>;
}

function ReadBadge({ state }: { state: "Unread" | "Read" | "Office unread" | "Office read" }) {
  const classes = state === "Unread" || state === "Office unread" ? "border-[#ef4444] bg-[#fff1f2] text-[#b91c1c]" : "border-[#16a34a] bg-[#f0fdf4] text-[#166534]";
  return <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-black uppercase tracking-[0.12em] ${classes}`}>{state}</span>;
}

function pad(value: number) { return String(value).padStart(2, "0"); }
function formatDate(date: Date) { return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`; }
function formatTime(date: Date) { return `${pad(date.getHours())}:${pad(date.getMinutes())}`; }
