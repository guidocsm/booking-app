import { BottomTabBar } from "@/components/bottom-tab-bar";
import { getCurrentMembership } from "@/lib/auth/getCurrentMembership";

export default async function AppLayout({ children }) {
  const membership = await getCurrentMembership();
  const isAdmin = membership?.role === "admin";

  return (
    <div className="min-h-dvh bg-stone-100">
      <main className="mx-auto w-full max-w-md px-6 pb-32 pt-12">
        {children}
      </main>
      <BottomTabBar isAdmin={isAdmin} />
    </div>
  );
}
