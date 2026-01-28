export type UiSound =
  | 'reaction_add'
  | 'reaction_remove'
  | 'comment_posted'
  | 'share_success'
  | 'message_sent'
  | 'send_post'
  | 'copy';

function getSoundParams(sound: UiSound) {
  switch (sound) {
    case 'reaction_add':
      return { freq: 880, dur: 0.14, gain: 0.06 };
    case 'reaction_remove':
      return { freq: 520, dur: 0.14, gain: 0.05 };
    case 'comment_posted':
      return { freq: 740, dur: 0.12, gain: 0.05 };
    case 'share_success':
      return { freq: 660, dur: 0.16, gain: 0.06 };
    case 'message_sent':
      return { freq: 600, dur: 0.10, gain: 0.04 };
    case 'send_post':
      return { freq: 690, dur: 0.12, gain: 0.05 };
    case 'copy':
      return { freq: 800, dur: 0.08, gain: 0.035 };
    default:
      return { freq: 700, dur: 0.12, gain: 0.04 };
  }
}

export function playUiSound(sound: UiSound) {
  try {
    const AudioCtx = (window as any).AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;

    const { freq, dur, gain } = getSoundParams(sound);
    const ctx = new AudioCtx();
    const o = ctx.createOscillator();
    const g = ctx.createGain();

    o.type = 'sine';
    o.frequency.value = freq;

    g.gain.value = 0.0001;
    o.connect(g);
    g.connect(ctx.destination);

    const now = ctx.currentTime;
    g.gain.setValueAtTime(0.0001, now);
    g.gain.exponentialRampToValueAtTime(gain, now + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, now + Math.max(0.05, dur));

    o.start(now);
    o.stop(now + dur);
    o.onended = () => ctx.close();
  } catch {
    // ignore
  }
}
