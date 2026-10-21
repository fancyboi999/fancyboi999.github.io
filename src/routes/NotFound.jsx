import { Link } from "react-router";
import { PixelSky, WordSwap } from "../components/fx.jsx";

export default function NotFound() {
  return (
    <section className="lost">
      <PixelSky className="lost-sky" options={{ cell: 24, seed: 404, reveal: "radial", drift: 10, cover: 0.5 }} play={{ ms: 700 }} />
      <div className="lost-copy">
        <WordSwap as="h1" className="lost-title" before={["Lost", "in", "the", "clouds"]} />
        <p>这个页面不存在，或者已经搬家了。</p>
        <Link className="pill" to="/">回到首页</Link>
      </div>
    </section>
  );
}
