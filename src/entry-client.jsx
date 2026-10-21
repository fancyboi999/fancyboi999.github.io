import { StrictMode } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import App from "./App.jsx";
import { loadBody } from "./content.js";

const app = (
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);

// 预渲染的文章页：先拿到正文再 hydrate，保证和静态 HTML 一致
const m = location.pathname.match(/^\/posts\/([^/]+)\/?$/);
const ready = m ? loadBody(decodeURIComponent(m[1])) : Promise.resolve();

const root = document.getElementById("root");
ready.then(() => {
  if (root.hasChildNodes()) hydrateRoot(root, app);
  else createRoot(root).render(app); // vite dev：没有预渲染内容
});
