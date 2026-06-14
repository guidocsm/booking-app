import { cn } from "@/lib/utils";
import { APP_NAME } from "@/lib/constants";

export function BrandMark({ className }) {
  return (
    <span
      className={cn(
        "flex h-14 w-14 items-center justify-center rounded-full bg-emerald-900",
        className
      )}
      aria-label={APP_NAME}
    >
      <span className="font-serif text-2xl font-normal leading-none text-white">
        {APP_NAME.charAt(0)}
      </span>
    </span>
  );
}
