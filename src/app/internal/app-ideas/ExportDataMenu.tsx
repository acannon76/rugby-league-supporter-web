"use client";

import { useEffect, useRef, useState } from "react";
import type { ExportFormat } from "./exportData";

type ExportDataMenuProps = {
  onExport: (format: ExportFormat) => void;
  disabled?: boolean;
  buttonClassName?: string;
  menuClassName?: string;
};

const exportOptions: { format: ExportFormat; label: string; detail: string }[] = [
  { format: "excel", label: "Excel", detail: ".xls" },
  { format: "csv", label: "CSV", detail: ".csv" },
  { format: "pdf", label: "PDF", detail: ".pdf" },
];

export default function ExportDataMenu({
  onExport,
  disabled = false,
  buttonClassName = "rounded-lg border border-[#111827] bg-white px-4 py-2 text-sm font-black uppercase tracking-[0.12em] text-[#111827] transition hover:bg-[#f3f4f6] disabled:cursor-not-allowed disabled:border-[#cbd5e1] disabled:text-[#94a3b8]",
  menuClassName = "right-0",
}: ExportDataMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!menuRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  return (
    <div ref={menuRef} className="relative inline-flex">
      <button
        type="button"
        disabled={disabled}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((current) => !current)}
        className={buttonClassName}
      >
        Export Data <span aria-hidden="true" className="ml-1">▾</span>
      </button>

      {isOpen && !disabled && (
        <div
          role="menu"
          className={`absolute top-[calc(100%+8px)] z-[80] min-w-[190px] overflow-hidden rounded-xl border border-[#cbd5e1] bg-white p-1.5 shadow-2xl ${menuClassName}`}
        >
          {exportOptions.map((option) => (
            <button
              key={option.format}
              type="button"
              role="menuitem"
              onClick={() => {
                onExport(option.format);
                setIsOpen(false);
              }}
              className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm font-black text-[#172033] transition hover:bg-[#eef2f7]"
            >
              <span>{option.label}</span>
              <span className="text-xs font-bold text-[#64748b]">{option.detail}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
