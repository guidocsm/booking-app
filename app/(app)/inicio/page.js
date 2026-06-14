import { LayoutGrid } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { SpaceHubGrid } from "@/components/space-hub-grid";

function HubEmptyState() {
  return (
    <div className="flex flex-col items-center gap-4 rounded-3xl border border-dashed border-stone-300 bg-white px-6 py-14 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-stone-100">
        <LayoutGrid
          className="h-5 w-5 text-stone-400"
          strokeWidth={1.6}
          aria-hidden="true"
        />
      </span>
      <p className="font-serif text-xl font-normal tracking-tight text-stone-900">
        Aún no hay espacios disponibles
      </p>
      <p className="max-w-xs text-sm text-stone-400">
        Cuando tu comunidad publique espacios reservables, aparecerán aquí.
      </p>
    </div>
  );
}

export default async function HomePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let communityName = null;
  let firstName = null;
  let spaces = [];

  if (user) {
    const { data: membership } = await supabase
      .from("memberships")
      .select("community_id")
      .eq("user_id", user.id)
      .limit(1)
      .maybeSingle();

    const { data: profile } = await supabase
      .from("profiles")
      .select("first_name")
      .eq("id", user.id)
      .maybeSingle();

    firstName = profile?.first_name ?? null;

    if (membership?.community_id) {
      const { data: community } = await supabase
        .from("communities")
        .select("name")
        .eq("id", membership.community_id)
        .maybeSingle();

      communityName = community?.name ?? null;

      const { data: communitySpaces } = await supabase
        .from("spaces")
        .select("id, name")
        .eq("community_id", membership.community_id)
        .eq("is_active", true)
        .order("name");

      spaces = communitySpaces ?? [];
    }
  }

  return (
    <div className="space-y-8">
      <header className="space-y-3">
        {communityName ? (
          <p className="text-xs uppercase tracking-[0.18em] text-stone-400">
            {communityName}
          </p>
        ) : null}
        <h1 className="font-serif text-3xl font-normal leading-tight tracking-tight text-stone-900">
          <span className="block">
            {firstName ? `Hola, ${firstName}` : "Hola"}
          </span>
          <span className="block">¿Qué te apetece reservar?</span>
        </h1>
      </header>

      {spaces.length > 0 ? (
        <SpaceHubGrid spaces={spaces} />
      ) : (
        <HubEmptyState />
      )}
    </div>
  );
}
