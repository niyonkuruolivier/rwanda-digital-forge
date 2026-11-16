import { describe, expect, it } from "vitest";
import { SHARE_PREVIEW_IMAGE, SITE_ORIGIN, shareUrl } from "./share";

describe("shared links", () => {
  it("builds an absolute store link on the published site", () => {
    expect(shareUrl("/vendors/kigali-tech")).toBe(`${SITE_ORIGIN}/vendors/kigali-tech`);
  });

  it("adds the missing leading slash", () => {
    expect(shareUrl("products/p1")).toBe(`${SITE_ORIGIN}/products/p1`);
  });

  it("keeps the current origin when sharing from the preview", () => {
    expect(shareUrl("/shop", "http://localhost:8080/")).toBe("http://localhost:8080/shop");
  });

  it("points the share preview card at the branded 1200x630 image", () => {
    expect(SHARE_PREVIEW_IMAGE).toBe(`${SITE_ORIGIN}/__l5e/assets-v1/234e28f9-6a19-4ac9-8b0b-e19f2687e571/share-preview.png`);
  });
});
