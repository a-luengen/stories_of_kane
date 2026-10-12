import * as THREE from 'three';
import { describe, expect, it } from 'vitest';
import { NavGrid } from '../ai/NavGrid';
import { CONFIG } from '../config';
import { NPCS } from '../data/npcs';
import { NpcSystem } from '../entities/NpcSystem';
import { TargetSystem } from '../entities/Targets';
import { buildSandboxMap } from '../world/maps/sandbox';
import { MOODS, phrases, planMurmur, syllablesIn, type MurmurPlan } from './murmur';
import { voiceFor } from './voices';

const jed = voiceFor('porch-gunman:Jed Collins', 'male');
const ada = voiceFor('townswoman:Ada Moore', 'female');
const avgPitch = (p: MurmurPlan) => p.syllables.reduce((s, x) => s + x.pitch0, 0) / p.syllables.length;
const avgGain = (p: MurmurPlan) => p.syllables.reduce((s, x) => s + x.gain, 0) / p.syllables.length;

describe('murmur: structure from the text', () => {
  it('splits phrases at punctuation and counts syllables by vowel groups', () => {
    expect(phrases('Howdy, stranger!')).toEqual([
      { words: ['Howdy'], end: ',' },
      { words: ['stranger'], end: '!' },
    ]);
    expect(phrases("Fine day, ain't it?").map((p) => p.end)).toEqual([',', '?']);
    expect(syllablesIn('stranger')).toBe(2);
    expect(syllablesIn('Hmm')).toBe(1);
    expect(syllablesIn('unbelievable')).toBe(3); // capped
  });

  it('longer lines murmur longer; one syllable per vowel group', () => {
    const short = planMurmur('Howdy!', jed, 'greet');
    const long = planMurmur('Welcome to town, friend. Mind the sun out here.', jed, 'greet');
    expect(short.syllables).toHaveLength(2);
    expect(long.duration).toBeGreaterThan(short.duration * 3);
  });

  it('punctuation adds pauses (a comma less than a full stop)', () => {
    const gapAfter = (text: string, word: number) => {
      const p = planMurmur(text, jed, 'greet');
      const s = p.syllables;
      const end = s[word].start + s[word].dur;
      return s[word + 1].start - end;
    };
    const plain = gapAfter('Go home now', 0);
    const comma = gapAfter('Go, home now', 0);
    const stop = gapAfter('Go. Home now', 0);
    expect(comma).toBeGreaterThan(plain + 0.1);
    expect(stop).toBeGreaterThan(comma);
  });

  it('a question rises at the end; a statement falls', () => {
    const q = planMurmur('Are you lost out here?', jed, 'greet');
    const s = planMurmur('You are lost out here.', jed, 'greet');
    const last = (p: MurmurPlan) => p.syllables[p.syllables.length - 1].pitch1;
    expect(last(q)).toBeGreaterThan(jed.pitch * 1.1);
    expect(last(s)).toBeLessThan(jed.pitch);
  });
});

describe('murmur: voices', () => {
  it('is deterministic per voice; different NPCs sound different', () => {
    const a = planMurmur("Fine day, ain't it?", jed, 'greet');
    expect(planMurmur("Fine day, ain't it?", jed, 'greet')).toEqual(a);
    const b = planMurmur("Fine day, ain't it?", voiceFor('someone else', 'male'), 'greet');
    expect(b.syllables.map((x) => x.pitch0)).not.toEqual(a.syllables.map((x) => x.pitch0));
  });

  it('women speak higher than men', () => {
    expect(avgPitch(planMurmur('Help! Somebody help!', ada, 'greet'))).toBeGreaterThan(avgPitch(planMurmur('Help! Somebody help!', jed, 'greet')) * 1.4);
  });

  it('each voice favours its own few vowels (its timbre)', () => {
    const vowels = (v: ReturnType<typeof voiceFor>) => new Set(planMurmur('the quick brown fox jumps over the lazy dog again and again today', v, 'greet').syllables.map((s) => s.vowel));
    expect(vowels(jed).size).toBeLessThanOrEqual(3);
    const others = ['a', 'b', 'c', 'd', 'e', 'f'].map((n) => [...vowels(voiceFor(n, 'male'))].sort().join());
    expect(new Set(others).size).toBeGreaterThan(1);
  });
});

describe('murmur: mood', () => {
  const line = 'You asked for it, draw!';
  const plan = (m: keyof typeof MOODS) => planMurmur(line, jed, m);

  it('hostile is low and harsh; flee high and fast', () => {
    expect(avgPitch(plan('hostile'))).toBeLessThan(avgPitch(plan('greet')) * 0.9);
    expect(plan('hostile').style.harsh).toBeGreaterThan(plan('greet').style.harsh);
    expect(avgPitch(plan('flee'))).toBeGreaterThan(avgPitch(plan('greet')) * 1.2);
    expect(plan('flee').duration).toBeLessThan(plan('greet').duration * 0.8);
  });

  it('warn is louder and clipped; calm slow and soft', () => {
    expect(avgGain(plan('warn'))).toBeGreaterThan(avgGain(plan('greet')));
    const fill = (p: MurmurPlan) => p.syllables.reduce((s, x) => s + x.dur, 0) / p.duration; // sound vs. silence
    expect(fill(plan('warn'))).toBeLessThan(fill(plan('greet')));
    expect(plan('calm').duration).toBeGreaterThan(plan('greet').duration * 1.2);
    expect(avgGain(plan('calm'))).toBeLessThan(avgGain(plan('greet')));
  });
});

describe('speech bubbles last as long as the murmur', () => {
  it("an NPC's bubble shows while it murmurs, then clears", () => {
    const wd = buildSandboxMap(new TargetSystem());
    const sys = new NpcSystem(NPCS, wd.collision, new NavGrid(wd.collision, CONFIG.world.size / 2), wd.occluders);
    const gunman = sys.npcs[0];
    const said: string[] = [];
    gunman.onSpeak = (_npc, text, mood) => {
      said.push(`${mood}:${text}`);
      return 1.2;
    };
    sys.onPlayerShotLanded(gunman.pos.clone().add(new THREE.Vector3(1.5, 0, 0)), null);
    expect(said).toHaveLength(1);
    expect(said[0]).toMatch(/^warn:/);
    const player = { pos: new THREE.Vector3(30, 0, 30), mounted: false, dead: false };
    const step = (s: number) => {
      for (let t = 0; t < s; t += 1 / 60) sys.update(1 / 60, player, [], () => {});
    };
    step(1.2 + CONFIG.npc.speechTail - 0.1);
    expect(gunman.speech).toBeTruthy();
    step(0.2);
    expect(gunman.speech).toBeNull();
  });
});
