import Link from "next/link";

import { PageHeader } from "@/components/layout/page-header";
import { calculateAge } from "@/lib/utils/dates";
import { getStudents } from "@/server/queries/students";

export default async function StudentsPage() {
  const students = await getStudents();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Alumnas"
        description="Registro, consulta y perfil administrativo de alumnas."
        actions={
          <Link className="btn-primary" href="/alumnas/new">
            Registrar alumna
          </Link>
        }
      />

      <section className="overflow-hidden rounded-lg border border-border bg-background">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border bg-muted/60 text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Matrícula</th>
              <th className="px-4 py-3">Nombre</th>
              <th className="px-4 py-3">Edad</th>
              <th className="px-4 py-3">Ingreso</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3 text-right">Perfil</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {students.map((student) => (
              <tr key={student.id}>
                <td className="px-4 py-3 font-mono text-xs">{student.folio}</td>
                <td className="px-4 py-3 font-medium">{student.full_name}</td>
                <td className="px-4 py-3">{calculateAge(student.birth_date)}</td>
                <td className="px-4 py-3 text-muted-foreground">{student.joined_at}</td>
                <td className="px-4 py-3">
                  <span className="rounded-full bg-muted px-2 py-1 text-xs capitalize">
                    {student.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <Link className="btn-secondary" href={`/alumnas/${student.id}`}>
                    Ver perfil
                  </Link>
                </td>
              </tr>
            ))}
            {students.length === 0 ? (
              <tr>
                <td className="px-4 py-6 text-center text-muted-foreground" colSpan={6}>
                  No hay alumnas registradas.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </section>
    </div>
  );
}
