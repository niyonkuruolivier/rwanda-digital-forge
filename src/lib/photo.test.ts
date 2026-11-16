import { describe, expect, it } from "vitest";
import { fitPhoto } from "./photo";

describe("uploaded photo size", () => {
  it("rejects 30 KB and keeps compressing until strictly below 30,000 bytes", async () => {
    let attempts = 0;
    const result = await fitPhoto(async () => new Blob([new Uint8Array(++attempts === 1 ? 30_000 : 29_999)]));
    expect(result.size).toBe(29_999);
    expect(attempts).toBe(2);
  });
  it("reduces dimensions if quality alone does not fit", async () => {
    const result = await fitPhoto(async (edge) => new Blob([new Uint8Array(edge >= 1200 ? 50_000 : 20_000)]));
    expect(result.size).toBe(20_000);
  });
  it("does not return a photo that stays too large", async () => {
    await expect(fitPhoto(async () => new Blob([new Uint8Array(30_000)]))).rejects.toThrow();
  });
});