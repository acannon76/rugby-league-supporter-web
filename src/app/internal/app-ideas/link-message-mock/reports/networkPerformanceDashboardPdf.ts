export type NetworkPerformanceDashboardPdfRow = {
  reportingSite: string;
  dutyDate: string;
  dutyNumber: string;
  dutyOrder: number;
  driver: string;
  vehicle: string;
  trailerNumber: string;
  traffic: string;
  departureLocation: string;
  finalDestination: string;
  plannedStartTs: string;
  actualStartTs: string;
  startDifference: string;
  dtt: string;
  plannedFinishTs: string;
  actualFinishTs: string;
  finishDifference: string;
  att: string;
  departureAssets: number;
  arrivalAssets: number;
  issueCategory: string;
  driverNotes: string;
  outcome: string;
  debriefedBy: string;
  debriefedAtTs: string;
};

type DashboardPdfFilters = {
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  site: string;
  timingStatus: string;
  traffic: string;
};

type DownloadArgs = {
  rows: NetworkPerformanceDashboardPdfRow[];
  filters: DashboardPdfFilters;
  fileName: string;
};

type Rgb = [number, number, number];

type SiteSummary = {
  site: string;
  total: number;
  ot: number;
  e: number;
  ve: number;
  l: number;
  vl: number;
  f: number;
  partComplete: number;
  onTimePercent: number;
};

type DailySummary = {
  date: string;
  total: number;
  dttOt: number;
  attOt: number;
  dttPercent: number;
  attPercent: number;
};

const PAGE_WIDTH = 842;
const PAGE_HEIGHT = 595;
const MARGIN = 24;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;

const NAVY: Rgb = [16, 32, 58];
const RED: Rgb = [228, 0, 0];
const WHITE: Rgb = [255, 255, 255];
const TEXT: Rgb = [17, 24, 39];
const MUTED: Rgb = [75, 85, 99];
const BORDER: Rgb = [207, 216, 227];
const PALE: Rgb = [248, 250, 252];
const GREEN: Rgb = [22, 163, 74];
const AMBER: Rgb = [245, 158, 11];
const ORANGE: Rgb = [234, 88, 12];
const DARK_RED: Rgb = [153, 27, 27];
const BLUE: Rgb = [37, 99, 235];
const LIGHT_BLUE: Rgb = [239, 246, 255];
const LIGHT_GREEN: Rgb = [240, 253, 244];

const timingColours: Record<string, Rgb> = {
  VE: BLUE,
  E: [124, 58, 237],
  OT: GREEN,
  L: AMBER,
  VL: ORANGE,
  F: DARK_RED,
};

export function downloadNetworkPerformanceDashboardPdf({ rows, filters, fileName }: DownloadArgs) {
  if (typeof window === "undefined" || rows.length === 0) return;

  const pdf = createNetworkPerformanceDashboardPdf(rows, filters);
  const blob = new Blob([pdf], { type: "application/pdf" });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName.replace(/\.pdf$/i, "") + ".pdf";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

function createNetworkPerformanceDashboardPdf(rows: NetworkPerformanceDashboardPdfRow[], filters: DashboardPdfFilters) {
  const siteSummary = buildSiteSummary(rows);
  const dailySummary = buildDailySummary(rows);
  const pageStreams: string[] = [];
  const sitePageCount = Math.max(1, Math.ceil(siteSummary.length / 24));
  const driverNotesPageCount = Math.max(1, Math.ceil(rows.length / 15));
  const detailPageCount = Math.max(1, Math.ceil(rows.length / 27));
  const totalPages = 1 + sitePageCount + driverNotesPageCount + detailPageCount;

  pageStreams.push(renderExecutiveSummaryPage(rows, siteSummary, dailySummary, filters, totalPages));
  pageStreams.push(...renderSiteSummaryPages(siteSummary, rows.length, filters, totalPages));
  pageStreams.push(...renderDriverNotesPages(rows, filters, totalPages, 2 + sitePageCount));
  pageStreams.push(...renderDetailPages(rows, filters, totalPages, 2 + sitePageCount + driverNotesPageCount));

  return assemblePdf(pageStreams);
}

function renderDriverNotesPages(
  rows: NetworkPerformanceDashboardPdfRow[],
  filters: DashboardPdfFilters,
  totalPages: number,
  pageOffset: number,
) {
  const rowsPerPage = 15;
  const chunks = chunk(rows, rowsPerPage);
  const pages: string[] = [];

  chunks.forEach((pageRows, pageIndex) => {
    const commands: string[] = [];
    const pageNumber = pageOffset + pageIndex;
    drawPageHeader(commands, "Network Performance Dashboard", "Driver notes and operational context", pageNumber, totalPages);
    drawText(
      commands,
      MARGIN,
      503,
      `${formatDate(filters.startDate)} ${filters.startTime} to ${formatDate(filters.endDate)} ${filters.endTime}   |   ${fitText(filters.site, 220, 6.8)}   |   ${formatNumber(rows.length)} rows`,
      6.8,
      "F1",
      MUTED,
    );

    const top = 476;
    const headerHeight = 27;
    const rowHeight = 28;
    const columns = [
      { title: "DATE", width: 55 },
      { title: "SITE", width: 125 },
      { title: "DUTY", width: 50 },
      { title: "DRIVER", width: 75 },
      { title: "VEHICLE", width: 55 },
      { title: "ISSUE", width: 75 },
      { title: "DRIVER NOTES", width: 294 },
      { title: "OUTCOME", width: 65 },
    ];

    drawRect(commands, MARGIN, top - headerHeight, CONTENT_WIDTH, headerHeight, NAVY);
    let x = MARGIN;
    columns.forEach((column) => {
      const lines = column.title.split(" ");
      if (lines.length > 1) {
        drawTextCentered(commands, x, top - 11, column.width, lines[0], 4.9, "F2", WHITE);
        drawTextCentered(commands, x, top - 19, column.width, lines.slice(1).join(" "), 4.9, "F2", WHITE);
      } else {
        drawTextCentered(commands, x, top - 17, column.width, column.title, 4.9, "F2", WHITE);
      }
      x += column.width;
      drawLine(commands, x, top - headerHeight, x, top, [73, 93, 122], 0.35);
    });

    pageRows.forEach((row, index) => {
      const yTop = top - headerHeight - index * rowHeight;
      const yBottom = yTop - rowHeight;
      drawRect(commands, MARGIN, yBottom, CONTENT_WIDTH, rowHeight, index % 2 === 0 ? WHITE : PALE, BORDER, 0.3);
      const values = [
        formatDate(row.dutyDate),
        row.reportingSite,
        row.dutyNumber,
        row.driver,
        row.vehicle,
        row.issueCategory,
        row.driverNotes,
        row.outcome,
      ];
      let cellX = MARGIN;
      columns.forEach((column, columnIndex) => {
        if (columnIndex === 6) {
          const wrapped = wrapText(values[columnIndex], 88).slice(0, 2);
          wrapped.forEach((line, lineIndex) => {
            drawText(commands, cellX + 4, yBottom + 17 - lineIndex * 9, fitText(line, column.width - 8, 5.2), 5.2, "F1", TEXT);
          });
        } else if ([1, 3, 5].includes(columnIndex)) {
          const fontSize = columnIndex === 1 ? 5.2 : 5.4;
          drawText(commands, cellX + 4, yBottom + 10, fitText(values[columnIndex], column.width - 8, fontSize), fontSize, columnIndex === 1 ? "F2" : "F1", TEXT);
        } else {
          drawTextCentered(
            commands,
            cellX,
            yBottom + 10,
            column.width,
            fitText(values[columnIndex], column.width - 6, 5.4),
            5.4,
            columnIndex === 7 ? "F2" : "F1",
            columnIndex === 7 && row.outcome !== "Complete" ? DARK_RED : TEXT,
          );
        }
        cellX += column.width;
      });
    });

    drawText(commands, MARGIN, 28, `Driver notes ${pageIndex * rowsPerPage + 1}-${pageIndex * rowsPerPage + pageRows.length} of ${rows.length}`, 6.4, "F1", MUTED);
    drawFooter(commands, pageNumber, totalPages, "Driver notes and operational context");
    pages.push(commands.join("\n"));
  });

  return pages;
}

function renderExecutiveSummaryPage(
  rows: NetworkPerformanceDashboardPdfRow[],
  siteSummary: SiteSummary[],
  dailySummary: DailySummary[],
  filters: DashboardPdfFilters,
  totalPages: number,
) {
  const commands: string[] = [];
  drawPageHeader(commands, "Network Performance Dashboard", "Selection-based management report", 1, totalPages);

  const generated = new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short" }).format(new Date());
  drawText(commands, MARGIN, 500, `Generated: ${sanitisePdfText(generated)}`, 6.7, "F1", MUTED);
  drawText(commands, MARGIN, 487, `Selection: ${formatDate(filters.startDate)} ${filters.startTime} to ${formatDate(filters.endDate)} ${filters.endTime}`, 6.7, "F1", MUTED);
  drawText(commands, MARGIN, 474, `Site: ${fitText(filters.site, 230, 6.7)}   |   ATT status: ${filters.timingStatus}   |   Due to Convey: ${fitText(filters.traffic, 210, 6.7)}`, 6.7, "F1", MUTED);

  const attCounts = countTiming(rows, "att");
  const dttOnTime = rows.filter((row) => row.dtt === "OT").length;
  const attOnTime = attCounts.OT;
  const lateArrivals = attCounts.L + attCounts.VL + attCounts.F;
  const earlyArrivals = attCounts.VE + attCounts.E;
  const partComplete = rows.filter((row) => row.outcome === "Part Complete").length;
  const uniqueSites = new Set(rows.map((row) => row.reportingSite)).size;

  const cards = [
    { label: "COMPLETED DEBRIEFS", value: formatNumber(rows.length), helper: `${uniqueSites} selected sites`, tone: NAVY },
    { label: "DTT ON TIME", value: `${percentage(dttOnTime, rows.length)}%`, helper: `${formatNumber(dttOnTime)} departures`, tone: BLUE },
    { label: "ATT ON TIME", value: `${percentage(attOnTime, rows.length)}%`, helper: `${formatNumber(attOnTime)} arrivals`, tone: GREEN },
    { label: "EARLY ARRIVALS", value: formatNumber(earlyArrivals), helper: "VE and E", tone: [124, 58, 237] as Rgb },
    { label: "LATE ARRIVALS", value: formatNumber(lateArrivals), helper: "L, VL and F", tone: ORANGE },
    { label: "PART COMPLETE", value: formatNumber(partComplete), helper: `${percentage(partComplete, rows.length)}% of rows`, tone: DARK_RED },
  ];

  const cardGap = 7;
  const cardWidth = (CONTENT_WIDTH - cardGap * 5) / 6;
  cards.forEach((card, index) => drawKpiCard(commands, MARGIN + index * (cardWidth + cardGap), 402, cardWidth, 58, card));

  drawPanel(commands, MARGIN, 222, 254, 164, "ATT PERFORMANCE MIX");
  drawTimingMix(commands, MARGIN + 14, 243, 226, 115, attCounts, rows.length);

  drawPanel(commands, MARGIN + 264, 222, 262, 164, "DAILY ON-TIME TREND");
  drawDailyTrend(commands, MARGIN + 278, 242, 234, 116, dailySummary.slice(-10));

  drawPanel(commands, MARGIN + 536, 222, 258, 164, "SITES REQUIRING REVIEW");
  drawRiskSites(commands, MARGIN + 550, 242, 230, 116, siteSummary.slice().sort((a, b) => a.onTimePercent - b.onTimePercent).slice(0, 7));

  drawPanel(commands, MARGIN, 45, CONTENT_WIDTH, 163, "MANAGEMENT SUMMARY");
  drawManagementSummary(commands, MARGIN + 14, 64, CONTENT_WIDTH - 28, 119, rows, siteSummary, filters);

  drawFooter(commands, 1, totalPages, "Network Performance Dashboard");
  return commands.join("\n");
}

function renderSiteSummaryPages(siteSummary: SiteSummary[], totalRows: number, filters: DashboardPdfFilters, totalPages: number) {
  const rowsPerPage = 24;
  const pages: string[] = [];
  const chunks = chunk(siteSummary, rowsPerPage);

  chunks.forEach((pageRows, pageIndex) => {
    const commands: string[] = [];
    drawPageHeader(commands, "Network Performance Dashboard", "Site performance summary", pageIndex + 2, totalPages);
    drawText(commands, MARGIN, 503, `Selected rows: ${formatNumber(totalRows)}   |   Site filter: ${fitText(filters.site, 240, 7)}`, 7, "F1", MUTED);

    const top = 475;
    const headerHeight = 24;
    const rowHeight = 17;
    const columns = [
      { title: "SITE", width: 330 },
      { title: "ROWS", width: 54 },
      { title: "VE", width: 42 },
      { title: "E", width: 42 },
      { title: "OT", width: 42 },
      { title: "L", width: 42 },
      { title: "VL", width: 42 },
      { title: "F", width: 42 },
      { title: "PART", width: 62 },
      { title: "ATT OT %", width: 96 },
    ];

    drawRect(commands, MARGIN, top - headerHeight, CONTENT_WIDTH, headerHeight, NAVY);
    let x = MARGIN;
    columns.forEach((column) => {
      drawTextCentered(commands, x, top - 15, column.width, column.title, 5.6, "F2", WHITE);
      x += column.width;
      drawLine(commands, x, top - headerHeight, x, top, [73, 93, 122], 0.4);
    });

    pageRows.forEach((row, index) => {
      const yTop = top - headerHeight - index * rowHeight;
      const yBottom = yTop - rowHeight;
      drawRect(commands, MARGIN, yBottom, CONTENT_WIDTH, rowHeight, index % 2 === 0 ? WHITE : PALE, BORDER, 0.35);
      const values = [
        row.site,
        formatNumber(row.total),
        String(row.ve),
        String(row.e),
        String(row.ot),
        String(row.l),
        String(row.vl),
        String(row.f),
        String(row.partComplete),
        `${row.onTimePercent.toFixed(1)}%`,
      ];
      let cellX = MARGIN;
      columns.forEach((column, columnIndex) => {
        const value = fitText(values[columnIndex], column.width - 8, columnIndex === 0 ? 6.4 : 6.1);
        if (columnIndex === 0) drawText(commands, cellX + 5, yBottom + 5.4, value, 6.4, "F2", TEXT);
        else drawTextCentered(commands, cellX, yBottom + 5.2, column.width, value, 6.1, columnIndex === 9 ? "F2" : "F1", columnIndex === 9 ? timingColourForPercent(row.onTimePercent) : TEXT);
        cellX += column.width;
      });
    });

    drawText(commands, MARGIN, 28, `Sites ${pageIndex * rowsPerPage + 1}-${pageIndex * rowsPerPage + pageRows.length} of ${siteSummary.length}`, 6.4, "F1", MUTED);
    drawFooter(commands, pageIndex + 2, totalPages, "Site performance summary");
    pages.push(commands.join("\n"));
  });

  return pages;
}

function renderDetailPages(
  rows: NetworkPerformanceDashboardPdfRow[],
  filters: DashboardPdfFilters,
  totalPages: number,
  pageOffset: number,
) {
  const rowsPerPage = 27;
  const chunks = chunk(rows, rowsPerPage);
  const pages: string[] = [];

  chunks.forEach((pageRows, pageIndex) => {
    const commands: string[] = [];
    const pageNumber = pageOffset + pageIndex;
    drawPageHeader(commands, "Network Performance Dashboard", "Selected debrief detail", pageNumber, totalPages);
    drawText(commands, MARGIN, 503, `${formatDate(filters.startDate)} ${filters.startTime} to ${formatDate(filters.endDate)} ${filters.endTime}   |   ${fitText(filters.site, 220, 6.8)}   |   ${formatNumber(rows.length)} rows`, 6.8, "F1", MUTED);

    const top = 476;
    const headerHeight = 27;
    const rowHeight = 15;
    const columns = [
      { title: "SITE", width: 110 },
      { title: "DATE", width: 48 },
      { title: "DUTY", width: 46 },
      { title: "LEG", width: 24 },
      { title: "VEHICLE", width: 48 },
      { title: "TRAILER", width: 48 },
      { title: "DUE TO CONVEY", width: 80 },
      { title: "START", width: 40 },
      { title: "DTT", width: 28 },
      { title: "FINISH", width: 40 },
      { title: "ATT", width: 28 },
      { title: "ISSUE", width: 72 },
      { title: "DRIVER NOTES", width: 120 },
      { title: "OUTCOME", width: 62 },
    ];

    drawRect(commands, MARGIN, top - headerHeight, CONTENT_WIDTH, headerHeight, NAVY);
    let x = MARGIN;
    columns.forEach((column) => {
      const lines = column.title.split(" ");
      if (lines.length > 1 && column.width < 105) {
        drawTextCentered(commands, x, top - 11, column.width, lines[0], 4.9, "F2", WHITE);
        drawTextCentered(commands, x, top - 19, column.width, lines.slice(1).join(" "), 4.9, "F2", WHITE);
      } else {
        drawTextCentered(commands, x, top - 17, column.width, column.title, 4.9, "F2", WHITE);
      }
      x += column.width;
      drawLine(commands, x, top - headerHeight, x, top, [73, 93, 122], 0.35);
    });

    pageRows.forEach((row, index) => {
      const yTop = top - headerHeight - index * rowHeight;
      const yBottom = yTop - rowHeight;
      drawRect(commands, MARGIN, yBottom, CONTENT_WIDTH, rowHeight, index % 2 === 0 ? WHITE : PALE, BORDER, 0.3);
      const values = [
        row.reportingSite,
        formatDate(row.dutyDate),
        row.dutyNumber,
        String(row.dutyOrder),
        row.vehicle,
        row.trailerNumber,
        row.traffic,
        formatTime(row.actualStartTs),
        row.dtt,
        formatTime(row.actualFinishTs),
        row.att,
        row.issueCategory,
        row.driverNotes,
        row.outcome,
      ];
      let cellX = MARGIN;
      columns.forEach((column, columnIndex) => {
        const fontSize = columnIndex === 0 || columnIndex === 6 || columnIndex === 11 || columnIndex === 12 ? 4.8 : 5.3;
        const text = fitText(values[columnIndex], column.width - 5, fontSize);
        const colour = columnIndex === 8 ? timingColours[row.dtt] ?? TEXT : columnIndex === 10 ? timingColours[row.att] ?? TEXT : TEXT;
        if ([0, 6, 11, 12].includes(columnIndex)) drawText(commands, cellX + 3, yBottom + 4.7, text, fontSize, columnIndex === 0 ? "F2" : "F1", colour);
        else drawTextCentered(commands, cellX, yBottom + 4.6, column.width, text, fontSize, [8, 10].includes(columnIndex) ? "F2" : "F1", colour);
        cellX += column.width;
      });
    });

    drawText(commands, MARGIN, 28, `Rows ${pageIndex * rowsPerPage + 1}-${pageIndex * rowsPerPage + pageRows.length} of ${rows.length}`, 6.4, "F1", MUTED);
    drawFooter(commands, pageNumber, totalPages, "Selected debrief detail");
    pages.push(commands.join("\n"));
  });

  return pages;
}

function drawManagementSummary(
  commands: string[],
  x: number,
  y: number,
  width: number,
  height: number,
  rows: NetworkPerformanceDashboardPdfRow[],
  siteSummary: SiteSummary[],
  filters: DashboardPdfFilters,
) {
  const attCounts = countTiming(rows, "att");
  const onTimeRate = percentage(attCounts.OT, rows.length);
  const late = attCounts.L + attCounts.VL + attCounts.F;
  const riskSites = siteSummary.filter((site) => site.onTimePercent < 80).length;
  const highestRisk = siteSummary.slice().sort((a, b) => a.onTimePercent - b.onTimePercent)[0];
  const topIssue = buildIssueSummary(rows)[0];

  const lines = [
    `The selected data contains ${formatNumber(rows.length)} completed debrief legs across ${siteSummary.length} reporting sites.`,
    `Arrival on-time performance is ${onTimeRate.toFixed(1)}%, with ${formatNumber(late)} late, very late or failed arrivals.`,
    `${riskSites} sites are below the 80% ATT on-time review threshold${highestRisk ? `; the lowest is ${highestRisk.site} at ${highestRisk.onTimePercent.toFixed(1)}%.` : "."}`,
    topIssue ? `The most frequent exception is ${topIssue.label}, recorded against ${formatNumber(topIssue.count)} selected legs.` : "No exception category is recorded in the current selection.",
    `This PDF reflects the active filters: ${filters.site}, ${filters.timingStatus}, ${filters.traffic}. It includes a dedicated driver-notes section and every selected row.`,
  ];

  const boxWidth = (width - 12) / 2;
  drawRect(commands, x, y, boxWidth, height, LIGHT_BLUE, [191, 219, 254], 0.7);
  drawText(commands, x + 10, y + height - 18, "KEY OBSERVATIONS", 7, "F2", NAVY);
  let textY = y + height - 34;
  lines.slice(0, 3).forEach((line) => {
    drawText(commands, x + 10, textY, "-", 7, "F2", RED);
    const wrapped = wrapText(line, 78);
    wrapped.forEach((wrappedLine, lineIndex) => drawText(commands, x + 20, textY - lineIndex * 9, wrappedLine, 6.6, "F1", TEXT));
    textY -= wrapped.length * 9 + 5;
  });

  const secondX = x + boxWidth + 12;
  drawRect(commands, secondX, y, boxWidth, height, LIGHT_GREEN, [187, 247, 208], 0.7);
  drawText(commands, secondX + 10, y + height - 18, "REPORT COVERAGE", 7, "F2", NAVY);
  let secondY = y + height - 34;
  lines.slice(3).forEach((line) => {
    drawText(commands, secondX + 10, secondY, "-", 7, "F2", GREEN);
    const wrapped = wrapText(line, 78);
    wrapped.forEach((wrappedLine, lineIndex) => drawText(commands, secondX + 20, secondY - lineIndex * 9, wrappedLine, 6.6, "F1", TEXT));
    secondY -= wrapped.length * 9 + 5;
  });
}

function drawTimingMix(commands: string[], x: number, y: number, width: number, height: number, counts: Record<string, number>, total: number) {
  const codes = ["VE", "E", "OT", "L", "VL", "F"];
  const barY = y + height - 32;
  drawRect(commands, x, barY, width, 18, [226, 232, 240]);
  let currentX = x;
  codes.forEach((code) => {
    const segmentWidth = total > 0 ? (counts[code] / total) * width : 0;
    if (segmentWidth > 0) drawRect(commands, currentX, barY, segmentWidth, 18, timingColours[code]);
    currentX += segmentWidth;
  });

  const legendY = barY - 20;
  codes.forEach((code, index) => {
    const column = index % 2;
    const row = Math.floor(index / 2);
    const legendX = x + column * (width / 2);
    const itemY = legendY - row * 26;
    drawRect(commands, legendX, itemY - 1, 8, 8, timingColours[code]);
    drawText(commands, legendX + 13, itemY, `${code}  ${formatNumber(counts[code])}`, 6.6, "F2", TEXT);
    drawText(commands, legendX + 68, itemY, `${percentage(counts[code], total).toFixed(1)}%`, 6.4, "F1", MUTED);
  });
}

function drawDailyTrend(commands: string[], x: number, y: number, width: number, height: number, days: DailySummary[]) {
  if (days.length === 0) {
    drawText(commands, x, y + height / 2, "No daily data", 8, "F2", MUTED);
    return;
  }

  const chartBottom = y + 18;
  const chartTop = y + height - 18;
  const chartHeight = chartTop - chartBottom;
  const chartWidth = width - 28;
  drawLine(commands, x + 24, chartBottom, x + 24, chartTop, BORDER, 0.5);
  drawLine(commands, x + 24, chartBottom, x + 24 + chartWidth, chartBottom, BORDER, 0.5);

  [0, 50, 100].forEach((tick) => {
    const tickY = chartBottom + (tick / 100) * chartHeight;
    drawLine(commands, x + 24, tickY, x + 24 + chartWidth, tickY, [229, 234, 240], 0.3);
    drawTextRight(commands, x + 20, tickY - 2, `${tick}%`, 5.2, "F1", MUTED);
  });

  const step = days.length > 1 ? chartWidth / (days.length - 1) : chartWidth;
  days.forEach((day, index) => {
    const pointX = x + 24 + index * step;
    const attY = chartBottom + (day.attPercent / 100) * chartHeight;
    const dttY = chartBottom + (day.dttPercent / 100) * chartHeight;
    if (index > 0) {
      const previous = days[index - 1];
      const previousX = x + 24 + (index - 1) * step;
      drawLine(commands, previousX, chartBottom + (previous.attPercent / 100) * chartHeight, pointX, attY, GREEN, 1.3);
      drawLine(commands, previousX, chartBottom + (previous.dttPercent / 100) * chartHeight, pointX, dttY, BLUE, 1.0);
    }
    drawCircle(commands, pointX, attY, 2.1, GREEN);
    drawCircle(commands, pointX, dttY, 1.8, BLUE);
    if (index % Math.max(1, Math.ceil(days.length / 5)) === 0 || index === days.length - 1) {
      drawTextCentered(commands, pointX - 18, chartBottom - 12, 36, formatShortDate(day.date), 4.8, "F1", MUTED);
    }
  });

  drawCircle(commands, x + 26, y + height - 4, 2.2, GREEN);
  drawText(commands, x + 33, y + height - 6, "ATT OT %", 5.8, "F2", TEXT);
  drawCircle(commands, x + 92, y + height - 4, 2.2, BLUE);
  drawText(commands, x + 99, y + height - 6, "DTT OT %", 5.8, "F2", TEXT);
}

function drawRiskSites(commands: string[], x: number, y: number, width: number, height: number, sites: SiteSummary[]) {
  if (sites.length === 0) {
    drawText(commands, x, y + height / 2, "No site data", 8, "F2", MUTED);
    return;
  }

  const rowHeight = 15;
  sites.forEach((site, index) => {
    const rowY = y + height - 14 - index * rowHeight;
    drawText(commands, x, rowY, fitText(site.site, 105, 5.6), 5.6, "F2", TEXT);
    const barX = x + 112;
    const barWidth = width - 150;
    drawRect(commands, barX, rowY - 1, barWidth, 7, [226, 232, 240]);
    drawRect(commands, barX, rowY - 1, Math.max(1, (site.onTimePercent / 100) * barWidth), 7, timingColourForPercent(site.onTimePercent));
    drawTextRight(commands, x + width, rowY, `${site.onTimePercent.toFixed(1)}%`, 5.8, "F2", timingColourForPercent(site.onTimePercent));
  });
}

function drawKpiCard(commands: string[], x: number, y: number, width: number, height: number, card: { label: string; value: string; helper: string; tone: Rgb }) {
  drawRect(commands, x, y, width, height, WHITE, BORDER, 0.7);
  drawRect(commands, x, y + height - 5, width, 5, card.tone);
  drawText(commands, x + 8, y + height - 18, card.label, 5.2, "F2", MUTED);
  drawText(commands, x + 8, y + 21, fitText(card.value, width - 16, 13), 13, "F2", NAVY);
  drawText(commands, x + 8, y + 8, fitText(card.helper, width - 16, 5.5), 5.5, "F1", MUTED);
}

function drawPanel(commands: string[], x: number, y: number, width: number, height: number, title: string) {
  drawRect(commands, x, y, width, height, WHITE, BORDER, 0.7);
  drawRect(commands, x, y + height - 27, width, 27, PALE, BORDER, 0.5);
  drawText(commands, x + 11, y + height - 18, title, 6.8, "F2", NAVY);
}

function drawPageHeader(commands: string[], title: string, subtitle: string, page: number, totalPages: number) {
  drawRect(commands, 0, PAGE_HEIGHT - 70, PAGE_WIDTH, 70, NAVY);
  drawRect(commands, 0, PAGE_HEIGHT - 75, PAGE_WIDTH, 5, RED);
  drawText(commands, MARGIN, PAGE_HEIGHT - 31, title, 18, "F2", WHITE);
  drawText(commands, MARGIN, PAGE_HEIGHT - 49, subtitle, 7.5, "F1", [219, 228, 241]);
  drawTextRight(commands, PAGE_WIDTH - MARGIN, PAGE_HEIGHT - 34, `PAGE ${page} OF ${totalPages}`, 6.5, "F2", [219, 228, 241]);
}

function drawFooter(commands: string[], page: number, totalPages: number, section: string) {
  drawLine(commands, MARGIN, 20, PAGE_WIDTH - MARGIN, 20, BORDER, 0.45);
  drawText(commands, MARGIN, 9, section, 5.8, "F1", MUTED);
  drawTextRight(commands, PAGE_WIDTH - MARGIN, 9, `Page ${page} of ${totalPages}`, 5.8, "F2", NAVY);
}

function buildSiteSummary(rows: NetworkPerformanceDashboardPdfRow[]) {
  const map = new Map<string, SiteSummary>();
  rows.forEach((row) => {
    const current = map.get(row.reportingSite) ?? {
      site: row.reportingSite,
      total: 0,
      ot: 0,
      e: 0,
      ve: 0,
      l: 0,
      vl: 0,
      f: 0,
      partComplete: 0,
      onTimePercent: 0,
    };
    current.total += 1;
    const code = row.att.toLowerCase() as "ot" | "e" | "ve" | "l" | "vl" | "f";
    current[code] += 1;
    if (row.outcome === "Part Complete") current.partComplete += 1;
    map.set(row.reportingSite, current);
  });

  return Array.from(map.values())
    .map((site) => ({ ...site, onTimePercent: percentage(site.ot, site.total) }))
    .sort((a, b) => a.site.localeCompare(b.site));
}

function buildDailySummary(rows: NetworkPerformanceDashboardPdfRow[]) {
  const map = new Map<string, DailySummary>();
  rows.forEach((row) => {
    const current = map.get(row.dutyDate) ?? { date: row.dutyDate, total: 0, dttOt: 0, attOt: 0, dttPercent: 0, attPercent: 0 };
    current.total += 1;
    if (row.dtt === "OT") current.dttOt += 1;
    if (row.att === "OT") current.attOt += 1;
    map.set(row.dutyDate, current);
  });
  return Array.from(map.values())
    .map((day) => ({ ...day, dttPercent: percentage(day.dttOt, day.total), attPercent: percentage(day.attOt, day.total) }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

function buildIssueSummary(rows: NetworkPerformanceDashboardPdfRow[]) {
  const map = new Map<string, number>();
  rows.forEach((row) => map.set(row.issueCategory, (map.get(row.issueCategory) ?? 0) + 1));
  return Array.from(map.entries()).map(([label, count]) => ({ label, count })).sort((a, b) => b.count - a.count);
}

function countTiming(rows: NetworkPerformanceDashboardPdfRow[], field: "dtt" | "att") {
  const counts: Record<string, number> = { VE: 0, E: 0, OT: 0, L: 0, VL: 0, F: 0 };
  rows.forEach((row) => { counts[row[field]] = (counts[row[field]] ?? 0) + 1; });
  return counts;
}

function percentage(value: number, total: number) {
  return total > 0 ? (value / total) * 100 : 0;
}

function timingColourForPercent(value: number): Rgb {
  if (value >= 90) return GREEN;
  if (value >= 80) return AMBER;
  return DARK_RED;
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-GB").format(value);
}

function formatDate(value: string) {
  const [year, month, day] = value.slice(0, 10).split("-");
  return `${day}/${month}/${year}`;
}

function formatShortDate(value: string) {
  const [, month, day] = value.slice(0, 10).split("-");
  return `${day}/${month}`;
}

function formatTime(value: string) {
  return value.slice(11, 16);
}

function chunk<T>(values: T[], size: number) {
  const chunks: T[][] = [];
  for (let index = 0; index < values.length; index += size) chunks.push(values.slice(index, index + size));
  return chunks.length > 0 ? chunks : [[]];
}

function assemblePdf(pageStreams: string[]) {
  const objects: string[] = [];
  const pageObjectNumbers = pageStreams.map((_, index) => 5 + index * 2);
  objects[1] = "<< /Type /Catalog /Pages 2 0 R >>";
  objects[2] = `<< /Type /Pages /Kids [${pageObjectNumbers.map((number) => `${number} 0 R`).join(" ")}] /Count ${pageStreams.length} >>`;
  objects[3] = "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>";
  objects[4] = "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>";

  pageStreams.forEach((stream, index) => {
    const pageObjectNumber = 5 + index * 2;
    const contentObjectNumber = pageObjectNumber + 1;
    objects[pageObjectNumber] = `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PAGE_WIDTH} ${PAGE_HEIGHT}] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ${contentObjectNumber} 0 R >>`;
    objects[contentObjectNumber] = `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`;
  });

  let pdf = "%PDF-1.4\n";
  const offsets: number[] = [0];
  for (let objectNumber = 1; objectNumber < objects.length; objectNumber += 1) {
    offsets[objectNumber] = pdf.length;
    pdf += `${objectNumber} 0 obj\n${objects[objectNumber]}\nendobj\n`;
  }
  const xrefOffset = pdf.length;
  pdf += `xref\n0 ${objects.length}\n0000000000 65535 f \n`;
  for (let objectNumber = 1; objectNumber < objects.length; objectNumber += 1) {
    pdf += `${String(offsets[objectNumber]).padStart(10, "0")} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${objects.length} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
  return pdf;
}

function drawRect(commands: string[], x: number, y: number, width: number, height: number, fill: Rgb, stroke?: Rgb, lineWidth = 0.5) {
  commands.push(`${rgb(fill)} rg`);
  if (stroke) commands.push(`${rgb(stroke)} RG`, `${lineWidth} w`, `${x} ${y} ${width} ${height} re B`);
  else commands.push(`${x} ${y} ${width} ${height} re f`);
}

function drawLine(commands: string[], x1: number, y1: number, x2: number, y2: number, colour: Rgb, lineWidth = 0.5) {
  commands.push(`${rgb(colour)} RG`, `${lineWidth} w`, `${x1} ${y1} m ${x2} ${y2} l S`);
}

function drawCircle(commands: string[], x: number, y: number, radius: number, fill: Rgb) {
  const k = 0.5522847498;
  const c = radius * k;
  commands.push(`${rgb(fill)} rg`, `${x + radius} ${y} m`, `${x + radius} ${y + c} ${x + c} ${y + radius} ${x} ${y + radius} c`, `${x - c} ${y + radius} ${x - radius} ${y + c} ${x - radius} ${y} c`, `${x - radius} ${y - c} ${x - c} ${y - radius} ${x} ${y - radius} c`, `${x + c} ${y - radius} ${x + radius} ${y - c} ${x + radius} ${y} c`, "f");
}

function drawText(commands: string[], x: number, y: number, value: string, size: number, font: "F1" | "F2", colour: Rgb) {
  commands.push("BT", `${rgb(colour)} rg`, `/${font} ${size} Tf`, `${x} ${y} Td`, `(${escapePdfText(sanitisePdfText(value))}) Tj`, "ET");
}

function drawTextRight(commands: string[], rightX: number, y: number, value: string, size: number, font: "F1" | "F2", colour: Rgb) {
  drawText(commands, rightX - estimateTextWidth(value, size, font), y, value, size, font, colour);
}

function drawTextCentered(commands: string[], x: number, y: number, width: number, value: string, size: number, font: "F1" | "F2", colour: Rgb) {
  const textWidth = estimateTextWidth(value, size, font);
  drawText(commands, x + Math.max(0, (width - textWidth) / 2), y, value, size, font, colour);
}

function fitText(value: string, width: number, size: number) {
  let text = sanitisePdfText(value);
  while (text.length > 1 && estimateTextWidth(text, size, "F1") > width) text = text.slice(0, -1);
  if (text !== sanitisePdfText(value) && text.length > 3) text = `${text.slice(0, -3)}...`;
  return text;
}

function wrapText(value: string, maximumLength: number) {
  const words = sanitisePdfText(value).split(/\s+/);
  const lines: string[] = [];
  let current = "";
  words.forEach((word) => {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length > maximumLength && current) {
      lines.push(current);
      current = word;
    } else current = candidate;
  });
  if (current) lines.push(current);
  return lines;
}

function estimateTextWidth(value: string, size: number, font: "F1" | "F2") {
  return value.length * size * (font === "F2" ? 0.56 : 0.5);
}

function rgb(colour: Rgb) {
  return colour.map((value) => (value / 255).toFixed(3)).join(" ");
}

function sanitisePdfText(value: string) {
  return String(value)
    .replace(/[–—→]/g, "-")
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/•/g, "-")
    .normalize("NFKD")
    .replace(/[^\x20-\x7E]/g, "?");
}

function escapePdfText(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}
