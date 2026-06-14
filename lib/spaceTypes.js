export const SPACE_TYPES = [
  { value: "padel", label: "Pádel" },
  { value: "tennis", label: "Tenis" },
  { value: "gym", label: "Gimnasio" },
  { value: "pool", label: "Piscina" },
  { value: "social", label: "Salón social" },
];

export const TYPE_LABELS = {
  padel: "Pádel",
  tennis: "Tenis",
  gym: "Gimnasio",
  pool: "Piscina",
  social: "Salón social",
};

export function getTypeLabel(type) {
  return TYPE_LABELS[type] ?? type;
}
