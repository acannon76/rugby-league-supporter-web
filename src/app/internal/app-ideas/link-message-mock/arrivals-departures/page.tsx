"use client";

import Link from "next/link";
import { type ReactNode, useEffect, useMemo, useState } from "react";

import {
  arrivalBoardRows,
  arrivalDepartureRows,
  trafficOptions,
  type ArrivalDepartureRow,
  type MovementStatus,
} from "../mockOfficeData";

type SidebarItem = {
  label: string;
  icon: string;
  href: string;
  alertCount?: number;
  active?: boolean;
};

type BoardView = "Overview" | "Departures" | "Arrivals";
type BoardMode = "Departures" | "Arrivals";
type PastRetentionMinutes = 30 | 60 | 90 | 120;

const siteOptions = [
  "Midlands Super Hub",
  "North West Super Hub",
  "Warrington MC",
  "Leeds MC",
  "Birmingham MC",
  "East Midlands Airport",
  "Scottish Parcel Hub",
  "Liverpool LD",
  "Chester MC",
  "Sheffield MC",
  "Aberdeen VOC",
  "Atherstone VOC",
  "Belfast VOC",
  "Birmingham VOC",
  "Bridgend VOC",
  "Carlisle VOC",
  "Chelmsford VOC",
  "Chorley VOC",
  "Coventry VOC",
  "Croydon VOC",
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
  "Manchester VOC",
  "Midlands SH VOC",
  "MK VOC",
  "National Parcel Hub",
  "North East VOC",
  "North West VOC",
  "Norwich VOC",
  "Peterborough VOC",
  "Plymouth VOC",
  "Preston VOC",
  "Princess Royal VOC",
  "Scotland VOC",
  "SOUTH EAST VOC",
  "South West VOC",
  "Southampton VOC",
  "Stourton VOC",
  "Swindon VOC",
  "Warrington VOC",
  "Woking VOC",
  "Wolverhampton VOC",
  "WRT VOC",
  "Yorkshire VOC",
] as const;

type SiteOption = (typeof siteOptions)[number];

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
  { label: "A&D Dashboard", icon: "A&D", href: "/internal/app-ideas/link-message-mock/arrivals-departures", active: true },
  { label: "System Configurations", icon: "⚙", href: "/internal/app-ideas/link-message-mock/configurations" },
];

const departureOffsets = [2, 8, 14, 20, 26, 32, 38, 44, 50, 56, 62, 68, 74, 80, 86, 92, 98, 104, 110, 116];
const arrivalOffsets = [4, 11, 18, 25, 32, 39, 46, 53, 60, 67, 74, 81, 88, 95, 102, 109, 116];

// Extra past duties are deliberately positioned around the four selectable retention points.
// This makes the mock-up visibly demonstrate what disappears when the user changes the setting.
const oldDepartureOffsets = [-118, -112, -88, -82, -58, -52, -28, -22];
const oldArrivalOffsets = [-119, -113, -89, -83, -59, -53, -29, -23];
const pastRetentionOptions = [30, 60, 90, 120] as const;

const departureDutyNumbers = [
  "MSVx5025b",
  "MSVp5032b",
  "PEVt2020c",
  "WAVx3052a",
  "PRDx2011a",
  "YDCx2030b",
  "HCNp3054a",
  "BOUa4014a",
  "MANv1132b",
  "LONp2021a",
  "VOCx1550a",
  "NWHx2540b",
  "BRVt3002b",
  "CMVx4009a",
  "EXVt3023b",
  "GWVp2006b",
  "MHVt3056b",
  "NRVp5003a",
  "SNVp2004a",
  "WKVc3034b",
];

const arrivalDutyNumbers = [
  "VPLt3012a",
  "NWVx4002c",
  "MVOt2003a",
  "HFVt3023a",
  "PEVt4018b",
  "WAVx3052a",
  "CRYp9021a",
  "LONp4552a",
  "BOUv1473a",
  "YDCx6112b",
  "PLVp3002a",
  "SWVp4023a",
  "SOVx2003a",
  "STVx3002b",
  "WRTx2007c",
  "LSAp4034a",
  "SEVx3004b",
];

const oldDepartureDutyNumbers = [
  "MSVx4820a",
  "NWVx4814b",
  "MANx3790a",
  "WAVx3784b",
  "PEVx2758a",
  "LONx2752b",
  "BRVx1728a",
  "YDCx1722b",
];

const oldArrivalDutyNumbers = [
  "VPLx4919a",
  "NWVx4913b",
  "MVOx3889a",
  "HFVx3883b",
  "PEVx2859a",
  "WAVx2853b",
  "CRYx1929a",
  "LONx1923b",
];

export default function ArrivalsDeparturesPage() {
  const [boardView, setBoardView] = useState<BoardView>("Overview");
  const [selectedSite, setSelectedSite] = useState<SiteOption>("Midlands Super Hub");
  const [search, setSearch] = useState("");
  const [trafficFilter, setTrafficFilter] = useState<ArrivalDepartureRow["traffic"] | "All">("All");
  const [pastRetentionMinutes, setPastRetentionMinutes] = useState<PastRetentionMinutes>(30);
  const [refreshTime, setRefreshTime] = useState(() => new Date());

  useEffect(() => {
    const interval = window.setInterval(() => {
      setRefreshTime(new Date());
    }, 60000);

    return () => window.clearInterval(interval);
  }, []);

  const selectedDepartureRows = useMemo(
    () => buildDynamicRows(arrivalDepartureRows, "Departures", selectedSite, refreshTime),
    [selectedSite, refreshTime],
  );

  const selectedArrivalRows = useMemo(
    () => buildDynamicRows(arrivalBoardRows, "Arrivals", selectedSite, refreshTime),
    [selectedSite, refreshTime],
  );

  const departureRows = useMemo(
    () => filterRows(selectedDepartureRows, search, trafficFilter, "Departures", refreshTime, pastRetentionMinutes),
    [selectedDepartureRows, search, trafficFilter, refreshTime, pastRetentionMinutes],
  );
  const arrivalRows = useMemo(
    () => filterRows(selectedArrivalRows, search, trafficFilter, "Arrivals", refreshTime, pastRetentionMinutes),
    [selectedArrivalRows, search, trafficFilter, refreshTime, pastRetentionMinutes],
  );

  return (
    <div className="min-h-screen bg-[#edf3f8] text-[#111827]">
      <OfficeHeader title="MOCK UP" subtitle="Arrival & Departure Dashboard" />
      <div className="flex">
        <OfficeSidebar />

        <main className="flex-1 p-2 sm:p-3">
          <section className="overflow-hidden rounded-[20px] border border-[#d9e3ee] bg-white shadow-sm">
            <div className="bg-[#e40000] px-5 py-2.5 text-white sm:px-6">
              <h1 className="text-2xl font-black sm:text-3xl">Arrival & Departure Board</h1>
            </div>

            <div className="px-3 py-2.5 sm:px-4">
              <div className="grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-[auto_minmax(170px,210px)_auto_minmax(220px,1fr)_minmax(125px,155px)_minmax(110px,135px)_auto_auto] xl:items-end">
                <div className="inline-flex flex-wrap gap-1 rounded-xl bg-[#f3f7fb] p-1 xl:flex-nowrap">
                  {(["Overview", "Arrivals", "Departures"] as BoardView[]).map((view) => (
                    <button
                      key={view}
                      type="button"
                      onClick={() => setBoardView(view)}
                      className={`rounded-lg px-3 py-2 text-sm font-black transition ${
                        boardView === view ? "bg-[#10203a] text-white shadow-sm" : "text-[#10203a] hover:bg-white"
                      }`}
                    >
                      {view}
                    </button>
                  ))}
                </div>

                <FilterField label="Site">
                  <select
                    value={selectedSite}
                    onChange={(event) => setSelectedSite(event.target.value as SiteOption)}
                    className="w-full rounded-lg border border-[#cfdae7] bg-white px-2.5 py-2 text-sm font-bold text-[#10203a] outline-none transition focus:border-[#0f3a6d] focus:ring-2 focus:ring-[#bfdbfe]"
                  >
                    {siteOptions.map((site) => (
                      <option key={site} value={site}>
                        {site}
                      </option>
                    ))}
                  </select>
                </FilterField>

                <div className="flex items-end gap-1.5 whitespace-nowrap text-sm font-black text-[#10203a]">
                  <span className="rounded-lg border border-[#d8e3ef] bg-[#f7fbff] px-2.5 py-2">Departures: {departureRows.length}</span>
                  <span className="rounded-lg border border-[#d8e3ef] bg-[#f7fbff] px-2.5 py-2">Arrivals: {arrivalRows.length}</span>
                </div>

                <FilterField label="Search">
                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Route, resource, traffic or duty"
                    className="w-full rounded-lg border border-[#cfdae7] px-2.5 py-2 text-sm font-bold text-[#10203a] outline-none transition focus:border-[#0f3a6d] focus:ring-2 focus:ring-[#bfdbfe]"
                  />
                </FilterField>

                <FilterField label="Traffic">
                  <select
                    value={trafficFilter}
                    onChange={(event) => setTrafficFilter(event.target.value as ArrivalDepartureRow["traffic"] | "All")}
                    className="w-full rounded-lg border border-[#cfdae7] px-2.5 py-2 text-sm font-bold text-[#10203a] outline-none transition focus:border-[#0f3a6d] focus:ring-2 focus:ring-[#bfdbfe]"
                  >
                    <option value="All">All traffic</option>
                    {trafficOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </FilterField>

                <FilterField label="Show past">
                  <select
                    value={pastRetentionMinutes}
                    onChange={(event) => setPastRetentionMinutes(Number(event.target.value) as PastRetentionMinutes)}
                    className="w-full rounded-lg border border-[#cfdae7] bg-white px-2.5 py-2 text-sm font-bold text-[#10203a] outline-none transition focus:border-[#0f3a6d] focus:ring-2 focus:ring-[#bfdbfe]"
                    aria-label="Show duties from the last number of minutes"
                  >
                    {pastRetentionOptions.map((minutes) => (
                      <option key={minutes} value={minutes}>
                        {minutes} mins
                      </option>
                    ))}
                  </select>
                </FilterField>

                <button
                  type="button"
                  onClick={() =>
                    downloadArrivalDepartureSnapshot({
                      site: selectedSite,
                      arrivals: arrivalRows,
                      departures: departureRows,
                      snapshotTime: new Date(),
                      pastRetentionMinutes,
                      trafficFilter,
                      search,
                    })
                  }
                  className="whitespace-nowrap rounded-lg bg-[#10203a] px-3 py-2 text-sm font-black text-white shadow-sm transition hover:bg-[#1b3153]"
                  title="Download a PDF snapshot of the current arrivals and departures"
                >
                  PDF Snapshot
                </button>

                <div className="whitespace-nowrap rounded-lg border border-[#c7d4e5] bg-[#f8fbfe] px-2.5 py-2 text-sm font-black text-[#10203a] xl:justify-self-end">
                  Last updated: <span className="text-[#e40000]">{formatDateTime(refreshTime)}</span>
                </div>
              </div>
            </div>
          </section>

          {boardView === "Overview" ? (
            <section className="mt-3 grid grid-cols-1 gap-3 2xl:grid-cols-2">
              <BoardCard title={`${selectedSite} Arrival Board`} subtitle="Planned arrival time order" count={arrivalRows.length} accent="green">
                <CompactBoardList rows={arrivalRows} mode="Arrivals" emptyText="No arrivals match the current filters." />
              </BoardCard>

              <BoardCard title={`${selectedSite} Departure Board`} subtitle="Planned departure time order" count={departureRows.length} accent="blue">
                <CompactBoardList rows={departureRows} mode="Departures" emptyText="No departures match the current filters." />
              </BoardCard>
            </section>
          ) : null}

          {boardView === "Departures" || boardView === "Overview" ? (
            <section className="mt-3">
              <DepartureBoardTable site={selectedSite} rows={departureRows} hidden={boardView !== "Departures"} />
            </section>
          ) : null}

          {boardView === "Arrivals" || boardView === "Overview" ? (
            <section className="mt-3">
              <ArrivalBoardTable site={selectedSite} rows={arrivalRows} hidden={boardView !== "Arrivals"} />
            </section>
          ) : null}
        </main>
      </div>
    </div>
  );
}

function buildDynamicRows(rows: ArrivalDepartureRow[], mode: BoardMode, selectedSite: string, now: Date) {
  const offsets = mode === "Departures" ? departureOffsets : arrivalOffsets;
  const oldOffsets = mode === "Departures" ? oldDepartureOffsets : oldArrivalOffsets;
  const oldDutyNumbers = mode === "Departures" ? oldDepartureDutyNumbers : oldArrivalDutyNumbers;

  const mapRowAtOffset = (row: ArrivalDepartureRow, offset: number, jobReference: string) => {
    const primaryDate = addMinutes(now, offset);
    const primaryTime = formatDateTime(primaryDate);

    if (mode === "Departures") {
      return {
        ...row,
        departing: selectedSite,
        departureDateTime: primaryTime,
        departureStatus: (offset < 0 ? "Actual" : offset <= 45 ? "ETD" : "Planned") as MovementStatus,
        jobReference,
      };
    }

    return {
      ...row,
      destination: selectedSite,
      arrivalDateTime: primaryTime,
      arrivalStatus: (offset <= 0 ? "Actual" : "ETA") as MovementStatus,
      jobReference,
    };
  };

  const oldRows = oldOffsets.map((offset, index) =>
    mapRowAtOffset(rows[index % rows.length], offset, oldDutyNumbers[index]),
  );

  const currentAndFutureRows = rows.map((row, index) =>
    mapRowAtOffset(row, offsets[index % offsets.length],
      mode === "Departures" ? departureDutyNumbers[index] ?? row.jobReference : arrivalDutyNumbers[index] ?? row.jobReference),
  );

  return [...oldRows, ...currentAndFutureRows];
}

function filterRows(
  rows: ArrivalDepartureRow[],
  search: string,
  trafficFilter: ArrivalDepartureRow["traffic"] | "All",
  mode: BoardMode,
  now: Date,
  pastRetentionMinutes: PastRetentionMinutes,
) {
  const term = search.trim().toLowerCase();
  const nowMs = now.getTime();
  const lowerWindow = nowMs - pastRetentionMinutes * 60 * 1000;
  const upperWindow = nowMs + 120 * 60 * 1000;

  return [...rows]
    .filter((row) => {
      const primaryTimeMs = parseDateTime(getPrimaryTimeForMode(row, mode));

      if (primaryTimeMs < lowerWindow || primaryTimeMs > upperWindow) {
        return false;
      }

      if (trafficFilter !== "All" && row.traffic !== trafficFilter) {
        return false;
      }

      if (!term) {
        return true;
      }

      const haystack = [row.departing, row.destination, row.jobReference, row.c3Bay, row.resources, row.assets, row.traffic, row.delay]
        .join(" ")
        .toLowerCase();
      return haystack.includes(term);
    })
    .sort((a, b) => parseDateTime(getPrimaryTimeForMode(a, mode)) - parseDateTime(getPrimaryTimeForMode(b, mode)));
}


type SnapshotPdfArgs = {
  site: string;
  arrivals: ArrivalDepartureRow[];
  departures: ArrivalDepartureRow[];
  snapshotTime: Date;
  pastRetentionMinutes: PastRetentionMinutes;
  trafficFilter: ArrivalDepartureRow["traffic"] | "All";
  search: string;
};

type PdfTableColumn = {
  heading: string;
  width: number;
  value: (row: ArrivalDepartureRow) => string;
  maxChars: number;
};

function downloadArrivalDepartureSnapshot({
  site,
  arrivals,
  departures,
  snapshotTime,
  pastRetentionMinutes,
  trafficFilter,
  search,
}: SnapshotPdfArgs) {
  const pdfBytes = createArrivalDepartureSnapshotPdf({
    site,
    arrivals,
    departures,
    snapshotTime,
    pastRetentionMinutes,
    trafficFilter,
    search,
  });
  const blob = new Blob([pdfBytes], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `arrival-departure-snapshot-${slugify(site)}-${formatFileDateTime(snapshotTime)}.pdf`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function createArrivalDepartureSnapshotPdf(args: SnapshotPdfArgs) {
  const pageWidth = 842;
  const pageHeight = 595;
  const left = 34;
  const right = 34;
  const bottom = 34;
  const pages: string[][] = [];
  let commands: string[] = [];
  let y = 0;

  const startPage = () => {
    commands = [];
    pages.push(commands);

    // Light watermark so the document is unmistakably a point-in-time snapshot.
    commands.push("0.94 g");
    pdfText(commands, 248, 300, "SNAPSHOT", 56, true);
    commands.push("0 g");

    commands.push("0.89 0 0 rg");
    pdfText(commands, left, 553, "Arrival & Departure Snapshot", 19, true);
    commands.push("0 g");
    pdfText(commands, left, 533, `Snapshot date/time: ${formatDateTime(args.snapshotTime)}`, 9, true);
    pdfText(commands, left, 518, `Site: ${args.site}`, 9, false);

    const filterParts = [
      `Show past: ${args.pastRetentionMinutes} mins`,
      `Traffic: ${args.trafficFilter === "All" ? "All traffic" : args.trafficFilter}`,
    ];
    if (args.search.trim()) {
      filterParts.push(`Search: ${args.search.trim()}`);
    }
    pdfText(commands, left, 503, filterParts.join("   |   "), 8, false);
    pdfLine(commands, left, 493, pageWidth - right, 493, 0.75);
    y = 474;
  };

  const ensureSpace = (height: number) => {
    if (y - height < bottom + 18) {
      startPage();
    }
  };

  const drawSection = (title: string, rows: ArrivalDepartureRow[], mode: BoardMode) => {
    const routeHeading = mode === "Arrivals" ? "Origin" : "Destination";
    const columns: PdfTableColumn[] = [
      {
        heading: mode === "Arrivals" ? "Planned arrival" : "Planned departure",
        width: 66,
        value: (row) => formatTimeOnly(getPrimaryTimeForMode(row, mode)),
        maxChars: 8,
      },
      { heading: "C3", width: 32, value: (row) => row.c3Bay, maxChars: 4 },
      {
        heading: routeHeading,
        width: 141,
        value: (row) => (mode === "Arrivals" ? row.departing : row.destination),
        maxChars: 29,
      },
      { heading: "Duty", width: 79, value: (row) => row.jobReference, maxChars: 15 },
      { heading: "Traffic", width: 96, value: (row) => row.traffic, maxChars: 21 },
      { heading: "Resources", width: 184, value: (row) => row.resources, maxChars: 39 },
      { heading: "Assets", width: 42, value: (row) => String(row.assets), maxChars: 6 },
      { heading: "Delay", width: 48, value: (row) => row.delay, maxChars: 8 },
      { heading: "Expected", width: 61, value: (row) => getExpectedTime(row, mode), maxChars: 9 },
    ];

    const tableWidth = columns.reduce((sum, column) => sum + column.width, 0);
    const rowHeight = 22;
    const headerHeight = 21;

    const drawHeader = (continued = false) => {
      ensureSpace(56);
      pdfText(commands, left, y, continued ? `${title} (continued)` : title, 12, true);
      pdfText(commands, left + 120, y, `${rows.length} row(s)`, 8, false);
      y -= 16;

      commands.push("0.06 0.13 0.23 rg");
      pdfRect(commands, left, y - headerHeight + 4, tableWidth, headerHeight, true);
      commands.push("1 1 1 rg");
      let x = left;
      for (const column of columns) {
        pdfText(commands, x + 3, y - 9, column.heading, 6.6, true);
        x += column.width;
      }
      commands.push("0 g");
      y -= headerHeight;
    };

    drawHeader();

    if (!rows.length) {
      pdfText(commands, left + 5, y - 10, "No rows match the current filters.", 8.5, false);
      y -= rowHeight;
      return;
    }

    rows.forEach((row, index) => {
      if (y - rowHeight < bottom + 18) {
        startPage();
        drawHeader(true);
      }

      if (index % 2 === 0) {
        commands.push("0.97 g");
        pdfRect(commands, left, y - rowHeight + 4, tableWidth, rowHeight, true);
        commands.push("0 g");
      }

      let x = left;
      for (const column of columns) {
        pdfText(commands, x + 3, y - 9, fitPdfText(column.value(row), column.maxChars), 7.2, false);
        x += column.width;
      }
      pdfLine(commands, left, y - rowHeight + 4, left + tableWidth, y - rowHeight + 4, 0.25, 0.84);
      y -= rowHeight;
    });

    y -= 13;
  };

  startPage();
  drawSection("Arrivals", args.arrivals, "Arrivals");
  ensureSpace(52);
  drawSection("Departures", args.departures, "Departures");

  pages.forEach((page, index) => {
    pdfLine(page, left, 24, pageWidth - right, 24, 0.5, 0.75);
    pdfText(page, left, 11, "Arrival & Departure Snapshot", 7, true);
    pdfText(page, pageWidth - 102, 11, `Page ${index + 1} of ${pages.length}`, 7, false);
  });

  return buildPdfDocument(pages, pageWidth, pageHeight);
}

function buildPdfDocument(pages: string[][], pageWidth: number, pageHeight: number) {
  const encoder = new TextEncoder();
  const objects: string[] = [];
  const pageObjectIds: number[] = [];
  const contentObjectIds: number[] = [];

  const catalogId = 1;
  const pagesId = 2;
  const regularFontId = 3;
  const boldFontId = 4;
  let nextId = 5;

  pages.forEach(() => {
    pageObjectIds.push(nextId++);
    contentObjectIds.push(nextId++);
  });

  objects[catalogId] = `<< /Type /Catalog /Pages ${pagesId} 0 R >>`;
  objects[pagesId] = `<< /Type /Pages /Kids [${pageObjectIds.map((id) => `${id} 0 R`).join(" ")}] /Count ${pages.length} >>`;
  objects[regularFontId] = "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>";
  objects[boldFontId] = "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>";

  pages.forEach((pageCommands, index) => {
    const pageId = pageObjectIds[index];
    const contentId = contentObjectIds[index];
    const content = pageCommands.join("\n");
    const contentLength = encoder.encode(content).length;

    objects[pageId] = `<< /Type /Page /Parent ${pagesId} 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Resources << /Font << /F1 ${regularFontId} 0 R /F2 ${boldFontId} 0 R >> >> /Contents ${contentId} 0 R >>`;
    objects[contentId] = `<< /Length ${contentLength} >>\nstream\n${content}\nendstream`;
  });

  let pdf = "%PDF-1.4\n";
  const offsets = new Array(objects.length).fill(0);

  for (let id = 1; id < objects.length; id += 1) {
    offsets[id] = encoder.encode(pdf).length;
    pdf += `${id} 0 obj\n${objects[id]}\nendobj\n`;
  }

  const xrefOffset = encoder.encode(pdf).length;
  pdf += `xref\n0 ${objects.length}\n`;
  pdf += "0000000000 65535 f \n";
  for (let id = 1; id < objects.length; id += 1) {
    pdf += `${String(offsets[id]).padStart(10, "0")} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${objects.length} /Root ${catalogId} 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  return encoder.encode(pdf);
}

function pdfText(commands: string[], x: number, y: number, text: string, size: number, bold: boolean) {
  commands.push(`BT /${bold ? "F2" : "F1"} ${size} Tf 1 0 0 1 ${x} ${y} Tm (${escapePdfText(text)}) Tj ET`);
}

function pdfLine(commands: string[], x1: number, y1: number, x2: number, y2: number, width: number, gray = 0.65) {
  commands.push(`${gray} G ${width} w ${x1} ${y1} m ${x2} ${y2} l S 0 G`);
}

function pdfRect(commands: string[], x: number, y: number, width: number, height: number, fill: boolean) {
  commands.push(`${x} ${y} ${width} ${height} re ${fill ? "f" : "S"}`);
}

function escapePdfText(value: string) {
  return value
    .replace(/•/g, " / ")
    .replace(/[–—]/g, "-")
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[^\x20-\x7E]/g, "")
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)");
}

function fitPdfText(value: string, maxChars: number) {
  const cleaned = escapePdfText(value).replace(/\\([()\\])/g, "$1");
  if (cleaned.length <= maxChars) {
    return cleaned;
  }
  return `${cleaned.slice(0, Math.max(1, maxChars - 3))}...`;
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function formatFileDateTime(date: Date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}-${pad(date.getHours())}${pad(date.getMinutes())}`;
}

function addMinutes(date: Date, minutes: number) {
  return new Date(date.getTime() + minutes * 60 * 1000);
}

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function formatDateTime(date: Date) {
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function parseDateTime(dateTime: string) {
  const [datePart, timePart] = dateTime.split(" ");
  const [day, month, year] = datePart.split("/").map(Number);
  const [hour, minute] = timePart.split(":").map(Number);
  return new Date(year, month - 1, day, hour, minute).getTime();
}

function getPrimaryTimeForMode(row: ArrivalDepartureRow, mode: BoardMode) {
  return mode === "Departures" ? row.departureDateTime : row.arrivalDateTime;
}

function formatTimeOnly(dateTime: string) {
  return dateTime.split(" ")[1] ?? dateTime;
}

function parseDelayMinutes(delay: string) {
  const match = delay.match(/^([+-]?)(\d{2}):(\d{2})$/);

  if (!match) {
    return 0;
  }

  const sign = match[1] === "-" ? -1 : 1;
  return sign * (Number(match[2]) * 60 + Number(match[3]));
}

function getExpectedTime(row: ArrivalDepartureRow, mode: BoardMode) {
  const expectedDate = new Date(
    parseDateTime(getPrimaryTimeForMode(row, mode)) + parseDelayMinutes(row.delay) * 60 * 1000,
  );

  return `${pad(expectedDate.getHours())}:${pad(expectedDate.getMinutes())}`;
}

function isRunningLate(delay: string) {
  return parseDelayMinutes(delay) > 0;
}

function FilterField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="text-xs font-black text-[#10203a]">
      <span className="mb-1 block">{label}</span>
      {children}
    </label>
  );
}

function BoardCard({
  title,
  subtitle,
  count,
  accent,
  children,
}: {
  title: string;
  subtitle: string;
  count: number;
  accent: "blue" | "green";
  children: ReactNode;
}) {
  const accentClasses =
    accent === "blue" ? "from-[#eff6ff] to-[#f8fbff] border-[#bfdbfe]" : "from-[#ecfdf3] to-[#f7fffa] border-[#bbf7d0]";

  return (
    <section className={`rounded-[20px] border bg-gradient-to-br ${accentClasses} p-3 shadow-sm`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#e40000]">Overview panel</p>
          <h2 className="mt-1 text-xl font-black text-[#10203a]">{title}</h2>
          <p className="mt-1 text-xs font-bold text-[#4b5563]">{subtitle}</p>
        </div>
        <div className="rounded-xl bg-white px-3 py-2 text-center shadow-sm">
          <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#6b7280]">Rows</p>
          <p className="mt-1 text-xl font-black text-[#10203a]">{count}</p>
        </div>
      </div>
      <div className="mt-2">{children}</div>
    </section>
  );
}

function CompactBoardList({ rows, mode, emptyText }: { rows: ArrivalDepartureRow[]; mode: BoardMode; emptyText: string }) {
  if (!rows.length) {
    return <p className="rounded-2xl border border-dashed border-[#cbd5e1] bg-white px-3 py-3 text-sm font-bold text-[#6b7280]">{emptyText}</p>;
  }

  const routeHeading = mode === "Departures" ? "Destination" : "Origin";
  const plannedHeading = mode === "Departures" ? "Planned departure" : "Planned arrival";

  return (
    <div className="max-h-[calc(100vh-390px)] min-h-[420px] overflow-y-auto overflow-x-hidden rounded-xl border border-[#dbe5f0] bg-white">
      <div className="w-full min-w-0">
        <div className="sticky top-0 z-10 grid grid-cols-[70px_36px_88px_minmax(90px,1fr)_minmax(120px,1.15fr)_100px_42px_70px] items-center gap-x-2 border-b border-[#dbe5f0] bg-[#f8fbff] px-1.5 py-2 text-[9px] font-black uppercase tracking-[0.1em] text-[#6b7280]">
          <span className="leading-tight">{plannedHeading}</span>
          <span className="text-center leading-[1.05]">C3<br />Bay</span>
          <span>Duty</span>
          <span>{routeHeading}</span>
          <span>Resources</span>
          <span>Traffic</span>
          <span className="text-center">Assets</span>
          <span className="border-l border-[#dbe5f0] pl-2 text-center leading-tight">Expected</span>
        </div>

        {rows.map((row, index) => {
          const route = mode === "Departures" ? row.destination : row.departing;

          return (
            <div
              key={`${row.jobReference}-${index}`}
              className="grid grid-cols-[70px_36px_88px_minmax(90px,1fr)_minmax(120px,1.15fr)_100px_42px_70px] items-center gap-x-2 border-b border-[#edf1f5] px-1.5 py-2 last:border-b-0"
            >
              <span className="text-[13px] font-black text-[#10203a]">{formatTimeOnly(getPrimaryTimeForMode(row, mode))}</span>
              <C3BayBadge value={row.c3Bay} compact />
              <span className="break-words text-[11px] font-black leading-tight text-[#e40000]">{row.jobReference}</span>
              <span className="break-words text-[11px] font-black leading-tight text-[#10203a]">{route}</span>
              <span className="break-words text-[10px] font-bold leading-tight text-[#4b5563]">{row.resources}</span>
              <TrafficBadge value={row.traffic} compact />
              <AssetsBadge value={row.assets} compact />
              <div className="border-l border-[#edf1f5] pl-2"><ExpectedTimePill time={getExpectedTime(row, mode)} late={isRunningLate(row.delay)} compact /></div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function DepartureBoardTable({ site, rows, hidden }: { site: string; rows: ArrivalDepartureRow[]; hidden?: boolean }) {
  return (
    <section className={`rounded-[20px] border border-[#d9e3ee] bg-white p-3 shadow-sm ${hidden ? "hidden" : "block"}`}>
      <BoardHeader title={`${site} Departure Board`} subtitle="Planned departure time order" rowCount={rows.length} />

      <div className="mt-3 overflow-x-auto rounded-[16px] border border-[#dbe5f0] bg-[#f8fbff] p-1">
        <table className="min-w-full table-fixed border-separate border-spacing-y-1 text-sm">
          <colgroup>
            <col className="w-[10%]" />
            <col className="w-[7%]" />
            <col className="w-[16%]" />
            <col className="w-[12%]" />
            <col className="w-[23%]" />
            <col className="w-[13%]" />
            <col className="w-[7%]" />
            <col className="w-[6%]" />
            <col className="w-[10%]" />
          </colgroup>
          <thead>
            <tr className="text-left text-[11px] font-black uppercase tracking-[0.14em] text-[#6b7280]">
              <th className="px-3 py-2">Planned departure</th>
              <th className="px-3 py-2">C3 Bay</th>
              <th className="px-3 py-2">Destination</th>
              <th className="px-3 py-2">Duty number</th>
              <th className="px-3 py-2">Resources</th>
              <th className="px-3 py-2">Traffic</th>
              <th className="px-3 py-2">Assets</th>
              <th className="px-3 py-2">Delay</th>
              <th className="px-3 py-2">Expected time</th>
            </tr>
          </thead>
          <tbody>
            {rows.length ? (
              rows.map((row, index) => (
                <tr key={`${row.jobReference}-${index}`}>
                  <td className="rounded-l-2xl border-y border-l border-[#e2e8f0] bg-white px-3 py-3">
                    <PlannedTimePill time={formatTimeOnly(row.departureDateTime)} />
                  </td>
                  <td className="border-y border-[#e2e8f0] bg-white px-3 py-3"><C3BayBadge value={row.c3Bay} /></td>
                  <td className="border-y border-[#e2e8f0] bg-white px-3 py-3 text-base font-black text-[#10203a]">{row.destination}</td>
                  <td className="border-y border-[#e2e8f0] bg-white px-3 py-3 text-base font-black text-[#e40000]">{row.jobReference}</td>
                  <td className="border-y border-[#e2e8f0] bg-white px-3 py-3 text-sm font-bold text-[#4b5563]">{row.resources}</td>
                  <td className="border-y border-[#e2e8f0] bg-white px-3 py-3"><TrafficBadge value={row.traffic} /></td>
                  <td className="border-y border-[#e2e8f0] bg-white px-3 py-3"><AssetsBadge value={row.assets} /></td>
                  <td className="border-y border-[#e2e8f0] bg-white px-3 py-3 text-base font-black text-[#10203a]">{row.delay}</td>
                  <td className="rounded-r-2xl border-y border-r border-[#e2e8f0] bg-white px-3 py-3">
                    <ExpectedTimePill time={getExpectedTime(row, "Departures")} late={isRunningLate(row.delay)} />
                  </td>
                </tr>
              ))
            ) : (
              <EmptyRow colSpan={9} />
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function ArrivalBoardTable({ site, rows, hidden }: { site: string; rows: ArrivalDepartureRow[]; hidden?: boolean }) {
  return (
    <section className={`rounded-[20px] border border-[#d9e3ee] bg-white p-3 shadow-sm ${hidden ? "hidden" : "block"}`}>
      <BoardHeader title={`${site} Arrival Board`} subtitle="Planned arrival time order" rowCount={rows.length} />

      <div className="mt-3 overflow-x-auto rounded-[16px] border border-[#dbe5f0] bg-[#f8fbff] p-1">
        <table className="min-w-full table-fixed border-separate border-spacing-y-1 text-sm">
          <colgroup>
            <col className="w-[10%]" />
            <col className="w-[7%]" />
            <col className="w-[16%]" />
            <col className="w-[12%]" />
            <col className="w-[13%]" />
            <col className="w-[23%]" />
            <col className="w-[7%]" />
            <col className="w-[6%]" />
            <col className="w-[10%]" />
          </colgroup>
          <thead>
            <tr className="text-left text-[11px] font-black uppercase tracking-[0.14em] text-[#6b7280]">
              <th className="px-3 py-2">Planned arrival</th>
              <th className="px-3 py-2">C3 Bay</th>
              <th className="px-3 py-2">Origin</th>
              <th className="px-3 py-2">Duty number</th>
              <th className="px-3 py-2">Traffic</th>
              <th className="px-3 py-2">Resources</th>
              <th className="px-3 py-2">Assets</th>
              <th className="px-3 py-2">Delay</th>
              <th className="px-3 py-2">Expected time</th>
            </tr>
          </thead>
          <tbody>
            {rows.length ? (
              rows.map((row, index) => (
                <tr key={`${row.jobReference}-${index}`}>
                  <td className="rounded-l-2xl border-y border-l border-[#e2e8f0] bg-white px-3 py-3">
                    <PlannedTimePill time={formatTimeOnly(row.arrivalDateTime)} />
                  </td>
                  <td className="border-y border-[#e2e8f0] bg-white px-3 py-3"><C3BayBadge value={row.c3Bay} /></td>
                  <td className="border-y border-[#e2e8f0] bg-white px-3 py-3 text-base font-black text-[#10203a]">{row.departing}</td>
                  <td className="border-y border-[#e2e8f0] bg-white px-3 py-3 text-base font-black text-[#e40000]">{row.jobReference}</td>
                  <td className="border-y border-[#e2e8f0] bg-white px-3 py-3"><TrafficBadge value={row.traffic} /></td>
                  <td className="border-y border-[#e2e8f0] bg-white px-3 py-3 text-sm font-bold text-[#4b5563]">{row.resources}</td>
                  <td className="border-y border-[#e2e8f0] bg-white px-3 py-3"><AssetsBadge value={row.assets} /></td>
                  <td className="border-y border-[#e2e8f0] bg-white px-3 py-3 text-base font-black text-[#10203a]">{row.delay}</td>
                  <td className="rounded-r-2xl border-y border-r border-[#e2e8f0] bg-white px-3 py-3">
                    <ExpectedTimePill time={getExpectedTime(row, "Arrivals")} late={isRunningLate(row.delay)} />
                  </td>
                </tr>
              ))
            ) : (
              <EmptyRow colSpan={9} />
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function BoardHeader({ title, subtitle, rowCount }: { title: string; subtitle: string; rowCount: number }) {
  return (
    <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#e40000]">Detailed board</p>
        <h2 className="mt-1 text-2xl font-black text-[#10203a]">{title}</h2>
        <p className="mt-1 text-sm font-bold text-[#4b5563]">{subtitle}</p>
      </div>
      <div className="rounded-xl border border-[#d7e2ef] bg-[#f8fbfe] px-3 py-2 text-sm font-black text-[#10203a]">
        Showing {rowCount} row(s)
      </div>
    </div>
  );
}

function EmptyRow({ colSpan }: { colSpan: number }) {
  return (
    <tr>
      <td colSpan={colSpan} className="rounded-2xl bg-white px-4 py-10 text-center text-sm font-bold text-[#6b7280]">
        No rows match the current filters.
      </td>
    </tr>
  );
}

function C3BayBadge({ value, compact = false }: { value: string; compact?: boolean }) {
  const sizeClasses = compact ? "min-w-[32px] rounded-md px-1 py-1 text-[10px]" : "min-w-[56px] rounded-lg px-2.5 py-1.5 text-sm";

  return (
    <span className={`inline-flex justify-center border border-[#c7d4e5] bg-[#f8fbfe] font-black text-[#10203a] ${sizeClasses}`}>
      {value}
    </span>
  );
}

function AssetsBadge({ value, showLabel = false, compact = false }: { value: number; showLabel?: boolean; compact?: boolean }) {
  const sizeClasses = compact ? "min-w-[34px] rounded-md px-1 py-1 text-[10px]" : "min-w-10 rounded-lg px-2.5 py-1.5 text-sm";

  return (
    <span className={`inline-flex justify-center border border-[#c7d4e5] bg-[#f8fbfe] font-black text-[#10203a] ${sizeClasses}`}>
      {showLabel ? `Assets: ${value}` : value}
    </span>
  );
}

function TrafficBadge({ value, compact = false }: { value: string; compact?: boolean }) {
  const sizeClasses = compact ? "w-full justify-center px-1.5 py-1 text-[9px] leading-[1.05]" : "px-3 py-1.5 text-xs";

  return (
    <span className={`inline-flex rounded-full bg-[#ecf5ff] font-black uppercase tracking-[0.12em] text-[#0f3a6d] ring-1 ring-[#bfdbfe] ${sizeClasses}`}>
      {value}
    </span>
  );
}

function PlannedTimePill({ time }: { time: string }) {
  return (
    <span className="inline-flex min-w-[72px] justify-center rounded-lg bg-[#10203a] px-3 py-2 text-sm font-black text-white">
      {time}
    </span>
  );
}

function ExpectedTimePill({ time, late, compact = false }: { time: string; late: boolean; compact?: boolean }) {
  const sizeClasses = compact ? "min-w-[60px] px-1 py-1 text-[10px]" : "min-w-[78px] px-3 py-2 text-sm";
  const colourClasses = late
    ? "border-[#ef4444] bg-[#fff1f2] text-[#b42318]"
    : "border-[#16a34a] bg-[#edfdf1] text-[#166534]";

  return (
    <span className={`inline-flex justify-center rounded-lg border font-black ${sizeClasses} ${colourClasses}`}>
      {time}
    </span>
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
          <p className="text-xl font-black uppercase tracking-wide">{title}</p>
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
    <aside className="flex min-h-[calc(100vh-56px)] w-[68px] flex-col bg-[#252c33] text-white">
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
