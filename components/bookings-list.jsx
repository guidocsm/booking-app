"use client";

import { useMemo, useState } from "react";
import { CalendarPlus, AlertCircle, Loader2 } from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import { madridTimeRange, madridDayLabel } from "@/lib/time";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";

const TWO_HOURS_MS = 2 * 60 * 60 * 1000;

function EmptyState({ title, subtitle }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-3xl border border-dashed border-stone-300 bg-white px-6 py-14 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-stone-100">
        <CalendarPlus
          className="h-5 w-5 text-stone-400"
          strokeWidth={1.6}
          aria-hidden="true"
        />
      </span>
      <p className="font-serif text-xl font-normal tracking-tight text-stone-900">
        {title}
      </p>
      <p className="max-w-xs text-sm text-stone-400">{subtitle}</p>
    </div>
  );
}

function BookingCard({ booking, variant, cancellable, onCancel }) {
  const isUpcoming = variant === "upcoming";
  const range = madridTimeRange(booking.startTime, booking.endTime);
  const dayLabel = madridDayLabel(booking.startTime);
  const typeLabel = booking.spaceTypeLabel || booking.spaceName;

  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-stone-200 bg-white p-5">
      <div className="min-w-0 space-y-1.5">
        <p className="truncate text-xs uppercase tracking-[0.18em] text-stone-900">
          {typeLabel}
        </p>
        <p className="font-serif text-xl font-normal tracking-tight text-stone-900">
          {range}
        </p>
        <p className="truncate text-xs text-stone-400">
          {booking.spaceName} · {dayLabel}
        </p>
      </div>

      {isUpcoming ? (
        <div className="shrink-0">
          {cancellable ? (
            <button
              type="button"
              onClick={onCancel}
              className="rounded-full border border-stone-200 px-4 py-2 text-xs text-stone-500 transition-colors hover:border-red-200 hover:text-red-800"
            >
              Cancelar
            </button>
          ) : (
            <span className="text-xs text-stone-400">No cancelable</span>
          )}
        </div>
      ) : null}
    </div>
  );
}

export function BookingsList({ bookings }) {
  const supabase = useMemo(() => createClient(), []);

  const [items, setItems] = useState(bookings);
  const [activeTab, setActiveTab] = useState("upcoming");
  const [cancelTarget, setCancelTarget] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [actionError, setActionError] = useState("");

  const now = Date.now();

  const upcoming = items
    .filter((booking) => Date.parse(booking.startTime) >= now)
    .sort((a, b) => Date.parse(a.startTime) - Date.parse(b.startTime));

  const past = items
    .filter((booking) => Date.parse(booking.startTime) < now)
    .sort((a, b) => Date.parse(b.startTime) - Date.parse(a.startTime));

  function switchTab(tab) {
    if (tab === activeTab) return;
    setActiveTab(tab);
    setActionError("");
  }

  function isCancellable(booking) {
    return Date.parse(booking.startTime) - Date.now() >= TWO_HOURS_MS;
  }

  async function confirmCancel() {
    const booking = cancelTarget;
    if (!booking) return;

    if (Date.parse(booking.startTime) - Date.now() < TWO_HOURS_MS) {
      setActionError("No es posible cancelar con menos de 2 horas de antelación.");
      setCancelTarget(null);
      return;
    }

    setActionError("");
    setDeletingId(booking.id);

    const { error } = await supabase
      .from("bookings")
      .delete()
      .eq("id", booking.id);

    setDeletingId(null);

    if (error) {
      setActionError("No hemos podido cancelar la reserva. Inténtalo de nuevo.");
      setCancelTarget(null);
      return;
    }

    setItems((previous) => previous.filter((item) => item.id !== booking.id));
    setCancelTarget(null);
  }

  const list = activeTab === "upcoming" ? upcoming : past;

  return (
    <div className="space-y-8">
      <header className="space-y-3">
        <p className="text-xs uppercase tracking-[0.18em] text-stone-400">
          Tus reservas
        </p>
        <h1 className="font-serif text-3xl font-normal tracking-tight text-stone-900">
          Mis reservas
        </h1>
      </header>

      <div className="flex rounded-full bg-stone-50 p-1">
        <button
          type="button"
          onClick={() => switchTab("upcoming")}
          aria-pressed={activeTab === "upcoming"}
          className={cn(
            "flex-1 rounded-full px-4 py-2 text-sm transition-colors",
            activeTab === "upcoming"
              ? "bg-white text-stone-900 shadow-sm"
              : "text-stone-400 hover:text-stone-600"
          )}
        >
          Próximas
        </button>
        <button
          type="button"
          onClick={() => switchTab("past")}
          aria-pressed={activeTab === "past"}
          className={cn(
            "flex-1 rounded-full px-4 py-2 text-sm transition-colors",
            activeTab === "past"
              ? "bg-white text-stone-900 shadow-sm"
              : "text-stone-400 hover:text-stone-600"
          )}
        >
          Pasadas
        </button>
      </div>

      {actionError ? (
        <div className="flex items-start gap-2 rounded-xl border border-red-100 bg-red-50 px-3 py-2.5 text-xs text-red-800">
          <AlertCircle
            className="mt-0.5 h-3.5 w-3.5 shrink-0"
            strokeWidth={1.8}
            aria-hidden="true"
          />
          <span>{actionError}</span>
        </div>
      ) : null}

      {list.length === 0 ? (
        activeTab === "upcoming" ? (
          <EmptyState
            title="Aún no tienes reservas"
            subtitle="Reserva un espacio desde Inicio para verlo aquí."
          />
        ) : (
          <EmptyState
            title="Sin reservas pasadas"
            subtitle="Aquí verás el historial de tus reservas una vez hayan pasado."
          />
        )
      ) : (
        <div className="space-y-3">
          {list.map((booking) => (
            <BookingCard
              key={booking.id}
              booking={booking}
              variant={activeTab}
              cancellable={activeTab === "upcoming" && isCancellable(booking)}
              onCancel={() => {
                setActionError("");
                setCancelTarget(booking);
              }}
            />
          ))}
        </div>
      )}

      <AlertDialog
        open={cancelTarget !== null}
        onOpenChange={(open) => {
          if (!open && deletingId === null) setCancelTarget(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Cancelar esta reserva?</AlertDialogTitle>
            <AlertDialogDescription>
              Liberarás este horario para que otro residente pueda reservarlo.
              Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deletingId !== null}>
              Volver
            </AlertDialogCancel>
            <Button
              type="button"
              onClick={confirmCancel}
              disabled={deletingId !== null}
              className="rounded-full"
            >
              {deletingId !== null ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : null}
              Sí, cancelar
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
