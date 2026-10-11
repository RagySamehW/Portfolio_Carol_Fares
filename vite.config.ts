import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import { resolve } from "path";

export default defineConfig({
  base: "./",
  plugins: [tailwindcss()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        about: resolve(__dirname, "about.html"),
        kinema: resolve(__dirname, "work/kinema.html"),
        undertow: resolve(__dirname, "work/undertow.html"),
        maren: resolve(__dirname, "work/maren.html"),
        signal: resolve(__dirname, "work/signal.html"),
      },
    },
  },
});
