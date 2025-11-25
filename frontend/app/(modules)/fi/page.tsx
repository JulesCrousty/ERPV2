"use client";

import { ColumnDef } from "@tanstack/react-table";
import { BanknotesIcon, PlusIcon } from "@heroicons/react/24/outline";
import { useMutation, useQuery } from "@tanstack/react-query";
import { DataTable } from "@/components/data-table";
import Card from "@/components/card";
import { PageTitle } from "@/components/page-title";
import { Badge } from "@/ui/badge";
import { useApi } from "@/hooks/useApi";
import { useProtectedRoute } from "@/hooks/useAuth";
import { api } from "@/lib/api";
import { Alert, AlertDescription, AlertTitle } from "@/ui/alert";
import { Button } from "@/ui/button";
import { Loader } from "@/components/loader";

interface FinancialDocument {
  id: string;
  type: string;
  amount: number;
  currency: string;
  status: string;
  date: string;
}

const columns: ColumnDef<FinancialDocument>[] = [
  { header: "Document", accessorKey: "id" },
  { header: "Type", accessorKey: "type" },
  {
    header: "Amount",
    cell: ({ row }) => (
      <span className="font-semibold text-text dark:text-white">
        {row.original.amount.toLocaleString()} {row.original.currency}
      </span>
    )
  },
  {
    header: "Status",
    cell: ({ row }) => <Badge variant="secondary">{row.original.status}</Badge>
  },
  { header: "Date", accessorKey: "date" }
];

export default function FinancePage() {
  useProtectedRoute(["admin", "manager"]);
  const documentsApi = useApi("/fi/documents");
  const documents = documentsApi.list({ limit: 20 });

  const journalMutation = useMutation({
    mutationFn: () => api.post("/fi/journals", { reference: "WEB-POST", amount: 1000 }),
    onSuccess: () => documents.refetch()
  });

  const metrics = useQuery({
    queryKey: ["fi-kpi"],
    queryFn: () => api.post("/analytics/metrics/run", { metric_code: "FI_BALANCE" }) as Promise<{ value: number }>,
    retry: false
  });

  return (
    <div className="space-y-6">
      <PageTitle title="Finance" subtitle="Balance sheets, journals and compliance" />
      <div className="grid gap-4 md:grid-cols-3">
        <Card
          title="Balance"
          description="Current month"
          className="bg-gradient-to-br from-white to-blue-50 dark:from-slate-900 dark:to-slate-800"
        >
          {metrics.isLoading ? (
            <Loader label="Loading balance" />
          ) : (
            <div className="flex items-center gap-3 text-3xl font-semibold text-text dark:text-white">
              <BanknotesIcon className="h-8 w-8 text-primary" />
              ${metrics.data?.value?.toLocaleString() ?? "--"}
            </div>
          )}
        </Card>
        <Card title="Post Journal" description="Sync with ledger" actions={<span className="text-xs text-slate-500">/fi/journals</span>}>
          <div className="flex items-center gap-3 text-2xl font-semibold">
            <Button onClick={() => journalMutation.mutate()} disabled={journalMutation.isLoading}>
              <PlusIcon className="h-4 w-4 mr-2" /> Create journal
            </Button>
          </div>
        </Card>
        <Card title="Compliance" description="Tax submissions" className="bg-primary/5">
          <p className="text-2xl font-semibold">Automated</p>
        </Card>
      </div>
      {documents.error && (
        <Alert variant="destructive">
          <AlertTitle>Unable to load documents</AlertTitle>
          <AlertDescription>{(documents.error as Error).message}</AlertDescription>
        </Alert>
      )}
      <Card title="Documents" description="Latest financial entries">
        <DataTable
          columns={columns}
          data={documents.data ?? []}
          loading={documents.isLoading}
          emptyMessage="No financial documents found"
        />
      </Card>
    </div>
  );
}
