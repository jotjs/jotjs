import type { Message } from "./message.ts";
import { getPartialSubject } from "./partial.ts";
import { getRedirectSubject } from "./redirect.ts";

const index: Record<string, { (content: unknown): void }> = {};

export function addSubjects(subjects: object) {
  Object.assign(index, subjects);
}

export function booster() {
  addSubjects({ ...getPartialSubject(), ...getRedirectSubject() });
  addEventListener("popstate", reload);
  navigator.serviceWorker?.addEventListener("message", receiver);
  reload();
}

export function receiver({
  data: { subject, content },
}: MessageEvent<Message>) {
  index[subject]?.(content);
}

function reload() {
  location.reload();
}

export function ServiceWorkerLoader(
  url: string | URL,
  options?: RegistrationOptions,
): VoidFunction {
  return async () => {
    if (await navigator.serviceWorker?.register(url, options)) {
      location.reload();
    }
  };
}
