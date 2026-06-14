import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { getCurrentMembership } from "@/lib/auth/getCurrentMembership";
import { getLookups, getLabelMap, getLabel } from "@/lib/lookups";
import { BackLink } from "@/components/back-link";
import { MaintenanceForm } from "@/components/admin/maintenance-form";

export default async function NewMaintenancePage() {
  const membership = await getCurrentMembership();
  const supabase = await createClient();

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

  if (spaces.length === 0) {
    redirect("/admin/mantenimiento");
  }

  return (
    <div className="space-y-8">
      <header className="space-y-4">
        <BackLink href="/admin/mantenimiento" />
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.18em] text-stone-400">
            Gestión
          </p>
          <h1 className="font-serif text-3xl font-normal tracking-tight text-stone-900">
            Nuevo bloqueo
          </h1>
        </div>
      </header>

      <MaintenanceForm spaces={spaces} reasonOptions={reasonOptions} />
    </div>
  );
}
