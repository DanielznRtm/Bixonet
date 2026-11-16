import { describe, expect, it } from "vitest";
import { formatDistance } from "./geo";

describe("formatDistance", () => {
  it("arredonda metros para a centena", () => {
    expect(formatDistance(780)).toBe("~800 m");
    expect(formatDistance(30)).toBe("~100 m");
  });

  it("usa km com vírgula a partir de ~1 km", () => {
    expect(formatDistance(950)).toBe("~1 km");
    expect(formatDistance(2340)).toBe("~2,3 km");
    expect(formatDistance(12_600)).toBe("~13 km");
  });

  it("rejeita valores inválidos", () => {
    expect(() => formatDistance(-1)).toThrow(RangeError);
    expect(() => formatDistance(Number.NaN)).toThrow(RangeError);
  });
});
