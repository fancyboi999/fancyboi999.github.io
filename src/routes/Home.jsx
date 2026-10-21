import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import { site } from "../site.js";
import { posts, tags } from "../content.js";
import { PixelSky, PixelSprite, WordSwap, useInView } from "../components/fx.jsx";
import { Arrow, Footer } from "../components/Layout.jsx";
import Stamp, { turnOf } from "../components/Stamp.jsx";
import { scrollStage, range, steps } from "../fx/scroll-stage.js";

const SLOT_COLORS = ["#00aaff", "#77ccff", "#000000"];

function Hero() {
  const stage = useRef(null);
  const sky = useRef(null);
  const title = useRef(null);
  const [state, setState] = useState({ out: 0, swapped: false });

  useEffect(() => {
    const s = scrollStage(stage.current, {
      onProgress(p, el) {
        setState({ out: range(p, 0, 0.3), swapped: p >= 0.2 });
        el.style.setProperty("--hint", String(1 - range(p, 0, 0.08)));
        // p=0 时把天空交给入场动画；离开顶部后按 4 步消散
        if (p > 0.001) sky.current?.setLevel(1 - steps(range(p, 0.05, 0.65), 4));
      },
    });
    return () => s.destroy();
  }, []);

  // 天空在标题和简介背后留白
  const clear = (cv) => {
    const a = cv.getBoundingClientRect();
    return [...cv.parentElement.querySelectorAll("[data-clear]")].map((el) => {
      const b = el.getBoundingClientRect();
      return { x: b.left - a.left, y: b.top - a.top, w: b.width, h: b.height };
    });
  };

  return (
    <section className="hero" ref={stage}>
      <div className="hero-sticky">
        <PixelSky ref={sky} className="hero-sky" options={{ cell: 24, seed: 7, reveal: "radial", steps: 6, drift: 6, feather: 3, clear }} play={{ ms: 700 }} />
        <div className="hero-copy">
          <div ref={title} data-clear>
            <WordSwap
              before={site.hero.before}
              after={site.hero.after}
              swapped={state.swapped}
              out={state.out}
              slot={<PixelSprite seed={9} n={7} colors={SLOT_COLORS} />}
              className="hero-title"
            />
          </div>
          <p className="hero-bio" data-clear>{site.hero.bio}</p>
        </div>
        <span className="hero-hint" aria-hidden="true">scroll</span>
      </div>
    </section>
  );
}

function Writing() {
  return (
    <section className="writing" aria-labelledby="writing-h">
      <header className="writing-head">
        <h2 id="writing-h">Writing</h2>
        <div className="writing-aside">
          <Link className="pills" to="/archives/">
            <span className="pill">全部 {posts.length} 篇</span>
            <span className="pill is-round" aria-hidden="true"><Arrow /></span>
          </Link>
        </div>
      </header>
      <ul className="stamp-row">
        {posts.map((p, i) => <li key={p.slug}><Stamp post={p} turn={turnOf(p.slug, i)} /></li>)}
      </ul>
    </section>
  );
}

function Values() {
  const topics = tags.slice(0, 8);
  return (
    <section className="values" aria-labelledby="values-h">
      <PixelSky className="seam" options={{ cell: 20, seed: 21, reveal: "none", cover: 0.5, feather: 0, shape: (x, y) => 0.32 - y * 0.62 }} />
      <div className="values-body">
        <h2 id="values-h">少即是多。<br />把复杂的系统，做简单。</h2>
        <div className="values-right">
          <p>我在这里写 agent 工程、AI 编程里的未知、测试与验证，以及开源协作里学到的东西。每篇都尽量回答一个具体问题，并给出能复现的证据。</p>
          <ul className="topic-list">
            {topics.map((t) => (
              <li key={t.slug}><Link className="chip chip-on-blue" to={`/tags/${t.slug}/`}>{t.name}<b>{t.posts.length}</b></Link></li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

function Contact() {
  const ref = useRef(null);
  const [on, setOn] = useState(false);
  useInView(ref, () => setOn(true), { threshold: 0.4 });
  return (
    <section className="contact" ref={ref}>
      <WordSwap
        as="h2"
        className={`contact-title ${on ? "is-live" : ""}`}
        before={["Let’s", "ship", "less,", "but", "better."]}
      />
      <div className="contact-cta">
        <Link className="pill" to="/archives/">读文章</Link>
        <a className="pill pill-ghost" href={site.github} target="_blank" rel="noopener">GitHub <Arrow /></a>
        <a className="pill pill-ghost" href="/feed.xml">RSS <Arrow /></a>
      </div>
      <Footer />
    </section>
  );
}

export default function Home() {
  return (
    <div className="home">
      <Hero />
      <Writing />
      <Values />
      <Contact />
    </div>
  );
}
