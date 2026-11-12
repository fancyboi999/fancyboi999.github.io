// 收藏的 prompt：content/prompts.json 是唯一来源。
// body 是原文（复制的就是它），zh 是中文意思，source 指向出处。
import data from "../content/prompts.json";

export const prompts = data.items.map((p, i) => ({
  ...p,
  no: String(i + 1).padStart(2, "0"),
}));

export const promptTags = [...new Set(prompts.flatMap((p) => p.tags))];
