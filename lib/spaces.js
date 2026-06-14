export const SLOT_OPTIONS = [
  { value: 60, label: "1 h" },
  { value: 90, label: "1,5 h" },
  { value: 120, label: "2 h" },
];

export function durationLabel(minutes) {
  const found = SLOT_OPTIONS.find((option) => option.value === Number(minutes));
  if (found) return found.label;

  const hours = Math.round((Number(minutes) / 60) * 100) / 100;
  const text = Number.isInteger(hours)
    ? String(hours)
    : String(hours).replace(".", ",");
  return `${text} h`;
}
