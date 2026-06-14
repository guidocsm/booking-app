"use client";

import { useState } from "react";
import { Wrench, AlertCircle, Loader2 } from "lucide-react";

import { getTypeLabel } from "@/lib/spaceTypes";
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
import { deleteBlock } from "@/app/(app)/admin/mantenimiento/actions";

function formatDate(dateISO) {
  const date = new Date(`${dateISO}T12:00:00Z`);
  const day = Number(dateISO.split("-")[2]);
  const month = new Intl.DateTimeFormat("es-ES", {
    month: "short",
    timeZone: "UTC",
  })
    .format(date)
    .replace(/\.$/, "");
  return `${day} ${month}`;
}

function MaintenanceCard({ block, onDelete }) {
  const range = `${block.startTime.slice(0, 5)} – ${block.endTime.slice(0, 5)}`;

  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-stone-200 bg-white p-5">
      <div className="min-w-0 space-y-1.5">
        <p className="truncate text-xs uppercase tracking-[0.18em] text-stone-900">
          {getTypeLabel(block.spaceType)} · {block.spaceName}
        </p>
        <p className="font-serif text-xl font-normal tracking-tight text-stone-900">
          {formatDate(block.blockDate)} · {range}
        </p>
        <p className="truncate text-xs text-stone-400">{block.reason}</p>
      </div>
      <button
        type="button"
        onClick={onDelete}
        className="shrink-0 rounded-full border border-stone-200 px-4 py-2 text-xs text-stone-500 transition-colors hover:border-red-200 hover:text-red-800"
      >
        Eliminar
      </button>
    </div>
  );
}

export function MaintenanceList({ blocks }) {
  const [items, setItems] = useState(blocks);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [actionError, setActionError] = useState("");

  async function confirmDelete() {
    const block = deleteTarget;
    if (!block) return;

    setActionError("");
    setDeletingId(block.id);

    const { error } = await deleteBlock(block.id, block.spaceId);

    setDeletingId(null);

    if (error) {
      setActionError("No hemos podido eliminar el bloqueo. Inténtalo de nuevo.");
      setDeleteTarget(null);
      return;
    }

    setItems((previous) => previous.filter((item) => item.id !== block.id));
    setDeleteTarget(null);
  }

  return (
    <div className="space-y-5">
      {actionError ? (
        <div className="flex items-start gap-2 rounded-xl border border-red-100 bg-red-50 px-3 py-2.5 text-xs text-red-800">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" strokeWidth={1.8} aria-hidden="true" />
          <span>{actionError}</span>
        </div>
      ) : null}

      {items.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-3xl border border-dashed border-stone-300 bg-white px-6 py-14 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-stone-100">
            <Wrench className="h-5 w-5 text-stone-400" strokeWidth={1.6} aria-hidden="true" />
          </span>
          <p className="font-serif text-xl font-normal tracking-tight text-stone-900">
            No hay bloqueos activos
          </p>
          <p className="max-w-xs text-sm text-stone-400">
            Crea uno para reservar una franja por mantenimiento.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((block) => (
            <MaintenanceCard
              key={block.id}
              block={block}
              onDelete={() => {
                setActionError("");
                setDeleteTarget(block);
              }}
            />
          ))}
        </div>
      )}

      <AlertDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open && deletingId === null) setDeleteTarget(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar este bloqueo?</AlertDialogTitle>
            <AlertDialogDescription>
              La franja volverá a estar disponible para reservar.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deletingId !== null}>
              Volver
            </AlertDialogCancel>
            <Button
              type="button"
              onClick={confirmDelete}
              disabled={deletingId !== null}
              className="rounded-full"
            >
              {deletingId !== null ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : null}
              Sí, eliminar
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
