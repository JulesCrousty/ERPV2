"use client";

import { ColumnDef } from "@tanstack/react-table";
import Card from "@/components/card";
import { DataTable } from "@/components/data-table";
import { PageTitle } from "@/components/page-title";
import { WorkflowItem } from "@/types/workflow";
import { Badge } from "@/ui/badge";

const items: WorkflowItem[] = [
  { id: "WF-01", title: "Purchase Approval", requester: "Marie Curie", step: "Manager", status: "Pending", submittedAt: "2024-07-02" },
  { id: "WF-02", title: "CapEx Request", requester: "Alan Turing", step: "Finance", status: "Approved", submittedAt: "2024-06-28" },
  { id: "WF-03", title: "Access Provisioning", requester: "Ada Lovelace", step: "IT", status: "Pending", submittedAt: "2024-07-01" }
];

const columns: ColumnDef<WorkflowItem>[] = [
  { header: "ID", accessorKey: "id" },
  { header: "Title", accessorKey: "title" },
  { header: "Requester", accessorKey: "requester" },
  { header: "Step", accessorKey: "step" },
  { header: "Status", cell: ({ row }) => <Badge variant="secondary">{row.original.status}</Badge> },
  { header: "Submitted", accessorKey: "submittedAt" }
];

export default function WorkflowPage() {
  return (
    <div className="space-y-6">
      <PageTitle title="Workflow Engine" subtitle="Automated approvals" />
      <div className="grid gap-4 md:grid-cols-2">
        <Card title="Timeline" description="Recent routing steps">
          <ol className="space-y-3 text-sm text-slate-700 dark:text-slate-200">
            <li className="flex items-start gap-3">
              <span className="mt-1 h-2 w-2 rounded-full bg-primary" />
              <div>
                <p className="font-medium">CapEx request approved</p>
                <p className="text-slate-500">Finance • 2h ago</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-1 h-2 w-2 rounded-full bg-primary" />
              <div>
                <p className="font-medium">Purchase order escalated</p>
                <p className="text-slate-500">Manager • 4h ago</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-1 h-2 w-2 rounded-full bg-primary" />
              <div>
                <p className="font-medium">User access provisioning</p>
                <p className="text-slate-500">IT • 8h ago</p>
              </div>
            </li>
          </ol>
        </Card>
        <Card title="Pending Requests" description="Action needed">
          <DataTable columns={columns} data={items} />
        </Card>
      </div>
    </div>
  );
}
