import { describe, expect, it } from "vitest";
import { statusGroups, type DealStory } from "./stories";

const NOW = 1_800_000_000_000;
const s = (id: string, vendorId: string, minsAgo: number): DealStory => ({ id, vendorId, title: id, image: "x", isLive: false, createdAt: NOW - minsAgo * 60_000 });

describe("WhatsApp-style statuses", () => {
  it("opens a seller at the new update after older ones were viewed", () => {
    const [group] = statusGroups([s("old", "a", 30), s("new", "a", 5)], new Set(["old"]), NOW);
    expect(group?.stories.map((x) => x.id)).toEqual(["old", "new"]);
    expect(group?.startId).toBe("new");
    expect(group?.viewed).toBe(false);
  });
  it("puts sellers with new updates before fully viewed sellers", () => {
    const groups = statusGroups([s("seen", "a", 1), s("fresh", "b", 60)], new Set(["seen"]), NOW);
    expect(groups.map((g) => [g.vendorId, g.viewed])).toEqual([["b", false], ["a", true]]);
  });
  it("replays a fully viewed seller from the first update", () => {
    const [group] = statusGroups([s("one", "a", 30), s("two", "a", 5)], new Set(["one", "two"]), NOW);
    expect(group?.startId).toBe("one");
  });
});
