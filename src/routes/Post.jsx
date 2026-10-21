import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router";
import { posts, postBySlug, getBody, loadBody, formatDate, seedOf, termSlug } from "../content.js";
import { PixelSky } from "../components/fx.jsx";
import { Footer } from "../components/Layout.jsx";
import Stamp, { turnOf } from "../components/Stamp.jsx";
import NotFound from "./NotFound.jsx";

// 正文缓存在 content.js；这里只在缓存未命中时加载，加载完触发一次重渲染
function useBody(slug) {
  const [, setLoaded] = useState(null);
  useEffect(() => {
    if (getBody(slug)) return;
    let alive = true;
    loadBody(slug).then(() => alive && setLoaded(slug));
    return () => { alive = false; };
  }, [slug]);
  return getBody(slug);
}

// 目录高亮：当前视口上部 1/3 处所在的章节
function useActiveHeading(root, toc) {
  const [active, setActive] = useState(null);
  useEffect(() => {
    if (!toc?.length || !root.current) return;
    const scroller = root.current.closest("[data-stage]");
    const els = toc.map((t) => root.current.querySelector(`[id="${CSS.escape(t.slug)}"]`)).filter(Boolean);
    const onScroll = () => {
      const line = innerHeight * 0.3;
      let cur = els[0]?.id;
      for (const el of els) if (el.getBoundingClientRect().top < line) cur = el.id;
      setActive(cur);
    };
    onScroll();
    scroller.addEventListener("scroll", onScroll, { passive: true });
    return () => scroller.removeEventListener("scroll", onScroll);
  }, [root, toc]);
  return active;
}

export default function Post() {
  const { slug } = useParams();
  const post = postBySlug[slug];
  const body = useBody(slug);
  const root = useRef(null);
  const active = useActiveHeading(root, body?.toc);
  if (!post) return <NotFound />;

  const i = posts.indexOf(post);
  const newer = posts[i - 1], older = posts[i + 1];
  const seed = seedOf(slug) % 100000;

  return (
    <article className="post" ref={root}>
      <header className="post-head">
        <PixelSky className="post-head-sky" options={{ cell: 18, seed, reveal: "rows", steps: 5, cover: 0.5, feather: 0, shape: (x, y) => y * 0.55 - 0.2 }} play={{ ms: 600 }} />
        <div className="post-head-inner">
          <div className="chips">
            {post.categories.map((c) => <Link key={c} className="chip" to={`/categories/${termSlug(c)}/`}>{c}</Link>)}
            {post.tags.map((t) => <Link key={t} className="chip chip-ghost" to={`/tags/${termSlug(t)}/`}>#{t}</Link>)}
          </div>
          <h1 className="post-h1">{post.title}</h1>
          {post.description ? <p className="post-lead">{post.description}</p> : null}
          <p className="post-meta"><time dateTime={post.date}>{formatDate(post.date)}</time> · 约 {post.readMin} 分钟</p>
        </div>
      </header>

      <div className="post-layout">
        {body?.toc?.length ? (
          <nav className="toc" aria-label="目录">
            <p className="toc-h">目录</p>
            <ol>
              {body.toc.map((t) => (
                <li key={t.slug} className={`toc-l${t.level} ${active === t.slug ? "is-active" : ""}`}>
                  <a href={`#${t.slug}`}>{t.title}</a>
                </li>
              ))}
            </ol>
          </nav>
        ) : null}
        {body ? (
          <div className="prose" dangerouslySetInnerHTML={{ __html: body.html }} />
        ) : (
          <div className="prose prose-loading" aria-busy="true">加载中…</div>
        )}
      </div>

      <nav className="post-nav" aria-label="更多文章">
        {newer ? <div><p className="post-nav-h">较新</p><Stamp post={newer} turn={turnOf(newer.slug, 0)} /></div> : <div />}
        {older ? <div><p className="post-nav-h">较早</p><Stamp post={older} turn={turnOf(older.slug, 1)} /></div> : <div />}
      </nav>
      <div className="page-foot"><Footer /></div>
    </article>
  );
}
