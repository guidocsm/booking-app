import { PageHeader } from "@/components/page-header";
import { APP_NAME } from "@/lib/constants";

export default function HomePage() {
  return <PageHeader eyebrow={APP_NAME} title="Inicio" />;
}
