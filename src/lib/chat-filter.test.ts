import { describe, expect, it } from "vitest";
import { chatTextBlocked } from "./chat-filter";
describe("chat number filter", () => {
  it("blocks digits like a phone number", () => expect(chatTextBlocked("call 0788 723 098")).toBe(true));
  it("blocks numbers written in English", () => expect(chatTextBlocked("five thousand")).toBe(true));
  it("blocks numbers written in Kinyarwanda", () => expect(chatTextBlocked("ibihumbi bitanu")).toBe(true));
  it("blocks numbers written in French", () => expect(chatTextBlocked("deux mille")).toBe(true));
  it("blocks Rwandan franc mentions", () => expect(chatTextBlocked("price in rwf")).toBe(true));
  it("allows normal negotiation words", () => expect(chatTextBlocked("Is the black one still available? Muraho")).toBe(false));
});
