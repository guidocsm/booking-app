import Link from "next/link";
import { Plus } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { getCurrentMembership } from "@/lib/auth/getCurrentMembership";
import { getTypeLabel } from "@/lib/spaceTypes";
import { durationLabel } from "@/lib/spaces";
import { BackLink } from "@/components/back-link";

export default async function AdminSpacesPage() {
  const membership = await getCurrentMembership();
  const supabase = await createClient();

  let communityName = null;
  let spaces = [];

  if (membership?.communityId) {
    const { data: community } = await supabase
      .from("communities")
      .select("name")
      .eq("id", membership.communityId)
      .maybeSingle();
    communityName = community?.name ?? null;

    const { data } = await supabase
      .from("spaces")
      .select("id, name, type, slot_minutes, is_active")
      .eq("community_id", membership.communityId)
      .order("name");
    spaces = data ?? [];
  }

  return (
    <div className="space-y-8">
      <header className="space-y-4">
        <BackLink href="/admin" />
        <p className="text-xs uppercase tracking-[0.18em] text-stone-400">
          Gestión
        </p>
        <h1 className="font-serif text-3xl font-normal tracking-tight text-stone-900">
          Espacios
        </h1>
        {communityName ? (
          <p className="text-sm text-stone-500">{communityName}</p>
        ) : null}
      </header>

      <Link
        href="/admin/espacios/nuevo"
        className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-emerald-900/90"
      >
        <Plus className="h-4 w-4" strokeWidth={1.8} aria-hidden="true" />
        Nuevo espacio
      </Link>

      {spaces.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-3xl border border-dashed border-stone-300 bg-white px-6 py-14 text-center">
          <p className="font-serif text-xl font-normal tracking-tight text-stone-900">
            Aún no hay espacios
          </p>
          <p className="max-w-xs text-sm text-stone-400">
            Crea el primer espacio reservable de tu comunidad.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {spaces.map((space) => (
            <Link
              key={space.id}
              href={`/admin/espacios/${space.id}`}
              className="flex items-center justify-between gap-4 rounded-2xl border border-stone-200 bg-white p-5 transition-colors hover:border-stone-300"
            >
              <div className="min-w-0 space-y-1">
                <p className="truncate font-serif text-xl font-normal tracking-tight text-stone-900">
                  {space.name}
                </p>
                <p className="truncate text-xs text-stone-400">
                  {getTypeLabel(space.type)} · {durationLabel(space.slot_minutes)}{" "}
                  por turno
                </p>
              </div>
              <span
                className={
                  space.is_active
                    ? "shrink-0 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-800"
                    : "shrink-0 rounded-full bg-stone-100 px-3 py-1 text-xs font-medium text-stone-500"
                }
              >
                {space.is_active ? "Activo" : "Inactivo"}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
