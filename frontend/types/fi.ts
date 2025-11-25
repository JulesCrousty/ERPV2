export interface FinancialDocument {
  id: string;
  type: string;
  amount: number;
  currency: string;
  status: "Open" | "Posted" | "Draft";
  date: string;
}
