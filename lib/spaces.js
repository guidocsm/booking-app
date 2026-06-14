export const SPACE_TYPES = [
  { value: "padel", label: "Pádel" },
  { value: "tennis", label: "Tenis" },
  { value: "gym", label: "Gimnasio" },
  { value: "pool", label: "Piscina" },
  { value: "social", label: "Salón social" },
];

export const SLOT_OPTIONS = [
  { value: 60, label: "1 h" },
  { value: 90, label: "1,5 h" },
  { value: 120, label: "2 h" },
];

export function spaceTypeLabel(type) {
  return SPACE_TYPES.find((option) => option.value === type)?.label ?? type;
}

export function durationLabel(minutes) {
  const found = SLOT_OPTIONS.find((option) => option.value === Number(minutes));
  if (found) return found.label;

  const hours = Math.round((Number(minutes) / 60) * 100) / 100;
  const text = Number.isInteger(hours)
    ? String(hours)
    : String(hours).replace(".", ",");
  return `${text} h`;
}
