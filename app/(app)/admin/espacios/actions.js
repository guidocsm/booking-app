"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { getCurrentMembership } from "@/lib/auth/getCurrentMembership";

function buildPayload(values) {
  return {
    name: (values.name ?? "").trim(),
    type: values.type,
    capacity: Math.max(1, Math.trunc(Number(values.capacity) || 1)),
    slot_minutes: Number(values.slotMinutes) || 90,
    max_advance_days: Math.max(1, Math.trunc(Number(values.maxAdvanceDays) || 7)),
    is_active: Boolean(values.isActive),
    weekly_hours: values.weeklyHours ?? {},
  };
}

function revalidateSpace(spaceId) {
  revalidatePath("/admin/espacios");
  revalidatePath("/inicio");
  if (spaceId) revalidatePath(`/reservar/${spaceId}`);
}

export async function createSpace(values) {
  const membership = await getCurrentMembership();
  if (!membership || membership.role !== "admin" || !membership.communityId) {
    return { error: "No tienes permisos para esta acción." };
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("spaces")
    .insert({ community_id: membership.communityId, ...buildPayload(values) })
    .select("id")
    .maybeSingle();

  if (error) return { error: error.message };

  revalidateSpace(data?.id);
  return { error: null, id: data?.id ?? null };
}

export async function updateSpace(spaceId, values) {
  const membership = await getCurrentMembership();
  if (!membership || membership.role !== "admin" || !membership.communityId) {
    return { error: "No tienes permisos para esta acción." };
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from("spaces")
    .update(buildPayload(values))
    .eq("id", spaceId)
    .eq("community_id", membership.communityId);

  if (error) return { error: error.message };

  revalidateSpace(spaceId);
  return { error: null, id: spaceId };
}
