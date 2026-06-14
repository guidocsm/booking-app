const MADRID_TIME_ZONE = "Europe/Madrid";

export function addMinutes(time, minutes) {
  const [hours, mins] = time.split(":").map(Number);
  const total = hours * 60 + mins + minutes;
  const normalized = ((total % 1440) + 1440) % 1440;
  const nextHours = Math.floor(normalized / 60);
  const nextMins = normalized % 60;
  return `${String(nextHours).padStart(2, "0")}:${String(nextMins).padStart(2, "0")}`;
}

function toMinutes(time) {
  const [hours, mins] = time.split(":").map(Number);
  return hours * 60 + mins;
}

export function generateBlocks(open, close, slotMinutes) {
  if (!open || !close || !slotMinutes) return [];

  const openMinutes = toMinutes(open);
  const closeMinutes = toMinutes(close);
  const blocks = [];

  for (
    let start = openMinutes;
    start + slotMinutes <= closeMinutes;
    start += slotMinutes
  ) {
    const hours = Math.floor(start / 60);
    const mins = start % 60;
    blocks.push(
      `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`
    );
  }

  return blocks;
}

function timeZoneOffsetMinutes(date, timeZone) {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  const parts = formatter.formatToParts(date).reduce((acc, part) => {
    if (part.type !== "literal") acc[part.type] = part.value;
    return acc;
  }, {});

  const asUTC = Date.UTC(
    Number(parts.year),
    Number(parts.month) - 1,
    Number(parts.day),
    Number(parts.hour),
    Number(parts.minute),
    Number(parts.second)
  );

  return (asUTC - date.getTime()) / 60000;
}

export function buildMadridTimestamp(dateISO, time) {
  const [year, month, day] = dateISO.split("-").map(Number);
  const [hours, mins] = time.split(":").map(Number);

  const naiveUTC = Date.UTC(year, month - 1, day, hours, mins, 0);
  const offset = timeZoneOffsetMinutes(new Date(naiveUTC), MADRID_TIME_ZONE);
  let instant = naiveUTC - offset * 60000;

  const recheck = timeZoneOffsetMinutes(new Date(instant), MADRID_TIME_ZONE);
  if (recheck !== offset) {
    instant = naiveUTC - recheck * 60000;
  }

  return new Date(instant).toISOString();
}

export function madridDateParts(value) {
  const date = value instanceof Date ? value : new Date(value);

  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: MADRID_TIME_ZONE,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

  const parts = formatter.formatToParts(date).reduce((acc, part) => {
    if (part.type !== "literal") acc[part.type] = part.value;
    return acc;
  }, {});

  return {
    dateISO: `${parts.year}-${parts.month}-${parts.day}`,
    time: `${parts.hour}:${parts.minute}`,
  };
}

export function madridTimeRange(startValue, endValue) {
  return `${madridDateParts(startValue).time} – ${madridDateParts(endValue).time}`;
}

export function madridDayLabel(value) {
  const { dateISO } = madridDateParts(value);
  const date = new Date(`${dateISO}T12:00:00Z`);
  const weekday = new Intl.DateTimeFormat("es-ES", {
    weekday: "short",
    timeZone: "UTC",
  })
    .format(date)
    .replace(/\.$/, "");
  const month = new Intl.DateTimeFormat("es-ES", {
    month: "short",
    timeZone: "UTC",
  })
    .format(date)
    .replace(/\.$/, "");
  const day = Number(dateISO.split("-")[2]);
  const capitalized = weekday.charAt(0).toUpperCase() + weekday.slice(1);
  return `${capitalized}, ${day} ${month}`;
}

export function addDaysISO(dateISO, days) {
  const [year, month, day] = dateISO.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  date.setUTCDate(date.getUTCDate() + days);
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(
    2,
    "0"
  )}-${String(date.getUTCDate()).padStart(2, "0")}`;
}
