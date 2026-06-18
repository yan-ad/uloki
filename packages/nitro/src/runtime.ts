import type { NitroApp } from "nitro/types";
import { LokiLogger, type LokiLogEntry } from "@nitro-loki/core";
import { resolveConfig, type NitroLokiConfig } from "./config";

/**
 * Nitro runtime: hooks into the Nitro app lifecycle.
 * Called once at server start to register hooks and wire LokiTransport.
 */
export function useLokiRuntime(nitroApp: NitroApp, config: NitroLokiConfig) {
  const resolved = resolveConfig(config);
  const logger = new LokiLogger({
    endpoint: resolved.endpoint,
    labels: resolved.labels,
    enabled: resolved.enabled,
    batchSize: resolved.batchSize,
    flushInterval: resolved.flushInterval,
    redact: resolved.redact,
  });

  // Hook into request lifecycle
  nitroApp.hooks.hook("request", (event) => {
    // Tag every request context with logger
    event.context.loki = {
      log: (entry: Partial<LokiLogEntry>) =>
        logger.log({ ...entry, labels: { ...resolved.labels, ...entry.labels } }),
      flush: () => logger.flush(),
    };
  });

  // Hook into close to flush remaining
  nitroApp.hooks.hook("close", async () => {
    await logger.flush();
  });

  // Hook into dev event for introspection in playground
  if (process.env.NODE_ENV === "development") {
    logger.onFlush((entries) => {
      for (const entry of entries) {
        nitroApp.hooks.callHook("loki:log" as any, entry);
      }
    });
  }

  return logger;
}
