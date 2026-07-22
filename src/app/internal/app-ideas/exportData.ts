export type ExportFormat = "excel" | "csv" | "pdf";
export type ExportCell = string | number | boolean | null | undefined;

type ExportDataArgs = {
  format: ExportFormat;
  headers: string[];
  rows: ExportCell[][];
  fileName: string;
  title?: string;
};

export function exportTabularData({
  format,
  headers,
  rows,
  fileName,
  title = "Exported Data",
}: ExportDataArgs) {
  if (typeof window === "undefined" || rows.length === 0) {
    return;
  }

  const safeBaseName = fileName.replace(/\.(xls|xlsx|csv|pdf)$/i, "");

  if (format === "excel") {
    downloadExcel(headers, rows, `${safeBaseName}.xls`);
    return;
  }

  if (format === "csv") {
    downloadCsv(headers, rows, `${safeBaseName}.csv`);
    return;
  }

  downloadPdf(headers, rows, `${safeBaseName}.pdf`, title);
}

function downloadExcel(headers: string[], rows: ExportCell[][], fileName: string) {
  const headerHtml = headers.map((header) => `<th>${escapeHtml(header)}</th>`).join("");
  const rowsHtml = rows
    .map(
      (row) =>
        `<tr>${row.map((cell) => `<td>${escapeHtml(formatCell(cell))}</td>`).join("")}</tr>`,
    )
    .join("");

  const html = `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <style>
    table { border-collapse: collapse; font-family: Arial, sans-serif; font-size: 11px; }
    th, td { border: 1px solid #000; padding: 6px; vertical-align: middle; }
    th { background: #cfeefa; font-weight: bold; }
  </style>
</head>
<body>
  <table>
    <thead><tr>${headerHtml}</tr></thead>
    <tbody>${rowsHtml}</tbody>
  </table>
</body>
</html>`;

  downloadBlob(
    new Blob(["\ufeff", html], { type: "application/vnd.ms-excel;charset=utf-8" }),
    fileName,
  );
}

function downloadCsv(headers: string[], rows: ExportCell[][], fileName: string) {
  const csv = [headers, ...rows]
    .map((row) => row.map((cell) => quoteCsv(formatCell(cell))).join(","))
    .join("\r\n");

  downloadBlob(new Blob(["\ufeff", csv], { type: "text/csv;charset=utf-8" }), fileName);
}

function downloadPdf(
  headers: string[],
  rows: ExportCell[][],
  fileName: string,
  title: string,
) {
  const lines = buildPdfLines(headers, rows, title);
  const pdf = createSimplePdf(lines);
  downloadBlob(new Blob([pdf], { type: "application/pdf" }), fileName);
}

function buildPdfLines(headers: string[], rows: ExportCell[][], title: string) {
  const lines: string[] = [];
  const generated = new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date());

  lines.push(sanitisePdfText(title));
  lines.push(`Generated: ${sanitisePdfText(generated)}`);
  lines.push(`Rows: ${rows.length}`);
  lines.push("");

  rows.forEach((row, rowIndex) => {
    lines.push(`ROW ${rowIndex + 1}`);

    headers.forEach((header, columnIndex) => {
      const text = `${header}: ${formatCell(row[columnIndex])}`;
      lines.push(...wrapPdfLine(sanitisePdfText(text), 125));
    });

    lines.push("");
  });

  return lines;
}

function createSimplePdf(lines: string[]) {
  const pageWidth = 842;
  const pageHeight = 595;
  const linesPerPage = 54;
  const pages: string[][] = [];

  for (let index = 0; index < lines.length; index += linesPerPage) {
    pages.push(lines.slice(index, index + linesPerPage));
  }

  if (pages.length === 0) {
    pages.push(["No data"]);
  }

  const objects: string[] = [];
  const pageObjectNumbers = pages.map((_, index) => 4 + index * 2);

  objects[1] = "<< /Type /Catalog /Pages 2 0 R >>";
  objects[2] = `<< /Type /Pages /Kids [${pageObjectNumbers.map((number) => `${number} 0 R`).join(" ")}] /Count ${pages.length} >>`;
  objects[3] = "<< /Type /Font /Subtype /Type1 /BaseFont /Courier >>";

  pages.forEach((pageLines, pageIndex) => {
    const pageObjectNumber = 4 + pageIndex * 2;
    const contentObjectNumber = pageObjectNumber + 1;
    const content = [
      "BT",
      "/F1 7 Tf",
      "36 560 Td",
      "9 TL",
      ...pageLines.flatMap((line) => [`(${escapePdfText(line)}) Tj`, "T*"]),
      "ET",
    ].join("\n");

    objects[pageObjectNumber] = `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Resources << /Font << /F1 3 0 R >> >> /Contents ${contentObjectNumber} 0 R >>`;
    objects[contentObjectNumber] = `<< /Length ${content.length} >>\nstream\n${content}\nendstream`;
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

function wrapPdfLine(value: string, maximumLength: number) {
  if (value.length <= maximumLength) {
    return [value];
  }

  const lines: string[] = [];
  let remaining = value;

  while (remaining.length > maximumLength) {
    let breakAt = remaining.lastIndexOf(" ", maximumLength);

    if (breakAt < Math.floor(maximumLength * 0.55)) {
      breakAt = maximumLength;
    }

    lines.push(remaining.slice(0, breakAt).trimEnd());
    remaining = remaining.slice(breakAt).trimStart();
  }

  if (remaining) {
    lines.push(remaining);
  }

  return lines;
}

function sanitisePdfText(value: string) {
  return value
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

function quoteCsv(value: string) {
  return `"${value.replace(/"/g, '""')}"`;
}

function formatCell(value: ExportCell) {
  return String(value ?? "");
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function downloadBlob(blob: Blob, fileName: string) {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}
