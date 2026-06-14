import Link from "next/link";
import { Plus } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { getCurrentMembership } from "@/lib/auth/getCurrentMembership";
import { madridDateParts } from "@/lib/time";
import { BackLink } from "@/components/back-link";
import { MaintenanceList } from "@/components/admin/maintenance-list";

export default async function AdminMaintenancePage() {
  const membership = await getCurrentMembership();
  const supabase = await createClient();
  const todayISO = madridDateParts(new Date()).dateISO;

  let blocks = [];

  if (membership?.communityId) {
    const { data } = await supabase
      .from("spaces_blocks")
      .select(
        "id, space_id, block_date, start_time, end_time, reason, spaces!inner(name, type, community_id)"
      )
      .eq("spaces.community_id", membership.communityId)
      .gte("block_date", todayISO)
      .order("block_date", { ascending: true })
      .order("start_time", { ascending: true });

    blocks = (data ?? []).map((block) => ({
      id: block.id,
      spaceId: block.space_id,
      blockDate: block.block_date,
      startTime: block.start_time,
      endTime: block.end_time,
      reason: block.reason,
      spaceName: block.spaces?.name ?? "Espacio",
      spaceType: block.spaces?.type ?? null,
    }));
  }

  return (
    <div className="space-y-8">
      <header className="space-y-4">
        <BackLink href="/admin" />
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.18em] text-stone-400">
            Gestión
          </p>
          <h1 className="font-serif text-3xl font-normal tracking-tight text-stone-900">
            Mantenimiento
          </h1>
          <p className="text-sm text-stone-500">
            Bloquea franjas para que no se puedan reservar.
          </p>
        </div>
      </header>

      <Link
        href="/admin/mantenimiento/nuevo"
        className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-emerald-900/90"
      >
        <Plus className="h-4 w-4" strokeWidth={1.8} aria-hidden="true" />
        Nuevo bloqueo
      </Link>

      <MaintenanceList blocks={blocks} />
    </div>
  );
}
