import { Link } from "react-router";
import { formatDate, seedOf } from "../content.js";
import { PixelSky } from "./fx.jsx";

// 按编号轮换的四色油墨：deep 印深色，mid 印中间调，底色是纸白
const INKS = [
  { deep: "#00aaff", mid: "#99ddff" },
  { deep: "#ff9900", mid: "#ffd699" },
  { deep: "#ff3fa4", mid: "#ffb3db" },
  { deep: "#2fc47a", mid: "#a6e9c6" },
];

// 每张邮票固定的倾斜角：左右交替，幅度由 slug 决定，每次构建都一样
export const turnOf = (slug, i) => (i % 2 ? 1 : -1) * (0.5 + (seedOf(slug) % 1000) / 2000) * 3;

export default function Stamp({ post, turn = 0 }) {
  const ink = INKS[(post.no - 1) % INKS.length];
  return (
    <Link className="stamp" to={`/posts/${post.slug}/`} aria-label={post.title} style={{ "--turn": `${turn.toFixed(2)}deg`, "--stamp-ink": ink.deep }}>
      <span className="stamp-lift">
        <span className="stamp-sheet" aria-hidden="true">
          <span className="stamp-paper" />
          <span className="stamp-field" style={{ "--sky-deep": ink.deep, "--sky-mid": ink.mid, "--sky-pale": "#fff" }}>
            <PixelSky className="stamp-sky" options={{ cell: 6, seed: seedOf(post.slug) % 100000, reveal: "none", cover: 0.55, feather: 0 }} />
          </span>
          <span className="stamp-words">
            <span className="stamp-told">
              <span className="stamp-issued">{formatDate(post.date).slice(0, 7).replace(".", "-")}</span>
              <span className="stamp-title">{post.legend.map((l) => <span key={l}>{l}</span>)}</span>
            </span>
            <span className="stamp-count">{String(post.no).padStart(2, "0")}</span>
          </span>
        </span>
      </span>
    </Link>
  );
}
