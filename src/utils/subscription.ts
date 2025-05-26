export function canAddJob(isPaid: boolean, jobsCount: number): boolean {
  return isPaid || jobsCount < 2;
}

export function canAddVehicle(isPaid: boolean): boolean {
  return isPaid;
}

export function canAddFuelEntry(isPaid: boolean): boolean {
  return isPaid;
}

export function canAddOdometerEntry(isPaid: boolean): boolean {
  return isPaid;
}
