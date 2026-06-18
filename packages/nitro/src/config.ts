import type { NitroLokiConfig } from "./types";

/** Default configuration values */
export const defaults: Required<NitroLokiConfig> = {
  endpoint: "http://localhost:3100/loki/api/v1/push",
  labels: {},
  enabled: true,
  batchSize: 10,
  flushInterval: 5000,
  redact: [],
};

/** Resolve config with defaults, merging user overrides */
export function resolveConfig(userConfig: Partial<NitroLokiConfig> = {}): Required<NitroLokiConfig> {
  return {
    ...defaults,
    ...userConfig,
    labels: { ...defaults.labels, ...userConfig.labels },
    redact: [...defaults.redact, ...(userConfig.redact ?? [])],
  };
}
