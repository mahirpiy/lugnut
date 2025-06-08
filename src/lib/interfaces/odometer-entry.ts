export interface OdometerEntry {
  id: string;
  type: "reading" | "fueling" | "initial" | "job";
  odometer: number;
  notes: string;
  entryDate: string;
}
