import { useEffect, useRef, useState } from "react";

export const STORY_PLAYBACK_MS = 20_000;

export function useStoryPlayback(storyId: string | undefined, onNext: () => void) {
  const nextRef = useRef(onNext);
  nextRef.current = onNext;
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    setElapsed(0);
    if (!storyId) return;
    const started = Date.now();
    const progress = window.setInterval(() => setElapsed(Math.min(Date.now() - started, STORY_PLAYBACK_MS)), 100);
    const timer = window.setTimeout(() => nextRef.current(), STORY_PLAYBACK_MS);
    return () => { window.clearInterval(progress); window.clearTimeout(timer); };
  }, [storyId]);

  return elapsed;
}