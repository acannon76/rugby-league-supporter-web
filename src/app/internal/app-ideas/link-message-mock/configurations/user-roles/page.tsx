"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type Tab = "roles" | "locations" | "permissions";

type MockUser = {
  id: string;
  name: string;
  email: string;
  employeeId: string;
  roles: string[];
  sites: string[];
};

type PermissionRow = {
  functionName: string;
  ui: string;
  access: string[];
};

type SidebarItem = {
  label: string;
  icon: string;
  href: string;
  alertCount?: number;
  active?: boolean;
};

const sidebarItems: SidebarItem[] = [
  { label: "Duty Execution", icon: "⚙", href: "/internal/app-ideas/link-message-mock" },
  { label: "Planning", icon: "⚙", href: "/internal/app-ideas/link-message-mock" },
  { label: "Vehicle view", icon: "🚛", href: "/internal/app-ideas/link-message-mock" },
  { label: "Trailer view", icon: "▰", href: "/internal/app-ideas/link-message-mock" },
  { label: "Fleet view", icon: "▱", href: "/internal/app-ideas/link-message-mock" },
  { label: "Comms", icon: "💬", href: "/internal/app-ideas/link-message-mock/comms", alertCount: 16 },
  { label: "Debrief", icon: "🧾", href: "/internal/app-ideas/link-message-mock/debrief" },
  { label: "RHC Team", icon: "RHC", href: "/internal/app-ideas/link-message-mock/rhc-team" },
  { label: "Live Tracking", icon: "GPS", href: "/internal/app-ideas/link-message-mock/live-tracking" },
  { label: "Reports", icon: "REP", href: "/internal/app-ideas/link-message-mock/reports" },
  { label: "A&D Dashboard", icon: "A&D", href: "/internal/app-ideas/link-message-mock/arrivals-departures" },
  {
    label: "System Configurations",
    icon: "⚙",
    href: "/internal/app-ideas/link-message-mock/configurations",
    active: true,
  },
];

const allRoles = [
  "SuperUser",
  "TOAD (VISION LOBBY)",
  "Gate Admin (NOT NEEDED)",
  "National Planner (CPC)",
  "Local Planner",
  "ADM - Logistic Distribution Manager",
  "ADM - Area Distribution Manager",
  "PFMW Manager",
  "Quality Team",
  "MC Managers",
  "Fleet Teams",
  "York Tracking",
  "Compliance",
  "Knowledge Management",
];

const allSites = [
  "Aberdeen VOC",
  "Atherstone VOC",
  "Belfast VOC",
  "Birmingham MC",
  "Birmingham VOC",
  "Bridgend VOC",
  "Carlisle VOC",
  "Chelmsford VOC",
  "Chester MC",
  "Chorley VOC",
  "Coventry VOC",
  "Croydon VOC",
  "East Midlands Airport",
  "Edinburgh VOC",
  "ELDC VOC",
  "EMA VOC",
  "Exeter VOC",
  "Gatwick VOC",
  "Glasgow VOC",
  "Greenford VOC",
  "Hatfield VOC",
  "HWDC VOC",
  "Inverness VOC",
  "Leeds MC",
  "Liverpool LD",
  "Manchester VOC",
  "Midlands SH VOC",
  "Midlands Super Hub",
  "MK VOC",
  "National Parcel Hub",
  "North East VOC",
  "North West Super Hub",
  "North West VOC",
  "Norwich VOC",
  "Peterborough VOC",
  "Plymouth VOC",
  "Preston VOC",
  "Princess Royal VOC",
  "Scotland VOC",
  "Scottish Parcel Hub",
  "Sheffield MC",
  "SOUTH EAST VOC",
  "South West VOC",
  "Southampton VOC",
  "Stourton VOC",
  "Swindon VOC",
  "Warrington MC",
  "Warrington VOC",
  "Woking VOC",
  "Wolverhampton VOC",
  "WRT VOC",
  "Yorkshire VOC",
];

const initialUsers: MockUser[] = [
  {
    id: "test1",
    name: "Test User 1",
    email: "test1@testaccount.com",
    employeeId: "RM000001",
    roles: ["Local Planner", "Quality Team"],
    sites: ["Midlands Super Hub", "North West Super Hub"],
  },
  {
    id: "test2",
    name: "Test User 2",
    email: "test2@testaccount.com",
    employeeId: "RM000002",
    roles: ["National Planner (CPC)", "York Tracking"],
    sites: ["WRT VOC"],
  },
  {
    id: "test3",
    name: "Test User 3",
    email: "test3@testaccount.com",
    employeeId: "RM000003",
    roles: ["Fleet Teams"],
    sites: ["National Parcel Hub", "Princess Royal VOC"],
  },
  {
    id: "test4",
    name: "Test User 4",
    email: "test4@testaccount.com",
    employeeId: "RM000004",
    roles: ["Compliance", "Knowledge Management"],
    sites: ["Warrington MC"],
  },
  {
    id: "test5",
    name: "Test User 5",
    email: "test5@testaccount.com",
    employeeId: "RM000005",
    roles: ["SuperUser"],
    sites: ["Midlands Super Hub", "North West Super Hub", "Warrington MC", "WRT VOC"],
  },
];

const permissionRows: PermissionRow[] = [
  { functionName: "Modifying existing duty", ui: "Duty Execution - LINK", access: ["SuperUser", "TOAD (VISION LOBBY)", "National Planner (CPC)", "Local Planner", "ADM - Logistic Distribution Manager", "ADM - Area Distribution Manager"] },
  { functionName: "Creating adhoc (copyduty)", ui: "Duty Execution - LINK", access: ["SuperUser", "TOAD (VISION LOBBY)", "National Planner (CPC)", "Local Planner", "ADM - Logistic Distribution Manager", "ADM - Area Distribution Manager"] },
  { functionName: "BMG Network/Locations Permission", ui: "Service Now", access: ["SuperUser", "TOAD (VISION LOBBY)", "National Planner (CPC)"] },
  { functionName: "SNOW - Amend location/add location to BAT cosmos DB", ui: "Service Now", access: ["SuperUser"] },
  { functionName: "SNOW - Amend location/add location to user profile", ui: "Service Now", access: ["SuperUser"] },
  { functionName: "SNOW - Create user", ui: "Service Now", access: ["SuperUser"] },
  { functionName: "Arrivals & Departures (Dashboards)", ui: "Duty Execution - LINK", access: ["SuperUser", "TOAD (VISION LOBBY)", "National Planner (CPC)", "Local Planner", "ADM - Logistic Distribution Manager", "ADM - Area Distribution Manager", "PFMW Manager", "Quality Team", "MC Managers", "Fleet Teams", "York Tracking"] },
  { functionName: "Debrief", ui: "Duty Execution - LINK", access: ["SuperUser", "TOAD (VISION LOBBY)", "National Planner (CPC)", "Local Planner", "ADM - Logistic Distribution Manager", "ADM - Area Distribution Manager", "Compliance"] },
  { functionName: "Debrief - Reports", ui: "Reports", access: ["SuperUser", "National Planner (CPC)", "Local Planner", "ADM - Logistic Distribution Manager", "ADM - Area Distribution Manager"] },
  { functionName: "Geofences & Zones", ui: "DCT Reports", access: ["SuperUser", "TOAD (VISION LOBBY)", "National Planner (CPC)", "Local Planner", "Quality Team", "Fleet Teams"] },
  { functionName: "Geofences & Zones - Edit", ui: "DCT", access: ["SuperUser", "National Planner (CPC)", "Local Planner", "Quality Team", "Fleet Teams"] },
  { functionName: "Journey Management LINK:T", ui: "Duty Execution - LINK", access: ["SuperUser", "TOAD (VISION LOBBY)", "National Planner (CPC)", "Local Planner", "ADM - Logistic Distribution Manager", "ADM - Area Distribution Manager", "Quality Team", "MC Managers", "Fleet Teams"] },
  { functionName: "Journey Management Reports", ui: "DCT Reports", access: ["SuperUser", "National Planner (CPC)", "Local Planner", "ADM - Logistic Distribution Manager", "ADM - Area Distribution Manager", "Quality Team", "MC Managers", "Fleet Teams", "Compliance"] },
  { functionName: "Journey Management Reports - Fuel Reports", ui: "DCT Reports", access: ["SuperUser", "National Planner (CPC)", "Local Planner", "Fleet Teams"] },
  { functionName: "Journey Management Reports - CO2", ui: "DCT Reports", access: ["SuperUser", "National Planner (CPC)", "Fleet Teams"] },
  { functionName: "Proximity Reports", ui: "DCT Reports", access: ["SuperUser", "National Planner (CPC)", "Fleet Teams", "Knowledge Management"] },
  { functionName: "Route Monitoring", ui: "DCT", access: ["SuperUser", "TOAD (VISION LOBBY)", "National Planner (CPC)", "Local Planner", "ADM - Logistic Distribution Manager", "ADM - Area Distribution Manager", "PFMW Manager", "Quality Team", "MC Managers", "Fleet Teams"] },
  { functionName: "Messaging", ui: "Driver APP", access: ["SuperUser", "TOAD (VISION LOBBY)", "National Planner (CPC)", "Local Planner", "ADM - Logistic Distribution Manager", "ADM - Area Distribution Manager"] },
  { functionName: "Messaging History", ui: "Duty Execution", access: ["SuperUser", "TOAD (VISION LOBBY)", "National Planner (CPC)", "Local Planner", "ADM - Logistic Distribution Manager", "ADM - Area Distribution Manager"] },
  { functionName: "SAT NAV", ui: "Driver app", access: ["SuperUser", "PFMW Manager"] },
  { functionName: "Drivers App", ui: "Driver app", access: ["SuperUser", "PFMW Manager"] },
  { functionName: "Vehicle Checks", ui: "Driver app", access: ["SuperUser", "National Planner (CPC)", "Local Planner", "ADM - Logistic Distribution Manager", "ADM - Area Distribution Manager", "PFMW Manager", "Fleet Teams", "Compliance"] },
  { functionName: "Vehicle Checks - Reports", ui: "Duty Execution / M5", access: ["SuperUser", "TOAD (VISION LOBBY)", "National Planner (CPC)", "Local Planner", "ADM - Logistic Distribution Manager", "ADM - Area Distribution Manager", "Fleet Teams", "Compliance"] },
  { functionName: "PMT Process", ui: "Driver App / Duty Execution", access: ["SuperUser", "TOAD (VISION LOBBY)", "National Planner (CPC)", "Local Planner", "PFMW Manager", "Fleet Teams", "Compliance"] },
  { functionName: "PMT Process - Reports", ui: "Duty Execution / M5", access: ["SuperUser", "TOAD (VISION LOBBY)", "National Planner (CPC)", "Local Planner", "Fleet Teams", "Compliance"] },
  { functionName: "Remote Downloading", ui: "CameraMatics - Automate", access: ["SuperUser", "TOAD (VISION LOBBY)", "National Planner (CPC)", "Local Planner", "ADM - Logistic Distribution Manager", "ADM - Area Distribution Manager", "Fleet Teams"] },
  { functionName: "Driver Behaviours", ui: "Driver App", access: ["SuperUser", "National Planner (CPC)", "Local Planner", "ADM - Logistic Distribution Manager", "ADM - Area Distribution Manager", "PFMW Manager", "Compliance"] },
  { functionName: "Driver Behaviours - Reports", ui: "CameraMatics / DCT", access: ["SuperUser", "National Planner (CPC)", "Local Planner", "ADM - Logistic Distribution Manager", "ADM - Area Distribution Manager", "Fleet Teams", "Compliance"] },
  { functionName: "Fitting Rollout", ui: "CameraMatics", access: ["SuperUser", "National Planner (CPC)", "Local Planner", "ADM - Logistic Distribution Manager", "ADM - Area Distribution Manager", "Fleet Teams"] },
  { functionName: "RTC", ui: "Driver App", access: ["National Planner (CPC)", "Local Planner", "ADM - Logistic Distribution Manager", "ADM - Area Distribution Manager", "Knowledge Management"] },
];

export default function UserRolesPage() {
  const [users, setUsers] = useState(initialUsers);
  const [selectedUserId, setSelectedUserId] = useState(initialUsers[0].id);
  const [tab, setTab] = useState<Tab>("roles");
  const [userQuery, setUserQuery] = useState("");
  const [availableQuery, setAvailableQuery] = useState("");
  const [currentQuery, setCurrentQuery] = useState("");
  const [selectedAvailable, setSelectedAvailable] = useState<string[]>([]);
  const [selectedCurrent, setSelectedCurrent] = useState<string[]>([]);
  const [permissionRole, setPermissionRole] = useState(initialUsers[0].roles[0]);
  const [saveMessage, setSaveMessage] = useState("");

  const selectedUser = users.find((user) => user.id === selectedUserId) ?? users[0];
  const currentValues = tab === "locations" ? selectedUser.sites : selectedUser.roles;
  const allValues = tab === "locations" ? allSites : allRoles;

  const availableValues = useMemo(
    () => allValues.filter((value) => !currentValues.includes(value)),
    [allValues, currentValues],
  );

  const filteredUsers = users.filter((user) =>
    `${user.name} ${user.email} ${user.employeeId}`.toLowerCase().includes(userQuery.toLowerCase()),
  );

  const filteredAvailable = availableValues.filter((value) =>
    value.toLowerCase().includes(availableQuery.toLowerCase()),
  );
  const filteredCurrent = currentValues.filter((value) =>
    value.toLowerCase().includes(currentQuery.toLowerCase()),
  );

  const selectedPermissionRows = permissionRows.filter((row) => row.access.includes(permissionRole));

  function selectUser(id: string) {
    const nextUser = users.find((user) => user.id === id);
    setSelectedUserId(id);
    setSelectedAvailable([]);
    setSelectedCurrent([]);
    setSaveMessage("");
    if (nextUser?.roles[0]) setPermissionRole(nextUser.roles[0]);
  }

  function changeTab(nextTab: Tab) {
    setTab(nextTab);
    setSelectedAvailable([]);
    setSelectedCurrent([]);
    setAvailableQuery("");
    setCurrentQuery("");
    setSaveMessage("");
  }

  function addSelected() {
    if (selectedAvailable.length === 0) return;
    setUsers((current) =>
      current.map((user) => {
        if (user.id !== selectedUserId) return user;
        if (tab === "locations") {
          return { ...user, sites: [...user.sites, ...selectedAvailable] };
        }
        return { ...user, roles: [...user.roles, ...selectedAvailable] };
      }),
    );
    if (tab === "roles" && !permissionRole && selectedAvailable[0]) setPermissionRole(selectedAvailable[0]);
    setSelectedAvailable([]);
    setSaveMessage("");
  }

  function removeSelected() {
    if (selectedCurrent.length === 0) return;
    setUsers((current) =>
      current.map((user) => {
        if (user.id !== selectedUserId) return user;
        if (tab === "locations") {
          return { ...user, sites: user.sites.filter((site) => !selectedCurrent.includes(site)) };
        }
        return { ...user, roles: user.roles.filter((role) => !selectedCurrent.includes(role)) };
      }),
    );
    setSelectedCurrent([]);
    setSaveMessage("");
  }

  function toggleSelection(value: string, side: "available" | "current") {
    const setter = side === "available" ? setSelectedAvailable : setSelectedCurrent;
    setter((current) => (current.includes(value) ? current.filter((item) => item !== value) : [...current, value]));
  }

  function saveMockChanges() {
    setSaveMessage("Mock changes saved for this browser session.");
  }

  return (
    <div className="min-h-screen bg-[#edf3f8] text-[#111827]">
      <OfficeHeader title="MOCK UP" subtitle="User Roles" />
      <div className="flex min-w-0">
        <OfficeSidebar />

        <main className="min-w-0 flex-1 p-2 sm:p-3">
          <section className="overflow-hidden rounded-[20px] border border-[#d9e3ee] bg-white shadow-sm">
            <div className="bg-[#e40000] px-5 py-3 text-white sm:px-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-2xl text-[#e40000] shadow-sm">👤</span>
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-white/80">System Administration</p>
                    <h1 className="text-2xl font-black sm:text-3xl">User Roles</h1>
                  </div>
                </div>
                <Link
                  href="/internal/app-ideas/link-message-mock/configurations"
                  className="rounded-lg border border-white/70 px-4 py-2 text-sm font-black text-white no-underline transition hover:bg-white/15"
                >
                  ← System Configurations
                </Link>
              </div>
            </div>

            <div className="min-h-[calc(100vh-170px)] bg-[#f8fbfe] p-4 sm:p-6">
              <div className="grid gap-5 xl:grid-cols-[330px_minmax(0,1fr)]">
                <aside className="rounded-[18px] border border-[#d9e3ee] bg-white p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.16em] text-[#e40000]">Mock Accounts</p>
                      <h2 className="mt-1 text-xl font-black text-[#10203a]">Users</h2>
                    </div>
                    <span className="rounded-full bg-[#eef3f7] px-2.5 py-1 text-xs font-black text-[#526176]">{users.length}</span>
                  </div>

                  <label className="mt-4 block text-xs font-black uppercase tracking-[0.12em] text-[#5c6b7f]" htmlFor="user-search">
                    Find user
                  </label>
                  <div className="mt-2 flex items-center rounded-lg border border-[#cfd9e4] bg-white px-3">
                    <span className="text-[#6b7789]">⌕</span>
                    <input
                      id="user-search"
                      value={userQuery}
                      onChange={(event) => setUserQuery(event.target.value)}
                      placeholder="Name, email or ID"
                      className="min-w-0 flex-1 bg-transparent px-2 py-2.5 text-sm font-semibold outline-none"
                    />
                  </div>

                  <div className="mt-4 space-y-2">
                    {filteredUsers.map((user) => (
                      <button
                        key={user.id}
                        type="button"
                        onClick={() => selectUser(user.id)}
                        className={`w-full rounded-xl border p-3 text-left transition ${
                          user.id === selectedUserId
                            ? "border-[#e40000] bg-[#fff4f4] shadow-sm"
                            : "border-[#d9e3ee] bg-white hover:bg-[#f7fafc]"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-black ${user.id === selectedUserId ? "bg-[#e40000] text-white" : "bg-[#e9eef3] text-[#405067]"}`}>
                            {user.name.slice(-1)}
                          </span>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-black text-[#10203a]">{user.email}</p>
                            <p className="mt-0.5 text-xs font-bold text-[#718096]">{user.employeeId} · {user.roles.length} role{user.roles.length === 1 ? "" : "s"}</p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>

                  <div className="mt-5 rounded-xl border border-dashed border-[#cbd5e1] bg-[#f8fbfe] p-3 text-xs font-semibold leading-5 text-[#64748b]">
                    These are demonstration accounts only. 
                  </div>
                </aside>

                <section className="min-w-0 rounded-[18px] border border-[#d9e3ee] bg-white shadow-sm">
                  <div className="border-b border-[#d9e3ee] px-5 py-4 sm:px-6">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <p className="text-xs font-black uppercase tracking-[0.16em] text-[#7a8798]">Selected User</p>
                        <h2 className="mt-1 text-xl font-black text-[#10203a]">{selectedUser.email}</h2>
                        <p className="mt-1 text-sm font-bold text-[#64748b]">{selectedUser.name} · {selectedUser.employeeId}</p>
                      </div>
                      <div className="flex gap-2">
                        <span className="rounded-lg bg-[#f1f5f9] px-3 py-2 text-xs font-black text-[#405067]">{selectedUser.roles.length} roles</span>
                        <span className="rounded-lg bg-[#f1f5f9] px-3 py-2 text-xs font-black text-[#405067]">{selectedUser.sites.length} sites</span>
                      </div>
                    </div>

                    <div className="mt-5 flex flex-wrap gap-1 border-b border-[#d9e3ee]">
                      <TabButton active={tab === "roles"} onClick={() => changeTab("roles")}>ROLES</TabButton>
                      <TabButton active={tab === "locations"} onClick={() => changeTab("locations")}>LOCATIONS</TabButton>
                      <TabButton active={tab === "permissions"} onClick={() => changeTab("permissions")}>ROLE PERMISSIONS</TabButton>
                    </div>
                  </div>

                  <div className="p-5 sm:p-6">
                    {tab === "permissions" ? (
                      <PermissionsPanel
                        permissionRole={permissionRole}
                        setPermissionRole={setPermissionRole}
                        selectedPermissionRows={selectedPermissionRows}
                      />
                    ) : (
                      <AssignmentPanel
                        mode={tab}
                        available={filteredAvailable}
                        current={filteredCurrent}
                        selectedAvailable={selectedAvailable}
                        selectedCurrent={selectedCurrent}
                        availableQuery={availableQuery}
                        currentQuery={currentQuery}
                        setAvailableQuery={setAvailableQuery}
                        setCurrentQuery={setCurrentQuery}
                        toggleSelection={toggleSelection}
                        addSelected={addSelected}
                        removeSelected={removeSelected}
                      />
                    )}

                    <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-[#e2e8f0] pt-5">
                      <p className="text-sm font-bold text-[#64748b]">
                        {saveMessage || "Changes are mock data only and are not sent to any live system."}
                      </p>
                      <button
                        type="button"
                        onClick={saveMockChanges}
                        className="rounded-lg bg-[#e40000] px-5 py-2.5 text-sm font-black text-white shadow-sm transition hover:bg-[#c90000]"
                      >
                        Save Mock Changes
                      </button>
                    </div>
                  </div>
                </section>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

function AssignmentPanel({
  mode,
  available,
  current,
  selectedAvailable,
  selectedCurrent,
  availableQuery,
  currentQuery,
  setAvailableQuery,
  setCurrentQuery,
  toggleSelection,
  addSelected,
  removeSelected,
}: {
  mode: "roles" | "locations";
  available: string[];
  current: string[];
  selectedAvailable: string[];
  selectedCurrent: string[];
  availableQuery: string;
  currentQuery: string;
  setAvailableQuery: (value: string) => void;
  setCurrentQuery: (value: string) => void;
  toggleSelection: (value: string, side: "available" | "current") => void;
  addSelected: () => void;
  removeSelected: () => void;
}) {
  const noun = mode === "locations" ? "Sites" : "Roles";
  return (
    <div>
      <div className="mb-4 rounded-xl border border-[#dbe5ef] bg-[#f8fbfe] px-4 py-3 text-sm font-semibold text-[#526176]">
        Select one or more {noun.toLowerCase()} and use the arrows to assign or remove them for the selected mock user.
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_64px_minmax(0,1fr)]">
        <SelectionBox
          title={`Available ${noun}`}
          values={available}
          selected={selectedAvailable}
          query={availableQuery}
          setQuery={setAvailableQuery}
          onToggle={(value) => toggleSelection(value, "available")}
        />

        <div className="flex items-center justify-center gap-2 lg:flex-col">
          <button
            type="button"
            aria-label={`Add selected ${noun.toLowerCase()}`}
            onClick={addSelected}
            disabled={selectedAvailable.length === 0}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-[#b8c5d3] bg-white text-2xl font-black text-[#e40000] shadow-sm transition hover:bg-[#fff3f3] disabled:cursor-not-allowed disabled:opacity-35"
          >
            →
          </button>
          <button
            type="button"
            aria-label={`Remove selected ${noun.toLowerCase()}`}
            onClick={removeSelected}
            disabled={selectedCurrent.length === 0}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-[#b8c5d3] bg-white text-2xl font-black text-[#e40000] shadow-sm transition hover:bg-[#fff3f3] disabled:cursor-not-allowed disabled:opacity-35"
          >
            ←
          </button>
        </div>

        <SelectionBox
          title={`User's Current ${noun}`}
          values={current}
          selected={selectedCurrent}
          query={currentQuery}
          setQuery={setCurrentQuery}
          onToggle={(value) => toggleSelection(value, "current")}
        />
      </div>
    </div>
  );
}

function SelectionBox({
  title,
  values,
  selected,
  query,
  setQuery,
  onToggle,
}: {
  title: string;
  values: string[];
  selected: string[];
  query: string;
  setQuery: (value: string) => void;
  onToggle: (value: string) => void;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-[#9aa8b8] bg-white">
      <div className="flex items-center justify-between border-b border-[#cbd5e1] px-4 py-3">
        <h3 className="text-base font-black text-[#10203a]">{title}</h3>
        <span className="text-xl text-[#10203a]">⌕</span>
      </div>
      <div className="border-b border-[#e2e8f0] p-2">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={`Search ${title.toLowerCase()}`}
          className="w-full rounded-md border border-[#d7e0e9] bg-[#f8fafc] px-3 py-2 text-sm font-semibold outline-none focus:border-[#e40000]"
        />
      </div>
      <div className="h-[360px] overflow-y-auto p-2">
        {values.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm font-bold text-[#94a3b8]">No data</div>
        ) : (
          values.map((value, index) => (
            <label
              key={value}
              className={`flex cursor-pointer items-start gap-3 px-3 py-3 text-sm font-bold text-[#26364c] ${index % 2 ? "bg-[#f3f5f7]" : "bg-white"}`}
            >
              <input
                type="checkbox"
                checked={selected.includes(value)}
                onChange={() => onToggle(value)}
                className="mt-0.5 h-4 w-4 accent-[#e40000]"
              />
              <span>{value}</span>
            </label>
          ))
        )}
      </div>
      <div className="border-t border-[#e2e8f0] px-4 py-3 text-center text-sm font-bold text-[#405067]">
        {selected.length} of {values.length} Selected
      </div>
    </div>
  );
}

function PermissionsPanel({
  permissionRole,
  setPermissionRole,
  selectedPermissionRows,
}: {
  permissionRole: string;
  setPermissionRole: (role: string) => void;
  selectedPermissionRows: PermissionRow[];
}) {
  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.14em] text-[#e40000]">Permission Matrix</p>
          <h3 className="mt-1 text-lg font-black text-[#10203a]">Role access reference</h3>
          <p className="mt-1 max-w-3xl text-sm font-semibold text-[#64748b]">
            Mock-up of the access matrix supplied for DriverOS. Select a role to see which functions it can access.
          </p>
        </div>
        <label className="min-w-[290px] text-xs font-black uppercase tracking-[0.12em] text-[#5c6b7f]">
          Role
          <select
            value={permissionRole}
            onChange={(event) => setPermissionRole(event.target.value)}
            className="mt-2 block w-full rounded-lg border border-[#b9c6d4] bg-white px-3 py-2.5 text-sm font-bold normal-case tracking-normal text-[#10203a] outline-none focus:border-[#e40000]"
          >
            {allRoles.map((role) => (
              <option key={role} value={role}>{role}</option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-5 overflow-x-auto rounded-xl border border-[#d9e3ee]">
        <table className="min-w-full border-collapse text-left text-sm">
          <thead className="bg-[#10203a] text-white">
            <tr>
              <th className="px-4 py-3 font-black">Function</th>
              <th className="px-4 py-3 font-black">UI</th>
              <th className="px-4 py-3 text-center font-black">Access</th>
            </tr>
          </thead>
          <tbody>
            {permissionRows.map((row, index) => {
              const hasAccess = row.access.includes(permissionRole);
              return (
                <tr key={row.functionName} className={index % 2 ? "bg-[#f6f8fa]" : "bg-white"}>
                  <td className="border-t border-[#e2e8f0] px-4 py-3 font-bold text-[#26364c]">{row.functionName}</td>
                  <td className="border-t border-[#e2e8f0] px-4 py-3 font-semibold text-[#526176]">{row.ui}</td>
                  <td className="border-t border-[#e2e8f0] px-4 py-3 text-center">
                    <span className={`inline-flex min-w-[54px] justify-center rounded-full px-2.5 py-1 text-xs font-black ${hasAccess ? "bg-[#e8f7ed] text-[#15783d]" : "bg-[#f1f3f5] text-[#697586]"}`}>
                      {hasAccess ? "YES" : "NO"}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-xs font-semibold text-[#7a8798]">
        {selectedPermissionRows.length} of {permissionRows.length} functions currently show access for {permissionRole}. This is mock configuration data for demonstration.
      </p>
    </div>
  );
}

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`border-b-2 px-4 py-3 text-sm font-black transition ${
        active ? "border-[#e40000] text-[#e40000]" : "border-transparent text-[#536276] hover:text-[#10203a]"
      }`}
    >
      {children}
    </button>
  );
}

function OfficeHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <header className="flex min-h-[56px] items-center justify-between bg-[#e40000] text-white shadow-sm">
      <div className="flex h-full items-center">
        <Link
          href="/internal/app-ideas/link-message-mock"
          className="flex h-[56px] w-[68px] items-center justify-center border-r border-white/30 text-3xl font-black text-white no-underline transition hover:bg-white/10"
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
          ← Back to DriverOS Home
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
    <aside className="flex min-h-[calc(100vh-56px)] w-[68px] shrink-0 flex-col bg-[#252c33] text-white">
      {sidebarItems.map((item) => (
        <Link
          key={item.label}
          href={item.href}
          aria-label={item.label}
          title={item.label}
          className={`relative flex h-[56px] items-center justify-center border-b border-white/10 no-underline transition ${
            item.icon.length > 2 ? "text-sm font-black" : "text-3xl"
          } ${item.active ? "bg-[#11171d] text-white" : "text-white/75 hover:bg-[#11171d] hover:text-white"}`}
        >
          <span>{item.icon}</span>
          {item.alertCount ? (
            <span className="absolute bottom-2 right-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#e40000] px-1 text-[11px] font-black leading-none text-white ring-2 ring-[#252c33]">
              {item.alertCount}
            </span>
          ) : null}
        </Link>
      ))}
    </aside>
  );
}
