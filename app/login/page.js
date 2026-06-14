import { BrandMark } from "@/components/brand-mark";
import { APP_NAME } from "@/lib/constants";

export default function LoginPage() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-stone-100 px-6">
      <div className="flex flex-col items-center gap-4 text-center">
        <BrandMark />
        <p className="text-xs uppercase tracking-[0.18em] text-stone-400">
          {APP_NAME}
        </p>
        <p className="text-sm text-stone-500">
          Autenticación — siguiente paso
        </p>
      </div>
    </main>
  );
}
