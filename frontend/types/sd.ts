export interface SalesOrder {
  id: string;
  customer: string;
  amount: number;
  status: "In Process" | "Completed" | "Pending";
  expectedDelivery: string;
}
