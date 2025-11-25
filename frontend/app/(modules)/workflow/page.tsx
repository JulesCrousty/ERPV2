"use client";

import { ColumnDef } from "@tanstack/react-table";
import Card from "@/components/card";
import { DataTable } from "@/components/data-table";
import { PageTitle } from "@/components/page-title";
import { useApi } from "@/hooks/useApi";
import { useProtectedRoute } from "@/hooks/useAuth";
import { Alert, AlertDescription, AlertTitle } from "@/ui/alert";
import { Button } from "@/ui/button";
import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Loader } from "@/components/loader";

interface WorkflowInstance {
  id: string;
  type: string;
  status: string;
  owner: string;
}

const columns: ColumnDef<WorkflowInstance>[] = [
  { header: "ID", accessorKey: "id" },
  { header: "Type", accessorKey: "type" },
  { header: "Status", accessorKey: "status" },
  { header: "Owner", accessorKey: "owner" }
];

export default function WorkflowPage() {
  useProtectedRoute(["admin", "manager", "employee"]);
  const workflowApi = useApi("/workflow/instances");
  const instances = workflowApi.list({ limit: 30 });

  const actionMutation = useMutation({
    mutationFn: (id: string) => api.post("/workflow/actions", { action: "ADVANCE", reference: id }),
    onSuccess: () => instances.refetch()
  });

  return (
    <div className="space-y-6">
      <PageTitle title="Workflow" subtitle="Process automation" />
      <div className="grid gap-4 md:grid-cols-3">
        <Card title="Instances" description="Active">
          {instances.isLoading ? <Loader /> : <p className="text-2xl font-semibold">{instances.data?.length ?? 0}</p>}
        </Card>
        <Card title="Automation" description="Actions triggered" className="bg-primary/5">
          <p className="text-2xl font-semibold">+Workflow</p>
        </Card>
        <Card title="Ownership" description="Managers">
          <p className="text-2xl font-semibold">Team wide</p>
        </Card>
      </div>
      {instances.error && (
        <Alert variant="destructive">
          <AlertTitle>Workflow offline</AlertTitle>
          <AlertDescription>{(instances.error as Error).message}</AlertDescription>
        </Alert>
      )}
      <Card title="Workflow Instances" description="Runtime processes">
        <DataTable columns={columns} data={instances.data ?? []} loading={instances.isLoading} />
        <div className="mt-4 flex flex-wrap gap-2">
          {(instances.data ?? []).map((instance) => (
            <Button
              key={instance.id}
              size="sm"
              variant="outline"
              onClick={() => actionMutation.mutate(instance.id)}
              disabled={actionMutation.isLoading}
            >
              Advance {instance.id}
            </Button>
          ))}
        </div>
      </Card>
    </div>
  );
}
