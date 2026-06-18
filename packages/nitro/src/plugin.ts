import { useLokiRuntime } from "./runtime";
import { resolveConfig } from "./config";
import type { NitroLokiConfig } from "./types";

/**
 * Nitro build-level plugin.
 * Injects the Loki runtime into the server bundle.
 */
export function nitroLokiPlugin(userConfig: NitroLokiConfig = {}) {
  const config = resolveConfig(userConfig);

  return {
    name: "nitro-loki",
    config: config,

    async init(nitro: any) {
      nitro.options.alias = nitro.options.alias ?? {};
      // Expose resolved config as virtual module so runtime can import it
      nitro.options.virtual = nitro.options.virtual ?? {};
      nitro.options.virtual["#nitro-loki-config"] = () =>
        `export default ${JSON.stringify(config, null, 2)}`;

      nitro.logger.info(`nitro-loki → ${config.endpoint}`);
    },

    // Inject runtime setup snippet into the server entry
    rollup: {
      plugins: [
        {
          name: "nitro-loki:virtual-runtime",
          resolveId(id: string) {
            if (id === "virtual:nitro-loki-runtime") return id;
          },
          load(id: string) {
            if (id === "virtual:nitro-loki-runtime") {
              return `
import { useLokiRuntime } from "@nitro-loki/nitro/runtime";
import config from "#nitro-loki-config";
export default function (nitroApp) { useLokiRuntime(nitroApp, config); }
`;
            }
          },
        },
      ],
    },
  };
}
