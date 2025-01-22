import { spy } from "./observable.ts";

/**
 *
 */
export interface Hook<N extends Node> {
  (node: N): void;
}

/**
 *
 */
export type Option<N extends Node> =
  | bigint
  | boolean
  | Hook<N>
  | Node
  | null
  | number
  | string
  | symbol
  | undefined
  | void;

function apply<N extends Node>(node: N, option: Option<N>): void {
  if (option == null) {
    return;
  }

  switch (typeof option) {
    case "function":
      return option(node);

    case "object":
      return void node.appendChild(option);
  }

  return void node.appendChild(new Text(String(option)));
}

/**
 *
 * @param options
 * @returns
 */
export function group<N extends Node>(...options: Option<N>[]): Hook<N> {
  return (node): void => {
    for (const option of options) {
      apply(node, option);
    }
  };
}

/**
 *
 * @param node
 * @param options
 * @returns
 */
export function jot<N extends Node>(node: N, ...options: Option<N>[]): N {
  return group(...options)(node), node;
}

/**
 *
 * @param hook
 * @returns
 */
export function watch<N extends Node>(hook: Hook<N>): Hook<N> {
  return (node): void => {
    const reference = new WeakRef(node);

    Object.assign(node, {
      [Symbol()]: spy(() => {
        const node = reference.deref();

        if (node) {
          apply(node, hook(node));
        }
      }),
    });
  };
}
