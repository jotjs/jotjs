import type { Handler } from "./handler.ts";

export const getUrl: Handler<URL> = Memoized(
  (event) => new URL(event.request.url),
);

export function Memoized<V>(handler: Handler<V>): Handler<V> {
  const values = new WeakMap<FetchEvent, V>();

  return (event) => {
    let value = values.get(event);

    if (value === undefined) {
      values.set(event, (value = handler(event)));
    }

    return value;
  };
}
