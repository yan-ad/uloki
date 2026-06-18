import { describe, it, expect, vi, beforeAll } from "vitest";

// Mock @nuxt/kit so the module can be imported without Nuxt installed
vi.mock("@nuxt/kit", () => ({
  defineNuxtModule: (def: any) => ({
    ...def,
    __isMock: true,
  }),
  createResolver: () => ({ resolve: (p: string) => `/resolved/${p}` }),
}));

describe("@uloki/nuxt module", () => {
  let mod: any;

  beforeAll(async () => {
    mod = await import("./module");
  });

  it("is defined", () => {
    expect(mod.default).toBeDefined();
  });

  it("has correct meta name and configKey", () => {
    const def = mod.default;
    expect(def.meta.name).toBe("uloki");
    expect(def.meta.configKey).toBe("loki");
  });

  it("provides sensible defaults", () => {
    const def = mod.default;
    expect(def.defaults.endpoint).toBe("http://localhost:3100/loki/api/v1/push");
    expect(def.defaults.enabled).toBe(true);
    expect(def.defaults.batchSize).toBe(10);
    expect(def.defaults.flushInterval).toBe(5000);
  });

  it("requires Nuxt >=3.12", () => {
    const def = mod.default;
    expect(def.meta.compatibility.nuxt).toBe(">=3.12");
  });
});
