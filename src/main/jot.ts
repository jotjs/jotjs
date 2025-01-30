import { spy, type Dependencies } from "./state.ts";

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
      return apply(node, option(node));

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

  return void node.appendChild(
    global.window.document.createTextNode(String(option)),
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
 * @param callback
 * @returns
 */
export function watch<N extends Node, T>(
  callback: (targets: T, node: N) => Option<N>,
  dependencies: Dependencies<T>,
): Callback<N> {
  return (node): void => {
    const reference = new WeakRef(node);

    Object.assign(node, {
      [Symbol()]: spy((targets) => {
        const node = reference.deref();

        if (node) {
          apply(node, callback(targets, node));
        }
      }, dependencies),
    });
  };
}
