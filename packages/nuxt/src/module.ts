import { defineNuxtModule, createResolver } from "@nuxt/kit";
import type { NitroLokiConfig } from "@nitro-loki/nitro";

export interface ModuleOptions extends NitroLokiConfig {}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: "nitro-loki",
    configKey: "loki",
    compatibility: { nuxt: ">=3.12" },
  },

  defaults: {
    endpoint: "http://localhost:3100/loki/api/v1/push",
    enabled: true,
    batchSize: 10,
    flushInterval: 5000,
  },

  async setup(options, nuxt) {
    const { resolve } = createResolver(import.meta.url);

    // Inject the Nitro plugin for server-side logging
    nuxt.hook("nitro:config", (nitroConfig) => {
      nitroConfig.plugins = nitroConfig.plugins ?? [];
      nitroConfig.plugins.push(resolve("./runtime/nitro-plugin"));
    });

    // Pass runtime config so the plugin can read it
    nuxt.options.runtimeConfig.public.loki = {
      endpoint: options.endpoint,
      enabled: options.enabled ?? true,
      batchSize: options.batchSize ?? 10,
      flushInterval: options.flushInterval ?? 5000,
    };
  },
});
