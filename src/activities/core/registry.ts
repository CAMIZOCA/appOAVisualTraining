import type { ActivityCategory, AnyActivityDefinition } from './types';

export const CATEGORIES: ActivityCategory[] = [
  'tracking',
  'oculomotor',
  'saccades',
  'convergence',
  'accommodation',
  'relaxation',
];

export interface ActivityRegistry {
  all: AnyActivityDefinition[];
  /** Visible in the Activities list. */
  visible: AnyActivityDefinition[];
  get: (id: string) => AnyActivityDefinition | undefined;
  byCategory: (category: ActivityCategory) => AnyActivityDefinition[];
}

export function createRegistry(definitions: AnyActivityDefinition[]): ActivityRegistry {
  const map = new Map<string, AnyActivityDefinition>();
  for (const def of definitions) {
    if (map.has(def.id)) throw new Error(`Duplicate activity id: ${def.id}`);
    map.set(def.id, def);
  }
  const visible = definitions.filter((d) => !d.hidden);
  return {
    all: definitions,
    visible,
    get: (id) => map.get(id),
    byCategory: (category) => visible.filter((d) => d.category === category),
  };
}
