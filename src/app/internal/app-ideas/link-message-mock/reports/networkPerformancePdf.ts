export type NetworkPerformancePdfRow = {
  reportingSite: string;
  debriefStatus: string;
  legState: string;
  dutyDate: string;
  weekNumber: number;
  dutyOrder: number;
  dutyNumber: string;
  division: string;
  driver: string;
  vehicle: string;
  trailerNumber: string;
  traffic: string;
  departureLocation: string;
  plannedStartTs: string;
  actualStartTs: string;
  startDifference: string;
  dtt: string;
  departureAssets: number;
  finalDestination: string;
  plannedFinishTs: string;
  actualFinishTs: string;
  finishDifference: string;
  att: string;
  arrivalAssets: number;
  issueCategory: string;
  driverNotes: string;
  outcome: string;
  debriefedBy: string;
  debriefedAtTs: string;
};

type CreateNetworkPerformancePdfArgs = {
  rows: NetworkPerformancePdfRow[];
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
};

type DownloadNetworkPerformancePdfArgs = CreateNetworkPerformancePdfArgs & {
  fileName: string;
};

type PdfPageRow = {
  row: NetworkPerformancePdfRow;
  detailLines: string[];
  height: number;
};

type Rgb = [number, number, number];

const PAGE_WIDTH = 842;
const PAGE_HEIGHT = 595;
const CONTENT_X = 24;
const CONTENT_WIDTH = 794;
const TABLE_TOP = 482;
const TABLE_HEADER_HEIGHT = 25;
const FOOTER_TOP = 30;
const MAIN_ROW_HEIGHT = 18;
const DETAIL_LINE_HEIGHT = 7;
const DETAIL_HORIZONTAL_PADDING = 4;
const DETAIL_VERTICAL_PADDING = 4;

const NAVY: Rgb = [16, 32, 58];
const RED: Rgb = [228, 0, 0];
const WHITE: Rgb = [255, 255, 255];
const TEXT: Rgb = [17, 24, 39];
const MUTED: Rgb = [75, 85, 99];
const BORDER: Rgb = [207, 216, 227];
const PALE_ROW: Rgb = [248, 250, 252];
const DETAIL_FILL: Rgb = [242, 246, 250];
const GREEN_FILL: Rgb = [234, 247, 239];
const GREEN_TEXT: Rgb = [22, 101, 52];
const AMBER_FILL: Rgb = [255, 247, 237];
const AMBER_TEXT: Rgb = [180, 83, 9];
const RED_FILL: Rgb = [255, 241, 242];
const RED_TEXT: Rgb = [153, 27, 27];
const BLUE_FILL: Rgb = [239, 246, 255];
const BLUE_TEXT: Rgb = [15, 58, 109];

const tableColumns = [
  { title: "SITE", width: 107, key: "site" },
  { title: "DUTY DATE", width: 44, key: "date" },
  { title: "WK", width: 20, key: "week" },
  { title: "DUTY", width: 45, key: "duty" },
  { title: "LEG", width: 18, key: "leg" },
  { title: "DRIVER", width: 67, key: "driver" },
  { title: "VEHICLE", width: 45, key: "vehicle" },
  { title: "TRAILER", width: 48, key: "trailer" },
  { title: "DUE TO CONVEY", width: 65, key: "traffic" },
  { title: "PLAN START", width: 48, key: "plannedStart" },
  { title: "ACT START", width: 48, key: "actualStart" },
  { title: "DTT", width: 24, key: "dtt" },
  { title: "PLAN FINISH", width: 48, key: "plannedFinish" },
  { title: "ACT FINISH", width: 48, key: "actualFinish" },
  { title: "ATT", width: 24, key: "att" },
  { title: "ASSETS", width: 35, key: "assets" },
  { title: "OUTCOME", width: 60, key: "outcome" },
] as const;

export function downloadNetworkPerformancePdf({
  rows,
  fileName,
  startDate,
  startTime,
  endDate,
  endTime,
}: DownloadNetworkPerformancePdfArgs) {
  if (typeof window === "undefined" || rows.length === 0) {
    return;
  }

  const pdf = createNetworkPerformancePdf({ rows, startDate, startTime, endDate, endTime });
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

export function createNetworkPerformancePdf({
  rows,
  startDate,
  startTime,
  endDate,
  endTime,
}: CreateNetworkPerformancePdfArgs) {
  const preparedRows = rows.map(preparePageRow);
  const pages = paginateRows(preparedRows);
  const uniqueSites = new Set(rows.map((row) => row.reportingSite)).size;
  const generated = new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date());

  const pageStreams = pages.map((pageRows, pageIndex) =>
    renderPage({
      pageRows,
      pageIndex,
      totalPages: pages.length,
      totalRows: rows.length,
      uniqueSites,
      startDate,
      startTime,
      endDate,
      endTime,
      generated,
    }),
  );

  return assemblePdf(pageStreams);
}

function preparePageRow(row: NetworkPerformancePdfRow): PdfPageRow {
  const detailText = [
    `Route: ${row.departureLocation} -> ${row.finalDestination}`,
    `Start diff: ${row.startDifference}`,
    `Finish diff: ${row.finishDifference}`,
    `Issue: ${row.issueCategory}`,
    `Status: ${row.debriefStatus} / ${row.legState} / ${row.division}`,
    `Debriefed: ${row.debriefedBy} at ${formatPdfDateTime(row.debriefedAtTs)}`,
    `Notes: ${row.driverNotes}`,
  ].join("  |  ");

  const detailLines = wrapText(detailText, 254);
  const height = MAIN_ROW_HEIGHT + DETAIL_VERTICAL_PADDING + detailLines.length * DETAIL_LINE_HEIGHT;

  return { row, detailLines, height };
}

function paginateRows(rows: PdfPageRow[]) {
  const pages: PdfPageRow[][] = [];
  let currentPage: PdfPageRow[] = [];
  let remainingHeight = TABLE_TOP - TABLE_HEADER_HEIGHT - FOOTER_TOP;

  rows.forEach((row) => {
    if (currentPage.length > 0 && row.height > remainingHeight) {
      pages.push(currentPage);
      currentPage = [];
      remainingHeight = TABLE_TOP - TABLE_HEADER_HEIGHT - FOOTER_TOP;
    }

    currentPage.push(row);
    remainingHeight -= row.height;
  });

  if (currentPage.length > 0) {
    pages.push(currentPage);
  }

  return pages.length > 0 ? pages : [[]];
}

function renderPage({
  pageRows,
  pageIndex,
  totalPages,
  totalRows,
  uniqueSites,
  startDate,
  startTime,
  endDate,
  endTime,
  generated,
}: {
  pageRows: PdfPageRow[];
  pageIndex: number;
  totalPages: number;
  totalRows: number;
  uniqueSites: number;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  generated: string;
}) {
  const commands: string[] = [];

  drawRect(commands, 0, PAGE_HEIGHT - 72, PAGE_WIDTH, 72, NAVY);
  drawRect(commands, 0, PAGE_HEIGHT - 77, PAGE_WIDTH, 5, RED);
  drawText(commands, 28, PAGE_HEIGHT - 34, "Network Performance Report", 18, "F2", WHITE);
  drawText(commands, 28, PAGE_HEIGHT - 52, "Completed Driver Debrief performance - national reporting suite", 7.5, "F1", [219, 228, 241]);

  const summaryY = PAGE_HEIGHT - 61;
  drawSummaryPill(commands, 430, summaryY, 116, "DATE RANGE", `${formatPdfDate(startDate)} ${startTime}`);
  drawSummaryPill(commands, 550, summaryY, 116, "TO", `${formatPdfDate(endDate)} ${endTime}`);
  drawSummaryPill(commands, 670, summaryY, 68, "SITES", String(uniqueSites));
  drawSummaryPill(commands, 742, summaryY, 72, "ROWS", String(totalRows));

  drawText(commands, CONTENT_X, 505, `Generated: ${sanitisePdfText(generated)}`, 6.5, "F1", MUTED);
  drawText(commands, 238, 505, "Status: Debriefed and complete", 6.5, "F1", MUTED);
  drawText(commands, 425, 505, "Division: Network", 6.5, "F1", MUTED);
  drawText(commands, 535, 505, "Assets shown as departure / arrival", 6.5, "F1", MUTED);

  drawTableHeader(commands);

  let rowTop = TABLE_TOP - TABLE_HEADER_HEIGHT;

  pageRows.forEach((preparedRow, rowIndex) => {
    const rowBottom = rowTop - preparedRow.height;
    drawReportRow(commands, preparedRow, rowIndex, rowTop, rowBottom);
    rowTop = rowBottom;
  });

  drawText(commands, CONTENT_X, 16, "Network Performance Report - completed debrief data", 6, "F1", MUTED);
  drawTextRight(commands, CONTENT_X + CONTENT_WIDTH, 16, `Page ${pageIndex + 1} of ${totalPages}`, 6.5, "F2", NAVY);

  return commands.join("\n");
}

function drawSummaryPill(commands: string[], x: number, y: number, width: number, label: string, value: string) {
  drawRect(commands, x, y, width, 35, [29, 53, 88], [77, 101, 136], 0.6);
  drawText(commands, x + 8, y + 23, label, 5.2, "F2", [185, 203, 225]);
  drawText(commands, x + 8, y + 9, fitText(value, width - 16, 7.3), 7.3, "F2", WHITE);
}

function drawTableHeader(commands: string[]) {
  drawRect(commands, CONTENT_X, TABLE_TOP - TABLE_HEADER_HEIGHT, CONTENT_WIDTH, TABLE_HEADER_HEIGHT, NAVY, NAVY, 0.4);

  let x = CONTENT_X;
  tableColumns.forEach((column) => {
    const titleLines = column.title.split(" ");
    const twoLines = titleLines.length > 1 && column.width < 60;

    if (twoLines) {
      const middle = Math.ceil(titleLines.length / 2);
      drawTextCentered(commands, x, TABLE_TOP - 10, column.width, titleLines.slice(0, middle).join(" "), 4.8, "F2", WHITE);
      drawTextCentered(commands, x, TABLE_TOP - 18, column.width, titleLines.slice(middle).join(" "), 4.8, "F2", WHITE);
    } else {
      drawTextCentered(commands, x, TABLE_TOP - 15, column.width, column.title, 4.8, "F2", WHITE);
    }

    x += column.width;
    drawLine(commands, x, TABLE_TOP - TABLE_HEADER_HEIGHT, x, TABLE_TOP, [73, 93, 122], 0.35);
  });
}

function drawReportRow(
  commands: string[],
  preparedRow: PdfPageRow,
  rowIndex: number,
  rowTop: number,
  rowBottom: number,
) {
  const { row, detailLines } = preparedRow;
  const mainBottom = rowTop - MAIN_ROW_HEIGHT;
  const rowFill = rowIndex % 2 === 0 ? WHITE : PALE_ROW;

  drawRect(commands, CONTENT_X, rowBottom, CONTENT_WIDTH, preparedRow.height, rowFill, BORDER, 0.35);
  drawRect(commands, CONTENT_X, rowBottom, CONTENT_WIDTH, mainBottom - rowBottom, DETAIL_FILL);
  drawLine(commands, CONTENT_X, mainBottom, CONTENT_X + CONTENT_WIDTH, mainBottom, BORDER, 0.35);

  const values: Record<(typeof tableColumns)[number]["key"], string> = {
    site: row.reportingSite,
    date: formatPdfDate(row.dutyDate),
    week: String(row.weekNumber),
    duty: row.dutyNumber,
    leg: String(row.dutyOrder),
    driver: row.driver,
    vehicle: row.vehicle,
    trailer: row.trailerNumber,
    traffic: row.traffic,
    plannedStart: formatPdfTime(row.plannedStartTs),
    actualStart: formatPdfTime(row.actualStartTs),
    dtt: row.dtt,
    plannedFinish: formatPdfTime(row.plannedFinishTs),
    actualFinish: formatPdfTime(row.actualFinishTs),
    att: row.att,
    assets: `${row.departureAssets}/${row.arrivalAssets}`,
    outcome: row.outcome,
  };

  let x = CONTENT_X;
  tableColumns.forEach((column) => {
    if (column.key === "dtt" || column.key === "att") {
      const timingTone = getTimingTone(values[column.key]);
      drawRect(commands, x + 2, mainBottom + 3, column.width - 4, MAIN_ROW_HEIGHT - 6, timingTone.fill, timingTone.stroke, 0.45);
      drawTextCentered(commands, x, mainBottom + 7, column.width, values[column.key], 5.6, "F2", timingTone.text);
    } else if (column.key === "outcome") {
      const outcomeTone = row.outcome === "Complete"
        ? { fill: GREEN_FILL, text: GREEN_TEXT, stroke: [134, 201, 154] as Rgb }
        : { fill: AMBER_FILL, text: AMBER_TEXT, stroke: [245, 185, 88] as Rgb };
      drawRect(commands, x + 2, mainBottom + 3, column.width - 4, MAIN_ROW_HEIGHT - 6, outcomeTone.fill, outcomeTone.stroke, 0.45);
      drawTextCentered(commands, x, mainBottom + 7, column.width, fitText(values[column.key], column.width - 7, 5.2), 5.2, "F2", outcomeTone.text);
    } else {
      const isCentred = ["week", "leg", "vehicle", "trailer", "plannedStart", "actualStart", "plannedFinish", "actualFinish", "assets"].includes(column.key);
      const value = fitText(values[column.key], column.width - 6, 5.2);

      if (isCentred) {
        drawTextCentered(commands, x, mainBottom + 7, column.width, value, 5.2, column.key === "site" ? "F2" : "F1", TEXT);
      } else {
        drawText(commands, x + 3, mainBottom + 7, value, 5.2, column.key === "site" || column.key === "duty" ? "F2" : "F1", TEXT);
      }
    }

    x += column.width;
    drawLine(commands, x, mainBottom, x, rowTop, BORDER, 0.3);
  });

  detailLines.forEach((line, lineIndex) => {
    const textY = mainBottom - DETAIL_VERTICAL_PADDING - DETAIL_LINE_HEIGHT * (lineIndex + 1) + 2;
    drawText(commands, CONTENT_X + DETAIL_HORIZONTAL_PADDING, textY, line, 5.15, "F1", MUTED);
  });
}

function getTimingTone(code: string) {
  if (code === "OT") {
    return { fill: GREEN_FILL, text: GREEN_TEXT, stroke: [134, 201, 154] as Rgb };
  }

  if (code === "E" || code === "VE") {
    return { fill: BLUE_FILL, text: BLUE_TEXT, stroke: [147, 197, 253] as Rgb };
  }

  if (code === "F") {
    return { fill: RED_FILL, text: RED_TEXT, stroke: [248, 113, 113] as Rgb };
  }

  return { fill: AMBER_FILL, text: AMBER_TEXT, stroke: [245, 185, 88] as Rgb };
}

function assemblePdf(pageStreams: string[]) {
  const objects: string[] = [];
  const pageObjectNumbers = pageStreams.map((_, index) => 5 + index * 2);

  objects[1] = "<< /Type /Catalog /Pages 2 0 R >>";
  objects[2] = `<< /Type /Pages /Kids [${pageObjectNumbers.map((number) => `${number} 0 R`).join(" ")}] /Count ${pageStreams.length} >>`;
  objects[3] = "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>";
  objects[4] = "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>";

  pageStreams.forEach((stream, pageIndex) => {
    const pageObjectNumber = 5 + pageIndex * 2;
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
  pdf += `xref\n0 ${objects.length}\n`;
  pdf += "0000000000 65535 f \n";

  for (let objectNumber = 1; objectNumber < objects.length; objectNumber += 1) {
    pdf += `${String(offsets[objectNumber]).padStart(10, "0")} 00000 n \n`;
  }

  pdf += `trailer\n<< /Size ${objects.length} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
  return pdf;
}

function drawRect(
  commands: string[],
  x: number,
  y: number,
  width: number,
  height: number,
  fill: Rgb,
  stroke?: Rgb,
  lineWidth = 0.5,
) {
  commands.push("q");
  commands.push(`${colour(fill)} rg`);

  if (stroke) {
    commands.push(`${colour(stroke)} RG`);
    commands.push(`${lineWidth} w`);
    commands.push(`${x} ${y} ${width} ${height} re B`);
  } else {
    commands.push(`${x} ${y} ${width} ${height} re f`);
  }

  commands.push("Q");
}

function drawLine(
  commands: string[],
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  stroke: Rgb,
  lineWidth: number,
) {
  commands.push("q");
  commands.push(`${colour(stroke)} RG`);
  commands.push(`${lineWidth} w`);
  commands.push(`${x1} ${y1} m ${x2} ${y2} l S`);
  commands.push("Q");
}

function drawText(
  commands: string[],
  x: number,
  y: number,
  text: string,
  fontSize: number,
  font: "F1" | "F2",
  fill: Rgb,
) {
  commands.push("BT");
  commands.push(`/${font} ${fontSize} Tf`);
  commands.push(`${colour(fill)} rg`);
  commands.push(`${x} ${y} Td`);
  commands.push(`(${escapePdfText(sanitisePdfText(text))}) Tj`);
  commands.push("ET");
}

function drawTextCentered(
  commands: string[],
  x: number,
  y: number,
  width: number,
  text: string,
  fontSize: number,
  font: "F1" | "F2",
  fill: Rgb,
) {
  const estimatedWidth = estimateTextWidth(text, fontSize);
  drawText(commands, x + Math.max(2, (width - estimatedWidth) / 2), y, text, fontSize, font, fill);
}

function drawTextRight(
  commands: string[],
  rightX: number,
  y: number,
  text: string,
  fontSize: number,
  font: "F1" | "F2",
  fill: Rgb,
) {
  drawText(commands, rightX - estimateTextWidth(text, fontSize), y, text, fontSize, font, fill);
}

function wrapText(value: string, maximumCharacters: number) {
  const clean = sanitisePdfText(value).replace(/\s+/g, " ").trim();

  if (clean.length <= maximumCharacters) {
    return [clean];
  }

  const lines: string[] = [];
  let remaining = clean;

  while (remaining.length > maximumCharacters) {
    let breakAt = remaining.lastIndexOf(" ", maximumCharacters);
    if (breakAt < maximumCharacters * 0.62) {
      breakAt = maximumCharacters;
    }

    lines.push(remaining.slice(0, breakAt).trim());
    remaining = remaining.slice(breakAt).trim();
  }

  if (remaining) {
    lines.push(remaining);
  }

  return lines;
}

function fitText(value: string, availableWidth: number, fontSize: number) {
  const clean = sanitisePdfText(value);
  if (estimateTextWidth(clean, fontSize) <= availableWidth) {
    return clean;
  }

  let trimmed = clean;
  while (trimmed.length > 1 && estimateTextWidth(`${trimmed}...`, fontSize) > availableWidth) {
    trimmed = trimmed.slice(0, -1);
  }

  return `${trimmed.trimEnd()}...`;
}

function estimateTextWidth(value: string, fontSize: number) {
  return value.length * fontSize * 0.49;
}

function formatPdfDate(value: string) {
  const [year, month, day] = value.slice(0, 10).split("-");
  return `${day}/${month}/${year.slice(-2)}`;
}

function formatPdfTime(value: string) {
  return value.slice(11, 16);
}

function formatPdfDateTime(value: string) {
  const [year, month, day] = value.slice(0, 10).split("-");
  return `${day}/${month}/${year} ${value.slice(11, 16)}`;
}

function sanitisePdfText(value: string) {
  return String(value ?? "")
    .replace(/[–—]/g, "-")
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/•/g, "-")
    .normalize("NFKD")
    .replace(/[^\x20-\x7E]/g, "?");
}

function escapePdfText(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

function colour([red, green, blue]: Rgb) {
  return `${(red / 255).toFixed(3)} ${(green / 255).toFixed(3)} ${(blue / 255).toFixed(3)}`;
}
