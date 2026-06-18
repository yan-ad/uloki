// @ts-nocheck — runtime injected by Nuxt module, types only resolve in Nuxt context
import { defineNitroPlugin } from "nitropack/runtime/plugin";
import { useLokiRuntime } from "@nitro-loki/nitro/runtime";

export default defineNitroPlugin((nitroApp) => {
  const config = useRuntimeConfig();

  useLokiRuntime(nitroApp, {
    endpoint: config.public?.loki?.endpoint ?? "http://localhost:3100/loki/api/v1/push",
    labels: {
      app: config.public?.loki?.app ?? "nuxt",
      env: process.env.NODE_ENV ?? "development",
    },
    enabled: config.public?.loki?.enabled ?? true,
    batchSize: config.public?.loki?.batchSize ?? 10,
    flushInterval: config.public?.loki?.flushInterval ?? 5000,
  });
});
