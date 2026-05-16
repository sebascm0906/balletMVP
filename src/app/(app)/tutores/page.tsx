import { GuardianForm } from "@/components/forms/guardian-form";
import { PageHeader } from "@/components/layout/page-header";
import { getGuardians } from "@/server/queries/guardians";

export default async function GuardiansPage() {
  const guardians = await getGuardians();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tutores"
        description="Contactos principales, emergencia y relación con alumnas."
      />

      <section className="rounded-lg border border-border bg-background p-5">
        <h2 className="mb-4 text-base font-semibold">Nuevo tutor</h2>
        <GuardianForm />
      </section>

      <section className="overflow-hidden rounded-lg border border-border bg-background">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border bg-muted/60 text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Nombre</th>
              <th className="px-4 py-3">Teléfono</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Dirección</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {guardians.map((guardian) => (
              <tr key={guardian.id}>
                <td className="px-4 py-3 font-medium">{guardian.full_name}</td>
                <td className="px-4 py-3">{guardian.phone}</td>
                <td className="px-4 py-3 text-muted-foreground">{guardian.email ?? "-"}</td>
                <td className="px-4 py-3 text-muted-foreground">{guardian.address ?? "-"}</td>
              </tr>
            ))}
            {guardians.length === 0 ? (
              <tr>
                <td className="px-4 py-6 text-center text-muted-foreground" colSpan={4}>
                  No hay tutores registrados.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </section>
    </div>
  );
}
