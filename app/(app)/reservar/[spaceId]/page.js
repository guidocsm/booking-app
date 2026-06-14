import Link from "next/link";
import { ChevronLeft } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { SpaceBooking } from "@/components/space-booking";

function UnavailableState() {
  return (
    <div className="space-y-8">
      <Link
        href="/inicio"
        className="inline-flex items-center gap-1 text-sm text-stone-400 transition-colors hover:text-stone-600"
      >
        <ChevronLeft className="h-4 w-4" strokeWidth={1.6} aria-hidden="true" />
        Volver
      </Link>
      <div className="flex flex-col items-center gap-3 rounded-3xl border border-dashed border-stone-300 bg-white px-6 py-14 text-center">
        <p className="font-serif text-xl font-normal tracking-tight text-stone-900">
          Espacio no disponible
        </p>
        <p className="max-w-xs text-sm text-stone-400">
          Este espacio no existe o ya no admite reservas.
        </p>
      </div>
    </div>
  );
}

export default async function BookingSpacePage({ params }) {
  const { spaceId } = params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: space } = await supabase
    .from("spaces")
    .select(
      "id, name, type, community_id, max_advance_days, is_active, weekly_hours, slot_minutes"
    )
    .eq("id", spaceId)
    .maybeSingle();

  if (!space || space.is_active === false || !user) {
    return <UnavailableState />;
  }

  const mappedSpace = {
    id: space.id,
    name: space.name,
    type: space.type,
    communityId: space.community_id,
    maxAdvanceDays: space.max_advance_days ?? 7,
    weeklyHours: space.weekly_hours ?? {},
    slotMinutes: space.slot_minutes ?? 90,
  };

  return <SpaceBooking space={mappedSpace} userId={user.id} />;
}
