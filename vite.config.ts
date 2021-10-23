import { defineConfig } from "vite";

export default defineConfig({
  define: {
    "process.env.FORCE_REDUCED_MOTION": false,
  },
});
