"use client";

import type { ExportFormat } from "../../exportData";

export function OperationalDownloadModal({
  title,
  rowCount,
  onClose,
  onDownload,
}: {
  title: string;
  rowCount: number;
  onClose: () => void;
  onDownload: (format: ExportFormat) => void | Promise<void>;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#07101f]/65 p-4" role="dialog" aria-modal="true">
      <div className="w-full max-w-3xl overflow-hidden rounded-[22px] border border-[#cfd8e5] bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-[#dde4ed] bg-[#f8fafc] px-6 py-5">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-[#e40000]">Report export</p>
            <h2 className="mt-1 text-2xl font-black text-[#10203a]">Download {title}</h2>
            <p className="mt-2 text-sm font-bold text-[#64748b]">{rowCount} selected data row(s) will be included.</p>
          </div>
          <button type="button" onClick={onClose} className="flex h-10 w-10 items-center justify-center rounded-full border border-[#d5dde7] bg-white text-xl font-black text-[#10203a] hover:bg-[#eef2f6]" aria-label="Close download options">×</button>
        </div>

        <div className="grid gap-4 p-6 md:grid-cols-3">
          <DownloadCard title="Excel workbook" icon="XLSX" description="Structured workbook with a summary sheet and the complete selected data." onClick={() => onDownload("excel")} />
          <DownloadCard title="CSV data" icon="CSV" description="Simple raw selected data for analysis or import into another reporting tool." onClick={() => onDownload("csv")} />
          <DownloadCard title="Presentation PDF" icon="PDF" description="Formatted management PDF with active filters, KPI summary and complete selected data." onClick={() => onDownload("pdf")} primary />
        </div>

        <div className="border-t border-[#dde4ed] bg-[#f8fafc] px-6 py-4">
          <p className="text-xs font-bold leading-5 text-[#64748b]">Every format follows the filters currently applied to the dashboard.</p>
        </div>
      </div>
    </div>
  );
}

function DownloadCard({
  title,
  icon,
  description,
  onClick,
  primary = false,
}: {
  title: string;
  icon: string;
  description: string;
  onClick: () => void;
  primary?: boolean;
}) {
  return (
    <button type="button" onClick={onClick} className={`group flex min-h-[210px] flex-col rounded-[18px] border p-5 text-left transition hover:-translate-y-0.5 hover:shadow-lg ${primary ? "border-[#b9c8da] bg-[#10203a] text-white" : "border-[#d6dee8] bg-white text-[#10203a]"}`}>
      <span className={`inline-flex w-fit rounded-lg px-3 py-2 text-xs font-black tracking-[0.08em] ${primary ? "bg-white text-[#10203a]" : "bg-[#eef3f8] text-[#10203a]"}`}>{icon}</span>
      <span className="mt-4 text-lg font-black">{title}</span>
      <span className={`mt-2 text-sm font-bold leading-6 ${primary ? "text-white/75" : "text-[#64748b]"}`}>{description}</span>
      <span className={`mt-auto pt-4 text-xs font-black uppercase tracking-[0.08em] ${primary ? "text-white" : "text-[#0f3a6d]"}`}>Download →</span>
    </button>
  );
}
