const DAY_MS = 24 * 60 * 60 * 1000;
const WEEK_MS = 7 * DAY_MS;

function getOperationalYearStartUtc(year: number) {
  const aprilFirstUtc = Date.UTC(year, 3, 1);
  const aprilFirstDay = new Date(aprilFirstUtc).getUTCDay();
  const daysSinceMonday = (aprilFirstDay + 6) % 7;

  return aprilFirstUtc - daysSinceMonday * DAY_MS;
}

function getOperationalWeekNumberFromParts(year: number, month: number, day: number) {
  if (![year, month, day].every(Number.isFinite)) {
    return 1;
  }

  const dateUtc = Date.UTC(year, month - 1, day);
  const currentYearStartUtc = getOperationalYearStartUtc(year);
  const operationalYearStartUtc =
    dateUtc >= currentYearStartUtc
      ? currentYearStartUtc
      : getOperationalYearStartUtc(year - 1);

  return Math.floor((dateUtc - operationalYearStartUtc) / WEEK_MS) + 1;
}

export function getOperationalWeekNumber(date: Date) {
  return getOperationalWeekNumberFromParts(
    date.getFullYear(),
    date.getMonth() + 1,
    date.getDate()
  );
}

export function getOperationalWeekNumberFromDisplayDate(displayDate: string) {
  const [day, month, year] = displayDate.split("/").map(Number);
  return getOperationalWeekNumberFromParts(year, month, day);
}

export function getOperationalWeekNumberFromInputDate(inputDate: string) {
  const [year, month, day] = inputDate.split("-").map(Number);
  return getOperationalWeekNumberFromParts(year, month, day);
}
