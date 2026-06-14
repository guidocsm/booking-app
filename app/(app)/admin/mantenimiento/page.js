import { PageHeader } from "@/components/page-header";
import { BackLink } from "@/components/back-link";

export default function AdminMaintenancePage() {
  return (
    <div className="space-y-4">
      <BackLink href="/admin" />
      <PageHeader eyebrow="Administración" title="Mantenimiento" />
    </div>
  );
}
