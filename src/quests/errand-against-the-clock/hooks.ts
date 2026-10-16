import type { QuestHooksFactory } from '../api';

/** Seconds that must still be on the clock at the lookout for Eli to call it quick. */
const FAST = 90;

/**
 * Errand Against the Clock: how much time was left when you reached the lookout decides how Eli
 * greets you (his two dialogs check the `errand-fast` flag) and whether he adds a bonus.
 */
const hooks: QuestHooksFactory = (api) => ({
  onStart() {
    api.setFlag('errand-fast', false);
  },
  onStepComplete(step) {
    if (step.id === 'ride') api.setFlag('errand-fast', (api.timeLeft() ?? 0) >= FAST);
  },
  onComplete() {
    if (api.flag('errand-fast') !== true) return;
    api.giveMoney(20);
    api.toast('Eli presses an extra $20 on you for the haste');
  },
});

export default hooks;
