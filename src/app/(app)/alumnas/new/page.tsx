import { StudentForm } from "@/components/forms/student-form";
import { PageHeader } from "@/components/layout/page-header";

export default function NewStudentPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Registrar alumna"
        description="Alta inicial de datos generales de la alumna."
      />
      <section className="rounded-lg border border-border bg-background p-5">
        <StudentForm />
      </section>
    </div>
  );
}
