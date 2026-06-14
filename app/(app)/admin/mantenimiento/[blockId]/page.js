import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { getCurrentMembership } from "@/lib/auth/getCurrentMembership";
import { getLookups, getLabelMap, getLabel } from "@/lib/lookups";
import { BackLink } from "@/components/back-link";
import { MaintenanceForm } from "@/components/admin/maintenance-form";

export default async function EditMaintenancePage({ params }) {
  const { blockId } = params;
  const membership = await getCurrentMembership();
  const supabase = await createClient();

  const { data: block } = await supabase
    .from("spaces_blocks")
    .select(
      "id, space_id, block_date, start_time, end_time, reason, spaces!inner(community_id)"
    )
    .eq("id", blockId)
    .eq("spaces.community_id", membership?.communityId ?? "")
    .maybeSingle();

  if (!block) {
    redirect("/admin/mantenimiento");
  }

  const [{ data }, typeMap, reasonOptions] = await Promise.all([
    supabase
      .from("spaces")
      .select("id, name, type")
      .eq("community_id", membership?.communityId ?? "")
      .order("name"),
    getLabelMap("space_type", membership?.communityId),
    getLookups("maintenance_reason", membership?.communityId),
  ]);

  const spaces = (data ?? []).map((space) => ({
    id: space.id,
    name: space.name,
    typeLabel: getLabel(typeMap, space.type),
  }));

  const initialBlock = {
    spaceId: block.space_id,
    blockDate: block.block_date,
    startTime: block.start_time,
    endTime: block.end_time,
    reason: block.reason,
  };

  return (
    <div className="space-y-8">
      <header className="space-y-4">
        <BackLink href="/admin/mantenimiento" />
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.18em] text-stone-400">
            Gestión
          </p>
          <h1 className="font-serif text-3xl font-normal tracking-tight text-stone-900">
            Editar bloqueo
          </h1>
        </div>
      </header>

      <MaintenanceForm
        spaces={spaces}
        reasonOptions={reasonOptions}
        blockId={block.id}
        initialBlock={initialBlock}
      />
    </div>
  );
}
