import { PageHeader } from "@/components/page-header";
import { createClient } from "@/lib/supabase/server";

export default async function BookingSpacePage({ params }) {
  const { spaceId } = params;
  const supabase = await createClient();

  const { data: space } = await supabase
    .from("spaces")
    .select("name")
    .eq("id", spaceId)
    .maybeSingle();

  return <PageHeader eyebrow="Reservar" title={space?.name ?? "Espacio"} />;
}
