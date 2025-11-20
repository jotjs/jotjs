import { Component } from "./component.ts";
import type { Handler } from "./handler.ts";
import { Message } from "./message.ts";

const subject = "REDIRECT";

export function getRedirectSubject(): object {
  return {
    [subject](url: string) {
      if (url && url !== location.href) {
        history.pushState(null, "", url);
      }
    },
  };
}

export function Redirect(url?: string): Handler {
  return Component(({ request: { url: base } }) =>
    Message({ subject, content: url ? String(new URL(url, base)) : base }),
  );
}
