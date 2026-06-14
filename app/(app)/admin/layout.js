import { redirect } from "next/navigation";

import { getCurrentMembership } from "@/lib/auth/getCurrentMembership";

export default async function AdminLayout({ children }) {
  const membership = await getCurrentMembership();

  if (!membership) redirect("/login");
  if (membership.role !== "admin") redirect("/inicio");

  return children;
}
