export interface Job {
  uuid: string;
  title: string;
  date: string;
  odometer: number;
  laborCost: string;
  isDiy: boolean;
  shopName?: string;
  notes?: string;
  totalPartsCount: number;
  totalPartsCost: string;
  hours?: number;
  difficulty?: number;
}
