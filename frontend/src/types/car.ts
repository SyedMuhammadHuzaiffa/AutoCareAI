/**
 * Canonical car shape aligned with backend (brand, model, year required).
 * Legacy API payloads may omit fields — use normalizeCar / parseCarsResponse.
 */
export type Car = {
  _id: string;
  brand: string;
  model: string;
  year: number;
};

function numYear(y: unknown): number | null {
  if (typeof y === "number" && Number.isFinite(y)) return y;
  if (typeof y === "string" && y.trim()) {
    const n = Number(y);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

/** Strict normalization — returns null if unusable. */
export function normalizeCar(raw: unknown): Car | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const id = o._id != null ? String(o._id) : "";
  const brand = String(o.brand ?? "").trim();
  const model = String(o.model ?? "").trim();
  const year = numYear(o.year);
  if (!id || !brand || !model || year === null) return null;
  return { _id: id, brand, model, year };
}

/** Lenient normalization for list/detail when backend sends partial legacy docs. */
export function normalizeCarLenient(raw: unknown): Car | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const id = o._id != null ? String(o._id) : "";
  if (!id) return null;
  const brand =
    String(o.brand ?? "").trim() || "Unknown brand";
  const model =
    String(o.model ?? "").trim() || "Unknown model";
  const year = numYear(o.year) ?? new Date().getFullYear();
  return { _id: id, brand, model, year };
}

export function parseCarsResponse(payload: unknown): Car[] {
  if (!Array.isArray(payload)) return [];
  const out: Car[] = [];
  for (const item of payload) {
    const c = normalizeCarLenient(item);
    if (c) out.push(c);
  }
  return out;
}

export function carDisplayTitle(c: Pick<Car, "brand" | "model">): string {
  return `${c.brand} ${c.model}`.trim();
}

export function carDisplaySubtitle(c: Pick<Car, "year" | "model">): string {
  return `${c.year} · ${c.model}`;
}
