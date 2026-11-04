import { describe, expect, it } from "vitest";
import { findCard } from "../content/cards";
import { localResult, mergeResult } from "./triage";
import { searchCards } from "./search";

describe("mergeResult", () => {
  it("uses the model card and reports its layer", () => {
    const result = mergeResult(searchCards("kolum kanıyor"), { id: "bleeding", source: "on_device" });
    expect(result.primary?.id).toBe("bleeding");
    expect(result.layer).toBe("on_device");
  });

  it("falls back to local search when the model has no answer", () => {
    expect(mergeResult(searchCards("gaz kokusu var"), null).layer).toBe("library");
    const other = mergeResult(searchCards("gaz kokusu var"), { id: "other", source: "in_cloud" });
    expect(other.primary?.id).toBe("gas");
    expect(other.layer).toBe("library");
  });

  it("lets a life-threatening local match beat a milder model choice", () => {
    const local = searchCards("bacağım sıkıştı nefes alamıyorum");
    const result = mergeResult(local, { id: "fracture", source: "on_device" });
    expect(result.primary?.id).toBe("trapped");
    expect(result.related.map((card) => card.id)).toContain("fracture");
    expect(result.layer).toBe("library");
  });

  it("trusts the model when local search finds nothing", () => {
    const result = mergeResult([], { id: "burn", source: "in_cloud" });
    expect(result.primary).toBe(findCard("burn"));
    expect(result.layer).toBe("in_cloud");
  });

  it("returns an empty result when nothing matches", () => {
    expect(localResult([])).toEqual({ primary: null, related: [], layer: "library" });
  });
});
