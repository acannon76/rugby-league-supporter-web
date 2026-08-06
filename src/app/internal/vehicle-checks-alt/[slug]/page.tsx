"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import VehicleCheckTimer from "../../vehicle-checks/VehicleCheckTimer";
import {
  altCheckCategories,
  altHistoryStorageKey,
  altMileageStorageKey,
  altStatusStorageKey,
  createAltPmt,
  formatReportedDate,
  type AltCheckStatus,
  type AltHistoryItem,
} from "../../vehicle-checks-altData";

type SavedCategoryState = {
  description: string;
  photoName: string;
};

function getCategoryStateKey(slug: string) {
  return `hgv-alt-category-state-${slug}`;
}

export default function VehicleChecksAltCategoryPage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const slug = params.slug;

  const category = useMemo(
    () => altCheckCategories.find((item) => item.slug === slug),
    [slug]
  );

  const [description, setDescription] = useState(() => {
    if (!category || typeof window === "undefined") {
      return "";
    }

    const raw = window.localStorage.getItem(getCategoryStateKey(category.slug));
    if (!raw) {
      return "";
    }

    const parsed: SavedCategoryState = JSON.parse(raw);
    return parsed.description || "";
  });

  const [photoName, setPhotoName] = useState(() => {
    if (!category || typeof window === "undefined") {
      return "";
    }

    const raw = window.localStorage.getItem(getCategoryStateKey(category.slug));
    if (!raw) {
      return "";
    }

    const parsed: SavedCategoryState = JSON.parse(raw);
    return parsed.photoName || "";
  });

  if (!category) {
    return null;
  }

  const currentCategory = category;

  function persistCategoryState(next: SavedCategoryState) {
    window.localStorage.setItem(
      getCategoryStateKey(currentCategory.slug),
      JSON.stringify(next)
    );
  }

  function saveStatus(status: AltCheckStatus) {
    const savedStatuses = window.localStorage.getItem(altStatusStorageKey);
    const currentStatuses: Record<number, AltCheckStatus> = savedStatuses
      ? JSON.parse(savedStatuses)
      : {};

    const nextStatuses: Record<number, AltCheckStatus> = {
      ...currentStatuses,
      [currentCategory.number]: status,
    };

    window.localStorage.setItem(altStatusStorageKey, JSON.stringify(nextStatuses));
  }

  function saveNoDefect() {
    persistCategoryState({ description: "", photoName: "" });
    setDescription("");
    setPhotoName("");
    saveStatus("ok");
    removeExistingHistoryForCategory();
    router.push("/internal/vehicle-checks-alt");
  }

  function removeExistingHistoryForCategory() {
    const saved = window.localStorage.getItem(altHistoryStorageKey);
    const current: AltHistoryItem[] = saved ? JSON.parse(saved) : [];
    const next = current.filter((item) => item.categorySlug !== currentCategory.slug);
    window.localStorage.setItem(altHistoryStorageKey, JSON.stringify(next));
  }

  function saveDefectAndReturn() {
    const trimmedDescription = description.trim();
    if (!trimmedDescription && !photoName) {
      return;
    }

    persistCategoryState({ description: trimmedDescription, photoName });
    saveStatus("defect");

    const saved = window.localStorage.getItem(altHistoryStorageKey);
    const current: AltHistoryItem[] = saved ? JSON.parse(saved) : [];
    const mileage = window.localStorage.getItem(altMileageStorageKey) || "684218";
    const mileageFormatted = `${Number(mileage || "0").toLocaleString("en-GB")} km`;

    const nextItem: AltHistoryItem = {
      categoryNumber: currentCategory.number,
      categoryTitle: currentCategory.title,
      categorySlug: currentCategory.slug,
      description: trimmedDescription,
      photoName,
      reported: formatReportedDate(),
      mileageReported: mileageFormatted,
      pmt: createAltPmt(currentCategory.number),
    };

    const next = [
      nextItem,
      ...current.filter((item) => item.categorySlug !== currentCategory.slug),
    ];

    window.localStorage.setItem(altHistoryStorageKey, JSON.stringify(next));
    router.push("/internal/vehicle-checks-alt");
  }

  function handlePhotoSelected(file: File | null) {
    const nextPhotoName = file ? file.name : "";
    setPhotoName(nextPhotoName);
    persistCategoryState({ description, photoName: nextPhotoName });
  }

  return (
    <main className="min-h-screen bg-[#f4f1ec] font-sans text-[#111]">
      <header className="border-b border-white/20 bg-[#b00020] px-4 py-4 text-white sm:px-6 lg:px-10">
        <div className="mx-auto flex max-w-[900px] items-center justify-between gap-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border-2 border-white bg-[#7d0017] text-lg font-black text-white">
              {currentCategory.number}
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div>
                <p className="text-lg font-black leading-none text-white">
                  {currentCategory.title}
                </p>
                <p className="text-sm font-black leading-none text-[#ffd9df]">
                  Vehicle Checks
                </p>
              </div>

              <VehicleCheckTimer />
            </div>
          </div>

          <Link
            href="/internal/vehicle-checks-alt"
            className="text-sm font-black text-white no-underline"
          >
            Back
          </Link>
        </div>
      </header>

      <section className="bg-[#b00020] px-4 py-7 text-white sm:px-6 lg:px-10">
        <div className="mx-auto max-w-[900px]">
          <p className="mb-3 text-xs font-black uppercase tracking-[0.22em] text-[#ffd9df]">
            Vehicle check category {currentCategory.number}
          </p>

          <h1 className="text-[42px] font-black leading-[0.95] sm:text-[64px]">
            {currentCategory.title}
          </h1>

          <p className="mt-4 max-w-[720px] text-sm font-bold leading-6 text-[#ffecef] sm:text-base">
            Use this simplified defect entry screen to record any issue found for {currentCategory.title.toLowerCase()}. Add details and optional photo evidence, or mark the category as checked with no defect.
          </p>
        </div>
      </section>

      <section className="px-4 py-6 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-[900px] space-y-5">
          <section className="rounded-[26px] border border-[#d6dce5] bg-white p-5 shadow-sm sm:p-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-[2fr_240px]">
              <div className="rounded-[22px] bg-[#f3f5f8] p-4">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-[#b00020]">
                  Defect Description
                </p>
                <textarea
                  value={description}
                  onChange={(event) => {
                    setDescription(event.target.value);
                    persistCategoryState({ description: event.target.value, photoName });
                  }}
                  placeholder="Type defect details here..."
                  className="mt-4 min-h-[120px] w-full resize-none rounded-[18px] border border-[#c9d2dd] bg-white px-4 py-4 text-base font-bold text-[#18243a] outline-none placeholder:text-[#94a3b8] focus:border-[#b00020]"
                />
              </div>

              <div className="rounded-[22px] bg-[#f3f5f8] p-4">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-[#b00020]">
                  Photo Evidence
                </p>
                <label className="mt-4 flex min-h-[120px] cursor-pointer flex-col items-center justify-center rounded-[18px] border-2 border-dashed border-[#b00020] bg-white px-4 py-4 text-center text-[#b00020]">
                  <span className="text-3xl">📷</span>
                  <span className="mt-2 text-2xl font-black leading-none">Open Camera</span>
                  <span className="mt-2 text-sm font-bold text-[#64748b]">
                    Take or attach photo
                  </span>
                  {photoName && (
                    <span className="mt-3 break-all rounded-full bg-[#fff1f3] px-3 py-1 text-xs font-black text-[#b00020]">
                      {photoName}
                    </span>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(event) => handlePhotoSelected(event.target.files?.[0] ?? null)}
                  />
                </label>
              </div>
            </div>
          </section>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <button
              type="button"
              onClick={saveNoDefect}
              className="rounded-[24px] bg-[#078a3d] px-5 py-4 text-sm font-black uppercase tracking-[0.16em] text-white shadow-sm transition hover:bg-[#066d30]"
            >
              No Defect Found
            </button>

            <button
              type="button"
              onClick={saveDefectAndReturn}
              className="rounded-[24px] bg-[#b00020] px-5 py-4 text-sm font-black uppercase tracking-[0.16em] text-white shadow-sm transition hover:bg-[#7d0017]"
            >
              Save Defect
            </button>

            <Link
              href="/internal/vehicle-checks-alt"
              className="flex items-center justify-center rounded-[24px] bg-[#18243a] px-5 py-4 text-sm font-black uppercase tracking-[0.16em] text-white no-underline shadow-sm transition hover:bg-[#0f172a]"
            >
              Return to Checks
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
