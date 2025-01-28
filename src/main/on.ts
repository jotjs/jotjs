import type { Callback } from "./jot.ts";

const listeners = new WeakMap<
  Node,
  [
    string,
    EventListenerOrEventListenerObject | null,
    AddEventListenerOptions | boolean | undefined,
  ][]
>();

/**
 *
 * @param node
 * @returns
 */
export function removeEventListeners(node: Node): void {
  for (const [type, listener, options] of listeners.get(node) || []) {
    node.removeEventListener(type, listener, options);
  }
}

/**
 *
 * @param type
 * @param listener
 * @param options
 */
export function on<N extends Node, T extends keyof E, E = HTMLElementEventMap>(
  type: T,
  listener: (this: N, event: E[T]) => unknown,
  options?: AddEventListenerOptions | boolean,
): Callback<N>;

/**
 *
 * @param type
 * @param listener
 * @param options
 */
export function on<N extends Node>(
  type: string,
  listener: EventListenerOrEventListenerObject | null,
  options?: AddEventListenerOptions | boolean,
): Callback<N>;

export function on<N extends Node>(
  type: string,
  listener: EventListenerOrEventListenerObject | null,
  options?: AddEventListenerOptions | boolean,
): Callback<N> {
  return (node): void => {
    node.addEventListener(type, listener, options);

    if (listeners.get(node)?.push([type, listener, options]) === undefined) {
      listeners.set(node, [[type, listener, options]]);
    }
  };
}
