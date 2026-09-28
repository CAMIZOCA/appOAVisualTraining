import AsyncStorage from '@react-native-async-storage/async-storage';

import { resetLocalData } from '@/services/resetData';
import { STORAGE_KEYS } from '@/services/storage';
import type { SessionRecord } from '@/types/session';

import { useDev } from './devStore';
import { useLab } from './labStore';
import { createSessionId, MAX_RECORDS, useSessions } from './sessionsStore';
import { DEFAULT_SETTINGS, useSettings } from './settingsStore';

const record = (id: string, extra: Partial<SessionRecord> = {}): SessionRecord => ({
  id,
  activityId: 'circle-clockwise',
  activityName: 'Círculo horario',
  startedAt: new Date().toISOString(),
  durationMs: 20_000,
  plannedMs: 20_000,
  difficulty: 'easy',
  params: { turns: 2 },
  completed: true,
  ...extra,
});

/** Let zustand's persist middleware flush its async write. */
const flush = () => new Promise((r) => setTimeout(r, 0));

async function stored(key: string) {
  const raw = await AsyncStorage.getItem(key);
  return raw ? JSON.parse(raw).state : null;
}

beforeEach(async () => {
  await AsyncStorage.clear();
  useSessions.setState({ records: [] });
  useSettings.setState(DEFAULT_SETTINGS);
});

describe('session storage', () => {
  it('saves sessions newest first and persists them', async () => {
    useSessions.getState().add(record('a'));
    useSessions.getState().add(record('b'));
    expect(useSessions.getState().records.map((r) => r.id)).toEqual(['b', 'a']);
    await flush();
    const persisted = await stored(STORAGE_KEYS.sessions);
    expect(persisted.records.map((r: SessionRecord) => r.id)).toEqual(['b', 'a']);
    expect(persisted.records[0]).toMatchObject({ activityId: 'circle-clockwise', completed: true });
  });

  it('stores comfort feedback on the right record', async () => {
    useSessions.getState().add(record('a'));
    useSessions.getState().add(record('b'));
    useSessions.getState().setComfort('a', 'slightFatigue');
    await flush();
    const persisted = await stored(STORAGE_KEYS.sessions);
    expect(persisted.records.find((r: SessionRecord) => r.id === 'a').comfort).toBe(
      'slightFatigue',
    );
    expect(persisted.records.find((r: SessionRecord) => r.id === 'b').comfort).toBeUndefined();
  });

  it('does not duplicate ids and stays bounded', () => {
    useSessions.getState().add(record('same'));
    useSessions.getState().add(record('same', { completed: false }));
    expect(useSessions.getState().records).toHaveLength(1);
    for (let i = 0; i < MAX_RECORDS + 20; i++) useSessions.getState().add(record(`r${i}`));
    expect(useSessions.getState().records).toHaveLength(MAX_RECORDS);
  });

  it('creates unique ids', () => {
    const ids = new Set(Array.from({ length: 200 }, () => createSessionId()));
    expect(ids.size).toBe(200);
  });

  it('rehydrates records from storage', async () => {
    await AsyncStorage.setItem(
      STORAGE_KEYS.sessions,
      JSON.stringify({ state: { records: [record('persisted')] }, version: 1 }),
    );
    await useSessions.persist.rehydrate();
    expect(useSessions.getState().records.map((r) => r.id)).toEqual(['persisted']);
  });
});

describe('settings persistence', () => {
  it('persists settings changes', async () => {
    useSettings.getState().update({ voiceEnabled: false, defaultSpeed: 'fast', language: 'en' });
    await flush();
    expect(await stored(STORAGE_KEYS.settings)).toMatchObject({
      voiceEnabled: false,
      defaultSpeed: 'fast',
      language: 'en',
    });
  });

  it('reset local data clears history and overrides but keeps consent and language', async () => {
    useSettings
      .getState()
      .update({ safetyAcceptedAt: '2026-01-01T00:00:00.000Z', language: 'en', devMode: true });
    useSessions.getState().add(record('x'));
    useDev.getState().setParams('star', { rounds: 3 });
    useLab.getState().setParams({ path: 'circle' });
    await resetLocalData();
    expect(useSessions.getState().records).toEqual([]);
    expect(useDev.getState().paramOverrides).toEqual({});
    expect(useLab.getState().params).toBeNull();
    expect(useSettings.getState()).toMatchObject({
      safetyAcceptedAt: '2026-01-01T00:00:00.000Z',
      language: 'en',
      devMode: false,
    });
  });
});
