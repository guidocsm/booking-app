import { getCurrentMembership } from "@/lib/auth/getCurrentMembership";
import { getLookups } from "@/lib/lookups";
import { SpaceForm } from "@/components/admin/space-form";

export default async function NewSpacePage() {
  const membership = await getCurrentMembership();
  const typeOptions = await getLookups("space_type", membership?.communityId);

  return <SpaceForm typeOptions={typeOptions} />;
}
