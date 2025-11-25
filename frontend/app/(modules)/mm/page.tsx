"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ExclamationTriangleIcon, ArrowPathIcon } from "@heroicons/react/24/outline";
import Card from "@/components/card";
import { DataTable } from "@/components/data-table";
import { PageTitle } from "@/components/page-title";
import { Badge } from "@/ui/badge";
import { useApi } from "@/hooks/useApi";
import { useProtectedRoute } from "@/hooks/useAuth";
import { Alert, AlertDescription, AlertTitle } from "@/ui/alert";
import { Loader } from "@/components/loader";
import { Button } from "@/ui/button";

interface MaterialStock {
  material: string;
  plant: string;
  storageLocation: string;
  quantity: number;
  unit: string;
  status: "Available" | "Reserved" | "Blocked";
}

const columns: ColumnDef<MaterialStock>[] = [
  { header: "Material", accessorKey: "material" },
  { header: "Plant", accessorKey: "plant" },
  { header: "Storage", accessorKey: "storageLocation" },
  { header: "Qty", accessorKey: "quantity" },
  { header: "Unit", accessorKey: "unit" },
  {
    header: "Status",
    cell: ({ row }) => <Badge variant="secondary">{row.original.status}</Badge>
  }
];

export default function MMPage() {
  useProtectedRoute(["admin", "manager", "employee"]);
  const stockApi = useApi("/mm/stocks");
  const stock = stockApi.list({ limit: 50 });
  const poApi = useApi("/mm/purchase-orders");
  const purchaseOrders = poApi.list({ limit: 5 });

  return (
    <div className="space-y-6">
      <PageTitle title="Materials Management" subtitle="Procurement and inventory" />
      <div className="grid gap-4 md:grid-cols-3">
        <Card title="Low stock alerts" description="Critical materials to replenish">
          {stock.isLoading ? (
            <Loader />
          ) : (
            <div className="flex items-center gap-3 text-2xl font-semibold">
              <ExclamationTriangleIcon className="h-7 w-7 text-amber-500" /> {stock.data?.filter((s: MaterialStock) => s.quantity < 10).length ?? 0}
            </div>
          )}
        </Card>
        <Card title="Open POs" description="Awaiting confirmation">
          {purchaseOrders.isLoading ? <Loader /> : <p className="text-2xl font-semibold">{purchaseOrders.data?.length ?? 0}</p>}
        </Card>
        <Card title="Vendors" description="Active" className="bg-primary/5">
          <p className="text-2xl font-semibold">58</p>
        </Card>
      </div>
      {stock.error && (
        <Alert variant="destructive">
          <AlertTitle>Stock unavailable</AlertTitle>
          <AlertDescription>{(stock.error as Error).message}</AlertDescription>
        </Alert>
      )}
      <Card
        title="Stock Overview"
        description="Latest storage snapshots"
        actions={
          <Button variant="ghost" size="sm" onClick={() => stock.refetch()} disabled={stock.isLoading}>
            <ArrowPathIcon className="h-4 w-4 mr-2" /> Refresh
          </Button>
        }
      >
        <DataTable columns={columns} data={stock.data ?? []} loading={stock.isLoading} />
      </Card>
    </div>
  );
}
