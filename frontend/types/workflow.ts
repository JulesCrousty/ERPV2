export interface WorkflowItem {
  id: string;
  title: string;
  requester: string;
  step: string;
  status: "Pending" | "Approved" | "Rejected";
  submittedAt: string;
}
