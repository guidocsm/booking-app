import { createClient } from "@/lib/supabase/server";
import { ProfileView } from "@/components/profile-view";

export default async function ProfilePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("first_name, last_name, unit_info, phone")
    .eq("id", user.id)
    .maybeSingle();

  const { data: membership } = await supabase
    .from("memberships")
    .select("communities(access_code)")
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle();

  const mappedProfile = {
    firstName: profile?.first_name ?? "",
    lastName: profile?.last_name ?? "",
    unitInfo: profile?.unit_info ?? "",
    phone: profile?.phone ?? "",
  };

  return (
    <ProfileView
      userId={user.id}
      email={user.email ?? ""}
      accessCode={membership?.communities?.access_code ?? ""}
      profile={mappedProfile}
    />
  );
}
