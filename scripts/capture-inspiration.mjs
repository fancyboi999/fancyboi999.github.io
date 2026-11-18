// 给 /inspiration/ 条目拍截图和录屏：
//   node scripts/capture-inspiration.mjs <id> <url> [--video] [--scroll 0.4] [--headed]
// 截图：1440×900 视口，缩成 800×500 → public/inspiration/<id>.webp
// 录屏（--video）：页面稳定后用滚轮匀速往下滚几秒 → public/inspiration/<id>.webm
// 用全局安装的 Playwright（npm i -g playwright），截图压缩用 cwebp，录屏转码用 ffmpeg；三者都不进项目依赖。
import { execFileSync, execSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { createRequire } from "node:module";
import { parseArgs } from "node:util";

const { values: opts, positionals } = parseArgs({
  allowPositionals: true,
  options: { video: { type: "boolean", default: false }, scroll: { type: "string", default: "0" }, settle: { type: "string", default: "4000" }, headed: { type: "boolean", default: false } },
});
const [id, url] = positionals;
if (!id || !url) {
  console.error("用法：node scripts/capture-inspiration.mjs <id> <url> [--video] [--scroll 0..1] [--settle 毫秒] [--headed]");
  process.exit(2);
}
const scrollAt = Number(opts.scroll);
const settle = Number(opts.settle);
const out = path.resolve(import.meta.dirname, "../public/inspiration");
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), `insp-${id}-`));
const { chromium } = createRequire(path.join(execSync("npm root -g").toString().trim(), "/"))("playwright");

const VIEW = { width: 1440, height: 900 };
// 有的网站拦无头浏览器（返回 403），--headed 换成有界面的真 Chrome
const browser = await chromium.launch(opts.headed ? { channel: "chrome", headless: false } : {});
try {
  const context = await browser.newContext({
    viewport: VIEW,
    ...(opts.video ? { recordVideo: { dir: tmp, size: VIEW } } : {}),
  });
  const page = await context.newPage();
  const opened = Date.now();
  await page.goto(url, { waitUntil: "load", timeout: 60_000 });
  await page.waitForTimeout(settle);

  if (scrollAt > 0) {
    await page.evaluate((f) => window.scrollTo(0, (document.documentElement.scrollHeight - innerHeight) * f), scrollAt);
    await page.waitForTimeout(1500);
  }
  const png = path.join(tmp, "shot.png");
  await page.screenshot({ path: png });
  execFileSync("cwebp", ["-quiet", "-q", "82", "-resize", "800", "500", png, "-o", path.join(out, `${id}.webp`)]);

  if (opts.video) {
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(1200);
    const start = (Date.now() - opened) / 1000;
    for (let i = 0; i < 60; i++) {
      await page.mouse.wheel(0, 120);
      await page.waitForTimeout(100);
    }
    await page.waitForTimeout(800);
    const length = (Date.now() - opened) / 1000 - start;
    const raw = await page.video().path();
    await context.close();
    execFileSync("ffmpeg", [
      "-loglevel", "error", "-y", "-ss", start.toFixed(2), "-t", length.toFixed(2), "-i", raw,
      "-an", "-vf", "scale=800:500", "-c:v", "libvpx-vp9", "-b:v", "0", "-crf", "42", "-row-mt", "1",
      path.join(out, `${id}.webm`),
    ]);
  } else {
    await context.close();
  }
} finally {
  await browser.close();
  fs.rmSync(tmp, { recursive: true, force: true });
}
for (const ext of ["webp", ...(opts.video ? ["webm"] : [])]) {
  const f = path.join(out, `${id}.${ext}`);
  console.log(`${path.relative(process.cwd(), f)}  ${(fs.statSync(f).size / 1024).toFixed(0)} KB`);
}
