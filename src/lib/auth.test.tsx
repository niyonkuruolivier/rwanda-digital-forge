import { act, render, cleanup } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AuthProvider, useAuth } from "./auth";

const mocks = vi.hoisted(() => ({ getUser: vi.fn() }));
vi.mock("@/integrations/supabase/client", () => ({ supabase: { auth: { getUser: mocks.getUser } } }));
let auth: ReturnType<typeof useAuth>;
function Probe() { auth = useAuth(); return null; }
afterEach(() => { cleanup(); vi.useRealTimers(); vi.clearAllMocks(); });

describe("Account loading recovery", () => {
  it("ends a stalled identity check without granting account access", async () => {
    vi.useFakeTimers();
    let resolve: (value: unknown) => void = () => {};
    mocks.getUser.mockReturnValue(new Promise(done => { resolve = done; }));
    render(<AuthProvider><Probe /></AuthProvider>);
    let pending: Promise<void> = Promise.resolve();
    act(() => { pending = auth.refresh(); });
    await act(async () => { await vi.advanceTimersByTimeAsync(15000); });
    expect(auth.ready).toBe(true);
    expect(auth.error).not.toBe("");
    expect(auth.role).toBe("buyer");
    await act(async () => { resolve({ data: { user: null }, error: null }); await pending; });
    expect(auth.error).not.toBe("");
  });
  it("offers recovery when an identity request rejects", async () => {
    mocks.getUser.mockRejectedValue(new Error("Failed to fetch"));
    render(<AuthProvider><Probe /></AuthProvider>);
    await act(async () => { await auth.refresh(); });
    expect(auth.ready).toBe(true);
    expect(auth.error).not.toBe("");
  });
  it("allows guests and a successful retry after connection failure", async () => {
    mocks.getUser.mockRejectedValueOnce(new Error("Offline")).mockResolvedValue({ data: { user: null }, error: { name: "AuthSessionMissingError" } });
    render(<AuthProvider><Probe /></AuthProvider>);
    await act(async () => { await auth.refresh(); });
    expect(auth.error).not.toBe("");
    await act(async () => { await auth.refresh(); });
    expect(auth.ready).toBe(true);
    expect(auth.error).toBe("");
    expect(auth.user).toBe(null);
  });
});