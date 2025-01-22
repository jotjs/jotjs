import type { Hook } from "./jot.ts";

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
export function on<N extends Node, K extends keyof M, M = HTMLElementEventMap>(
  type: K,
  listener: (this: N, event: M[K]) => unknown,
  options?: AddEventListenerOptions | boolean,
): Hook<N>;

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
): Hook<N>;

export function on<N extends Node>(
  type: string,
  listener: EventListenerOrEventListenerObject | null,
  options?: AddEventListenerOptions | boolean,
): Hook<N> {
  return (node): void => {
    node.addEventListener(type, listener, options);

    if (listeners.get(node)?.push([type, listener, options]) === undefined) {
      listeners.set(node, [[type, listener, options]]);
    }
  };
}
