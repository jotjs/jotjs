import type { Handler } from "./handler.ts";
import { Reply } from "./server.ts";

const headers = { "content-type": "text/html" };
const safeHtml = new WeakSet();
const unsafeCharacters = /[!-/:-@[-`{-~]/g;

export function Fragment(...values: unknown[]): Handler {
  return SafeHtmlReply(values.map(toSafeValue).join(""));
}

export function HtmlReply(
  body?: BodyInit | null,
  init?: ResponseInit,
): Handler {
  return Reply(body, {
    ...init,
    headers: new Headers({
      ...init?.headers,
      ...headers,
    }),
  });
}

export function html(
  template: TemplateStringsArray,
  ...values: unknown[]
): Handler {
  return SafeHtmlReply(String.raw(template, ...values.map(toSafeValue)));
}

function SafeHtmlReply(body: string, init?: ResponseInit): Handler {
  const response = Object.assign(HtmlReply(body, init), {
    toString() {
      return body;
    },
  });

  safeHtml.add(response);

  return response;
}

function toSafeValue(value: unknown): string {
  if (value == null) {
    return "";
  }

  const html = String(value);

  if (safeHtml.has(value)) {
    return html;
  }

  return html.replace(unsafeCharacters, withHtmlEntities);
}

function withHtmlEntities(value: string): string {
  return `&#${value.charCodeAt(0)};`;
}
