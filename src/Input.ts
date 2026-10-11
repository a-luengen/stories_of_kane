/** Keyboard + mouse state. "Pressed" flags are edge-triggered and consumed once. */
export class Input {
  private down = new Set<string>();
  private pressed = new Set<string>();
  mouseDown = false;
  /** Pointer position in client (CSS) pixels. */
  mouseX = window.innerWidth / 2;
  mouseY = window.innerHeight / 2;
  mouseInside = true;

  constructor(target: HTMLElement) {
    window.addEventListener('keydown', (e) => {
      if (e.code === 'Tab' || e.code === 'Space' || e.code === 'F3') e.preventDefault();
      if (!e.repeat) this.pressed.add(e.code);
      this.down.add(e.code);
    });
    window.addEventListener('keyup', (e) => this.down.delete(e.code));
    window.addEventListener('blur', () => {
      this.down.clear();
      this.mouseDown = false;
    });
    target.addEventListener('mousedown', (e) => {
      if (e.button === 0) {
        this.mouseDown = true;
        this.pressed.add('Mouse0');
      }
    });
    window.addEventListener('mouseup', (e) => {
      if (e.button === 0) this.mouseDown = false;
    });
    window.addEventListener('mousemove', (e) => {
      this.mouseX = e.clientX;
      this.mouseY = e.clientY;
      this.mouseInside = true;
    });
    document.addEventListener('mouseleave', () => (this.mouseInside = false));
    target.addEventListener('contextmenu', (e) => e.preventDefault());
  }

  isDown(code: string): boolean {
    return this.down.has(code);
  }

  /** Returns true once per physical key press. */
  consume(code: string): boolean {
    return this.pressed.delete(code);
  }

  /** Screen-relative movement axes: x = right, y = up on screen. Not normalized. */
  moveAxes(): { x: number; y: number } {
    const x = (this.isDown('KeyD') ? 1 : 0) - (this.isDown('KeyA') ? 1 : 0);
    const y = (this.isDown('KeyW') ? 1 : 0) - (this.isDown('KeyS') ? 1 : 0);
    return { x, y };
  }

  get sprint(): boolean {
    return this.isDown('ShiftLeft') || this.isDown('ShiftRight');
  }
}
