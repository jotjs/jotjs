import type { Handler } from "./handler.ts";

export type Component = Handler<Handler | PromiseLike<Handler>>;

export function Component(component: Component): Handler {
  return async (event) => (await component(event))(event);
}

export function nil() {}
