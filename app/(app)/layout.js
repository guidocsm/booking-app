import { BottomTabBar } from "@/components/bottom-tab-bar";

export default function AppLayout({ children }) {
  return (
    <div className="min-h-dvh bg-stone-100">
      <main className="mx-auto w-full max-w-md px-6 pb-32 pt-12">
        {children}
      </main>
      <BottomTabBar />
    </div>
  );
}
