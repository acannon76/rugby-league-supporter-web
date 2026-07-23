export type NationalLocalPlanPdfRow = {
  dayLabel: string;
  location: string;
  nationalDuties: number;
  localDuties: number;
  percentChanged: number;
  nationalCounts: Record<string, number>;
  localPercentages: Record<string, number>;
  isTotal?: boolean;
};

type Args = {
  rows: NationalLocalPlanPdfRow[];
  fileName: string;
  startDate: string;
  endDate: string;
};

type Rgb = [number, number, number];
const NAVY: Rgb = [16, 32, 58];
const RED: Rgb = [228, 0, 0];
const WHITE: Rgb = [255, 255, 255];
const TEXT: Rgb = [17, 24, 39];
const MUTED: Rgb = [75, 85, 99];
const BORDER: Rgb = [207, 216, 227];
const PALE: Rgb = [248, 250, 252];
const TOTAL: Rgb = [223, 231, 242];
const codes = ["VE", "E", "OT", "L", "VL", "F"];

export function downloadNationalLocalPlanPdf({ rows, fileName, startDate, endDate }: Args) {
  if (typeof window === "undefined" || rows.length === 0) return;
  const pageWidth = 842;
  const pageHeight = 595;
  const margin = 22;
  const headerBottom = 515;
  const footerTop = 25;
  const rowHeight = 15;
  const tableHeaderHeight = 30;
  const rowsPerPage = Math.max(1, Math.floor((headerBottom - footerTop - tableHeaderHeight) / rowHeight));
  const pages: NationalLocalPlanPdfRow[][] = [];
  for (let i = 0; i < rows.length; i += rowsPerPage) pages.push(rows.slice(i, i + rowsPerPage));

  const streams = pages.map((pageRows, pageIndex) => {
    const c: string[] = [];
    rect(c, 0, pageHeight - 68, pageWidth, 68, NAVY);
    rect(c, 0, pageHeight - 73, pageWidth, 5, RED);
    text(c, 26, pageHeight - 31, "National vs Local Plan Report", 18, "F2", WHITE);
    text(c, 26, pageHeight - 49, `${fmt(startDate)} to ${fmt(endDate)} | Dynamic seven completed-day period`, 8, "F1", [219, 228, 241]);
    text(c, 620, pageHeight - 31, `Page ${pageIndex + 1} of ${pages.length}`, 8, "F2", WHITE);

    const columns = [
      ["DAY / LOCATION", 188], ["NAT", 31], ["LOCAL", 34], ["% CHG", 38],
      ["VE", 31], ["E", 31], ["OT", 31], ["L", 31], ["VL", 31], ["F", 31],
      ["VE %", 36], ["E %", 36], ["OT %", 36], ["L %", 36], ["VL %", 36], ["F %", 36],
    ] as const;
    let x = margin;
    let y = headerBottom;
    columns.forEach(([label, width], index) => {
      rect(c, x, y - tableHeaderHeight, width, tableHeaderHeight, index < 4 ? NAVY : index < 10 ? [45, 62, 88] : [70, 88, 115]);
      text(c, x + 3, y - 18, label, 6.1, "F2", WHITE);
      x += width;
    });
    y -= tableHeaderHeight;

    pageRows.forEach((row, idx) => {
      const fill = row.isTotal ? TOTAL : idx % 2 === 0 ? WHITE : PALE;
      const values = [
        row.isTotal ? `${row.dayLabel} TOTAL` : row.location,
        String(row.nationalDuties), String(row.localDuties), `${row.percentChanged}%`,
        ...codes.map((code) => String(row.nationalCounts[code] || 0)),
        ...codes.map((code) => `${row.localPercentages[code] || 0}%`),
      ];
      x = margin;
      columns.forEach(([, width], colIndex) => {
        rect(c, x, y - rowHeight, width, rowHeight, fill, BORDER, 0.45);
        text(c, x + (colIndex === 0 ? 3 : width / 2), y - 10.5, clip(values[colIndex], colIndex === 0 ? 35 : 8), row.isTotal ? 6.2 : 5.8, row.isTotal ? "F2" : "F1", TEXT, colIndex === 0 ? "left" : "center");
        x += width;
      });
      y -= rowHeight;
    });
    text(c, margin, 12, "National counts are calculated from each site's Local Agreed Plan percentages against National Duties Planned.", 6.2, "F1", MUTED);
    return c.join("\n");
  });

  const pdf = assemble(streams);
  const blob = new Blob([pdf], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName.endsWith(".pdf") ? fileName : `${fileName}.pdf`;
  document.body.appendChild(link); link.click(); link.remove(); URL.revokeObjectURL(url);
}

function fmt(v: string) { const [y,m,d] = v.split("-"); return `${d}/${m}/${y}`; }
function clip(v: string, max: number) { return v.length > max ? `${v.slice(0, max - 1)}…` : v; }
function esc(v: string) { return v.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)").replace(/[^\x20-\x7E]/g, "-"); }
function rgb(v: Rgb) { return v.map((n) => (n / 255).toFixed(3)).join(" "); }
function rect(c: string[], x: number, y: number, w: number, h: number, fill: Rgb, stroke?: Rgb, sw = 0) { c.push(`${rgb(fill)} rg`, `${x} ${y} ${w} ${h} re f`); if (stroke && sw) c.push(`${sw} w`, `${rgb(stroke)} RG`, `${x} ${y} ${w} ${h} re S`); }
function text(c: string[], x: number, y: number, value: string, size: number, font: string, colour: Rgb, align: "left"|"center"="left") { const width = value.length * size * 0.48; const tx = align === "center" ? x - width / 2 : x; c.push("BT", `/${font} ${size} Tf`, `${rgb(colour)} rg`, `1 0 0 1 ${tx.toFixed(2)} ${y.toFixed(2)} Tm`, `(${esc(value)}) Tj`, "ET"); }
function assemble(streams: string[]) {
  const objects: string[] = [];
  objects.push("<< /Type /Catalog /Pages 2 0 R >>");
  const pageIds = streams.map((_, i) => 5 + i * 2);
  objects.push(`<< /Type /Pages /Kids [${pageIds.map((id) => `${id} 0 R`).join(" ")}] /Count ${pageIds.length} >>`);
  objects.push("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>");
  objects.push("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>");
  streams.forEach((stream, i) => {
    const contentId = 6 + i * 2;
    objects.push(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 842 595] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ${contentId} 0 R >>`);
    objects.push(`<< /Length ${new TextEncoder().encode(stream).length} >>\nstream\n${stream}\nendstream`);
  });
  let pdf = "%PDF-1.4\n"; const offsets = [0];
  objects.forEach((obj, i) => { offsets.push(new TextEncoder().encode(pdf).length); pdf += `${i + 1} 0 obj\n${obj}\nendobj\n`; });
  const xref = new TextEncoder().encode(pdf).length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  offsets.slice(1).forEach((o) => { pdf += `${String(o).padStart(10, "0")} 00000 n \n`; });
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  return new TextEncoder().encode(pdf);
}
