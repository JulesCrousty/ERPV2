export interface MaterialStock {
  material: string;
  plant: string;
  storageLocation: string;
  quantity: number;
  unit: string;
  status: "Available" | "Reserved" | "Blocked";
}
