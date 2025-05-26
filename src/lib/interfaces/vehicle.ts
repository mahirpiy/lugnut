export interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  nickname?: string;
  initialOdometer: number;
  currentOdometer: number;
  createdAt: Date;
  licensePlate?: string;
  purchaseDate?: Date;
}
