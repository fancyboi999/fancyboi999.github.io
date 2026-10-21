import { Link } from "react-router";
import { formatDate, seedOf } from "../content.js";
import { PixelSky } from "./fx.jsx";
import { Arrow } from "./Layout.jsx";

// 每篇文章一张专属像素天空作封面：种子取自 slug，所以每次构建都一样
export default function PostCard({ post, lead = false, style }) {
  const seed = seedOf(post.slug) % 100000;
  return (
    <Link className={`lift post-card ${lead ? "is-lead" : ""}`} to={`/posts/${post.slug}/`} style={style}>
      <div className="lift-card post-media">
        <PixelSky className="post-sky" options={{ cell: lead ? 22 : 16, seed, reveal: "none", cover: 0.55 }} />
        <span className="view-pill"><span>阅读</span><Arrow className="" /></span>
      </div>
      <div className="post-caption">
        <div className="chips">
          {post.tags.slice(0, lead ? 3 : 2).map((t) => <span key={t} className="chip">{t}</span>)}
        </div>
        <h3 className="post-title">{post.title}</h3>
        {lead && post.description ? <p className="post-desc">{post.description}</p> : null}
        <p className="post-meta"><time dateTime={post.date}>{formatDate(post.date)}</time> · {post.readMin} min</p>
      </div>
    </Link>
  );
}
