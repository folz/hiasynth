import { defineConfig } from "vite";

export default defineConfig({
  build: {
    target: "esnext",
  },
  define: {
    "process.env.FORCE_REDUCED_MOTION": false,
  },
});
