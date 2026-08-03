import {
  formatDate,
  roundOne,
  timingCodes,
  timingColours,
  type NationalLocalPlanRow,
  type TimingCounts,
} from "./option-4/nationalLocalPlanDashboardData";

export type NationalLocalPlanDashboardPdfFilters = {
  startDate: string;
  endDate: string;
  region: string;
  site: string;
  changeBand: string;
  volumeBand: string;
  timingProfile: string;
};

type Args = {
  rows: NationalLocalPlanRow[];
  filters: NationalLocalPlanDashboardPdfFilters;
  fileName: string;
};

type Rgb = [number, number, number];
type PdfSiteSummary = ReturnType<typeof buildSiteSummary>[number];
type PdfDailySummary = ReturnType<typeof buildDailySummary>[number];

const PAGE_WIDTH = 842;
const PAGE_HEIGHT = 595;
const NAVY: Rgb = [16, 32, 58];
const RED: Rgb = [228, 0, 0];
const WHITE: Rgb = [255, 255, 255];
const TEXT: Rgb = [17, 24, 39];
const MUTED: Rgb = [75, 85, 99];
const BORDER: Rgb = [207, 216, 227];
const PALE: Rgb = [248, 250, 252];
const BLUE_PALE: Rgb = [239, 246, 255];
const GREEN_PALE: Rgb = [240, 253, 244];
const AMBER_PALE: Rgb = [255, 251, 235];
const RED_PALE: Rgb = [254, 242, 242];

export function downloadNationalLocalPlanDashboardPdf({ rows, filters, fileName }: Args) {
  if (typeof window === "undefined" || rows.length === 0) return;

  const totals = calculateTotals(rows);
  const daily = buildDailySummary(rows);
  const sites = buildSiteSummary(rows);
  const streams: string[] = [];

  streams.push(buildExecutivePage(rows, filters, totals, daily, sites));

  const sitePageSize = 20;
  for (let index = 0; index < sites.length; index += sitePageSize) {
    streams.push(buildSitePage(sites.slice(index, index + sitePageSize), filters, index / sitePageSize + 1, Math.ceil(sites.length / sitePageSize)));
  }

  const detailPageSize = 23;
  for (let index = 0; index < rows.length; index += detailPageSize) {
    streams.push(buildDetailPage(rows.slice(index, index + detailPageSize), filters, index / detailPageSize + 1, Math.ceil(rows.length / detailPageSize)));
  }

  const pdf = assemble(streams);
  const blob = new Blob([pdf], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName.endsWith(".pdf") ? fileName : `${fileName}.pdf`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function buildExecutivePage(
  rows: NationalLocalPlanRow[],
  filters: NationalLocalPlanDashboardPdfFilters,
  totals: ReturnType<typeof calculateTotals>,
  daily: PdfDailySummary[],
  sites: PdfSiteSummary[],
) {
  const c: string[] = [];
  drawHeader(c, "National vs Local Plan Dashboard", `${formatDate(filters.startDate)} to ${formatDate(filters.endDate)} | Executive management summary`, "Executive summary");

  sectionTitle(c, 24, 500, "ACTIVE DASHBOARD FILTERS");
  const filterValues = [
    ["Region", filters.region],
    ["Reporting site", filters.site],
    ["Plan change", filters.changeBand],
    ["Volume", filters.volumeBand],
    ["Timing profile", filters.timingProfile],
  ] as const;
  filterValues.forEach(([label, value], index) => {
    const x = 24 + index * 158;
    infoBox(c, x, 456, 148, 38, label, clip(value, 24));
  });

  sectionTitle(c, 24, 438, "KEY PERFORMANCE INDICATORS");
  const kpis = [
    ["National duties planned", formatNumber(totals.national), `${totals.siteCount} reporting sites`, BLUE_PALE],
    ["Local agreed plan", formatNumber(totals.local), `${formatNumber(totals.adjusted)} duties adjusted`, GREEN_PALE],
    ["Plan retained", `${totals.retainedPercent}%`, `${totals.adjustedPercent}% adjusted`, GREEN_PALE],
    ["On time / OT", `${totals.timingPercentages.OT}%`, `${formatNumber(totals.timingCounts.OT)} duties`, GREEN_PALE],
    ["Late / failed", `${totals.lateRiskPercent}%`, "L, VL and F combined", AMBER_PALE],
    ["Rows selected", formatNumber(rows.length), `${daily.length} completed days`, PALE],
  ] as const;
  kpis.forEach(([label, value, helper, fill], index) => {
    const column = index % 3;
    const row = Math.floor(index / 3);
    kpiBox(c, 24 + column * 265, 376 - row * 65, 252, 55, label, value, helper, fill as Rgb);
  });

  sectionTitle(c, 24, 246, "TIMING MIX - SELECTED NATIONAL DUTIES");
  drawTimingBar(c, 24, 213, 794, 24, totals.timingCounts, totals.national);
  let legendX = 24;
  timingCodes.forEach((code) => {
    const colour = hexToRgb(timingColours[code]);
    rect(c, legendX, 192, 9, 9, colour);
    text(c, legendX + 13, 193, `${code} ${totals.timingPercentages[code]}%`, 7, "F2", TEXT);
    legendX += 92;
  });

  sectionTitle(c, 24, 169, "DAILY PLAN POSITION");
  drawDailyTable(c, daily.slice(0, 7), 24, 43, 480);

  sectionTitle(c, 522, 169, "SITES REQUIRING MOST ATTENTION");
  drawAttentionTable(c, sites.slice(0, 7), 522, 43, 296);

  footer(c, "Dashboard PDF | All figures and tables use the active filter selection shown above.");
  return c.join("\n");
}

function buildSitePage(
  rows: PdfSiteSummary[],
  filters: NationalLocalPlanDashboardPdfFilters,
  page: number,
  totalPages: number,
) {
  const c: string[] = [];
  drawHeader(c, "National vs Local Plan Dashboard", `${formatDate(filters.startDate)} to ${formatDate(filters.endDate)} | Site performance`, `Site table ${page} of ${totalPages}`);
  sectionTitle(c, 24, 500, "SITE PERFORMANCE - ALPHABETICAL");

  const columns = [
    ["REGION / SITE", 210], ["NAT", 42], ["LOCAL", 44], ["ADJ", 38], ["RETAIN", 48],
    ["VE", 35], ["E", 35], ["OT", 35], ["L", 35], ["VL", 35], ["F", 35], ["LATE RISK", 57],
  ] as const;
  let x = 24;
  columns.forEach(([label, width], index) => {
    rect(c, x, 465, width, 28, index < 5 ? NAVY : [45, 62, 88]);
    text(c, x + (index === 0 ? 4 : width / 2), 476, label, 6.5, "F2", WHITE, index === 0 ? "left" : "center");
    x += width;
  });

  let y = 465;
  rows.forEach((row, rowIndex) => {
    const fill = rowIndex % 2 === 0 ? WHITE : PALE;
    const values = [
      `${row.region} | ${row.site}`,
      formatNumber(row.national),
      formatNumber(row.local),
      formatNumber(row.adjusted),
      `${row.retainedPercent}%`,
      `${row.timingPercentages.VE}%`,
      `${row.timingPercentages.E}%`,
      `${row.timingPercentages.OT}%`,
      `${row.timingPercentages.L}%`,
      `${row.timingPercentages.VL}%`,
      `${row.timingPercentages.F}%`,
      `${row.lateRiskPercent}%`,
    ];
    x = 24;
    columns.forEach(([, width], columnIndex) => {
      rect(c, x, y - 20, width, 20, fill, BORDER, 0.45);
      text(c, x + (columnIndex === 0 ? 4 : width / 2), y - 13, clip(values[columnIndex], columnIndex === 0 ? 44 : 10), 6.3, columnIndex === 0 ? "F1" : "F2", TEXT, columnIndex === 0 ? "left" : "center");
      x += width;
    });
    y -= 20;
  });

  footer(c, "Plan retained = Local Agreed Plan / National Duties Planned. Late risk = L + VL + F.");
  return c.join("\n");
}

function buildDetailPage(
  rows: NationalLocalPlanRow[],
  filters: NationalLocalPlanDashboardPdfFilters,
  page: number,
  totalPages: number,
) {
  const c: string[] = [];
  drawHeader(c, "National vs Local Plan Dashboard", `${formatDate(filters.startDate)} to ${formatDate(filters.endDate)} | Selected detail`, `Detail ${page} of ${totalPages}`);
  sectionTitle(c, 24, 500, "DAILY SITE DETAIL");

  const columns = [
    ["DATE", 58], ["REGION / SITE", 202], ["NAT", 34], ["LOCAL", 38], ["ADJ", 32], ["RETAIN", 43],
    ["VE", 35], ["E", 35], ["OT", 35], ["L", 35], ["VL", 35], ["F", 35], ["PROFILE", 75],
  ] as const;
  let x = 24;
  columns.forEach(([label, width], index) => {
    rect(c, x, 465, width, 28, index < 6 ? NAVY : [45, 62, 88]);
    text(c, x + (index <= 1 ? 4 : width / 2), 476, label, 6.2, "F2", WHITE, index <= 1 ? "left" : "center");
    x += width;
  });

  let y = 465;
  rows.forEach((row, rowIndex) => {
    const fill = rowIndex % 2 === 0 ? WHITE : PALE;
    const values = [
      formatDate(row.date),
      `${row.region} | ${row.site}`,
      String(row.nationalDuties),
      String(row.localAgreedDuties),
      String(row.adjustedDuties),
      `${row.planRetainedPercent}%`,
      `${row.timingPercentages.VE}%`,
      `${row.timingPercentages.E}%`,
      `${row.timingPercentages.OT}%`,
      `${row.timingPercentages.L}%`,
      `${row.timingPercentages.VL}%`,
      `${row.timingPercentages.F}%`,
      row.timingProfile,
    ];
    x = 24;
    columns.forEach(([, width], columnIndex) => {
      rect(c, x, y - 17, width, 17, fill, BORDER, 0.4);
      text(c, x + (columnIndex <= 1 ? 3 : width / 2), y - 11.5, clip(values[columnIndex], columnIndex === 1 ? 40 : columnIndex === 12 ? 16 : 10), 5.8, columnIndex <= 1 ? "F1" : "F2", TEXT, columnIndex <= 1 ? "left" : "center");
      x += width;
    });
    y -= 17;
  });

  footer(c, "Timing percentages represent the VE/E/OT/L/VL/F distribution for each daily site plan row.");
  return c.join("\n");
}

function drawHeader(c: string[], title: string, subtitle: string, pageLabel: string) {
  rect(c, 0, PAGE_HEIGHT - 68, PAGE_WIDTH, 68, NAVY);
  rect(c, 0, PAGE_HEIGHT - 73, PAGE_WIDTH, 5, RED);
  text(c, 24, PAGE_HEIGHT - 30, title, 18, "F2", WHITE);
  text(c, 24, PAGE_HEIGHT - 49, subtitle, 8, "F1", [219, 228, 241]);
  text(c, 818, PAGE_HEIGHT - 30, pageLabel, 8, "F2", WHITE, "right");
}

function sectionTitle(c: string[], x: number, y: number, value: string) {
  text(c, x, y, value, 8, "F2", NAVY);
  rect(c, x, y - 6, 42, 2, RED);
}

function infoBox(c: string[], x: number, y: number, width: number, height: number, label: string, value: string) {
  rect(c, x, y, width, height, PALE, BORDER, 0.6);
  text(c, x + 7, y + height - 13, label.toUpperCase(), 5.8, "F2", MUTED);
  text(c, x + 7, y + 9, value, 8, "F2", TEXT);
}

function kpiBox(c: string[], x: number, y: number, width: number, height: number, label: string, value: string, helper: string, fill: Rgb) {
  rect(c, x, y, width, height, fill, BORDER, 0.6);
  text(c, x + 9, y + height - 15, label.toUpperCase(), 6.2, "F2", MUTED);
  text(c, x + 9, y + 19, value, 15, "F2", NAVY);
  text(c, x + 96, y + 21, helper, 6.6, "F1", MUTED);
}

function drawTimingBar(c: string[], x: number, y: number, width: number, height: number, counts: TimingCounts, total: number) {
  let currentX = x;
  timingCodes.forEach((code, index) => {
    const segmentWidth = index === timingCodes.length - 1
      ? x + width - currentX
      : total
        ? (counts[code] / total) * width
        : 0;
    if (segmentWidth > 0) rect(c, currentX, y, segmentWidth, height, hexToRgb(timingColours[code]));
    if (segmentWidth > 35) text(c, currentX + segmentWidth / 2, y + 8, `${code} ${Math.round((counts[code] / Math.max(1, total)) * 100)}%`, 6.2, "F2", WHITE, "center");
    currentX += segmentWidth;
  });
  rect(c, x, y, width, height, [255, 255, 255], BORDER, 0.7, true);
}

function drawDailyTable(c: string[], rows: PdfDailySummary[], x: number, y: number, width: number) {
  const columns = [["DATE", 85], ["NAT", 52], ["LOCAL", 52], ["ADJ", 45], ["RETAIN", 62], ["OT", 52], ["LATE RISK", 66]] as const;
  let currentX = x;
  columns.forEach(([label, columnWidth]) => {
    rect(c, currentX, y + 98, columnWidth, 22, NAVY);
    text(c, currentX + columnWidth / 2, y + 106, label, 6.2, "F2", WHITE, "center");
    currentX += columnWidth;
  });
  let currentY = y + 98;
  rows.forEach((row, index) => {
    currentY -= 14;
    currentX = x;
    const values = [formatDate(row.date), String(row.national), String(row.local), String(row.adjusted), `${row.retainedPercent}%`, `${row.timingPercentages.OT}%`, `${row.lateRiskPercent}%`];
    columns.forEach(([, columnWidth], columnIndex) => {
      rect(c, currentX, currentY, columnWidth, 14, index % 2 === 0 ? WHITE : PALE, BORDER, 0.35);
      text(c, currentX + columnWidth / 2, currentY + 4, values[columnIndex], 5.8, columnIndex === 0 ? "F1" : "F2", TEXT, "center");
      currentX += columnWidth;
    });
  });
  void width;
}

function drawAttentionTable(c: string[], rows: PdfSiteSummary[], x: number, y: number, width: number) {
  const columns = [["SITE", 154], ["ADJ", 42], ["RETAIN", 49], ["LATE", 51]] as const;
  let currentX = x;
  columns.forEach(([label, columnWidth]) => {
    rect(c, currentX, y + 98, columnWidth, 22, NAVY);
    text(c, currentX + (label === "SITE" ? 4 : columnWidth / 2), y + 106, label, 6.2, "F2", WHITE, label === "SITE" ? "left" : "center");
    currentX += columnWidth;
  });
  let currentY = y + 98;
  rows.forEach((row, index) => {
    currentY -= 14;
    currentX = x;
    const values = [row.site, String(row.adjusted), `${row.retainedPercent}%`, `${row.lateRiskPercent}%`];
    columns.forEach(([, columnWidth], columnIndex) => {
      rect(c, currentX, currentY, columnWidth, 14, index % 2 === 0 ? WHITE : RED_PALE, BORDER, 0.35);
      text(c, currentX + (columnIndex === 0 ? 3 : columnWidth / 2), currentY + 4, clip(values[columnIndex], columnIndex === 0 ? 26 : 9), 5.7, columnIndex === 0 ? "F1" : "F2", TEXT, columnIndex === 0 ? "left" : "center");
      currentX += columnWidth;
    });
  });
  void width;
}

function footer(c: string[], value: string) {
  rect(c, 0, 0, PAGE_WIDTH, 27, PALE);
  text(c, 24, 10, value, 6.2, "F1", MUTED);
  text(c, 818, 10, `Generated ${new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short" }).format(new Date())}`, 6.2, "F1", MUTED, "right");
}

function calculateTotals(rows: NationalLocalPlanRow[]) {
  const national = rows.reduce((sum, row) => sum + row.nationalDuties, 0);
  const local = rows.reduce((sum, row) => sum + row.localAgreedDuties, 0);
  const adjusted = national - local;
  const timingCounts = emptyTimingCounts();
  rows.forEach((row) => timingCodes.forEach((code) => { timingCounts[code] += row.timingCounts[code]; }));
  const timingPercentages = percentagesFromCounts(timingCounts, national);
  return {
    national,
    local,
    adjusted,
    retainedPercent: national ? roundOne((local / national) * 100) : 0,
    adjustedPercent: national ? roundOne((adjusted / national) * 100) : 0,
    timingCounts,
    timingPercentages,
    lateRiskPercent: timingPercentages.L + timingPercentages.VL + timingPercentages.F,
    siteCount: new Set(rows.map((row) => row.site)).size,
  };
}

function buildDailySummary(rows: NationalLocalPlanRow[]) {
  const grouped = new Map<string, NationalLocalPlanRow[]>();
  rows.forEach((row) => grouped.set(row.date, [...(grouped.get(row.date) ?? []), row]));
  return [...grouped.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([date, dayRows]) => {
    const totals = calculateTotals(dayRows);
    return { date, ...totals };
  });
}

function buildSiteSummary(rows: NationalLocalPlanRow[]) {
  const grouped = new Map<string, NationalLocalPlanRow[]>();
  rows.forEach((row) => grouped.set(row.site, [...(grouped.get(row.site) ?? []), row]));
  return [...grouped.entries()].map(([site, siteRows]) => {
    const totals = calculateTotals(siteRows);
    return { site, region: siteRows[0]?.region ?? "", ...totals };
  }).sort((a, b) => b.adjustedPercent - a.adjustedPercent || b.lateRiskPercent - a.lateRiskPercent || a.site.localeCompare(b.site));
}

function emptyTimingCounts(): TimingCounts {
  return { VE: 0, E: 0, OT: 0, L: 0, VL: 0, F: 0 };
}

function percentagesFromCounts(counts: TimingCounts, total: number) {
  const result = emptyTimingCounts();
  timingCodes.forEach((code) => { result[code] = total ? roundOne((counts[code] / total) * 100) : 0; });
  return result;
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-GB").format(value);
}

function clip(value: string, max: number) {
  return value.length > max ? `${value.slice(0, Math.max(1, max - 1))}…` : value;
}

function hexToRgb(value: string): Rgb {
  const hex = value.replace("#", "");
  return [Number.parseInt(hex.slice(0, 2), 16), Number.parseInt(hex.slice(2, 4), 16), Number.parseInt(hex.slice(4, 6), 16)];
}

function esc(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)").replace(/[^\x20-\x7E]/g, "-");
}

function rgb(value: Rgb) {
  return value.map((number) => (number / 255).toFixed(3)).join(" ");
}

function rect(c: string[], x: number, y: number, width: number, height: number, fill: Rgb, stroke?: Rgb, strokeWidth = 0, strokeOnly = false) {
  if (!strokeOnly) c.push(`${rgb(fill)} rg`, `${x} ${y} ${width} ${height} re f`);
  if (stroke && strokeWidth) c.push(`${strokeWidth} w`, `${rgb(stroke)} RG`, `${x} ${y} ${width} ${height} re S`);
}

function text(c: string[], x: number, y: number, value: string, size: number, font: string, colour: Rgb, align: "left" | "center" | "right" = "left") {
  const estimatedWidth = value.length * size * 0.47;
  const tx = align === "center" ? x - estimatedWidth / 2 : align === "right" ? x - estimatedWidth : x;
  c.push("BT", `/${font} ${size} Tf`, `${rgb(colour)} rg`, `1 0 0 1 ${tx.toFixed(2)} ${y.toFixed(2)} Tm`, `(${esc(value)}) Tj`, "ET");
}

function assemble(streams: string[]) {
  const objects: string[] = [];
  objects.push("<< /Type /Catalog /Pages 2 0 R >>");
  const pageIds = streams.map((_, index) => 5 + index * 2);
  objects.push(`<< /Type /Pages /Kids [${pageIds.map((id) => `${id} 0 R`).join(" ")}] /Count ${pageIds.length} >>`);
  objects.push("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>");
  objects.push("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>");
  streams.forEach((stream, index) => {
    const contentId = 6 + index * 2;
    objects.push(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PAGE_WIDTH} ${PAGE_HEIGHT}] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ${contentId} 0 R >>`);
    objects.push(`<< /Length ${new TextEncoder().encode(stream).length} >>\nstream\n${stream}\nendstream`);
  });

  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  objects.forEach((object, index) => {
    offsets.push(new TextEncoder().encode(pdf).length);
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });
  const xref = new TextEncoder().encode(pdf).length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  offsets.slice(1).forEach((offset) => { pdf += `${String(offset).padStart(10, "0")} 00000 n \n`; });
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  return new TextEncoder().encode(pdf);
}

