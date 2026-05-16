import { PlaceholderPage } from "@/components/layout/placeholder-page";
import { requireRole } from "@/server/queries/auth";

export default async function SettingsPage() {
  await requireRole(["admin"]);

  return (
    <PlaceholderPage
      title="Configuración"
      description="Marca, reglas de cobro y usuarios internos."
    />
  );
}
