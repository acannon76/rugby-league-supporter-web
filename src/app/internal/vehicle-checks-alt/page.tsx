"use client";

import Link from "next/link";
import NextImage from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import DriverName, { useDriverName } from "../DriverName";
import VehicleCheckTimer from "../vehicle-checks/VehicleCheckTimer";
import { readOpenCommsItems, writeOpenCommsItems, type DriverCommsItem } from "../app-ideas/driverMessageSync";
import {
  altLogbookStorageKey,
  altMileageStorageKey,
  altVehicleDetails,
  formatDateTime,
  type AltLogbookEntry,
} from "../vehicle-checks-altData";
import {
  motiveAnswersStorageKey,
  motiveCheckCategories,
  motiveLogbookHistoryStorageKey,
  type MotiveAnswer,
  type MotiveAnswers,
  type MotiveCategory,
  type MotiveCheckStatus,
} from "./motiveCheckData";

const vehicleRegistration = altVehicleDetails.find((detail) => detail.label === "Registration")?.value || "PE68UHD";
const trailerId = altVehicleDetails.find((detail) => detail.label === "Trailer")?.value || "";
const lastMileage = altVehicleDetails.find((detail) => detail.label === "Last Mileage")?.value || "684,218 km";
const vehicleHistoryStorageKey = "hgv-backup2-mock-vehicle-history-extra";
const emptyAnswer: MotiveAnswer = { status: "none", description: "", photoName: "" };

function answerKey(category: number, check: number) {
  return `${category}.${check}`;
}

function readArray<T>(key: string): T[] {
  try {
    const stored = window.localStorage.getItem(key);
    const parsed: unknown = stored ? JSON.parse(stored) : [];
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
}

export default function VehicleChecksAltPage() {
  const router = useRouter();
  const driverName = useDriverName();
  const [answers, setAnswers] = useState<MotiveAnswers>({});
  const answersRef = useRef<MotiveAnswers>({});
  const [currentMileage, setCurrentMileage] = useState("");
  const [expandedCategory, setExpandedCategory] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      try {
        const saved = window.localStorage.getItem(motiveAnswersStorageKey);
        if (saved) {
          answersRef.current = JSON.parse(saved) as MotiveAnswers;
          setAnswers(answersRef.current);
        }
      } catch {
        // An invalid draft should not prevent a new vehicle check.
      }
      setCurrentMileage(window.localStorage.getItem(altMileageStorageKey) || "");
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  function updateAnswer(category: number, check: number, update: Partial<MotiveAnswer>) {
    const key = answerKey(category, check);
    const previous = answersRef.current[key] || emptyAnswer;
    const nextAnswer = { ...previous, ...update };
    const next = { ...answersRef.current, [key]: nextAnswer };
    answersRef.current = next;
    setAnswers(next);
    window.localStorage.setItem(motiveAnswersStorageKey, JSON.stringify(next));
  }

  function selectStatus(category: number, check: number, status: MotiveCheckStatus) {
    updateAnswer(category, check, status === "ok" ? { status, description: "", photoName: "", photoDataUrl: undefined } : { status });
  }

  function takePhoto(category: number, check: number, file?: File) {
    if (!file) return;
    const image = new Image();
    const objectUrl = URL.createObjectURL(file);
    image.onload = () => {
      const scale = Math.min(1, 720 / Math.max(image.naturalWidth, image.naturalHeight));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(image.naturalWidth * scale);
      canvas.height = Math.round(image.naturalHeight * scale);
      const context = canvas.getContext("2d");
      context?.drawImage(image, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(objectUrl);
      updateAnswer(category, check, { photoName: file.name, photoDataUrl: context ? canvas.toDataURL("image/jpeg", 0.65) : undefined });
    };
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      updateAnswer(category, check, { photoName: file.name });
    };
    image.src = objectUrl;
  }

  function markCategoryOk(category: MotiveCategory) {
    // A quick all-OK action must never erase an issue that the driver has recorded.
    if (category.checks.some((check) => ["vehicleIssue", "defect"].includes(answers[answerKey(category.number, check.number)]?.status))) return;
    const next = { ...answersRef.current };
    category.checks.forEach((check) => {
      next[answerKey(category.number, check.number)] = { status: "ok", description: "", photoName: "" };
    });
    answersRef.current = next;
    setAnswers(next);
    window.localStorage.setItem(motiveAnswersStorageKey, JSON.stringify(next));
  }

  function updateCurrentMileage(value: string) {
    const digits = value.replace(/[^\d]/g, "");
    setCurrentMileage(digits);
    window.localStorage.setItem(altMileageStorageKey, digits);
  }

  const completedCount = motiveCheckCategories.filter((category) =>
    category.checks.every((check) => answers[answerKey(category.number, check.number)]?.status && answers[answerKey(category.number, check.number)].status !== "none")
  ).length;

  const issues = motiveCheckCategories.flatMap((category) => category.checks.flatMap((check) => {
    const answer = answers[answerKey(category.number, check.number)];
    return answer?.status === "defect" || answer?.status === "vehicleIssue"
      ? [{ category, check, answer }]
      : [];
  }));
  const hasRed = issues.some(({ answer }) => answer.status === "defect");
  const missingDescriptions = issues.some(({ answer }) => !answer.description.trim());
  const canSubmit = completedCount === motiveCheckCategories.length && !submitting;

  function completeVehicleChecks() {
    if (!canSubmit) return;
    setSubmitting(true);
    const now = new Date();
    const endTimestamp = now.getTime();
    const storedStart = Number(window.localStorage.getItem("hgv-check-timer-started-at"));
    const startTimestamp = Number.isFinite(storedStart) && storedStart > 0 ? storedStart : endTimestamp - 12 * 60 * 1000;
    const pmt = issues.length ? `PMT${endTimestamp.toString().slice(-9)}` : "";
    const mileageEnd = currentMileage ? `${Number(currentMileage).toLocaleString("en-GB")} km` : "Not entered";
    const summary = issues.map(({ category, check, answer }) =>
      `${category.number}.${check.number} ${category.title} — ${check.title} (${answer.status === "defect" ? "RED defect" : "AMBER issue"}): ${answer.description.trim() || "No further description supplied"}${answer.photoName ? ` [Photo: ${answer.photoName}]` : ""}`
    );
    const photoEvidence = issues.flatMap(({ category, check, answer }) => answer.photoDataUrl
      ? [{ check: `${category.number}.${check.number}`, title: check.title, dataUrl: answer.photoDataUrl }]
      : []);

    const entry: AltLogbookEntry = {
      startDateTime: formatDateTime(new Date(startTimestamp)),
      endDateTime: formatDateTime(now),
      startTimestamp,
      endTimestamp,
      driverName,
      registration: vehicleRegistration,
      mileageStart: lastMileage,
      mileageEnd,
      hasDefects: issues.length > 0,
      decision: hasRed ? "stop" : issues.length ? "monitor" : "clear",
      defectsSummary: summary.length ? summary : ["NIL Defects"],
      pmts: pmt ? [pmt] : [],
      photoEvidence,
    };

    const previous = readArray<AltLogbookEntry>(motiveLogbookHistoryStorageKey);
    const oldLatestRaw = window.localStorage.getItem(altLogbookStorageKey);
    let oldLatest: AltLogbookEntry | null = null;
    try { if (oldLatestRaw) oldLatest = JSON.parse(oldLatestRaw) as AltLogbookEntry; } catch { /* ignore old invalid mock record */ }
    const prior = oldLatest && !previous.some((item) => item.endTimestamp === oldLatest?.endTimestamp) ? [oldLatest, ...previous] : previous;
    window.localStorage.setItem(motiveLogbookHistoryStorageKey, JSON.stringify([entry, ...prior]));
    window.localStorage.setItem(altLogbookStorageKey, JSON.stringify(entry));

    if (pmt) {
      const history = readArray<Record<string, string>>(vehicleHistoryStorageKey);
      const newHistory = issues.map(({ category, check, answer }) => ({
        pmt,
        issue: `${category.number}.${check.number} ${category.title}: ${check.title}`,
        type: answer.status === "defect" ? "Defect" : "Vehicle Issue",
        reported: now.toLocaleDateString("en-GB"),
        fixed: answer.status === "defect" ? "Awaiting workshop" : "Review at next service",
        mileageReported: mileageEnd,
        status: answer.status === "defect" ? "Open" : "Monitor",
        notes: `${answer.description.trim() || "No further description supplied."}${answer.photoName ? ` Photo captured: ${answer.photoName}.` : ""}`,
      }));
      window.localStorage.setItem(vehicleHistoryStorageKey, JSON.stringify([...newHistory, ...history]));

      const message: DriverCommsItem = {
        id: `CHECK-PMT-${pmt}`,
        source: "PMT Confirmation",
        priority: hasRed ? "High" : "Normal",
        status: "New",
        duty: "VEHICLE CHECK",
        driver: driverName,
        vehicle: vehicleRegistration,
        trailer: trailerId,
        received: now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }),
        receivedDate: now.toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "2-digit" }),
        title: hasRed ? "RED vehicle defect — driver stopped" : "AMBER vehicle issue — next service",
        summary: `${pmt} • ${vehicleRegistration} • ${issues.length} reported item${issues.length === 1 ? "" : "s"}. ${hasRed ? "Do not use vehicle; driver to return to transport office and speak to manager." : "Driver may continue; review at next service."}`,
        pmt: {
          pmt,
          issueTitle: `${issues[0].category.number}.${issues[0].check.number} ${issues[0].check.title}${issues.length > 1 ? ` (+${issues.length - 1} more)` : ""}`,
          severity: hasRed ? "Defect" : "Vehicle Issue",
          reported: now.toLocaleDateString("en-GB"),
          fixed: hasRed ? "Awaiting manager and workshop" : "Review at next service",
          mileage: mileageEnd,
          pmtStatus: hasRed ? "Open — vehicle not to be used" : "Monitor — next service",
          notes: summary.join("; "),
          photoEvidence,
        },
      };
      writeOpenCommsItems([message, ...readOpenCommsItems()]);
    }

    window.localStorage.removeItem(motiveAnswersStorageKey);
    window.localStorage.removeItem(altMileageStorageKey);
    router.push("/internal/logbook");
  }

  return (
    <main className="min-h-screen bg-[#f4f1ec] font-sans text-[#111]">
      <header className="border-b border-white/20 bg-[#b00020] px-4 py-4 text-white sm:px-6 lg:px-10">
        <div className="mx-auto flex max-w-[900px] flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border-2 border-white bg-[#7d0017] text-lg font-black">HGV</div>
            <div><p className="text-lg font-black leading-none">Vehicle Checks</p><p className="text-sm font-black text-[#ffd9df]">DriverOS Concept</p></div>
            <VehicleCheckTimer />
          </div>
          <div className="flex items-center gap-4">
            <div className="rounded-2xl border border-white/30 bg-white/10 px-4 py-2"><p className="text-xs font-black uppercase tracking-widest text-[#ffd9df]">Driver</p><p className="text-base font-black"><DriverName /></p></div>
            <Link href="/internal/logbook" className="text-sm font-black text-white no-underline">Back</Link>
          </div>
        </div>
      </header>

      <section className="bg-[#b00020] px-4 py-6 text-white sm:px-6 lg:px-10">
        <div className="mx-auto max-w-[900px]">
          <p className="mb-3 text-xs font-black uppercase tracking-[0.22em] text-[#ffd9df]">Driver daily check</p>
          <h1 className="text-[42px] font-black leading-[0.95] sm:text-[64px]">Vehicle Checks</h1>
          <p className="mt-4 max-w-[720px] text-sm font-bold leading-6 text-[#ffecef] sm:text-base">Enter the current mileage. Open each category to complete its numbered checks on this page. Use the category OK button when every check in that category is satisfactory.</p>
          <div className="mt-5 grid grid-cols-2 gap-2 rounded-[24px] bg-white/95 p-2 sm:grid-cols-4 lg:grid-cols-8">
            {altVehicleDetails.map((detail) => (
              <div key={detail.label} className={`rounded-2xl border px-3 py-2 ${detail.label === "Last Mileage" ? "border-[#f8df8d] bg-[#fff7e6]" : "border-[#ead6dc] bg-[#fff7f8]"}`}>
                <p className={`text-[10px] font-black uppercase tracking-[0.16em] ${detail.label === "Last Mileage" ? "text-[#92400e]" : "text-[#b00020]"}`}>{detail.label}</p>
                <p className="mt-1 text-sm font-black text-[#18243a]">{detail.value}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 rounded-[24px] border border-white/25 bg-white/10 p-3">
            <label htmlFor="current-mileage" className="text-xs font-black uppercase tracking-[0.18em] text-[#ffd9df]">Current mileage / KM</label>
            <div className="mt-2 flex items-center gap-3">
              <input id="current-mileage" type="text" inputMode="numeric" value={currentMileage} onChange={(event) => updateCurrentMileage(event.target.value)} placeholder="Enter current mileage" className="min-h-[52px] min-w-0 flex-1 rounded-2xl border border-white/30 bg-white px-4 text-lg font-black text-[#18243a] outline-none placeholder:text-[#94a3b8]" />
              <div className="rounded-2xl border border-white/25 bg-white/10 px-4 py-3"><p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#ffd9df]">Last use</p><p className="text-sm font-black">{lastMileage}</p></div>
            </div>
          </div>
          <div className="mt-4 rounded-[20px] border border-white/25 bg-white/10 p-4">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#ffd9df]">Completion progress</p>
            <p className="mt-1 text-lg font-black">{completedCount} of {motiveCheckCategories.length} categories completed</p>
            <p className="mt-1 text-sm font-bold text-[#ffecef]">Open a category to select OK, Vehicle Issue (amber) or Defect (red) for each check.</p>
          </div>
        </div>
      </section>

      <section className="px-4 py-6 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-[900px] space-y-3">
          {motiveCheckCategories.map((category) => {
            const expanded = expandedCategory === category.number;
            const categoryAnswers = category.checks.map((check) => answers[answerKey(category.number, check.number)] || emptyAnswer);
            const allOk = categoryAnswers.every((answer) => answer.status === "ok");
            const anyIssue = categoryAnswers.some((answer) => answer.status === "defect" || answer.status === "vehicleIssue");
            const categoryRed = categoryAnswers.some((answer) => answer.status === "defect");
            const categoryComplete = categoryAnswers.every((answer) => answer.status !== "none");
            return (
              <div key={category.number}>
                <div className="grid grid-cols-[1fr_74px] gap-3">
                  <button type="button" aria-expanded={expanded} aria-controls={`category-${category.number}-checks`} onClick={() => setExpandedCategory(expanded ? null : category.number)} className="flex min-h-[82px] items-center gap-4 rounded-[24px] border border-[#d6dce5] bg-white p-4 text-left shadow-sm transition hover:shadow-lg">
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#b00020] text-lg font-black text-white">{category.number}</span>
                    <span className="min-w-0 flex-1"><span className="block text-lg font-black leading-tight text-[#18243a] sm:text-xl">{category.title}</span><span className="mt-1 block text-xs font-black uppercase tracking-[0.12em] text-[#b00020]">{expanded ? "Close checks ↑" : `Open ${category.checks.length} checks ↓`}</span></span>
                    {categoryComplete && <span className={`rounded-full px-2 py-1 text-xs font-black ${categoryRed ? "bg-[#ffe5eb] text-[#b00020]" : anyIssue ? "bg-[#fff3d1] text-[#92400e]" : "bg-[#e8f7ee] text-[#078a3d]"}`}>{categoryRed ? "RED defect" : anyIssue ? "AMBER issue" : "OK"}</span>}
                  </button>
                  <button type="button" onClick={() => markCategoryOk(category)} disabled={anyIssue} title={anyIssue ? "Review the recorded issue below before changing the result" : "Mark all checks in this category OK"} aria-label={`Mark all ${category.title} checks OK`} className={`flex min-h-[82px] items-center justify-center rounded-[24px] border text-3xl font-black shadow-sm ${allOk ? "border-[#078a3d] bg-[#078a3d] text-white" : categoryRed ? "cursor-not-allowed border-[#b00020] bg-[#b00020] text-white" : anyIssue ? "cursor-not-allowed border-[#f8df8d] bg-[#fff7e6] text-[#92400e]" : "border-[#d6dce5] bg-white text-[#94a3b8]"}`}>{allOk ? "✓" : categoryRed ? "×" : anyIssue ? "!" : "□"}</button>
                </div>
                {expanded && (
                  <div id={`category-${category.number}-checks`} className="ml-4 mt-2 space-y-3 border-l-4 border-[#b00020] pl-3 sm:ml-12 sm:pl-5">
                    {category.checks.map((check) => {
                      const answer = answers[answerKey(category.number, check.number)] || emptyAnswer;
                      return (
                        <div key={check.number} className="rounded-[22px] border border-[#d6dce5] bg-white p-4 shadow-sm">
                          <div className="flex items-start gap-3"><span className="rounded-xl bg-[#fbe7eb] px-3 py-2 text-sm font-black text-[#b00020]">{category.number}.{check.number}</span><h3 className="pt-1 text-base font-black leading-snug text-[#18243a]">{check.title}</h3></div>
                          <div className="mt-4 grid gap-2 sm:grid-cols-3">
                            {(["ok", "vehicleIssue", "defect"] as const).map((status) => (
                              <button key={status} type="button" onClick={() => selectStatus(category.number, check.number, status)} aria-pressed={answer.status === status} className={`min-h-[44px] rounded-xl px-2 text-sm font-black ${status === "ok" ? answer.status === status ? "bg-[#078a3d] text-white" : "bg-[#e7f7ee] text-[#078a3d]" : status === "vehicleIssue" ? answer.status === status ? "bg-[#e3a008] text-[#18243a]" : "bg-[#fff3cd] text-[#92400e]" : answer.status === status ? "bg-[#b00020] text-white" : "bg-[#ffe5eb] text-[#b00020]"}`}>{status === "ok" ? "OK" : status === "vehicleIssue" ? "Vehicle Issue (amber)" : "Defect ✕ (red)"}</button>
                            ))}
                          </div>
                          {(answer.status === "vehicleIssue" || answer.status === "defect") && (
                            <div className="mt-4 space-y-3">
                              <div className="grid gap-3 sm:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
                                <label className="block rounded-2xl bg-[#f4f6fa] p-4 text-xs font-black uppercase tracking-[0.12em] text-[#b00020]">Defect description<textarea value={answer.description} onChange={(event) => updateAnswer(category.number, check.number, { description: event.target.value })} placeholder="Type defect details here..." className="mt-3 min-h-[116px] w-full rounded-xl border border-[#cbd5e1] bg-white p-3 text-sm font-bold normal-case tracking-normal text-[#18243a]" /></label>
                                <div className="rounded-2xl bg-[#f4f6fa] p-4">
                                  <p className="text-xs font-black uppercase tracking-[0.12em] text-[#b00020]">Photo evidence</p>
                                  <input id={`photo-${category.number}-${check.number}`} type="file" accept="image/*" capture="environment" onChange={(event) => { takePhoto(category.number, check.number, event.target.files?.[0]); event.target.value = ""; }} className="sr-only" />
                                  <label htmlFor={`photo-${category.number}-${check.number}`} className="mt-3 flex min-h-[116px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#b00020] bg-white p-3 text-center text-sm font-black text-[#b00020] focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-[#b00020]">
                                    <span aria-hidden="true" className="text-2xl">📷</span><span className="mt-1">Take Photo</span>
                                    {answer.photoName && <span className="mt-1 max-w-full break-all text-xs text-[#475569]">{answer.photoName}</span>}
                                  </label>
                                </div>
                              </div>
                              {answer.photoDataUrl && <NextImage src={answer.photoDataUrl} alt={`Photo evidence for ${check.title}`} width={720} height={480} unoptimized className="h-auto max-h-48 max-w-full rounded-xl border border-[#cbd5e1] object-contain" />}
                              {answer.status === "defect" && <p className="rounded-xl bg-[#ffe5eb] p-3 text-sm font-black text-[#b00020]">RED ✕ — Do not use the vehicle. Return to the transport office and speak to your manager.</p>}
                              {answer.status === "vehicleIssue" && <p className="rounded-xl bg-[#fff3cd] p-3 text-sm font-black text-[#92400e]">AMBER — You may continue. This issue will be reviewed at the next service.</p>}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
          {issues.length > 0 && <div role="alert" className={`rounded-[22px] border p-5 text-sm font-black ${hasRed ? "border-[#b00020] bg-[#ffe5eb] text-[#7d0017]" : "border-[#e3a008] bg-[#fff3cd] text-[#92400e]"}`}>{hasRed ? "RED ✕ — Vehicle must not be used. Return to the transport office and speak to your manager. The PMT will be added to vehicle history and manager Comms when you submit." : "AMBER — You may continue with duty. The PMT will be recorded for review at the next service and shown in manager Comms when you submit."}</div>}
          <button type="button" onClick={completeVehicleChecks} disabled={!canSubmit} className={`mt-6 w-full rounded-[24px] px-5 py-5 text-sm font-black uppercase tracking-[0.12em] shadow-sm ${canSubmit ? "bg-[#b00020] text-white hover:bg-[#7d0017]" : "cursor-not-allowed bg-[#cbd5e1] text-[#64748b]"}`}>Submit vehicle checks {completedCount}/{motiveCheckCategories.length}</button>
          {!currentMileage && <p className="text-sm font-bold text-[#92400e]">Current mileage has not been entered; the Logbook will record “Not entered”.</p>}
          {missingDescriptions && <p className="text-sm font-bold text-[#92400e]">Add a description where possible. If left blank, the reported check and its status will still go to the Logbook and manager.</p>}
        </div>
      </section>
    </main>
  );
}
