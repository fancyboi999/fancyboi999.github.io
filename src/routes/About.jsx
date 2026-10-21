import { Link } from "react-router";
import { site } from "../site.js";
import { posts, tags } from "../content.js";
import { Footer } from "../components/Layout.jsx";

export default function About() {
  return (
    <div className="page about">
      <header className="page-head">
        <p className="kicker">关于</p>
        <h1 className="page-title">About</h1>
      </header>
      <div className="prose about-body">
        <p className="about-lead">{site.hero.bio}</p>
        <p>
          这个博客记录技术探索、开源贡献，以及一些还没想明白的事。目前写了 {posts.length} 篇，
          最常出现的话题是 {tags.slice(0, 4).map((t, i) => (
            <span key={t.slug}>{i ? "、" : ""}<Link to={`/tags/${t.slug}/`}>{t.name}</Link></span>
          ))}。
        </p>
        <p>
          想交流可以在 <a href={site.github} target="_blank" rel="noopener">GitHub</a> 找到我，也可以通过 <a href="/feed.xml">RSS</a> 订阅更新。
        </p>
        <p className="about-motto">{site.motto}.</p>
      </div>
      <div className="page-foot"><Footer /></div>
    </div>
  );
}
