import { Link, useParams } from "react-router";
import { posts, postBySlug, tags, categories, formatDate, yearOf, termSlug } from "../content.js";
import { Footer } from "../components/Layout.jsx";
import NotFound from "./NotFound.jsx";

function PostRows({ list }) {
  const years = [...new Set(list.map((p) => yearOf(p.date)))];
  return years.map((y) => (
    <section key={y} className="year">
      <h2 className="year-h">{y}</h2>
      {list.filter((p) => yearOf(p.date) === y).map((p) => (
        <Link key={p.slug} className="row" to={`/posts/${p.slug}/`}>
          <time className="row-date" dateTime={p.date}>{formatDate(p.date).slice(5)}</time>
          <span className="row-title">{p.title}</span>
          <span className="row-tags">{p.tags.slice(0, 2).map((t) => <span key={t} className="chip">{t}</span>)}</span>
        </Link>
      ))}
    </section>
  ));
}

function Page({ kicker, title, children }) {
  return (
    <div className="page">
      <header className="page-head">
        {kicker ? <p className="kicker">{kicker}</p> : null}
        <h1 className="page-title">{title}</h1>
      </header>
      {children}
      <div className="page-foot"><Footer /></div>
    </div>
  );
}

function TermCloud({ list, base }) {
  return (
    <ul className="cloud">
      {list.map((t) => (
        <li key={t.slug}><Link className="chip chip-lg" to={`/${base}/${t.slug}/`}>{t.name}<b>{t.posts.length}</b></Link></li>
      ))}
    </ul>
  );
}

export function Archives() {
  return (
    <Page kicker={`${posts.length} 篇`} title="Archive">
      <TermCloud list={tags.slice(0, 12)} base="tags" />
      <PostRows list={posts} />
    </Page>
  );
}

export function TermIndex({ kind }) {
  const list = kind === "tags" ? tags : categories;
  return (
    <Page kicker={`${list.length} 个`} title={kind === "tags" ? "Tags" : "Categories"}>
      <TermCloud list={list} base={kind} />
    </Page>
  );
}

export function TermPage({ kind }) {
  const { term } = useParams();
  const list = kind === "tags" ? tags : categories;
  const hit = list.find((t) => t.slug === termSlug(decodeURIComponent(term)));
  if (!hit) return <NotFound />;
  return (
    <Page kicker={kind === "tags" ? "标签" : "分类"} title={kind === "tags" ? `#${hit.name}` : hit.name}>
      <PostRows list={hit.posts.map((s) => postBySlug[s])} />
      <p className="back"><Link to={`/${kind}/`}>← 全部{kind === "tags" ? "标签" : "分类"}</Link></p>
    </Page>
  );
}
