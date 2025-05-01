import { defineConfig } from "vite";
import viteRCE from "./plugin-rce/index";

export default defineConfig({
  plugins: [viteRCE()]
})