import Card from "@/components/card";
import { PageTitle } from "@/components/page-title";

export default function QMPage() {
  return (
    <div className="space-y-6">
      <PageTitle title="Quality Management" subtitle="Inspections and non-conformities" />
      <div className="grid gap-4 md:grid-cols-3">
        <Card title="Open Inspections" description="Lots awaiting release">
          <p className="text-3xl font-semibold">12</p>
        </Card>
        <Card title="Non-conformities" description="Current month">
          <p className="text-3xl font-semibold">5</p>
        </Card>
        <Card title="Audit score" description="Last assessment" className="bg-green-50">
          <p className="text-3xl font-semibold">92</p>
        </Card>
      </div>
      <Card title="Notes" description="Quality processes and corrective actions">
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Use this workspace to track incoming inspections, supplier quality alerts and CAPA steps.
        </p>
      </Card>
    </div>
  );
}
