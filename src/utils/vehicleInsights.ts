export function calculateDiyLaborSavedString(
  diyHours: number,
  includeSuffix: boolean = true
): string {
  if (diyHours === 0) return "No DIY work yet";
  const saved = diyHours * 0.4 * 140;
  return `$${saved.toFixed(2)}${includeSuffix ? " saved in labor" : ""}`;
}

export function formatDiyHours(diyHours: number): string {
  if (diyHours === 0) return "No DIY work yet";
  const days = Math.floor(diyHours / 24);
  const hours = Math.floor(diyHours % 24);
  const minutes = Math.round((diyHours % 1) * 60);

  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);

  return `${parts.join(" ") || "0h"} spent DIYing`;
}

export function calculateMilesPerTank(fuelOdometers: number[]): string {
  if (fuelOdometers.length === 0) return "No fuel entries yet";
  if (fuelOdometers.length < 2)
    return "Not enough data to calculate miles per tank";

  let total = 0;
  fuelOdometers.sort((a, b) => a - b);

  for (let i = 1; i < fuelOdometers.length; i++) {
    total += fuelOdometers[i] - fuelOdometers[i - 1];
  }

  const intervals = fuelOdometers.length - 1;
  const milesPerFillup = total / intervals;

  return `${milesPerFillup.toFixed(1)} miles per fillup`;
}

export function milesDrivenPerDay(
  initialOdometer: number,
  currentOdometer: number,
  purhcaseDate: Date,
  today: Date
): string {
  if (initialOdometer === 0) return "No initial odometer reading yet";
  const daysSincePurchase = Math.ceil(
    (today.getTime() - purhcaseDate.getTime()) / (1000 * 60 * 60 * 24)
  );
  const milesDrivenPerDay =
    (currentOdometer - initialOdometer) / daysSincePurchase;
  return `${milesDrivenPerDay.toFixed(1)} miles per day`;
}
