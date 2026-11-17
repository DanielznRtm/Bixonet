import { describe, expect, it, vi } from "vitest";
import { retryOnTimeout } from "./retry";

describe("retryOnTimeout", () => {
  it("repete uma vez quando o banco cancela por tempo", async () => {
    const query = vi
      .fn()
      .mockResolvedValueOnce({ data: null, error: { code: "57014", message: "timeout" } })
      .mockResolvedValueOnce({ data: [1], error: null });
    await expect(retryOnTimeout(query)).resolves.toEqual({ data: [1], error: null });
    expect(query).toHaveBeenCalledTimes(2);
  });

  it("não repete em sucesso nem em outros erros", async () => {
    const ok = vi.fn().mockResolvedValue({ data: [1], error: null });
    await retryOnTimeout(ok);
    expect(ok).toHaveBeenCalledTimes(1);

    const other = vi
      .fn()
      .mockResolvedValue({ data: null, error: { code: "42501", message: "x" } });
    const result = await retryOnTimeout(other);
    expect(other).toHaveBeenCalledTimes(1);
    expect(result.error?.code).toBe("42501");
  });
});
