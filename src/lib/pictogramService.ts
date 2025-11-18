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

export async function fetchBestPictograms(
  language: string,
  searchText: string,
  signal?: AbortSignal,
): Promise<PictogramResult[]> {
  const trimmed = searchText.trim();
  if (!trimmed) return [];

  const encodedQuery = encodeURIComponent(trimmed);
  const response = await fetch(`${API_BASE}/${language}/bestsearch/${encodedQuery}`, {
    signal,
  });

  if (response.status === 404) {
    return [];
  }

  if (!response.ok) {
    let details = "";
    try {
      details = await response.text();
    } catch {
      details = "";
    }
    throw new Error(`No se pudo obtener pictogramas (${response.status}) ${details}`.trim());
  }

  const data = (await response.json()) as PictogramApiResponse[];

  return data.map((item) => ({
    id: item._id,
    imageUrl: buildPictogramImageUrl(item._id),
    searchText: trimmed,
    keywords: item.keywords?.map((keyword) => keyword.keyword) ?? [],
    description: item.desc,
  }));
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
