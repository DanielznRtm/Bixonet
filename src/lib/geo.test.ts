import { describe, expect, it } from "vitest";
import { circlePolygon, formatDistance } from "./geo";

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

describe("circlePolygon", () => {
  it("gera um anel fechado com todos os pontos a ~150 m do centro", () => {
    const lat = -23.479;
    const lng = -47.417;
    const polygon = circlePolygon(lat, lng, 150);
    const ring = polygon.coordinates[0];

    expect(ring[0]).toEqual(ring[ring.length - 1]);

    const toRad = (d: number) => (d * Math.PI) / 180;
    for (const [pLng, pLat] of ring) {
      // Haversine
      const a =
        Math.sin(toRad(pLat - lat) / 2) ** 2 +
        Math.cos(toRad(lat)) *
          Math.cos(toRad(pLat)) *
          Math.sin(toRad(pLng - lng) / 2) ** 2;
      const d = 2 * 6_371_000 * Math.asin(Math.sqrt(a));
      expect(d).toBeGreaterThan(148);
      expect(d).toBeLessThan(152);
    }
  });
});
