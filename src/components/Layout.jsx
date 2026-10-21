import { useEffect, useRef } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router";
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

// 平滑滚动：仅接管滚轮，触屏保持原生；reduced-motion 下不启用
function useSmoothScroll() {
  const lenis = useRef(null);
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const l = new Lenis({ autoRaf: true, anchors: { offset: -96 } });
    lenis.current = l;
    window.__lenis = l;
    return () => { l.destroy(); lenis.current = null; window.__lenis = null; };
  }, []);
  useEffect(() => {
    if (hash) return;
    if (lenis.current) lenis.current.scrollTo(0, { immediate: true });
    else window.scrollTo(0, 0);
  }, [pathname, hash]);
}

export default function Layout() {
  useSmoothScroll();
  return (
    <>
      <a className="skip" href="#main">跳到正文</a>
      <Nav />
      <main id="main">
        <Outlet />
      </main>
    </>
  );
}
