import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { getCurrentMembership } from "@/lib/auth/getCurrentMembership";
import { SpaceForm } from "@/components/admin/space-form";

export default async function EditSpacePage({ params }) {
  const { spaceId } = params;
  const membership = await getCurrentMembership();
  const supabase = await createClient();

  const { data: space } = await supabase
    .from("spaces")
    .select(
      "id, name, type, slot_minutes, max_advance_days, is_active, weekly_hours"
    )
    .eq("id", spaceId)
    .eq("community_id", membership?.communityId ?? "")
    .maybeSingle();

  if (!space) {
    redirect("/admin/espacios");
  }

  const initialSpace = {
    name: space.name ?? "",
    type: space.type ?? "padel",
    slotMinutes: space.slot_minutes ?? 90,
    maxAdvanceDays: space.max_advance_days ?? 7,
    isActive: space.is_active ?? true,
    weeklyHours: space.weekly_hours ?? {},
  };

  return <SpaceForm spaceId={space.id} initialSpace={initialSpace} />;
}
