// Bunyi lembut dijana dengan Web Audio (tiada fail audio luar).
let ctx;

const TUNES = {
  tap: [[660, 0.06]],
  correct: [[523, 0.1], [659, 0.1], [784, 0.18]],
  wrong: [[440, 0.12], [392, 0.16]],
  done: [[523, 0.12], [659, 0.12], [784, 0.12], [1047, 0.3]],
};

export function playSound(type, enabled) {
  if (!enabled) return;
  try {
    ctx ||= new (window.AudioContext || window.webkitAudioContext)();
    let t = ctx.currentTime;
    for (const [freq, dur] of TUNES[type]) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(0.12, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      osc.connect(gain).connect(ctx.destination);
      osc.start(t);
      osc.stop(t + dur + 0.02);
      t += dur;
    }
  } catch {
    // audio tidak disokong
  }
}
