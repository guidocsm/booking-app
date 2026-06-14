"use client";

import { useRouter } from "next/navigation";
import { ArrowUpRight } from "lucide-react";

import { cn } from "@/lib/utils";

export function SpaceHubGrid({ spaces }) {
  const router = useRouter();

  const count = spaces.length;
  const singleColumn = count === 1;
  const oddBeyondFirst = count > 1 && count % 2 === 1;

  return (
    <div className="overflow-hidden rounded-3xl border border-stone-200 bg-stone-200">
      <div
        className={cn(
          "grid gap-px",
          singleColumn ? "grid-cols-1" : "grid-cols-2"
        )}
      >
        {spaces.map((space, index) => {
          const initial = (space.name || "").charAt(0).toUpperCase();
          const isLast = index === count - 1;
          const fullWidth = singleColumn || (isLast && oddBeyondFirst);

          return (
            <button
              key={space.id}
              type="button"
              onClick={() => router.push(`/reservar/${space.id}`)}
              className={cn(
                "group relative flex flex-col justify-between overflow-hidden bg-white p-5 text-left transition-colors hover:bg-stone-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-emerald-800",
                fullWidth ? "h-44" : "aspect-square",
                isLast && oddBeyondFirst ? "col-span-2" : null
              )}
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
