/**
 * Feedback sounds for menus and panels. UI widgets call `uiSound('ui.click')`; the engine
 * connects this to the AudioEngine once (widgets don't need an engine reference).
 */
let sink: ((id: string) => void) | null = null;

export function setUiSoundSink(fn: ((id: string) => void) | null): void {
  sink = fn;
}

export function uiSound(id: string): void {
  sink?.(id);
}
