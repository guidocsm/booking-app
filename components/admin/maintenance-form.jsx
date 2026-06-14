"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, AlertCircle } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { madridDateParts } from "@/lib/time";
import { createBlock, updateBlock } from "@/app/(app)/admin/mantenimiento/actions";

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

const LABEL_CLASS = "block text-xs uppercase tracking-[0.18em] text-stone-500";

function toMinutes(time) {
  const [hours, mins] = time.split(":").map(Number);
  return hours * 60 + mins;
}

export function MaintenanceForm({
  spaces,
  reasonOptions,
  blockId = null,
  initialBlock = null,
}) {
  const router = useRouter();
  const isEdit = Boolean(blockId);
  const todayISO = useMemo(() => madridDateParts(new Date()).dateISO, []);

  const [spaceId, setSpaceId] = useState(
    initialBlock?.spaceId ?? spaces[0]?.id ?? ""
  );
  const [blockDate, setBlockDate] = useState(initialBlock?.blockDate ?? todayISO);
  const [startTime, setStartTime] = useState(
    initialBlock?.startTime?.slice(0, 5) ?? "09:00"
  );
  const [endTime, setEndTime] = useState(
    initialBlock?.endTime?.slice(0, 5) ?? "13:00"
  );
  const [reason, setReason] = useState(
    initialBlock?.reason ?? reasonOptions[0]?.key ?? ""
  );

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const timeValid = toMinutes(endTime) > toMinutes(startTime);
  const dateValid = blockDate >= todayISO;
  const valid =
    Boolean(spaceId) && Boolean(blockDate) && dateValid && timeValid && Boolean(reason);

  async function handleSubmit(event) {
    event.preventDefault();
    if (!valid || saving) return;

    setSaving(true);
    setError("");

    const values = { spaceId, blockDate, startTime, endTime, reason };
    const result = isEdit
      ? await updateBlock(blockId, values, initialBlock?.spaceId)
      : await createBlock(values);

    if (result?.error) {
      setSaving(false);
      setError(`No hemos podido guardar el bloqueo: ${result.error}`);
      return;
    }

    router.push("/admin/mantenimiento");
    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5 rounded-3xl border border-stone-200 bg-white p-6"
    >
      <div className="space-y-1.5">
        <label htmlFor="space" className={LABEL_CLASS}>
          Espacio
        </label>
        <select
          id="space"
          value={spaceId}
          onChange={(event) => {
            setError("");
            setSpaceId(event.target.value);
          }}
          className={SELECT_CLASS}
        >
          {spaces.map((space) => (
            <option key={space.id} value={space.id}>
              {space.name} · {space.typeLabel}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="blockDate" className={LABEL_CLASS}>
          Fecha
        </label>
        <Input
          id="blockDate"
          type="date"
          min={todayISO}
          value={blockDate}
          onChange={(event) => {
            setError("");
            setBlockDate(event.target.value);
          }}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label htmlFor="startTime" className={LABEL_CLASS}>
            Hora inicio
          </label>
          <select
            id="startTime"
            value={startTime}
            onChange={(event) => {
              setError("");
              setStartTime(event.target.value);
            }}
            className={SELECT_CLASS}
          >
            {TIME_OPTIONS.map((time) => (
              <option key={time} value={time}>
                {time}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <label htmlFor="endTime" className={LABEL_CLASS}>
            Hora fin
          </label>
          <select
            id="endTime"
            value={endTime}
            onChange={(event) => {
              setError("");
              setEndTime(event.target.value);
            }}
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

      {!timeValid ? (
        <p className="text-xs text-red-800">
          La hora de fin debe ser posterior a la de inicio.
        </p>
      ) : null}

      <div className="space-y-1.5">
        <label htmlFor="reason" className={LABEL_CLASS}>
          Motivo
        </label>
        <select
          id="reason"
          value={reason}
          onChange={(event) => {
            setError("");
            setReason(event.target.value);
          }}
          className={SELECT_CLASS}
        >
          {reasonOptions.map((option) => (
            <option key={option.key} value={option.key}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {error ? (
        <div className="flex items-start gap-2 rounded-xl border border-red-100 bg-red-50 px-3 py-2.5 text-xs text-red-800">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" strokeWidth={1.8} aria-hidden="true" />
          <span>{error}</span>
        </div>
      ) : null}

      <Button type="submit" disabled={!valid || saving} className="w-full rounded-xl">
        {saving ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        ) : null}
        {saving ? "Guardando…" : isEdit ? "Guardar cambios" : "Crear bloqueo"}
      </Button>
    </form>
  );
}
