import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // 客户端与预渲染共用构建时的年份，避免跨年时 hydrate 不一致
  define: { __BUILD_YEAR__: JSON.stringify(new Date().getFullYear()) },
  build: { outDir: "dist", emptyOutDir: true },
});
