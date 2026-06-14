"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, Loader2, AlertCircle, Check, Copy } from "lucide-react";

import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SPACE_TYPES, SLOT_OPTIONS } from "@/lib/spaces";
import { createSpace, updateSpace } from "@/app/(app)/admin/espacios/actions";

const DAY_ROWS = [
  { key: "1", label: "Lunes" },
  { key: "2", label: "Martes" },
  { key: "3", label: "Miércoles" },
  { key: "4", label: "Jueves" },
  { key: "5", label: "Viernes" },
  { key: "6", label: "Sábado" },
  { key: "0", label: "Domingo" },
];

const TIME_OPTIONS = (() => {
  const options = [];
  for (let minutes = 0; minutes < 24 * 60; minutes += 30) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    options.push(
      `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`
    );
  }
  return options;
})();

const SELECT_CLASS =
  "h-11 w-full rounded-xl border border-stone-200 bg-white px-3 text-sm text-stone-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-900 focus-visible:ring-offset-2 focus-visible:ring-offset-white";

const LABEL_CLASS =
  "block text-xs uppercase tracking-[0.18em] text-stone-500";

function toMinutes(time) {
  const [hours, mins] = time.split(":").map(Number);
  return hours * 60 + mins;
}

function Switch({ checked, onChange, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors",
        checked ? "bg-emerald-900" : "bg-stone-200"
      )}
    >
      <span
        className={cn(
          "inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform",
          checked ? "translate-x-5" : "translate-x-0.5"
        )}
      />
    </button>
  );
}

function buildInitialSchedule(weeklyHours) {
  return DAY_ROWS.map(({ key, label }) => {
    const entry = weeklyHours?.[key];
    if (entry && entry.closed !== true && entry.open && entry.close) {
      return { key, label, open: true, openTime: entry.open, closeTime: entry.close };
    }
    return { key, label, open: false, openTime: "08:00", closeTime: "22:00" };
  });
}

export function SpaceForm({ spaceId = null, initialSpace = null }) {
  const router = useRouter();
  const isEdit = Boolean(spaceId);

  const [name, setName] = useState(initialSpace?.name ?? "");
  const [type, setType] = useState(initialSpace?.type ?? SPACE_TYPES[0].value);
  const [capacity, setCapacity] = useState(String(initialSpace?.capacity ?? 1));
  const [slotMinutes, setSlotMinutes] = useState(
    String(initialSpace?.slotMinutes ?? 90)
  );
  const [maxAdvanceDays, setMaxAdvanceDays] = useState(
    String(initialSpace?.maxAdvanceDays ?? 7)
  );
  const [isActive, setIsActive] = useState(initialSpace?.isActive ?? true);
  const [schedule, setSchedule] = useState(() =>
    initialSpace
      ? buildInitialSchedule(initialSpace.weeklyHours)
      : DAY_ROWS.map(({ key, label }) => ({
          key,
          label,
          open: true,
          openTime: "08:00",
          closeTime: "22:00",
        }))
  );

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function clearMessages() {
    if (error) setError("");
    if (success) setSuccess("");
  }

  function updateRow(index, changes) {
    clearMessages();
    setSchedule((previous) =>
      previous.map((row, rowIndex) =>
        rowIndex === index ? { ...row, ...changes } : row
      )
    );
  }

  function applyToAll() {
    clearMessages();
    const first = schedule[0];
    setSchedule((previous) =>
      previous.map((row) => ({
        ...row,
        open: first.open,
        openTime: first.openTime,
        closeTime: first.closeTime,
      }))
    );
  }

  const scheduleValid = useMemo(
    () =>
      schedule.every(
        (row) => !row.open || toMinutes(row.closeTime) > toMinutes(row.openTime)
      ),
    [schedule]
  );

  const valid =
    name.trim().length > 0 &&
    Number(capacity) >= 1 &&
    Number(maxAdvanceDays) >= 1 &&
    scheduleValid;

  async function handleSubmit(event) {
    event.preventDefault();
    if (!valid || saving) return;

    setSaving(true);
    setError("");
    setSuccess("");

    const weeklyHours = {};
    schedule.forEach((row) => {
      weeklyHours[row.key] = row.open
        ? { open: row.openTime, close: row.closeTime }
        : { closed: true };
    });

    const values = {
      name,
      type,
      capacity,
      slotMinutes,
      maxAdvanceDays,
      isActive,
      weeklyHours,
    };

    const result = isEdit
      ? await updateSpace(spaceId, values)
      : await createSpace(values);

    if (result?.error) {
      setSaving(false);
      setError(`No hemos podido guardar el espacio: ${result.error}`);
      return;
    }

    if (isEdit) {
      setSaving(false);
      setSuccess("Espacio guardado.");
      router.refresh();
    } else {
      router.push("/admin/espacios");
      router.refresh();
    }
  }

  return (
    <div className="space-y-8">
      <header className="space-y-4">
        <Link
          href="/admin/espacios"
          aria-label="Volver a espacios"
          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-stone-200 bg-white text-stone-600 transition-colors hover:bg-stone-50"
        >
          <ChevronLeft className="h-4 w-4" strokeWidth={1.6} aria-hidden="true" />
        </Link>
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.18em] text-stone-400">
            Gestión
          </p>
          <h1 className="font-serif text-3xl font-normal tracking-tight text-stone-900">
            {isEdit ? initialSpace?.name || "Editar espacio" : "Nuevo espacio"}
          </h1>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-5 rounded-3xl border border-stone-200 bg-white p-6">
          <div className="space-y-1.5">
            <label htmlFor="name" className={LABEL_CLASS}>
              Nombre
            </label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(event) => {
                clearMessages();
                setName(event.target.value);
              }}
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="type" className={LABEL_CLASS}>
              Tipo
            </label>
            <select
              id="type"
              value={type}
              onChange={(event) => {
                clearMessages();
                setType(event.target.value);
              }}
              className={SELECT_CLASS}
            >
              {SPACE_TYPES.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="capacity" className={LABEL_CLASS}>
              Aforo
            </label>
            <Input
              id="capacity"
              type="number"
              min={1}
              step={1}
              value={capacity}
              onChange={(event) => {
                clearMessages();
                setCapacity(event.target.value);
              }}
            />
            <p className="text-xs text-stone-400">
              1 = uso exclusivo por turno; mayor = varias reservas por turno.
            </p>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="slotMinutes" className={LABEL_CLASS}>
              Duración del turno
            </label>
            <select
              id="slotMinutes"
              value={slotMinutes}
              onChange={(event) => {
                clearMessages();
                setSlotMinutes(event.target.value);
              }}
              className={SELECT_CLASS}
            >
              {SLOT_OPTIONS.map((option) => (
                <option key={option.value} value={String(option.value)}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="maxAdvanceDays" className={LABEL_CLASS}>
              Días de antelación
            </label>
            <Input
              id="maxAdvanceDays"
              type="number"
              min={1}
              step={1}
              value={maxAdvanceDays}
              onChange={(event) => {
                clearMessages();
                setMaxAdvanceDays(event.target.value);
              }}
            />
            <p className="text-xs text-stone-400">
              Con cuánta antelación pueden reservar los vecinos.
            </p>
          </div>

          <div className="flex items-center justify-between gap-4">
            <div className="space-y-0.5">
              <span className={LABEL_CLASS}>Estado</span>
              <p className="text-sm text-stone-500">
                {isActive ? "Activo" : "Inactivo"}
              </p>
            </div>
            <Switch
              checked={isActive}
              onChange={(value) => {
                clearMessages();
                setIsActive(value);
              }}
              label="Estado activo"
            />
          </div>
        </div>

        <div className="space-y-4 rounded-3xl border border-stone-200 bg-white p-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-serif text-xl font-normal tracking-tight text-stone-900">
              Horario semanal
            </h2>
            <button
              type="button"
              onClick={applyToAll}
              className="inline-flex items-center gap-1.5 rounded-full border border-stone-200 px-3 py-1.5 text-xs text-stone-600 transition-colors hover:bg-stone-50"
            >
              <Copy className="h-3.5 w-3.5" strokeWidth={1.6} aria-hidden="true" />
              Aplicar a todos los días
            </button>
          </div>

          <div className="space-y-2">
            {schedule.map((row, index) => {
              const invalid =
                row.open && toMinutes(row.closeTime) <= toMinutes(row.openTime);

              return (
                <div
                  key={row.key}
                  className="space-y-2 rounded-xl border border-stone-200 p-3"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm text-stone-900">{row.label}</span>
                    <span className="flex items-center gap-2">
                      <span className="text-xs text-stone-400">
                        {row.open ? "Abierto" : "Cerrado"}
                      </span>
                      <Switch
                        checked={row.open}
                        onChange={(value) => updateRow(index, { open: value })}
                        label={`${row.label} abierto`}
                      />
                    </span>
                  </div>

                  {row.open ? (
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="block text-[10px] uppercase tracking-[0.18em] text-stone-400">
                          Apertura
                        </label>
                        <select
                          value={row.openTime}
                          onChange={(event) =>
                            updateRow(index, { openTime: event.target.value })
                          }
                          className={SELECT_CLASS}
                        >
                          {TIME_OPTIONS.map((time) => (
                            <option key={time} value={time}>
                              {time}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="block text-[10px] uppercase tracking-[0.18em] text-stone-400">
                          Cierre
                        </label>
                        <select
                          value={row.closeTime}
                          onChange={(event) =>
                            updateRow(index, { closeTime: event.target.value })
                          }
                          className={SELECT_CLASS}
                        >
                          {TIME_OPTIONS.map((time) => (
                            <option key={time} value={time}>
                              {time}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  ) : null}

                  {invalid ? (
                    <p className="text-xs text-red-800">
                      La hora de cierre debe ser posterior a la de apertura.
                    </p>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>

        {error ? (
          <div className="flex items-start gap-2 rounded-xl border border-red-100 bg-red-50 px-3 py-2.5 text-xs text-red-800">
            <AlertCircle
              className="mt-0.5 h-3.5 w-3.5 shrink-0"
              strokeWidth={1.8}
              aria-hidden="true"
            />
            <span>{error}</span>
          </div>
        ) : null}

        {success ? (
          <div className="flex items-start gap-2 rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2.5 text-xs text-emerald-900">
            <Check
              className="mt-0.5 h-3.5 w-3.5 shrink-0"
              strokeWidth={1.8}
              aria-hidden="true"
            />
            <span>{success}</span>
          </div>
        ) : null}

        <Button
          type="submit"
          disabled={!valid || saving}
          className="w-full rounded-xl"
        >
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : null}
          {saving ? "Guardando…" : "Guardar espacio"}
        </Button>
      </form>
    </div>
  );
}
