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

export async function updateBlock(blockId, values, previousSpaceId = null) {
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

  const { data, error } = await supabase
    .from("spaces_blocks")
    .update({
      space_id: values.spaceId,
      block_date: values.blockDate,
      start_time: values.startTime,
      end_time: values.endTime,
      reason: (values.reason ?? "").trim(),
    })
    .eq("id", blockId)
    .select("id");

  if (error) return { error: error.message };

  if (!data || data.length === 0) {
    return {
      error:
        "No se pudo actualizar el bloqueo. Puede que no tengas permisos para editarlo.",
    };
  }

  revalidatePath("/admin/mantenimiento");
  revalidatePath(`/reservar/${values.spaceId}`);
  if (previousSpaceId && previousSpaceId !== values.spaceId) {
    revalidatePath(`/reservar/${previousSpaceId}`);
  }
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
