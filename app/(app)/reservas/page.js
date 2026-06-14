import { createClient } from "@/lib/supabase/server";
import { BookingsList } from "@/components/bookings-list";

export default async function BookingsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let bookings = [];

  if (user) {
    const { data } = await supabase
      .from("bookings")
      .select("id, space_id, start_time, end_time, status, spaces(name)")
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
    }));
  }

  return <BookingsList bookings={bookings} />;
}
