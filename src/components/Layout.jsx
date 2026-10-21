import { useEffect, useRef } from "react";
import { Link, NavLink, Outlet } from "react-router";
import Lenis from "lenis";
import { site } from "../site.js";
import { PixelSprite } from "./fx.jsx";

const LOGO_COLORS = ["#00aaff", "#77ccff", "#000000"];

export const Arrow = ({ className = "nudge" }) => (
  <svg className={className} viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" aria-hidden="true">
    <path d="M4 12 12 4M6 4h6v6" />
  </svg>
);

function Nav() {
  return (
    <header className="nav">
      <nav className="nav-pill glass" aria-label="主导航">
        <Link className="nav-logo" to="/" aria-label={`${site.title} 首页`}>
          <PixelSprite seed={9} n={7} colors={LOGO_COLORS} />
          <span>fancy</span>
        </Link>
        <NavLink to="/archives/">文章</NavLink>
        <NavLink to="/tags/">标签</NavLink>
        <NavLink to="/stack/">工具箱</NavLink>
        <NavLink to="/about/">关于</NavLink>
      </nav>
      <div className="nav-cta">
        <a className="pill" href={site.github} target="_blank" rel="noopener">GitHub</a>
        <a className="pill is-round" href="/feed.xml" aria-label="RSS 订阅"><Arrow /></a>
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="site-foot">
      <span>© {__BUILD_YEAR__} {site.title}</span>
      <span className="foot-motto">{site.motto}</span>
      <span>
        <a href="/feed.xml">RSS</a> · <a href="/sitemap.xml">Sitemap</a> · <a href={site.github} target="_blank" rel="noopener">GitHub</a>
      </span>
    </footer>
  );
}

// 平滑滚动：页面在卡片内的 [data-stage] 里滚动，Lenis 接管这个容器；reduced-motion 下不启用
function useSmoothScroll(root) {
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const wrapper = root.current.closest("[data-stage]");
    const l = new Lenis({ wrapper, content: root.current, autoRaf: true, anchors: { offset: -96 } });
    return () => l.destroy();
  }, [root]);
}

export default function Layout() {
  const root = useRef(null);
  useSmoothScroll(root);
  return (
    <div className="page-root" ref={root}>
      <a className="skip" href="#main">跳到正文</a>
      <Nav />
      <main id="main">
        <Outlet />
      </main>
    </div>
  );
}
