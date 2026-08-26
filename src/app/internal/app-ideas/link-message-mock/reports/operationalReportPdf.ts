export type PdfTone = "navy" | "blue" | "green" | "amber" | "red" | "purple" | "teal";

export type OperationalPdfKpi = {
  label: string;
  value: string;
  helper?: string;
  tone?: PdfTone;
};

export type OperationalPdfColumn = {
  label: string;
  width: number;
  align?: "left" | "center" | "right";
};

export type DownloadOperationalReportPdfArgs = {
  fileName: string;
  title: string;
  subtitle: string;
  filters: { label: string; value: string }[];
  kpis: OperationalPdfKpi[];
  columns: OperationalPdfColumn[];
  rows: string[][];
  notes?: string[];
};

type Rgb = [number, number, number];

const PAGE_WIDTH = 842;
const PAGE_HEIGHT = 595;
const CONTENT_X = 24;
const CONTENT_WIDTH = 794;
const NAVY: Rgb = [16, 32, 58];
const RED: Rgb = [228, 0, 0];
const WHITE: Rgb = [255, 255, 255];
const TEXT: Rgb = [17, 24, 39];
const MUTED: Rgb = [84, 97, 116];
const BORDER: Rgb = [210, 219, 230];
const PALE: Rgb = [248, 250, 252];

const toneColours: Record<PdfTone, { fill: Rgb; accent: Rgb }> = {
  navy: { fill: [238, 242, 247], accent: NAVY },
  blue: { fill: [239, 246, 255], accent: [37, 99, 235] },
  green: { fill: [236, 253, 245], accent: [22, 163, 74] },
  amber: { fill: [255, 251, 235], accent: [217, 119, 6] },
  red: { fill: [255, 241, 242], accent: [220, 38, 38] },
  purple: { fill: [245, 243, 255], accent: [124, 58, 237] },
  teal: { fill: [240, 253, 250], accent: [13, 148, 136] },
};

export function downloadOperationalReportPdf(args: DownloadOperationalReportPdfArgs) {
  if (typeof window === "undefined" || args.rows.length === 0) return;

  const pdf = createOperationalReportPdf(args);
  const blob = new Blob([pdf], { type: "application/pdf" });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = args.fileName.replace(/\.pdf$/i, "") + ".pdf";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

export function createOperationalReportPdf(args: DownloadOperationalReportPdfArgs) {
  const generated = new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date());

  const detailPages = chunk(args.rows, 19);
  const streams = [buildSummaryPage(args, generated)];
  detailPages.forEach((rows, index) => {
    streams.push(buildDetailPage(args, rows, index + 1, detailPages.length, generated));
  });
  return assemblePdf(streams);
}

function buildSummaryPage(args: DownloadOperationalReportPdfArgs, generated: string) {
  const c: string[] = [];
  header(c, args.title, args.subtitle, "Executive summary");
  text(c, 24, 505, `Generated: ${sanitise(generated)}`, 7, "F1", MUTED);
  text(c, 818, 505, `${args.rows.length} selected row(s)`, 7, "F2", NAVY, "right");

  sectionTitle(c, 24, 482, "ACTIVE SELECTION");
  const filterWidth = 190;
  args.filters.slice(0, 8).forEach((filter, index) => {
    const col = index % 4;
    const row = Math.floor(index / 4);
    infoBox(c, 24 + col * 198, 425 - row * 52, filterWidth, 42, filter.label, filter.value);
  });

  const filterRows = Math.ceil(Math.min(args.filters.length, 8) / 4);
  const kpiTitleY = filterRows > 1 ? 358 : 410;
  sectionTitle(c, 24, kpiTitleY, "KEY PERFORMANCE INDICATORS");
  args.kpis.slice(0, 6).forEach((kpi, index) => {
    const col = index % 3;
    const row = Math.floor(index / 3);
    const y = kpiTitleY - 70 - row * 68;
    kpiBox(c, 24 + col * 265, y, 252, 57, kpi);
  });

  const notesY = kpiTitleY - 160;
  sectionTitle(c, 24, notesY, "REPORT NOTES");
  const notes = args.notes?.length ? args.notes : ["The detailed pages contain every row included by the active dashboard filters."];
  notes.slice(0, 5).forEach((note, index) => {
    text(c, 34, notesY - 24 - index * 17, `• ${sanitise(note)}`, 8, "F1", TEXT);
  });

  rect(c, 24, 43, CONTENT_WIDTH, 44, [246, 248, 251], BORDER, 0.6);
  text(c, 36, 68, "DATA EXPORT", 6.2, "F2", MUTED);
  text(c, 36, 52, `This PDF contains ${args.rows.length} selected data row(s) plus this summary page.`, 8, "F2", NAVY);
  footer(c, "DriverOS reporting workspace | Presentation-quality PDF generated from the active selection.");
  return c.join("\n");
}

function buildDetailPage(
  args: DownloadOperationalReportPdfArgs,
  rows: string[][],
  page: number,
  totalPages: number,
  generated: string,
) {
  const c: string[] = [];
  header(c, args.title, args.subtitle, `Data ${page} of ${totalPages}`);
  text(c, 24, 505, `Generated: ${sanitise(generated)}`, 6.5, "F1", MUTED);
  text(c, 818, 505, `Selected rows: ${args.rows.length}`, 6.5, "F2", NAVY, "right");
  sectionTitle(c, 24, 482, "SELECTED DATA");

  const totalWidth = args.columns.reduce((sum, column) => sum + column.width, 0);
  const scale = totalWidth > CONTENT_WIDTH ? CONTENT_WIDTH / totalWidth : 1;
  let x = CONTENT_X;
  args.columns.forEach((column, index) => {
    const width = column.width * scale;
    rect(c, x, 444, width, 28, index === 0 ? NAVY : [37, 52, 75]);
    text(c, x + (column.align === "left" ? 4 : width / 2), 455, column.label, 6.2, "F2", WHITE, column.align === "left" ? "left" : "center");
    x += width;
  });

  let y = 444;
  rows.forEach((row, rowIndex) => {
    y -= 20;
    x = CONTENT_X;
    args.columns.forEach((column, columnIndex) => {
      const width = column.width * scale;
      rect(c, x, y, width, 20, rowIndex % 2 === 0 ? WHITE : PALE, BORDER, 0.4);
      const align = column.align ?? (columnIndex <= 1 ? "left" : "center");
      const raw = sanitise(String(row[columnIndex] ?? ""));
      const fitted = fitText(raw, width - 8, 6.1);
      const tx = align === "left" ? x + 4 : align === "right" ? x + width - 4 : x + width / 2;
      text(c, tx, y + 7, fitted, 6.1, columnIndex <= 1 ? "F1" : "F2", TEXT, align);
      x += width;
    });
  });

  footer(c, `DriverOS reporting workspace | Detail page ${page} of ${totalPages}.`);
  return c.join("\n");
}

function header(c: string[], title: string, subtitle: string, label: string) {
  rect(c, 0, PAGE_HEIGHT - 68, PAGE_WIDTH, 68, NAVY);
  rect(c, 0, PAGE_HEIGHT - 73, PAGE_WIDTH, 5, RED);
  text(c, 24, PAGE_HEIGHT - 30, title, 18, "F2", WHITE);
  text(c, 24, PAGE_HEIGHT - 49, fitText(subtitle, 590, 8), 8, "F1", [219, 228, 241]);
  text(c, 818, PAGE_HEIGHT - 30, label, 8, "F2", WHITE, "right");
}

function sectionTitle(c: string[], x: number, y: number, value: string) {
  text(c, x, y, value, 8, "F2", NAVY);
  rect(c, x, y - 6, 42, 2, RED);
}

function infoBox(c: string[], x: number, y: number, width: number, height: number, label: string, value: string) {
  rect(c, x, y, width, height, PALE, BORDER, 0.6);
  text(c, x + 7, y + height - 14, label.toUpperCase(), 5.7, "F2", MUTED);
  text(c, x + 7, y + 10, fitText(value, width - 14, 8), 8, "F2", TEXT);
}

function kpiBox(c: string[], x: number, y: number, width: number, height: number, kpi: OperationalPdfKpi) {
  const colours = toneColours[kpi.tone ?? "navy"];
  rect(c, x, y, width, height, colours.fill, BORDER, 0.6);
  rect(c, x, y, 5, height, colours.accent);
  text(c, x + 12, y + height - 16, kpi.label.toUpperCase(), 6.2, "F2", MUTED);
  text(c, x + 12, y + 21, fitText(kpi.value, 92, 15), 15, "F2", NAVY);
  if (kpi.helper) text(c, x + 106, y + 22, fitText(kpi.helper, width - 118, 6.6), 6.6, "F1", MUTED);
}

function footer(c: string[], value: string) {
  text(c, 24, 16, fitText(value, 690, 6), 6, "F1", MUTED);
}

function rect(c: string[], x: number, y: number, width: number, height: number, fill: Rgb, stroke?: Rgb, lineWidth = 0.5) {
  c.push(`${rgb(fill)} rg`);
  if (stroke) {
    c.push(`${rgb(stroke)} RG`);
    c.push(`${lineWidth.toFixed(2)} w`);
    c.push(`${x.toFixed(2)} ${y.toFixed(2)} ${width.toFixed(2)} ${height.toFixed(2)} re B`);
  } else {
    c.push(`${x.toFixed(2)} ${y.toFixed(2)} ${width.toFixed(2)} ${height.toFixed(2)} re f`);
  }
}

function text(
  c: string[],
  x: number,
  y: number,
  value: string,
  size: number,
  font: "F1" | "F2",
  colour: Rgb,
  align: "left" | "center" | "right" = "left",
) {
  const safe = sanitise(value);
  const estimate = safe.length * size * 0.5;
  const adjustedX = align === "center" ? x - estimate / 2 : align === "right" ? x - estimate : x;
  c.push("BT");
  c.push(`/${font} ${size.toFixed(2)} Tf`);
  c.push(`${rgb(colour)} rg`);
  c.push(`${adjustedX.toFixed(2)} ${y.toFixed(2)} Td`);
  c.push(`(${escapePdf(safe)}) Tj`);
  c.push("ET");
}

function fitText(value: string, width: number, fontSize: number) {
  const max = Math.max(4, Math.floor(width / Math.max(2.5, fontSize * 0.5)));
  return value.length <= max ? value : `${value.slice(0, Math.max(1, max - 3))}...`;
}

function rgb(value: Rgb) {
  return value.map((channel) => (channel / 255).toFixed(3)).join(" ");
}

function sanitise(value: string) {
  return value
    .replace(/[–—]/g, "-")
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/•/g, "-")
    .normalize("NFKD")
    .replace(/[^\x20-\x7E]/g, "?");
}

function escapePdf(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

function chunk<T>(items: T[], size: number) {
  const result: T[][] = [];
  for (let index = 0; index < items.length; index += size) result.push(items.slice(index, index + size));
  return result.length ? result : [[]];
}

function assemblePdf(pageStreams: string[]) {
  const objects: string[] = [];
  const pageObjectNumbers = pageStreams.map((_, index) => 5 + index * 2);
  objects[1] = "<< /Type /Catalog /Pages 2 0 R >>";
  objects[2] = `<< /Type /Pages /Kids [${pageObjectNumbers.map((number) => `${number} 0 R`).join(" ")}] /Count ${pageStreams.length} >>`;
  objects[3] = "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>";
  objects[4] = "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>";

  pageStreams.forEach((stream, index) => {
    const pageObject = 5 + index * 2;
    const contentObject = pageObject + 1;
    objects[pageObject] = `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PAGE_WIDTH} ${PAGE_HEIGHT}] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ${contentObject} 0 R >>`;
    objects[contentObject] = `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`;
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
