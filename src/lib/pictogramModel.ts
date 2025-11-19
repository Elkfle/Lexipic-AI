import Papa from "papaparse";
import datasetCsv from "@/data/frases_procesadas.csv?raw";
import { distance as levenshtein } from "fastest-levenshtein";

export type PictogramSample = {
  frase: string;
  fraseNorm: string;
  categoria: string;
  tokens: string[];
  bigrams: string[];
  trigrams: string[];
};

export type SampleScore = {
  sample: PictogramSample;
  score: number;
  matchedTokens: string[];
};

const ENYE_PLACEHOLDER = "__enye__";
const NON_ALPHANUMERIC = /[^a-z0-9ñ\s]/g;
const EXTRA_SPACES = /\s+/g;
const ACCENTS = /[\u0300-\u036f]/g;

const LEET_MAP: Record<string, string> = {
  "0": "o",
  "1": "i",
  "3": "e",
  "4": "a",
  "5": "s",
  "7": "t",
};

const rawSamples: PictogramSample[] = (() => {
  const parsed = Papa.parse<Record<string, string>>(datasetCsv, {
    header: true,
    skipEmptyLines: true,
  });

  return parsed.data
    .filter((row) => Boolean(row.frase))
    .map((row) => ({
      frase: row.frase ?? "",
      fraseNorm: row.frase_norm ?? "",
      categoria: row.categoria ?? "",
      tokens: parseArrayField(row.tokens),
      bigrams: parseArrayField(row.bigrams),
      trigrams: parseArrayField(row.trigrams),
    }));
})();

const VOCAB = new Set<string>();
rawSamples.forEach((sample) => {
  sample.tokens.forEach((token) => {
    if (token) VOCAB.add(token);
  });
});

function parseArrayField(value?: string): string[] {
  if (!value) return [];

  const normalized = value
    .trim()
    .replace(/^"|"$/g, "")
    .replace(/'/g, '"');

  try {
    const parsed = JSON.parse(normalized);
    return Array.isArray(parsed)
      ? parsed.map((item) => String(item))
      : [];
  } catch {
    return normalized
      .replace(/[\[\]]/g, "")
      .split(",")
      .map((token) => token.trim())
      .filter(Boolean);
  }
}


function normalizeLeet(text: string): string {
  return text.replace(/[013457]/g, (ch) => LEET_MAP[ch] ?? ch);
}

function normalizeText(text: string): string {
  if (!text) return "";

  let normalized = text.toLowerCase();

  //pasar de "t3ng0" → "tengo"
  normalized = normalizeLeet(normalized);

  normalized = normalized
    .replace(/ñ/g, ENYE_PLACEHOLDER)
    .normalize("NFD")
    .replace(ACCENTS, "")
    .replace(new RegExp(ENYE_PLACEHOLDER, "g"), "ñ")
    .replace(NON_ALPHANUMERIC, " ")
    .replace(EXTRA_SPACES, " ")
    .trim();

  return normalized;
}

function correctToken(token: string): string {
  if (!token) return token;
  if (VOCAB.has(token)) return token;

  let best = token;
  let bestDist = Infinity;

  for (const cand of VOCAB) {
    const d = levenshtein(token, cand);
    if (d < bestDist) {
      bestDist = d;
      best = cand;
    }
    if (bestDist === 0) break;
  }

  return bestDist <= 2 ? best : token;
}


function tokenize(text: string): string[] {
  const normalized = normalizeText(text);

  const rawTokens = normalized
    .split(" ")
    .map((token) => token.trim())
    .filter(Boolean);

  return rawTokens.map((token) => correctToken(token));
}

function generateNgrams(tokens: string[], size: number): string[] {
  if (tokens.length < size) return [];
  const grams: string[] = [];

  for (let i = 0; i <= tokens.length - size; i += 1) {
    grams.push(tokens.slice(i, i + size).join(" "));
  }

  return grams;
}

function scoreSample(
  inputTokens: string[],
  inputBigrams: string[],
  inputTrigrams: string[],
  inputNormalized: string,
  sample: PictogramSample,
): SampleScore | null {
  if (!sample.tokens.length) return null;

  const sampleTokens = new Set(sample.tokens);
  const sampleBigrams = new Set(sample.bigrams);
  const sampleTrigrams = new Set(sample.trigrams);

  const matchedTokens = inputTokens.filter((token) => sampleTokens.has(token));
  const matchedBigrams = inputBigrams.filter((gram) => sampleBigrams.has(gram));
  const matchedTrigrams = inputTrigrams.filter((gram) => sampleTrigrams.has(gram));

  const lexicalScore = matchedTokens.length;
  const bigramScore = matchedBigrams.length * 2;
  const trigramScore = matchedTrigrams.length * 3;
  const phraseExactMatch = normalizeText(sample.fraseNorm) === inputNormalized ? 10 : 0;

  const score = lexicalScore + bigramScore + trigramScore + phraseExactMatch;

  if (score <= 0) return null;

  return {
    sample,
    score,
    matchedTokens,
  };
}

export type InferenceResult = {
  searchText: string;
  sample: PictogramSample;
  matchedTokens: string[];
  score: number;
};

export function inferSearchQueries(
  message: string,
  limit = 3,
): InferenceResult[] {
  const tokens = tokenize(message);
  const normalizedInput = tokens.join(" ");

  if (!tokens.length) return [];

  const bigrams = generateNgrams(tokens, 2);
  const trigrams = generateNgrams(tokens, 3);

  const scoredSamples = rawSamples
    .map((sample) => scoreSample(tokens, bigrams, trigrams, normalizedInput, sample))
    .filter((value): value is SampleScore => Boolean(value))
    .sort((a, b) => b.score - a.score);

  const fallbackSamples = rawSamples.slice(0, limit).map((sample) => ({
    sample,
    score: 1,
    matchedTokens: sample.tokens.slice(0, 2),
  }));

  const bestMatches = scoredSamples.length ? scoredSamples.slice(0, limit) : fallbackSamples;

  return bestMatches.map((match) => ({
    searchText: buildSearchText(tokens, match.sample.tokens),
    sample: match.sample,
    matchedTokens: match.matchedTokens,
    score: match.score,
  }));
}

function buildSearchText(inputTokens: string[], sampleTokens: string[]): string {
  const combined = new Set<string>([...inputTokens.slice(0, 3), ...sampleTokens.slice(0, 3)]);
  return Array.from(combined)
    .filter(Boolean)
    .join(" ")
    .trim();
}
