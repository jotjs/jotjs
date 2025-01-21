import { spy } from "./observable.ts";

/**
 *
 */
export interface Hook<N extends Node> {
  (node: N): Option<N>;
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
  | Option<N>[]
  | Partial<N>
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
      return applyHook(node, option);

    case "object":
      return applyObject(node, option);
  }

  return void node.appendChild(new Text(String(option)));
}

function applyHook<N extends Node>(node: N, hook: Hook<N>): void {
  const reference = new WeakRef(node);

  Object.assign(node, {
    [Symbol()]: spy(() => {
      const node = reference.deref();

      if (node) {
        apply(node, hook(node));
      }
    }),
  });
}

function applyObject<N extends Node>(
  node: N,
  option: Node | Option<N>[] | Partial<N>,
): void {
  if (isNode(option)) {
    return void node.appendChild(option);
  }

  if (Array.isArray(option)) {
    return void jot(node, ...option);
  }

  Object.assign(node, option);
}

function isNode(target: object): target is Node {
  return "nodeType" in target;
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
