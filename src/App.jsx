import { Route, Routes } from "react-router";
import Layout from "./components/Layout.jsx";
import Home from "./routes/Home.jsx";
import Post from "./routes/Post.jsx";
import About from "./routes/About.jsx";
import NotFound from "./routes/NotFound.jsx";
import { Archives, TermIndex, TermPage } from "./routes/Lists.jsx";

import "@fontsource-variable/geist";
import "@fontsource-variable/geist-mono";
import "@fontsource/instrument-serif/400.css";
import "@fontsource/instrument-serif/400-italic.css";
import "./fx/word-swap.css";
import "./fx/motion.css";
import "./styles/global.css";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="posts/:slug" element={<Post />} />
        <Route path="archives" element={<Archives />} />
        <Route path="tags" element={<TermIndex kind="tags" />} />
        <Route path="tags/:term" element={<TermPage kind="tags" />} />
        <Route path="categories" element={<TermIndex kind="categories" />} />
        <Route path="categories/:term" element={<TermPage kind="categories" />} />
        <Route path="about" element={<About />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
