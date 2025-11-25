"use client";

import { ColumnDef } from "@tanstack/react-table";
import Card from "@/components/card";
import { DataTable } from "@/components/data-table";
import { PageTitle } from "@/components/page-title";
import { Badge } from "@/ui/badge";
import { useApi } from "@/hooks/useApi";
import { useProtectedRoute } from "@/hooks/useAuth";
import { Alert, AlertDescription, AlertTitle } from "@/ui/alert";
import { Button } from "@/ui/button";
import { Loader } from "@/components/loader";

interface Employee {
  id: string;
  name: string;
  position: string;
  department: string;
  status: string;
}

const columns: ColumnDef<Employee>[] = [
  { header: "ID", accessorKey: "id" },
  { header: "Name", accessorKey: "name" },
  { header: "Position", accessorKey: "position" },
  { header: "Dept", accessorKey: "department" },
  { header: "Status", cell: ({ row }) => <Badge variant="secondary">{row.original.status}</Badge> }
];

export default function HRCorePage() {
  useProtectedRoute(["admin", "manager", "employee"]);
  const employeesApi = useApi("/hr/employees");
  const employees = employeesApi.list({ limit: 50 });
  const updateEmployee = employeesApi.update();

  const handleActivate = (id: string) => updateEmployee.mutate({ id, status: "Active" });

  return (
    <div className="space-y-6">
      <PageTitle title="HR Core" subtitle="People and organization" />
      <div className="grid gap-4 md:grid-cols-3">
        <Card title="Headcount" description="Active employees">
          {employees.isLoading ? <Loader /> : <p className="text-3xl font-semibold">{employees.data?.length ?? 0}</p>}
        </Card>
        <Card title="New hires" description="Last 30 days">
          <p className="text-3xl font-semibold">8</p>
        </Card>
        <Card title="Attrition" description="YTD">
          <p className="text-3xl font-semibold">4.2%</p>
        </Card>
      </div>
      {employees.error && (
        <Alert variant="destructive">
          <AlertTitle>Unable to load directory</AlertTitle>
          <AlertDescription>{(employees.error as Error).message}</AlertDescription>
        </Alert>
      )}
      <Card
        title="Directory"
        description="Employees snapshot"
        actions={<span className="text-sm text-slate-500">Update status via API</span>}
      >
        <DataTable columns={columns} data={employees.data ?? []} loading={employees.isLoading} />
        <div className="mt-4 flex flex-wrap gap-2">
          {(employees.data ?? []).map((employee) => (
            <Button
              key={employee.id}
              size="sm"
              variant="outline"
              onClick={() => handleActivate(employee.id)}
              disabled={updateEmployee.isLoading}
            >
              Activate {employee.name}
            </Button>
          ))}
        </div>
      </Card>
    </div>
  );
}
