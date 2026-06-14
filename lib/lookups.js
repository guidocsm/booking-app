import { cache } from "react";

import { createClient } from "@/lib/supabase/server";

export const getLookups = cache(async (category, communityId = null) => {
  const supabase = await createClient();

  let query = supabase
    .from("lookups")
    .select("key, label, sort_order, community_id")
    .eq("category", category)
    .eq("is_active", true);

  if (communityId) {
    query = query.or(`community_id.is.null,community_id.eq.${communityId}`);
  } else {
    query = query.is("community_id", null);
  }

  const { data } = await query.order("sort_order", { ascending: true });

  return (data ?? []).map((row) => ({ key: row.key, label: row.label }));
});

export async function getLabelMap(category, communityId = null) {
  const rows = await getLookups(category, communityId);
  const map = {};
  rows.forEach((row) => {
    map[row.key] = row.label;
  });
  return map;
}

export function getLabel(map, key) {
  return map?.[key] ?? key;
}
