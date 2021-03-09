/** @type {import("snowpack").SnowpackUserConfig } */
module.exports = {
  mount: {
    public: { url: "/", static: true },
    snowpack_public: { url: "/", static: true },
    src: { url: "/dist" },
  },
  plugins: ["@snowpack/plugin-typescript"],
  alias: {
    src: "./src",
  },
  routes: [],
  opitmize: {},
  packagesOptions: {},
  devOptions: {},
  buildOptions: {},
};
