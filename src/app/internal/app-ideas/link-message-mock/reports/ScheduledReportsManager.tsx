"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";

export type ScheduledReportSource = "network" | "national-local" | "proximity";
export type ScheduledReportFormat = "excel" | "csv" | "pdf";
export type DeliveryFrequency = "hourly" | "daily" | "weekly";
export type ReportPeriod = "daily" | "weekly";

export type ScheduledReport = {
  id: string;
  source: ScheduledReportSource;
  name: string;
  format: ScheduledReportFormat;
  frequency: DeliveryFrequency;
  deliveryTime: string;
  minutePastHour: string;
  deliveryDay: string;
  reportPeriod: ReportPeriod;
  fromTime: string;
  toTime: string;
  fromDay: string;
  toDay: string;
  emailAddress: string;
};

export const REPORT_SOURCE_LABELS: Record<ScheduledReportSource, string> = {
  network: "Network Performance Report",
  "national-local": "National vs Local Plan Report",
  proximity: "Vehicle Proximity Report",
};

const dayOptions = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const formatLabels: Record<ScheduledReportFormat, string> = {
  excel: "Excel",
  csv: "CSV",
  pdf: "PDF",
};

const EMPTY_FORM: Omit<ScheduledReport, "id"> = {
  source: "network",
  name: "",
  format: "excel",
  frequency: "daily",
  deliveryTime: "08:00",
  minutePastHour: "00",
  deliveryDay: "Monday",
  reportPeriod: "daily",
  fromTime: "00:00",
  toTime: "23:59",
  fromDay: "Monday",
  toDay: "Sunday",
  emailAddress: "",
};

type ScheduledReportsManagerProps = {
  open: boolean;
  initialSource: ScheduledReportSource;
  initialEditId?: string | null;
  schedules: ScheduledReport[];
  onClose: () => void;
  onSave: (schedule: ScheduledReport) => void;
  onRemove: (id: string) => void;
};

export function ScheduledReportsManager({
  open,
  initialSource,
  initialEditId = null,
  schedules,
  onClose,
  onSave,
  onRemove,
}: ScheduledReportsManagerProps) {
  const [screen, setScreen] = useState<"list" | "form">("list");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<ScheduledReport, "id">>({ ...EMPTY_FORM });
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) {
      return;
    }

    const timer = window.setTimeout(() => {
      if (initialEditId) {
        const existing = schedules.find((schedule) => schedule.id === initialEditId);
        if (existing) {
          const { id, ...values } = existing;
          setEditingId(id);
          setForm(values);
          setScreen("form");
          setError("");
          return;
        }
      }

      setEditingId(null);
      setForm({ ...EMPTY_FORM, source: initialSource });
      setScreen("list");
      setError("");
    }, 0);

    return () => window.clearTimeout(timer);
  }, [initialEditId, initialSource, open, schedules]);

  const reportSchedules = useMemo(
    () => schedules.filter((schedule) => schedule.source === initialSource),
    [initialSource, schedules],
  );

  if (!open) {
    return null;
  }

  const startAdd = () => {
    if (schedules.length >= 10) {
      setError("The maximum of 10 scheduled reports has already been reached.");
      return;
    }

    setEditingId(null);
    setForm({ ...EMPTY_FORM, source: initialSource });
    setError("");
    setScreen("form");
  };

  const startEdit = (schedule: ScheduledReport) => {
    const { id, ...values } = schedule;
    setEditingId(id);
    setForm(values);
    setError("");
    setScreen("form");
  };

  const saveSchedule = () => {
    const trimmedName = form.name.trim();
    const trimmedEmail = form.emailAddress.trim();

    if (!trimmedName) {
      setError("Enter a name for the scheduled report.");
      return;
    }

    if (!/^\S+@\S+\.\S+$/.test(trimmedEmail)) {
      setError("Enter a valid email address.");
      return;
    }

    if (!editingId && schedules.length >= 10) {
      setError("The maximum of 10 scheduled reports has already been reached.");
      return;
    }

    const nextSchedule: ScheduledReport = {
      ...form,
      id: editingId ?? `scheduled-${Date.now()}`,
      name: trimmedName,
      emailAddress: trimmedEmail,
    };

    onSave(nextSchedule);
    setEditingId(null);
    setForm({ ...EMPTY_FORM, source: initialSource });
    setError("");
    setScreen("list");
  };

  const removeSchedule = (schedule: ScheduledReport) => {
    const confirmed = window.confirm(`Remove the scheduled report “${schedule.name}”?`);
    if (confirmed) {
      onRemove(schedule.id);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#07101f]/65 p-4" role="dialog" aria-modal="true" aria-labelledby="scheduled-reports-title">
      <div className="max-h-[94vh] w-full max-w-5xl overflow-hidden rounded-[24px] border border-[#cfd8e3] bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-4 bg-[#10203a] px-5 py-4 text-white sm:px-6">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-white/70">Automated report delivery</p>
            <h2 id="scheduled-reports-title" className="mt-1 text-2xl font-black">
              {screen === "form" ? (editingId ? "Edit Scheduled Report" : "Add Scheduled Report") : "Scheduled Reports"}
            </h2>
            <p className="mt-1 text-sm font-bold text-white/75">{schedules.length} of 10 report schedules configured</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/50 text-xl font-black text-white transition hover:bg-white/10"
            aria-label="Close scheduled reports"
          >
            ×
          </button>
        </div>

        <div className="max-h-[calc(94vh-94px)] overflow-y-auto p-5 sm:p-6">
          {screen === "list" ? (
            <>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-black text-[#10203a]">{REPORT_SOURCE_LABELS[initialSource]}</p>
                  <p className="mt-1 text-sm font-bold text-[#4b5563]">
                    Add a new email schedule, or edit and remove any of the existing scheduled reports below.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={startAdd}
                  disabled={schedules.length >= 10}
                  className="shrink-0 rounded-xl bg-[#e40000] px-5 py-3 text-xs font-black uppercase tracking-[0.08em] text-white shadow-sm transition hover:bg-[#c90000] disabled:cursor-not-allowed disabled:bg-[#9ca3af]"
                >
                  + Add scheduled report
                </button>
              </div>

              {error ? <ErrorMessage message={error} /> : null}

              {schedules.length === 0 ? (
                <div className="mt-5 rounded-[20px] border-2 border-dashed border-[#c7d2df] bg-[#f8fafc] px-6 py-12 text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#e8eef8] text-2xl">✉</div>
                  <p className="mt-4 text-lg font-black text-[#10203a]">No scheduled reports set up</p>
                  <p className="mx-auto mt-2 max-w-xl text-sm font-bold leading-6 text-[#4b5563]">
                    Add the first schedule to send a report automatically by email on an hourly, daily or weekly basis.
                  </p>
                </div>
              ) : (
                <div className="mt-5 space-y-3">
                  {schedules.map((schedule) => (
                    <ScheduledReportCard
                      key={schedule.id}
                      schedule={schedule}
                      highlighted={schedule.source === initialSource}
                      onEdit={() => startEdit(schedule)}
                      onRemove={() => removeSchedule(schedule)}
                    />
                  ))}
                </div>
              )}

              {reportSchedules.length === 0 && schedules.length > 0 ? (
                <p className="mt-4 rounded-xl border border-[#bfdbfe] bg-[#eff6ff] px-4 py-3 text-sm font-bold text-[#1e3a5f]">
                  No schedules currently use {REPORT_SOURCE_LABELS[initialSource]}. Select “Add scheduled report” to create one.
                </p>
              ) : null}
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => {
                  setError("");
                  setScreen("list");
                }}
                className="mb-4 text-sm font-black text-[#0f3a6d] hover:underline"
              >
                ← Back to scheduled reports
              </button>

              <section className="rounded-[18px] border border-[#d7dee9] bg-[#f8fafc] p-4 sm:p-5">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-[#e40000]">Report details</p>
                <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                  <Field label="Report source">
                    <select
                      value={form.source}
                      onChange={(event) => setForm((current) => ({ ...current, source: event.target.value as ScheduledReportSource }))}
                      className={inputClassName}
                    >
                      {(Object.keys(REPORT_SOURCE_LABELS) as ScheduledReportSource[]).map((source) => (
                        <option key={source} value={source}>{REPORT_SOURCE_LABELS[source]}</option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Scheduled report name">
                    <input
                      type="text"
                      value={form.name}
                      maxLength={80}
                      onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                      placeholder="e.g. Daily Network Performance"
                      className={inputClassName}
                    />
                  </Field>
                  <Field label="File format">
                    <select
                      value={form.format}
                      onChange={(event) => setForm((current) => ({ ...current, format: event.target.value as ScheduledReportFormat }))}
                      className={inputClassName}
                    >
                      {(Object.keys(formatLabels) as ScheduledReportFormat[]).map((format) => (
                        <option key={format} value={format}>{formatLabels[format]}</option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Email address">
                    <input
                      type="email"
                      value={form.emailAddress}
                      onChange={(event) => setForm((current) => ({ ...current, emailAddress: event.target.value }))}
                      placeholder="name@example.com"
                      className={inputClassName}
                    />
                  </Field>
                </div>
              </section>

              <section className="mt-4 rounded-[18px] border border-[#d7dee9] bg-[#f8fafc] p-4 sm:p-5">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-[#e40000]">Schedule details</p>
                <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
                  <Field label="Send report">
                    <select
                      value={form.frequency}
                      onChange={(event) => setForm((current) => ({ ...current, frequency: event.target.value as DeliveryFrequency }))}
                      className={inputClassName}
                    >
                      <option value="hourly">Hourly</option>
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                    </select>
                  </Field>

                  {form.frequency === "hourly" ? (
                    <Field label="Minute past each hour">
                      <select
                        value={form.minutePastHour}
                        onChange={(event) => setForm((current) => ({ ...current, minutePastHour: event.target.value }))}
                        className={inputClassName}
                      >
                        <option value="00">On the hour</option>
                        <option value="15">15 minutes past</option>
                        <option value="30">30 minutes past</option>
                        <option value="45">45 minutes past</option>
                      </select>
                    </Field>
                  ) : (
                    <Field label="Send time">
                      <input
                        type="time"
                        value={form.deliveryTime}
                        onChange={(event) => setForm((current) => ({ ...current, deliveryTime: event.target.value }))}
                        className={inputClassName}
                      />
                    </Field>
                  )}

                  {form.frequency === "weekly" ? (
                    <Field label="Send day">
                      <select
                        value={form.deliveryDay}
                        onChange={(event) => setForm((current) => ({ ...current, deliveryDay: event.target.value }))}
                        className={inputClassName}
                      >
                        {dayOptions.map((day) => <option key={day} value={day}>{day}</option>)}
                      </select>
                    </Field>
                  ) : (
                    <div className="rounded-xl border border-[#d7dee9] bg-white px-4 py-3">
                      <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#6b7280]">Delivery status</p>
                      <p className="mt-2 text-sm font-black text-[#166534]">Active after saving</p>
                    </div>
                  )}
                </div>
              </section>

              <section className="mt-4 rounded-[18px] border border-[#d7dee9] bg-[#f8fafc] p-4 sm:p-5">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-[#e40000]">Schedule parameters</p>
                <p className="mt-2 text-sm font-bold leading-6 text-[#4b5563]">
                  Choose whether each emailed file contains one day or one week of report data, then set the report’s from and to parameters.
                </p>
                <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
                  <Field label="Report period">
                    <select
                      value={form.reportPeriod}
                      onChange={(event) => setForm((current) => ({ ...current, reportPeriod: event.target.value as ReportPeriod }))}
                      className={inputClassName}
                    >
                      <option value="daily">Daily report</option>
                      <option value="weekly">Weekly report</option>
                    </select>
                  </Field>

                  {form.reportPeriod === "daily" ? (
                    <>
                      <Field label="Report from time">
                        <input
                          type="time"
                          value={form.fromTime}
                          onChange={(event) => setForm((current) => ({ ...current, fromTime: event.target.value }))}
                          className={inputClassName}
                        />
                      </Field>
                      <Field label="Report to time">
                        <input
                          type="time"
                          value={form.toTime}
                          onChange={(event) => setForm((current) => ({ ...current, toTime: event.target.value }))}
                          className={inputClassName}
                        />
                      </Field>
                    </>
                  ) : (
                    <>
                      <Field label="Report from day">
                        <select
                          value={form.fromDay}
                          onChange={(event) => setForm((current) => ({ ...current, fromDay: event.target.value }))}
                          className={inputClassName}
                        >
                          {dayOptions.map((day) => <option key={day} value={day}>{day}</option>)}
                        </select>
                      </Field>
                      <Field label="Report to day">
                        <select
                          value={form.toDay}
                          onChange={(event) => setForm((current) => ({ ...current, toDay: event.target.value }))}
                          className={inputClassName}
                        >
                          {dayOptions.map((day) => <option key={day} value={day}>{day}</option>)}
                        </select>
                      </Field>
                    </>
                  )}
                </div>
              </section>

              {error ? <ErrorMessage message={error} /> : null}

              <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setError("");
                    setScreen("list");
                  }}
                  className="rounded-xl border border-[#cfd8e3] bg-white px-5 py-3 text-sm font-black text-[#10203a] transition hover:bg-[#f3f6fa]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={saveSchedule}
                  className="rounded-xl bg-[#10203a] px-6 py-3 text-sm font-black text-white transition hover:bg-[#1e3558]"
                >
                  {editingId ? "Save changes" : "Save scheduled report"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export function ScheduledReportCard({
  schedule,
  highlighted = false,
  onEdit,
  onRemove,
}: {
  schedule: ScheduledReport;
  highlighted?: boolean;
  onEdit: () => void;
  onRemove: () => void;
}) {
  return (
    <div className={`rounded-[16px] border bg-white px-4 py-4 ${highlighted ? "border-[#93c5fd] ring-1 ring-[#bfdbfe]" : "border-[#d7dee9]"}`}>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-base font-black text-[#10203a]">{schedule.name}</p>
            <span className="rounded-full bg-[#e8eef8] px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.12em] text-[#0f3a6d]">
              {formatLabels[schedule.format]}
            </span>
            <span className="rounded-full bg-[#dcfce7] px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.12em] text-[#166534]">Active</span>
          </div>
          <p className="mt-1 text-sm font-black text-[#0f3a6d]">{REPORT_SOURCE_LABELS[schedule.source]}</p>
          <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-xs font-bold text-[#4b5563]">
            <span>{getDeliverySummary(schedule)}</span>
            <span>{getPeriodSummary(schedule)}</span>
            <span>{schedule.emailAddress}</span>
          </div>
        </div>
        <div className="flex shrink-0 gap-2">
          <button type="button" onClick={onEdit} className="rounded-lg border border-[#c7d2df] bg-white px-4 py-2 text-xs font-black text-[#10203a] transition hover:bg-[#f3f6fa]">Edit</button>
          <button type="button" onClick={onRemove} className="rounded-lg border border-[#fecaca] bg-[#fff1f2] px-4 py-2 text-xs font-black text-[#b91c1c] transition hover:bg-[#fee2e2]">Remove</button>
        </div>
      </div>
    </div>
  );
}

function getDeliverySummary(schedule: ScheduledReport) {
  if (schedule.frequency === "hourly") {
    return schedule.minutePastHour === "00" ? "Sent hourly on the hour" : `Sent hourly at ${schedule.minutePastHour} minutes past`;
  }

  if (schedule.frequency === "weekly") {
    return `Sent every ${schedule.deliveryDay} at ${schedule.deliveryTime}`;
  }

  return `Sent daily at ${schedule.deliveryTime}`;
}

function getPeriodSummary(schedule: ScheduledReport) {
  return schedule.reportPeriod === "daily"
    ? `Daily data ${schedule.fromTime}–${schedule.toTime}`
    : `Weekly data ${schedule.fromDay}–${schedule.toDay}`;
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="text-[10px] font-black uppercase tracking-[0.14em] text-[#6b7280]">{label}</span>
      <span className="mt-1 block">{children}</span>
    </label>
  );
}

function ErrorMessage({ message }: { message: string }) {
  return <p className="mt-4 rounded-xl border border-[#fecaca] bg-[#fff1f2] px-4 py-3 text-sm font-black text-[#991b1b]">{message}</p>;
}

const inputClassName = "h-11 w-full rounded-xl border border-[#cfd8e3] bg-white px-3 text-sm font-black text-[#10203a] outline-none transition focus:border-[#0f3a6d] focus:ring-2 focus:ring-[#bfdbfe]";
