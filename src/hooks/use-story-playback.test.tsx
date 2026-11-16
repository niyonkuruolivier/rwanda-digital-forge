import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useStoryPlayback } from "./use-story-playback";

afterEach(() => vi.useRealTimers());

describe("story playback", () => {
  it("advances only after 20 seconds", () => {
    vi.useFakeTimers();
    const next = vi.fn();
    const { result } = renderHook(() => useStoryPlayback("first", next));
    act(() => vi.advanceTimersByTime(19_999));
    expect(next).not.toHaveBeenCalled();
    expect(result.current).toBeGreaterThan(0);
    act(() => vi.advanceTimersByTime(1));
    expect(next).toHaveBeenCalledTimes(1);
  });

  it("starts a fresh 20 seconds after changing stories and cancels on close", () => {
    vi.useFakeTimers();
    const next = vi.fn();
    const { rerender, result } = renderHook(({ id }: { id: string | undefined }) => useStoryPlayback(id, next), { initialProps: { id: "first" as string | undefined } });
    act(() => vi.advanceTimersByTime(10_000));
    rerender({ id: "second" });
    expect(result.current).toBe(0);
    act(() => vi.advanceTimersByTime(19_999));
    expect(next).not.toHaveBeenCalled();
    rerender({ id: undefined });
    act(() => vi.advanceTimersByTime(20_000));
    expect(next).not.toHaveBeenCalled();
  });
});