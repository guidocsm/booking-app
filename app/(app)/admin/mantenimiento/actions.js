"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { getCurrentMembership } from "@/lib/auth/getCurrentMembership";

export async function createBlock(values) {
  const membership = await getCurrentMembership();
  if (!membership || membership.role !== "admin" || !membership.communityId) {
    return { error: "No tienes permisos para esta acción." };
  }

  const supabase = await createClient();

  const { data: space } = await supabase
    .from("spaces")
    .select("id, community_id")
    .eq("id", values.spaceId)
    .maybeSingle();

  if (!space || space.community_id !== membership.communityId) {
    return { error: "Espacio no válido." };
  }

  const { error } = await supabase.from("spaces_blocks").insert({
    space_id: values.spaceId,
    block_date: values.blockDate,
    start_time: values.startTime,
    end_time: values.endTime,
    reason: (values.reason ?? "").trim(),
  });

  if (error) return { error: error.message };

  revalidatePath("/admin/mantenimiento");
  revalidatePath(`/reservar/${values.spaceId}`);
  return { error: null };
}

export async function deleteBlock(blockId, spaceId) {
  const membership = await getCurrentMembership();
  if (!membership || membership.role !== "admin" || !membership.communityId) {
    return { error: "No tienes permisos para esta acción." };
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from("spaces_blocks")
    .delete()
    .eq("id", blockId);

  if (error) return { error: error.message };

  revalidatePath("/admin/mantenimiento");
  if (spaceId) revalidatePath(`/reservar/${spaceId}`);
  return { error: null };
}
