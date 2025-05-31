export interface ServiceInterval {
  id: string;
  name: string;
  mileageInterval?: number;
  monthInterval?: number;
  notes?: string;
  tags?: string[];
  lastServiced?: {
    id: string;
    title: string;
    odometer: number;
    date: Date;
    jobId: string;
  };
}
