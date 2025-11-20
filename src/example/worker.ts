import {
  Booster,
  Component,
  configurePartial,
  Forward,
  Fragment,
  getUrl,
  html,
  HtmlReply,
  Partial,
  Reply,
  Server,
} from "../main/mod.ts";

const notAllowed = Reply(null, { status: 405 });
const notFound = html`<div class="text-xl font-bold">NOT FOUND</div>`;

const shell = html`
  <!doctype html>
  <html lang="en">
    <head>
      <script src="/client.js" type="module"></script>
      <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser"></script>
    </head>
    <body class="bg-slate-700 text-slate-50 p-8">
      <ul>
        ${Fragment(
          //
          Link("/", "home"),
          Link("/foo", "foo"),
          Link("/bar", "bar"),
        )}
      </ul>
      <main></main>
    </body>
  </html>
`;

const routes = Booster(
  Component((event) => {
    const url = getUrl(event);

    switch (url.pathname) {
      case "/":
      case "/foo":
      case "/bar": {
        return home;
      }
    }

    return Partial(notFound);
  }),
  shell,
);

const router = Component(async (event) => {
  const url = getUrl(event);

  if (url.origin !== location.origin || url.pathname.includes(".")) {
    const response = await fetch(event.request);

    if (response.headers.get("content-type")?.includes("text/html")) {
      return HtmlReply(String(notFound), { status: 404 });
    }

    return Forward(response);
  }

  switch (event.request.method) {
    case "GET": {
      return routes;
    }
  }

  return notAllowed;
});

const home = Component((event) =>
  Partial(html`<div>PATH => ${getUrl(event).pathname}</div>`),
);

function Link(href: string, text: string) {
  return html`
    <li class="my-2">
      <a href="${href}">${text}</a>
    </li>
  `;
}

configurePartial({ target: "main" });

declare const addEventListener: ServiceWorkerGlobalScope["addEventListener"];

addEventListener("fetch", Server(router));
