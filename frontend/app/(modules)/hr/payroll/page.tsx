"use client";

import Card from "@/components/card";
import { DataTable } from "@/components/data-table";
import { PageTitle } from "@/components/page-title";
import { useProtectedRoute } from "@/hooks/useAuth";
import { Alert, AlertDescription, AlertTitle } from "@/ui/alert";
import { Button } from "@/ui/button";
import { useApi } from "@/hooks/useApi";
import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Loader } from "@/components/loader";
import { ColumnDef } from "@tanstack/react-table";

interface PayrollResult {
  id: string;
  period: string;
  status: string;
  total: number;
}

const columns: ColumnDef<PayrollResult>[] = [
  { header: "Run", accessorKey: "id" },
  { header: "Period", accessorKey: "period" },
  { header: "Status", accessorKey: "status" },
  {
    header: "Total",
    cell: ({ row }) => <span className="font-semibold">${row.original.total?.toLocaleString()}</span>
  }
];

export default function HRPayrollPage() {
  useProtectedRoute(["admin", "manager"]);

  const resultsApi = useApi("/hr/payroll/results");
  const results = resultsApi.list({ limit: 20 });
  const generatePayroll = useMutation({
    mutationFn: () => api.post("/hr/payroll/generate", { period: "2024-07" }),
    onSuccess: () => results.refetch()
  });

  return (
    <div className="space-y-6">
      <PageTitle title="HR Payroll" subtitle="Payroll run and compensation" />
      <div className="grid gap-4 md:grid-cols-3">
        <Card title="Latest run" description="Status">
          {results.isLoading ? <Loader /> : <p className="text-3xl font-semibold">{results.data?.[0]?.status ?? "-"}</p>}
        </Card>
        <Card title="Period" description="Current">
          <p className="text-3xl font-semibold">Jul 2024</p>
        </Card>
        <Card title="Generate" description="Trigger backend" className="bg-primary/5">
          <Button onClick={() => generatePayroll.mutate()} disabled={generatePayroll.isLoading}>
            {generatePayroll.isLoading ? "Generating..." : "Generate payroll"}
          </Button>
        </Card>
      </div>
      {results.error && (
        <Alert variant="destructive">
          <AlertTitle>Unable to load payroll</AlertTitle>
          <AlertDescription>{(results.error as Error).message}</AlertDescription>
        </Alert>
      )}
      <Card title="Payroll Results" description="Latest payroll runs">
        <DataTable columns={columns} data={results.data ?? []} loading={results.isLoading} />
      </Card>
    </div>
  );
}
