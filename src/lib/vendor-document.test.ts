import { afterEach, expect, it, vi } from "vitest";
import { preloadAgreementImages } from "./vendor-document";
import { AGREEMENT_COMPANY } from "./agreement-company";

afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals(); });

it("loads all three company images concurrently and reuses them for agreement preparation", async () => {
  const releases: (() => void)[] = [];
  const fetchMock = vi.fn(() => new Promise<Response>((resolve) => {
    releases.push(() => resolve({ ok: true, blob: async () => new Blob() } as Response));
  }));
  vi.stubGlobal("fetch", fetchMock);
  vi.stubGlobal("createImageBitmap", vi.fn(async () => ({ width: 10, height: 10, close: vi.fn() })));
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue({ drawImage: vi.fn() } as unknown as CanvasRenderingContext2D);
  vi.spyOn(HTMLCanvasElement.prototype, "toBlob").mockImplementation((callback) => callback({ arrayBuffer: async () => new ArrayBuffer(3) } as Blob));
  const first = preloadAgreementImages(AGREEMENT_COMPANY);
  const second = preloadAgreementImages(AGREEMENT_COMPANY);
  expect(fetchMock).toHaveBeenCalledTimes(3);
  releases.forEach((release) => release());
  await Promise.all([first, second]);
  await preloadAgreementImages(AGREEMENT_COMPANY);
  expect(fetchMock).toHaveBeenCalledTimes(3);
});