// 校验 content/inspiration.json：字段齐全、取值合法、截图和录屏都在。
// 收录规范见 .agents/skills/collect-inspiration/SKILL.md；这里只管机器能查的部分，不合格就让 dev/build 失败。
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const file = path.join(root, "content/inspiration.json");
export const KINDS = ["组件", "模式", "体裁", "母题", "技法"];

const isDate = (v) => typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(Date.parse(v));
const isText = (v) => typeof v === "string" && v.trim() !== "";
const isUrl = (v) => {
  try {
    return ["https:", "http:"].includes(new URL(v).protocol);
  } catch {
    return false;
  }
};
const isTextList = (v, min = 1) => Array.isArray(v) && v.length >= min && v.every(isText);

export function checkInspiration(data, exists = (p) => fs.existsSync(path.join(root, p))) {
  const errors = [];
  const items = Array.isArray(data?.items) ? data.items : [];
  if (items.length === 0) errors.push("items 为空");

  const link = (where, l, { kind = false, captured = true } = {}) => {
    if (!isText(l?.title)) errors.push(`${where}: 缺 title`);
    if (!isUrl(l?.url)) errors.push(`${where}: url 不是 http(s) 地址`);
    if (captured && !isDate(l?.captured)) errors.push(`${where}: captured 要写浏览器里核实的日期 YYYY-MM-DD`);
    if (l?.archive !== undefined && !isUrl(l.archive)) errors.push(`${where}: archive 不是地址`);
    if (kind && !isText(l?.kind)) errors.push(`${where}: 缺 kind（变体）`);
    if (!kind && l?.kind !== undefined) errors.push(`${where}: 只有 similar 写 kind`);
  };

  items.forEach((it, n) => {
    const at = `items[${n}] ${it?.id ?? "?"}`;
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(it?.id ?? "")) errors.push(`${at}: id 用小写英文和连字符`);
    if (items.findIndex((x) => x?.id === it?.id) !== n) errors.push(`${at}: id 重复`);
    if (!KINDS.includes(it?.kind)) errors.push(`${at}: kind 只能是 ${KINDS.join(" / ")}`);
    for (const k of ["name", "summary", "principle", "recipe", "avoid"]) if (!isText(it?.[k])) errors.push(`${at}: 缺 ${k}`);
    if (!isDate(it?.date)) errors.push(`${at}: date 不是 YYYY-MM-DD`);
    for (const k of ["aka", "tags", "uses", "search"]) if (!isTextList(it?.[k])) errors.push(`${at}: ${k} 至少一项`);
    const aka = new Set((it?.aka ?? []).map((a) => a.toLowerCase()));
    for (const u of it?.uses ?? []) {
      if (aka.has(u.toLowerCase())) errors.push(`${at}: "${u}" 同时在 aka 和 uses；aka 只放同义词，uses 放用到的更底层的东西`);
      if (u === it?.id) errors.push(`${at}: uses 不能指向自己`);
    }
    if (!Array.isArray(it?.parts) || it.parts.length === 0) errors.push(`${at}: parts 至少一项`);
    (it?.parts ?? []).forEach((p, j) => {
      if (!isText(p?.name) || !isText(p?.how)) errors.push(`${at} parts[${j}]: 要有 name 和 how`);
    });
    link(`${at} source`, it?.source);
    if (!Array.isArray(it?.similar) || it.similar.length === 0) errors.push(`${at}: similar 至少一项`);
    (it?.similar ?? []).forEach((s, j) => link(`${at} similar[${j}]`, s, { kind: true }));
    if (!Array.isArray(it?.kits)) errors.push(`${at}: kits 要是数组`);
    (it?.kits ?? []).forEach((k, j) => link(`${at} kits[${j}]`, k, { captured: false }));
    if (!exists(`public/inspiration/${it?.id}.webp`)) errors.push(`${at}: 缺截图 public/inspiration/${it?.id}.webp`);
    if (it?.source?.video && !exists(`public/inspiration/${it.id}.webm`)) errors.push(`${at}: source.video 为 true，但缺录屏 public/inspiration/${it.id}.webm`);
  });
  return errors;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const errors = checkInspiration(JSON.parse(fs.readFileSync(file, "utf8")));
  if (errors.length) {
    console.error(`content/inspiration.json 有 ${errors.length} 处不合规范：\n- ${errors.join("\n- ")}`);
    process.exit(1);
  }
  console.log("inspiration.json ok");
}
