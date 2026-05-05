export function normalizeBrand(brand?: string): string {
  if (!brand) return "";
  return brand.toLowerCase().replace(/[-_]/g, " ").replace(/\s+/g, " ").trim();
}
