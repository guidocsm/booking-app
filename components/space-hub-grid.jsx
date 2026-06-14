"use client";

import { useRouter } from "next/navigation";
import { ArrowUpRight } from "lucide-react";

export function SpaceHubGrid({ spaces }) {
  const router = useRouter();

  return (
    <div className="overflow-hidden rounded-3xl border border-stone-200 bg-stone-200">
      <div className="grid grid-cols-2 gap-px">
        {spaces.map((space) => {
          const initial = (space.name || "").charAt(0).toUpperCase();

          return (
            <button
              key={space.id}
              type="button"
              onClick={() => router.push(`/reservar/${space.id}`)}
              className="group relative flex aspect-square flex-col justify-between overflow-hidden bg-white p-5 text-left transition-colors hover:bg-stone-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-emerald-800"
            >
              <span
                aria-hidden="true"
                className="pointer-events-none absolute right-1 top-0 select-none font-serif text-8xl leading-none text-stone-100 transition-colors group-hover:text-emerald-50"
              >
                {initial}
              </span>

              <span className="relative z-10 flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-700" />
                <span className="text-xs uppercase tracking-[0.18em] text-stone-400">
                  Disponible
                </span>
              </span>

              <span className="relative z-10 flex items-end justify-between gap-3">
                <span className="font-serif text-xl font-normal tracking-tight text-stone-900">
                  {space.name}
                </span>
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-stone-200 transition-colors group-hover:border-emerald-900 group-hover:bg-emerald-900">
                  <ArrowUpRight
                    className="h-4 w-4 text-stone-400 transition-colors group-hover:text-white"
                    strokeWidth={1.6}
                    aria-hidden="true"
                  />
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
