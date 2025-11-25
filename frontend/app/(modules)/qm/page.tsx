"use client";

import { ColumnDef } from "@tanstack/react-table";
import Card from "@/components/card";
import { DataTable } from "@/components/data-table";
import { PageTitle } from "@/components/page-title";
import { useApi } from "@/hooks/useApi";
import { useProtectedRoute } from "@/hooks/useAuth";
import { Alert, AlertDescription, AlertTitle } from "@/ui/alert";
import { Badge } from "@/ui/badge";
import { Loader } from "@/components/loader";

interface InspectionLot {
  id: string;
  material: string;
  status: string;
  result: string;
  date: string;
}

const columns: ColumnDef<InspectionLot>[] = [
  { header: "Inspection", accessorKey: "id" },
  { header: "Material", accessorKey: "material" },
  { header: "Status", cell: ({ row }) => <Badge variant="secondary">{row.original.status}</Badge> },
  { header: "Result", accessorKey: "result" },
  { header: "Date", accessorKey: "date" }
];

export default function QMPage() {
  useProtectedRoute(["admin", "manager", "employee"]);
  const inspectionApi = useApi("/qm/inspections");
  const inspections = inspectionApi.list({ limit: 20 });

  return (
    <div className="space-y-6">
      <PageTitle title="Quality Management" subtitle="Inspections and quality reporting" />
      <div className="grid gap-4 md:grid-cols-3">
        <Card title="Open inspections" description="Pending quality checks">
          {inspections.isLoading ? <Loader /> : <p className="text-2xl font-semibold">{inspections.data?.length ?? 0}</p>}
        </Card>
        <Card title="Pass rate" description="Last 30 days" className="bg-primary/5">
          <p className="text-2xl font-semibold">97%</p>
        </Card>
        <Card title="Rejections" description="Current month">
          <p className="text-2xl font-semibold">2</p>
        </Card>
      </div>
      {inspections.error && (
        <Alert variant="destructive">
          <AlertTitle>Unable to load inspections</AlertTitle>
          <AlertDescription>{(inspections.error as Error).message}</AlertDescription>
        </Alert>
      )}
      <Card title="Inspection Lots" description="Latest inspection results">
        <DataTable columns={columns} data={inspections.data ?? []} loading={inspections.isLoading} />
      </Card>
    </div>
  );
}
