import { type Hook, hook } from "./hook.ts";

const listeners = new WeakMap<
  Node,
  [string, EventListenerOrEventListenerObject][]
>();

/**
 *
 * @param node
 * @returns
 */
export function removeEventListeners(node: Node): void {
  for (const [type, listener] of listeners.get(node) || []) {
    node.removeEventListener(type, listener);
  }
}

/**
 *
 * @param type
 * @param listener
 * @param options
 */
export function on<E extends HTMLElement, K extends keyof HTMLElementEventMap>(
  type: K,
  listener: (this: E, event: HTMLElementEventMap[K]) => unknown,
  options?: boolean | AddEventListenerOptions,
): Hook<E>;

/**
 *
 * @param type
 * @param listener
 * @param options
 */
export function on<N extends Node>(
  type: string,
  listener: EventListenerOrEventListenerObject,
  options?: boolean | AddEventListenerOptions,
): Hook<N> {
  return hook((node) => {
    node.addEventListener(type, listener, options);

    if (listeners.get(node)?.push([type, listener]) === undefined) {
      listeners.set(node, [[type, listener]]);
    }
  });
}
