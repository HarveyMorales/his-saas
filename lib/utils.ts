import { type ClassValue, clsx } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function getInitials(name: string): string {
  const parts = name.replace("Dr. ", "").replace("Dra. ", "").split(" ");
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

export function formatCurrency(amount: number): string {
  return `$${amount.toLocaleString("es-AR")}`;
}

export function getSpecialtyColor(specialty: string): string {
  const map: Record<string, string> = {
    "Cardiología": "#EF4444",
    "Clínica Médica": "#2563EB",
    "Ginecología": "#8B5CF6",
    "Traumatología": "#F59E0B",
    "Pediatría": "#10B981",
    "Neurología": "#06B6D4",
    "Diabetología": "#F97316",
    "Laboratorio": "#6366F1",
    "Urgencias": "#EF4444",
    "Control": "#10B981",
  };
  return map[specialty] ?? "#94A3B8";
}

export function parseRecordDate(dateStr: string): Date {
  const [day, month, year] = dateStr.split("/").map(Number);
  return new Date(year, month - 1, day);
}
