import { createClient } from "@/lib/supabase/server";
import { getCurrentMembership } from "@/lib/auth/getCurrentMembership";
import { getLabelMap, getLabel } from "@/lib/lookups";
import { BookingsList } from "@/components/bookings-list";

export default async function BookingsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const membership = await getCurrentMembership();
  const typeMap = await getLabelMap("space_type", membership?.communityId);

  let bookings = [];

  if (user) {
    const { data } = await supabase
      .from("bookings")
      .select("id, space_id, start_time, end_time, status, spaces(name, type)")
      .eq("user_id", user.id)
      .eq("status", "active")
      .order("start_time", { ascending: true });

    bookings = (data ?? []).map((booking) => ({
      id: booking.id,
      spaceId: booking.space_id,
      startTime: booking.start_time,
      endTime: booking.end_time,
      status: booking.status,
      spaceName: booking.spaces?.name ?? "Espacio",
      spaceTypeLabel: booking.spaces?.type
        ? getLabel(typeMap, booking.spaces.type)
        : null,
    }));
  }

  return <BookingsList bookings={bookings} />;
}
