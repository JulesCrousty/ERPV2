export interface ProductionOrder {
  id: string;
  material: string;
  quantity: number;
  status: "Released" | "Scheduled" | "Delayed";
  startDate: string;
  endDate: string;
}
