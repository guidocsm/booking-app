"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

export async function updateProfileAction(values) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "No hay sesión activa. Vuelve a iniciar sesión." };
  }

  const phone = (values.phone ?? "").trim();

  const { error } = await supabase
    .from("profiles")
    .update({
      first_name: (values.firstName ?? "").trim(),
      last_name: (values.lastName ?? "").trim(),
      unit_info: (values.unitInfo ?? "").trim(),
      phone: phone === "" ? null : phone,
    })
    .eq("id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/perfil");
  revalidatePath("/inicio");

  return { error: null };
}
