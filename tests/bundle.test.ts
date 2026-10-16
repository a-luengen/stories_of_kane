// @vitest-environment node
// (Outside src/: it runs under Node, which the game's type check knows nothing about.)
import { mkdtempSync, readdirSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterAll, describe, expect, it } from 'vitest';
import { build } from 'vite';

/** Every string a pack shows the player (titles, descriptions, objectives, item names, dialog). */
function questTexts(): string[] {
  const root = join(process.cwd(), 'public/quests');
  const out: string[] = [];
  const walk = (v: unknown, key = ''): void => {
    if (typeof v === 'string' && ['title', 'description', 'objective', 'name', 'text'].includes(key) && v.length > 6) out.push(v);
    else if (Array.isArray(v)) v.forEach((x) => walk(x));
    else if (v && typeof v === 'object') for (const [k, x] of Object.entries(v)) walk(x, k);
  };
  for (const id of readdirSync(root, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name)) {
    walk(JSON.parse(readFileSync(join(root, id, 'quest.json'), 'utf8')));
  }
  return out;
}

describe('the production bundle', () => {
  const outDir = mkdtempSync(join(tmpdir(), 'sok-bundle-'));
  afterAll(() => rmSync(outDir, { recursive: true, force: true }));

  it('holds the quest engine but no quest content; packs are served as separate files', async () => {
    await build({ logLevel: 'silent', build: { outDir, emptyOutDir: true } });
    const assets = readdirSync(join(outDir, 'assets'));
    const js = assets.filter((f) => f.endsWith('.js'));
    // The entry chunk (and every chunk that isn't a quest's own hooks chunk).
    const html = readFileSync(join(outDir, 'index.html'), 'utf8');
    const entry = /assets\/(index-[\w-]+\.js)/.exec(html)![1];
    const engineChunks = js.filter((f) => !/^hooks-/.test(f));
    expect(engineChunks).toContain(entry);
    const code = engineChunks.map((f) => readFileSync(join(outDir, 'assets', f), 'utf8')).join('\n');
    expect(code).toContain('quest.json'); // (the loader is in)
    const texts = questTexts();
    expect(texts.length).toBeGreaterThan(3);
    for (const t of texts) expect(code.includes(t), `"${t}" is in the bundle`).toBe(false);
    // Packs ship next to the game, fetched on demand.
    expect(readdirSync(join(outDir, 'quests'))).toContain('index.json');
  }, 120_000);
});
