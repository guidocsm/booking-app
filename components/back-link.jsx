import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export function BackLink({ href, label = "Volver" }) {
  return (
    <Link
      href={href}
      aria-label={label}
      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-stone-200 bg-white text-stone-500 transition-colors hover:bg-stone-50 hover:text-stone-800"
    >
      <ChevronLeft className="h-4 w-4" strokeWidth={1.6} aria-hidden="true" />
    </Link>
  );
}
