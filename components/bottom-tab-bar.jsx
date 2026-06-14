"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { House, CalendarCheck, UserRound } from "lucide-react";

import { cn } from "@/lib/utils";

const TABS = [
  { href: "/inicio", label: "Inicio", icon: House },
  { href: "/reservas", label: "Mis reservas", icon: CalendarCheck },
  { href: "/perfil", label: "Mi perfil", icon: UserRound },
];

export function BottomTabBar() {
  const pathname = usePathname();

  return (
    <nav className="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex justify-center px-6">
      <div className="pointer-events-auto flex w-full max-w-md items-stretch justify-between gap-1 rounded-full border border-stone-200 bg-white p-2 shadow-lg">
        {TABS.map(({ href, label, icon: Icon }) => {
          const isActive =
            pathname === href || pathname.startsWith(`${href}/`);

          return (
            <Link
              key={href}
              href={href}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "flex flex-1 flex-col items-center justify-center gap-1 rounded-full py-2 transition-colors",
                isActive
                  ? "text-emerald-900"
                  : "text-stone-400 hover:text-stone-600"
              )}
            >
              <Icon
                className="h-5 w-5"
                strokeWidth={isActive ? 1.9 : 1.6}
                aria-hidden="true"
              />
              <span
                className={cn(
                  "text-[11px] leading-none",
                  isActive ? "font-medium" : "font-normal"
                )}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
