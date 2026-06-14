import { cache } from "react";

import { createClient } from "@/lib/supabase/server";

export const getCurrentMembership = cache(async () => {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: membership } = await supabase
    .from("memberships")
    .select("community_id, role")
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle();

  return {
    userId: user.id,
    communityId: membership?.community_id ?? null,
    role: membership?.role ?? null,
  };
});
