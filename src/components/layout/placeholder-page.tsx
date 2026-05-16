import { PageHeader } from "@/components/layout/page-header";

type PlaceholderPageProps = {
  title: string;
  description: string;
};

export function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  return (
    <div className="space-y-6">
      <PageHeader title={title} description={description} />
      <div className="rounded-lg border border-dashed border-border bg-background p-8 text-sm text-muted-foreground">
        Este módulo se implementará en las siguientes fases del MVP.
      </div>
    </div>
  );
}
