import { createHash } from 'crypto';
import mongoose from 'mongoose';

const NAMESPACE = 'gestpro-seed:v1:';

/**
 * Deterministic ObjectId derived from a stable string key.
 * Running the seed twice produces the same _id, which is what makes
 * the whole operation idempotent (and safe under concurrent cold starts).
 */
export function seedId(key: string): mongoose.Types.ObjectId {
  const hex = createHash('sha256').update(NAMESPACE + key).digest('hex').slice(0, 24);
  return new mongoose.Types.ObjectId(hex);
}

export function isObjectIdHex(value: string): boolean {
  return /^[0-9a-fA-F]{24}$/.test(value);
}

/**
 * mulberry32 PRNG seeded from a string. Same string => same sequence,
 * so the generated dataset is byte-identical on every machine and every boot.
 */
export function createRng(seed: string): () => number {
  let a = parseInt(createHash('sha256').update(NAMESPACE + seed).digest('hex').slice(0, 8), 16) | 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), a | 1);
    t = (t + Math.imul(t ^ (t >>> 7), t | 61)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Inclusive random integer. */
export function randInt(rng: () => number, min: number, max: number): number {
  return min + Math.floor(rng() * (max - min + 1));
}

export function chance(rng: () => number, probability: number): boolean {
  return rng() < probability;
}

/** Weighted pick. Falls back to the last item if every weight is zero. */
export function weightedPick<T>(rng: () => number, items: readonly T[], weights: readonly number[]): T {
  if (items.length === 0) {
    throw new Error('weightedPick: empty item list');
  }
  let total = 0;
  for (const w of weights) total += Math.max(0, w);
  if (total <= 0) return items[items.length - 1];

  let roll = rng() * total;
  for (let i = 0; i < items.length; i++) {
    roll -= Math.max(0, weights[i] ?? 0);
    if (roll < 0) return items[i];
  }
  return items[items.length - 1];
}
