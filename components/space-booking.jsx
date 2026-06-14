"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowUpRight,
  Check,
  Lock,
  Wrench,
  Loader2,
  AlertCircle,
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import {
  addMinutes,
  generateBlocks,
  buildMadridTimestamp,
  madridDateParts,
  addDaysISO,
} from "@/lib/time";
import { BackLink } from "@/components/back-link";
import { cn } from "@/lib/utils";

const MAINTENANCE_PATTERN =
  "repeating-linear-gradient(45deg, rgba(120,113,108,0.05) 0, rgba(120,113,108,0.05) 1px, transparent 1px, transparent 8px)";

function toMinutes(time) {
  const [hours, mins] = time.slice(0, 5).split(":").map(Number);
  return hours * 60 + mins;
}

function dayOfWeek(dateISO) {
  return new Date(`${dateISO}T12:00:00Z`).getUTCDay();
}

function capitalize(text) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function stripDot(text) {
  return text.replace(/\.$/, "");
}

function weekdayShort(dateISO) {
  const date = new Date(`${dateISO}T12:00:00Z`);
  return capitalize(
    stripDot(
      new Intl.DateTimeFormat("es-ES", {
        weekday: "short",
        timeZone: "UTC",
      }).format(date)
    )
  );
}

function weekdayLong(dateISO) {
  const date = new Date(`${dateISO}T12:00:00Z`);
  return capitalize(
    new Intl.DateTimeFormat("es-ES", {
      weekday: "long",
      timeZone: "UTC",
    }).format(date)
  );
}

function monthShort(dateISO) {
  const date = new Date(`${dateISO}T12:00:00Z`);
  return stripDot(
    new Intl.DateTimeFormat("es-ES", {
      month: "short",
      timeZone: "UTC",
    }).format(date)
  );
}

function dayNumber(dateISO) {
  return Number(dateISO.split("-")[2]);
}

function formatDuration(minutes) {
  const hours = Math.round((minutes / 60) * 100) / 100;
  const text = Number.isInteger(hours) ? String(hours) : String(hours).replace(".", ",");
  return `${text} h`;
}

function SlotCard({ slot, durationLabel, submitting, busy, onReserve }) {
  const range = `${slot.start} – ${slot.end}`;

  if (slot.status === "mine") {
    return (
      <div className="flex items-center justify-between gap-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <Check className="h-3.5 w-3.5 text-emerald-800" strokeWidth={1.8} aria-hidden="true" />
            <span className="text-xs uppercase tracking-[0.18em] text-emerald-800">
              Tu reserva
            </span>
          </div>
          <p className="font-serif text-xl font-normal tracking-tight text-stone-900">
            {range}
          </p>
          <p className="text-xs text-stone-400">{durationLabel}</p>
        </div>
        <span className="shrink-0 rounded-full bg-emerald-900 px-4 py-1.5 text-xs font-medium text-white">
          Reservada
        </span>
      </div>
    );
  }

  if (slot.status === "occupied") {
    return (
      <div className="flex items-center justify-between gap-4 rounded-2xl border border-stone-200 bg-stone-50 p-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <Lock className="h-3.5 w-3.5 text-stone-400" strokeWidth={1.8} aria-hidden="true" />
            <span className="text-xs uppercase tracking-[0.18em] text-stone-400">
              Reservada
            </span>
          </div>
          <p className="font-serif text-xl font-normal tracking-tight text-stone-400">
            {range}
          </p>
          <p className="text-xs text-stone-400">{durationLabel}</p>
        </div>
      </div>
    );
  }

  if (slot.status === "maintenance") {
    return (
      <div
        className="flex cursor-not-allowed items-center justify-between gap-4 rounded-2xl border border-stone-200 bg-stone-50 p-4"
        style={{ backgroundImage: MAINTENANCE_PATTERN }}
      >
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <Wrench className="h-3.5 w-3.5 text-stone-400" strokeWidth={1.8} aria-hidden="true" />
            <span className="text-xs uppercase tracking-[0.18em] text-stone-400">
              {slot.reasonLabel
                ? `No disponible · ${slot.reasonLabel}`
                : "No disponible"}
            </span>
          </div>
          <p className="font-serif text-xl font-normal tracking-tight text-stone-400">
            {range}
          </p>
          <p className="text-xs text-stone-400">{durationLabel}</p>
        </div>
        <span className="shrink-0 rounded-full border border-dashed border-stone-300 px-4 py-1.5 text-xs text-stone-400">
          Mantenimiento
        </span>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={onReserve}
      disabled={busy}
      aria-label={`Reservar ${range}`}
      className="group flex w-full items-center justify-between gap-4 rounded-2xl border border-stone-200 bg-white p-4 text-left transition-all hover:-translate-y-0.5 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-900 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-60"
    >
      <div className="space-y-1.5">
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-700" />
          <span className="text-xs uppercase tracking-[0.18em] text-stone-400">
            Disponible
          </span>
        </div>
        <p className="font-serif text-xl font-normal tracking-tight text-stone-900">
          {range}
        </p>
        <p className="text-xs text-stone-400">{durationLabel}</p>
      </div>

      {submitting ? (
        <Loader2 className="h-5 w-5 shrink-0 animate-spin text-stone-400" aria-hidden="true" />
      ) : (
        <span className="flex shrink-0 items-center gap-2">
          <span className="rounded-full border border-stone-200 px-4 py-1.5 text-xs font-medium text-stone-700">
            Reservar
          </span>
          <span className="flex h-9 w-9 items-center justify-center rounded-full border border-stone-200 transition-colors group-hover:border-emerald-900 group-hover:bg-emerald-900">
            <ArrowUpRight
              className="h-4 w-4 text-stone-400 transition-colors group-hover:text-white"
              strokeWidth={1.6}
              aria-hidden="true"
            />
          </span>
        </span>
      )}
    </button>
  );
}

export function SpaceBooking({ space, userId, reasonLabels = {} }) {
  const supabase = useMemo(() => createClient(), []);
  const todayISO = useMemo(() => madridDateParts(new Date()).dateISO, []);

  const days = useMemo(() => {
    const result = [];
    for (let offset = 0; offset <= space.maxAdvanceDays; offset += 1) {
      result.push(addDaysISO(todayISO, offset));
    }
    return result;
  }, [todayISO, space.maxAdvanceDays]);

  const [selectedDate, setSelectedDate] = useState(todayISO);
  const [bookings, setBookings] = useState([]);
  const [maintenance, setMaintenance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [actionError, setActionError] = useState("");
  const [submittingBlock, setSubmittingBlock] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setFetchError("");
      setActionError("");

      const dayStart = buildMadridTimestamp(selectedDate, "00:00");
      const dayEnd = buildMadridTimestamp(addDaysISO(selectedDate, 1), "00:00");

      const [bookingsRes, blocksRes] = await Promise.all([
        supabase
          .from("bookings")
          .select("id, user_id, start_time, end_time, status")
          .eq("space_id", space.id)
          .eq("status", "active")
          .gte("start_time", dayStart)
          .lt("start_time", dayEnd),
        supabase
          .from("spaces_blocks")
          .select("start_time, end_time, reason")
          .eq("space_id", space.id)
          .eq("block_date", selectedDate),
      ]);

      if (cancelled) return;

      if (bookingsRes.error || blocksRes.error) {
        setFetchError("No hemos podido cargar la disponibilidad. Inténtalo de nuevo.");
        setBookings([]);
        setMaintenance([]);
      } else {
        setBookings(bookingsRes.data ?? []);
        setMaintenance(blocksRes.data ?? []);
      }

      setLoading(false);
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [selectedDate, supabase, space.id]);

  const hours = space.weeklyHours?.[String(dayOfWeek(selectedDate))];
  const closed = !hours || hours.closed === true || !hours.open || !hours.close;
  const blocks = closed
    ? []
    : generateBlocks(hours.open, hours.close, space.slotMinutes);

  const durationLabel = formatDuration(space.slotMinutes);
  const isToday = selectedDate === todayISO;
  const nowMs = Date.now();

  const slots = blocks
    .map((start) => {
      const end = addMinutes(start, space.slotMinutes);
      const startMs = Date.parse(buildMadridTimestamp(selectedDate, start));
      const matching = bookings.filter(
        (booking) => Date.parse(booking.start_time) === startMs
      );
      const mine = matching.some((booking) => booking.user_id === userId);
      const startMin = toMinutes(start);
      const endMin = toMinutes(end);
      const overlappingBlock = maintenance.find((block) => {
        const blockStart = toMinutes(block.start_time);
        const blockEnd = toMinutes(block.end_time);
        return startMin < blockEnd && endMin > blockStart;
      });

      let status;
      if (overlappingBlock) status = "maintenance";
      else if (mine) status = "mine";
      else if (matching.length >= 1) status = "occupied";
      else status = "available";

      const reasonLabel = overlappingBlock
        ? reasonLabels[overlappingBlock.reason] ?? null
        : null;

      return { start, end, status, startMs, reasonLabel };
    })
    .filter((slot) => !isToday || slot.startMs > nowMs);

  const availableCount = slots.filter((slot) => slot.status === "available").length;
  const dayLabel = isToday
    ? `Hoy, ${dayNumber(selectedDate)} ${monthShort(selectedDate)}`
    : `${weekdayLong(selectedDate)}, ${dayNumber(selectedDate)} ${monthShort(selectedDate)}`;
  const freeLabel =
    availableCount > 0
      ? `${availableCount} ${availableCount === 1 ? "disponible" : "disponibles"}`
      : "Sin disponibilidad";

  async function reserve(block) {
    if (submittingBlock) return;

    setActionError("");
    setSubmittingBlock(block);

    try {
      const startISO = buildMadridTimestamp(selectedDate, block);
      const endISO = buildMadridTimestamp(
        selectedDate,
        addMinutes(block, space.slotMinutes)
      );

      const { data, error } = await supabase
        .from("bookings")
        .insert({
          space_id: space.id,
          user_id: userId,
          start_time: startISO,
          end_time: endISO,
          status: "active",
        })
        .select("id, user_id, start_time, end_time, status")
        .maybeSingle();

      if (error) {
        setActionError("No hemos podido completar la reserva. Inténtalo de nuevo.");
        return;
      }

      if (data) {
        setBookings((previous) => [...previous, data]);
      }
    } catch {
      setActionError("Ha ocurrido un error inesperado. Inténtalo de nuevo.");
    } finally {
      setSubmittingBlock(null);
    }
  }

  return (
    <div className="space-y-8">
      <header className="space-y-4">
        <BackLink href="/inicio" />
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.18em] text-stone-400">
            Reserva
          </p>
          <h1 className="font-serif text-3xl font-normal tracking-tight text-stone-900">
            {space.name}
          </h1>
          <p className="text-xs uppercase tracking-[0.18em] text-stone-400">
            {space.typeLabel}
          </p>
        </div>
      </header>

      <div className="-mx-6 px-6">
        <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
          {days.map((dateISO) => {
            const selected = dateISO === selectedDate;
            const today = dateISO === todayISO;

            return (
              <button
                key={dateISO}
                type="button"
                onClick={() => setSelectedDate(dateISO)}
                aria-pressed={selected}
                className={cn(
                  "flex min-w-[4.25rem] shrink-0 flex-col items-center gap-1 rounded-2xl border px-3 py-3 transition-colors",
                  selected
                    ? "border-emerald-900 bg-emerald-900"
                    : "border-stone-200 bg-white hover:bg-stone-50"
                )}
              >
                <span
                  className={cn(
                    "text-[11px] uppercase tracking-[0.14em]",
                    selected ? "text-emerald-100" : "text-stone-400"
                  )}
                >
                  {today ? "Hoy" : weekdayShort(dateISO)}
                </span>
                <span
                  className={cn(
                    "font-serif text-xl font-normal",
                    selected ? "text-white" : "text-stone-900"
                  )}
                >
                  {dayNumber(dateISO)}
                </span>
                <span
                  className={cn(
                    "text-[11px]",
                    selected ? "text-emerald-100" : "text-stone-400"
                  )}
                >
                  {monthShort(dateISO)}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-5">
        <div className="flex items-baseline justify-between gap-3">
          <p className="font-serif text-lg font-normal tracking-tight text-stone-900">
            {dayLabel}
          </p>
          {!closed && !loading ? (
            <p className="text-xs text-stone-400">{freeLabel}</p>
          ) : null}
        </div>

        {fetchError ? (
          <div className="flex items-start gap-2 rounded-xl border border-red-100 bg-red-50 px-3 py-2.5 text-xs text-red-800">
            <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" strokeWidth={1.8} aria-hidden="true" />
            <span>{fetchError}</span>
          </div>
        ) : null}

        {actionError ? (
          <div className="flex items-start gap-2 rounded-xl border border-red-100 bg-red-50 px-3 py-2.5 text-xs text-red-800">
            <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" strokeWidth={1.8} aria-hidden="true" />
            <span>{actionError}</span>
          </div>
        ) : null}

        {closed ? (
          <div className="flex flex-col items-center gap-3 rounded-3xl border border-dashed border-stone-300 bg-white px-6 py-14 text-center">
            <p className="font-serif text-xl font-normal tracking-tight text-stone-900">
              Cerrado este día
            </p>
            <p className="max-w-xs text-sm text-stone-400">
              Este espacio no abre en la fecha seleccionada. Prueba con otro día.
            </p>
          </div>
        ) : loading ? (
          <div className="space-y-3">
            {[0, 1, 2, 3, 4].map((index) => (
              <div
                key={index}
                className="h-[5.25rem] animate-pulse rounded-2xl border border-stone-200 bg-stone-50"
              />
            ))}
          </div>
        ) : slots.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-3xl border border-dashed border-stone-300 bg-white px-6 py-14 text-center">
            <p className="font-serif text-xl font-normal tracking-tight text-stone-900">
              No quedan horas disponibles hoy
            </p>
            <p className="max-w-xs text-sm text-stone-400">
              Hoy ya no hay más turnos. Prueba con otro día.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {slots.map((slot) => (
              <SlotCard
                key={slot.start}
                slot={slot}
                durationLabel={durationLabel}
                submitting={submittingBlock === slot.start}
                busy={submittingBlock !== null}
                onReserve={() => reserve(slot.start)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
