import { defineBuildConfig } from "unbuild";

export default defineBuildConfig({
  failOnWarn: false,
  externals: ["@nuxt/kit", "@nuxt/schema", "@nitro-loki/core", "@nitro-loki/nitro"],
});
