export type PictogramApiKeyword = {
  idKeyword: number;
  keyword: string;
  plural?: string;
  meaning?: string;
};

export type PictogramApiResponse = {
  _id: number;
  keywords: PictogramApiKeyword[];
  desc?: string;
};

export type PictogramResult = {
  id: number;
  imageUrl: string;
  searchText: string;
  keywords: string[];
  description?: string;
};

const API_BASE = "https://api.arasaac.org/api/pictograms";
const STATIC_BASE = "https://static.arasaac.org/pictograms";

import { API_URL } from "../config";

export async function fetchBestPictograms(
  language: string,
  searchText: string,
  signal?: AbortSignal
): Promise<PictogramResult[]> {
  const trimmed = searchText.trim();
  if (!trimmed) return [];

  const res = await fetch(`${API_URL}/api/generate-pictograms`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      text: trimmed,
      language,
    }),
    signal,
  });

  if (!res.ok) {
    throw new Error(`Backend error: ${res.status}`);
  }

  const data = await res.json();

  // El backend devuelve:
  // { ok: true, pictograms: [...] }
  if (!data || !data.ok || !Array.isArray(data.pictograms)) {
    return [];
  }

  return data.pictograms as PictogramResult[];
}


export function buildPictogramImageUrl(
  pictogramId: number,
  resolution: 500 | 300 | 2500 = 500,
  options?: {
    action?: "past" | "future";
    hairHex?: string;
    skinHex?: string;
    plural?: boolean;
    noColor?: boolean;
  },
): string {
  const modifiers: string[] = [];

  if (options?.plural) modifiers.push("plural");
  if (options?.noColor) modifiers.push("nocolor");
  if (options?.action) modifiers.push(`action-${options.action}`);
  if (options?.hairHex) modifiers.push(`hair-${options.hairHex}`);
  if (options?.skinHex) modifiers.push(`skin-${options.skinHex}`);

  const modifierSuffix = modifiers.length ? `_${modifiers.join("_")}` : "";

  return `${STATIC_BASE}/${pictogramId}/${pictogramId}${modifierSuffix}_${resolution}.png`;
}

export function dedupePictograms(results: PictogramResult[], limit = 6): PictogramResult[] {
  const seen = new Set<number>();
  const unique: PictogramResult[] = [];

  for (const pictogram of results) {
    if (seen.has(pictogram.id)) continue;
    seen.add(pictogram.id);
    unique.push(pictogram);

    if (unique.length === limit) break;
  }

  return unique;
}
