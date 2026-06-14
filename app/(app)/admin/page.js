import Link from "next/link";
import { LayoutGrid, Wrench, ChevronRight } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { getCurrentMembership } from "@/lib/auth/getCurrentMembership";

const SECTIONS = [
  {
    href: "/admin/espacios",
    title: "Espacios",
    description: "Gestiona los espacios reservables de tu comunidad.",
    icon: LayoutGrid,
  },
  {
    href: "/admin/mantenimiento",
    title: "Mantenimiento",
    description: "Bloquea franjas horarias por mantenimiento.",
    icon: Wrench,
  },
];

export default async function AdminPage() {
  const membership = await getCurrentMembership();
  const supabase = await createClient();

  let communityName = null;
  if (membership?.communityId) {
    const { data } = await supabase
      .from("communities")
      .select("name")
      .eq("id", membership.communityId)
      .maybeSingle();
    communityName = data?.name ?? null;
  }

  return (
    <div className="space-y-8">
      <header className="space-y-3">
        <p className="text-xs uppercase tracking-[0.18em] text-stone-400">
          Administración
        </p>
        <h1 className="font-serif text-3xl font-normal tracking-tight text-stone-900">
          Panel de administración
        </h1>
        {communityName ? (
          <p className="text-sm text-stone-500">{communityName}</p>
        ) : null}
      </header>

      <div className="space-y-3">
        {SECTIONS.map(({ href, title, description, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="flex items-center justify-between gap-4 rounded-2xl border border-stone-200 bg-white p-5 transition-colors hover:border-stone-300"
          >
            <span className="flex min-w-0 items-center gap-4">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-stone-100">
                <Icon
                  className="h-5 w-5 text-stone-600"
                  strokeWidth={1.6}
                  aria-hidden="true"
                />
              </span>
              <span className="min-w-0 space-y-0.5">
                <span className="block font-serif text-lg font-normal tracking-tight text-stone-900">
                  {title}
                </span>
                <span className="block text-xs text-stone-400">
                  {description}
                </span>
              </span>
            </span>
            <ChevronRight
              className="h-5 w-5 shrink-0 text-stone-400"
              strokeWidth={1.6}
              aria-hidden="true"
            />
          </Link>
        ))}
      </div>
    </div>
  );
}
