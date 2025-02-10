import { removeEventListeners } from "./on.ts";
import { dispose, spy, type Disposable } from "./state.ts";

/**
 *
 */
export interface Callback<N extends Node> {
  (node: N): Option<N>;
}

/**
 *
 */
export interface Hook<N extends Node> {
  [hook](node: N): Option<N>;
}

/**
 *
 */
export type Option<N extends Node> =
  | bigint
  | boolean
  | Callback<N>
  | Hook<N>
  | Node
  | null
  | number
  | Option<N>[]
  | Properties<N>
  | string
  | symbol
  | undefined
  | void;

/**
 *
 */
export type Properties<N extends Node> = Partial<Omit<N, "nodeType">>;

/**
 *
 */
export const global: { window: Window } = { window };

const reserve = new WeakSet<Node>();
const disposables = new WeakMap<Node, Disposable[]>();

/**
 *
 */
export const hook: unique symbol = Symbol();

function apply<N extends Node>(node: N, option: Option<N>): void {
  if (option == null) {
    return;
  }

  switch (typeof option) {
    case "function":
      return applyCallback(node, option);

    case "object":
      if (hook in option) {
        return apply(node, option[hook](node));
      }

      if ("nodeType" in option) {
        return void node.appendChild(option);
      }

      if (Array.isArray(option)) {
        return void jot(node, ...option);
      }

      return void Object.assign(node, option);
  }

  node.appendChild(global.window.document.createTextNode(String(option)));
}

function applyCallback<N extends Node>(node: N, callback: Callback<N>): void {
  let spies = disposables.get(node);

  if (!spies) {
    disposables.set(node, (spies = []));
  }

  const reference = new WeakRef(node);

  spies.push(
    spy(() => {
      const node = reference.deref();

      if (node) {
        apply(node, callback(node));
      }
    }),
  );
}

/**
 *
 * @param node
 * @param options
 * @returns
 */
export function jot<N extends Node>(node: N, ...options: Option<N>[]): N {
  for (const option of options) {
    apply(node, option);
  }

  return node;
}

/**
 *
 * @param node
 * @param force
 */
export function remove(node: Node, force?: boolean): void {
  if (!force && reserve.has(node)) {
    return;
  }

  for (const child of [...node.childNodes]) {
    remove(child, force);
  }

  removeSpies(node);
  removeEventListeners(node);
  node.parentNode?.removeChild(node);
}

function removeSpies(node: Node): void {
  for (const disposable of disposables.get(node) || []) {
    dispose(disposable);
  }

  disposables.delete(node);
}

/**
 *
 * @param node
 * @returns
 */
export function reusable<N extends Node>(node: N): N {
  return reserve.add(node), node;
}
