"use client";

import { useMemo, useState } from "react";
import { exportTabularData, type ExportFormat } from "../../exportData";
import { downloadNationalLocalPlanPdf, type NationalLocalPlanPdfRow } from "./nationalLocalPlanPdf";

type TimingCode = "VE" | "E" | "OT" | "L" | "VL" | "F";
const codes: TimingCode[] = ["VE", "E", "OT", "L", "VL", "F"];

type ReportRow = NationalLocalPlanPdfRow & { date: string };

export function NationalLocalPlanReport({ locations }: { locations: string[] }) {
  const [open, setOpen] = useState(false);
  const [range] = useState(() => getSevenDayRange());
  const [startDate, setStartDate] = useState(range.startDate);
  const [endDate, setEndDate] = useState(range.endDate);
  const [selectedLocations, setSelectedLocations] = useState<string[]>(locations);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");


  const allRows = useMemo(() => buildRows(range.dates, locations), [range, locations]);
  const rows = useMemo(() => {
    const selected = new Set(selectedLocations);
    const detailRows = allRows.filter(
      (row) => !row.isTotal && row.date >= startDate && row.date <= endDate && selected.has(row.location),
    );

    return range.dates
      .filter((date) => date >= startDate && date <= endDate)
      .flatMap((date) => {
        const dayRows = detailRows.filter((row) => row.date === date);
        return dayRows.length ? [...dayRows, buildTotalRow(date, dayRows)] : [];
      });
  }, [allRows, range.dates, startDate, endDate, selectedLocations]);
  const shownLocations = locations.filter((v) => v.toLowerCase().includes(search.trim().toLowerCase()));

  const download = (format: ExportFormat) => {
    if (startDate > endDate) { setError("The start date must be before the end date."); return; }
    if (!selectedLocations.length) { setError("Select at least one location."); return; }
    if (!rows.length) { setError("No report data is available for this selection."); return; }
    setError("");
    if (format === "pdf") {
      downloadNationalLocalPlanPdf({ rows, fileName: `national-vs-local-plan-${startDate}-to-${endDate}.pdf`, startDate, endDate });
      return;
    }
    const headers = ["Day/Location", "National Duties Planned", "Local Duties Changed", "% Duties Changed", ...codes.map((c) => `National ${c}`), ...codes.map((c) => `Local ${c} %`)];
    const exportRows = rows.map((r) => [r.isTotal ? `${r.dayLabel} Totals` : r.location, r.nationalDuties, r.localDuties, `${r.percentChanged}%`, ...codes.map((c) => r.nationalCounts[c]), ...codes.map((c) => `${r.localPercentages[c]}%`)]);
    exportTabularData({ format, headers, rows: exportRows, fileName: `national-vs-local-plan-${startDate}-to-${endDate}`, title: "National vs Local Plan Report" });
  };

  return (
    <>
      <div className="flex flex-col gap-3 rounded-[16px] border border-[#d7dee9] bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#6b7280]">National vs Local Plan Report</p>
          <p className="mt-1 text-sm font-black text-[#10203a]">Daily national duties, local changes and VE/E/OT/L/VL/F performance</p>
        </div>
        <button type="button" onClick={() => setOpen(true)} className="shrink-0 rounded-xl bg-[#10203a] px-4 py-2.5 text-xs font-black uppercase tracking-[0.07em] text-white hover:bg-[#1e3558]">Select dates and site download</button>
      </div>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#07101f]/65 p-4" role="dialog" aria-modal="true">
          <div className="max-h-[92vh] w-full max-w-5xl overflow-hidden rounded-[24px] border border-[#cfd8e3] bg-white shadow-2xl">
            <div className="flex items-start justify-between bg-[#10203a] px-6 py-4 text-white">
              <div><p className="text-xs font-black uppercase tracking-[0.18em] text-white/70">Report download</p><h2 className="mt-1 text-2xl font-black">National vs Local Plan Report</h2></div>
              <button type="button" onClick={() => setOpen(false)} className="flex h-9 w-9 items-center justify-center rounded-full border border-white/50 text-xl font-black">×</button>
            </div>
            <div className="max-h-[calc(92vh-82px)] overflow-y-auto p-5 sm:p-6">
              <p className="text-sm font-bold leading-6 text-[#4b5563]">Choose dates within the latest seven completed days and select one or more locations. Each requested day is added as a separate block with a daily totals row.</p>
              <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <DateBox label="Start date" value={startDate} min={range.startDate} max={range.endDate} onChange={setStartDate} />
                <DateBox label="End date" value={endDate} min={range.startDate} max={range.endDate} onChange={setEndDate} />
              </div>
              <section className="mt-5 overflow-hidden rounded-[18px] border border-[#d7dee9] bg-[#f8fafc]">
                <div className="flex flex-col gap-3 border-b border-[#d7dee9] bg-[#e9eef9] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                  <div><p className="text-xs font-black uppercase tracking-[0.16em] text-[#10203a]">Available locations</p><p className="mt-1 text-xs font-bold text-[#4b5563]">{selectedLocations.length} of {locations.length} selected</p></div>
                  <div className="flex gap-2"><button onClick={() => setSelectedLocations(locations)} className="rounded-lg bg-white px-3 py-2 text-xs font-black text-[#0f3a6d] ring-1 ring-[#c7d2df]">Select all</button><button onClick={() => setSelectedLocations([])} className="rounded-lg bg-white px-3 py-2 text-xs font-black text-[#10203a] ring-1 ring-[#c7d2df]">Clear all</button></div>
                </div>
                <div className="p-3"><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by location name" className="w-full rounded-xl border border-[#cfd8e3] bg-white px-4 py-3 text-sm font-bold outline-none" />
                  <div className="mt-3 grid max-h-64 grid-cols-1 overflow-y-auto rounded-xl border border-[#d7dee9] sm:grid-cols-2">
                    {shownLocations.map((location) => <label key={location} className="flex cursor-pointer items-center justify-between border-b border-r border-[#e2e8f0] bg-white px-4 py-2.5 text-xs font-black text-[#10203a]"><span>{location}</span><input type="checkbox" checked={selectedLocations.includes(location)} onChange={() => setSelectedLocations((cur) => cur.includes(location) ? cur.filter((x) => x !== location) : [...cur, location])} className="h-4 w-4 accent-[#0f3a6d]" /></label>)}
                  </div>
                </div>
              </section>
              {error ? <p className="mt-4 rounded-xl border border-[#fecaca] bg-[#fff1f2] px-4 py-3 text-sm font-black text-[#991b1b]">{error}</p> : null}
              <p className="mt-5 text-xs font-black uppercase tracking-[0.14em] text-[#6b7280]">Download report as</p>
              <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">{(["excel","csv","pdf"] as ExportFormat[]).map((format) => <button key={format} onClick={() => download(format)} className="rounded-[16px] border border-[#cfd8e3] bg-[#f8fafc] px-4 py-4 text-left text-base font-black uppercase text-[#10203a] hover:bg-[#e9eef9]">{format}</button>)}</div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

function DateBox({ label, value, min, max, onChange }: { label: string; value: string; min: string; max: string; onChange: (v:string)=>void }) { return <fieldset className="rounded-[16px] border border-[#d7dee9] bg-[#f8fafc] p-4"><legend className="px-2 text-sm font-black text-[#10203a]">{label}</legend><input type="date" value={value} min={min} max={max} onChange={(e)=>onChange(e.target.value)} className="w-full rounded-xl border border-[#cfd8e3] bg-white px-3 py-3 text-sm font-black" /></fieldset>; }

function buildTotalRow(date: string, detail: ReportRow[]): ReportRow {
  const nationalDuties = detail.reduce((sum, row) => sum + row.nationalDuties, 0);
  const localDuties = detail.reduce((sum, row) => sum + row.localDuties, 0);
  const nationalCounts = Object.fromEntries(
    codes.map((code) => [code, detail.reduce((sum, row) => sum + row.nationalCounts[code], 0)]),
  );
  const localPercentages = Object.fromEntries(
    codes.map((code) => [code, nationalDuties ? Math.round((nationalCounts[code] / nationalDuties) * 100) : 0]),
  );

  return {
    date,
    dayLabel: dayLabel(date),
    location: "",
    nationalDuties,
    localDuties,
    percentChanged: nationalDuties ? Math.round((localDuties / nationalDuties) * 100) : 0,
    nationalCounts,
    localPercentages,
    isTotal: true,
  };
}

function getSevenDayRange() { const today = londonDate(); const dates = Array.from({length:7}, (_,i)=>addDays(today, i-7)); return { startDate: dates[0], endDate: dates[6], dates }; }
function londonDate() { const p = new Intl.DateTimeFormat("en-GB",{timeZone:"Europe/London",year:"numeric",month:"2-digit",day:"2-digit"}).formatToParts(new Date()); const get=(t:string)=>p.find(x=>x.type===t)?.value||"01"; return `${get("year")}-${get("month")}-${get("day")}`; }
function addDays(v:string,n:number){const [y,m,d]=v.split("-").map(Number);const x=new Date(Date.UTC(y,m-1,d));x.setUTCDate(x.getUTCDate()+n);return `${x.getUTCFullYear()}-${String(x.getUTCMonth()+1).padStart(2,"0")}-${String(x.getUTCDate()).padStart(2,"0")}`;}
function dayLabel(v:string){return new Intl.DateTimeFormat("en-GB",{weekday:"long",day:"2-digit",month:"short",year:"numeric",timeZone:"UTC"}).format(new Date(`${v}T00:00:00Z`));}
function buildRows(dates:string[], locations:string[]): ReportRow[] {
  return dates.flatMap((date, dayIndex) => {
    const detail = locations.map((location, siteIndex) => {
      const national = 1 + ((siteIndex * 17 + 3) % 282);
      const local = Math.max(0, national - ((dayIndex + siteIndex) % 4));
      const raw = [3 + ((siteIndex + dayIndex) % 35), 4 + ((siteIndex * 2 + dayIndex) % 20), 12 + ((siteIndex * 3 + dayIndex) % 35), 2 + ((siteIndex + dayIndex * 2) % 14), 1 + ((siteIndex * 2 + dayIndex) % 10), 4 + ((siteIndex * 5 + dayIndex) % 35)];
      const sum = raw.reduce((a,b)=>a+b,0); const pct = raw.map((x)=>Math.floor(x*100/sum)); pct[5] += 100-pct.reduce((a,b)=>a+b,0);
      const localPercentages = Object.fromEntries(codes.map((c,i)=>[c,pct[i]]));
      const nationalCounts = Object.fromEntries(codes.map((c,i)=>[c,Math.round(national*pct[i]/100)]));
      const countSum = codes.reduce((a,c)=>a+nationalCounts[c],0); nationalCounts.F += national-countSum;
      return { date, dayLabel: dayLabel(date), location, nationalDuties:national, localDuties:local, percentChanged:national ? Math.round(local/national*100):0, nationalCounts, localPercentages } as ReportRow;
    });
    const nat = detail.reduce((a,r)=>a+r.nationalDuties,0), loc=detail.reduce((a,r)=>a+r.localDuties,0);
    const counts = Object.fromEntries(codes.map(c=>[c,detail.reduce((a,r)=>a+r.nationalCounts[c],0)]));
    const pcts = Object.fromEntries(codes.map(c=>[c,nat?Math.round(counts[c]/nat*100):0]));
    return [...detail, { date, dayLabel: dayLabel(date), location:"", nationalDuties:nat, localDuties:loc, percentChanged:nat?Math.round(loc/nat*100):0, nationalCounts:counts, localPercentages:pcts, isTotal:true } as ReportRow];
  });
}
