import { describe, expect, it } from "vitest";
import { chatAutoReply } from "./chat-auto-reply";
import { SEED_PRODUCTS } from "./data";
const watch = SEED_PRODUCTS.find((p) => p.id === "p2")!;
describe("chat auto-reply", () => {
  it("lists sizes", () => expect(chatAutoReply("What sizes do you have?", watch)?.text).toBe("Available sizes: 40mm, 44mm."));
  it("states fixed price", () => expect(chatAutoReply("Is the price final?", watch)?.text).toContain("RWF 115,500"));
  it("leaves other questions to the seller", () => expect(chatAutoReply("Hello", watch)).toBeNull());
});
