import { addObservers } from "./observers.ts";
import { remove } from "./remove.ts";

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
  [hookTo](node: N): Option<N>;
}

interface NodeConsumer {
  (node: Node): void;
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

const hookTo: unique symbol = Symbol();

function apply<N extends Node>(
  node: N,
  option: Option<N>,
  applyNode: NodeConsumer,
): void {
  if (option == null) {
    return;
  }

  switch (typeof option) {
    case "function":
      return applyCallback(node, option, applyNode);

    case "object":
      if (hookTo in option) {
        return apply(node, option[hookTo](node), applyNode);
      }

      if ("nodeType" in option) {
        return applyNode(option);
      }

      if (Array.isArray(option)) {
        for (const nested of option) {
          apply(node, nested, applyNode);
        }
      } else {
        Object.assign(node, option);
      }

      return;
  }

  if (node.ownerDocument) {
    applyNode(node.ownerDocument.createTextNode(String(option)));
  }
}

function applyCallback<N extends Node>(
  node: N,
  callback: Callback<N>,
  applyNode: NodeConsumer,
): void {
  const children: Node[] = [];

  let start: Text;
  let end: Text;

  function applyChildNode(child: Node) {
    children.push(child);
  }

  function update() {
    const document = node.ownerDocument;

    if (!document) {
      return;
    }

    if (!start) {
      if (children.length === 0) {
        return;
      }

      applyNode((start = document.createTextNode("")));
      applyNode((end = document.createTextNode("")));
    }

    const range = document.createRange();

    range.setStartAfter(start);
    range.setEndBefore(end);

    const contents = range.extractContents();

    setTimeout(remove, 100, contents);

    if (children.length === 0) {
      return;
    }

    const fragment = document.createDocumentFragment();

    fragment.append(...children);
    range.insertNode(fragment);
  }

  addObservers(node, () => {
    apply(node, callback(node), applyChildNode);
    update();

    children.length = 0;
  });
}

/**
 *
 * @param callback
 * @returns
 */
export function hook<N extends Node>(callback: Callback<N>): Hook<N> {
  return {
    [hookTo]: callback,
  };
}

/**
 *
 * @param node
 * @param options
 * @returns
 */
export function jot<N extends Node>(node: N, ...options: Option<N>[]): N {
  function applyNode(child: Node) {
    node.appendChild(child);
  }

  for (const option of options) {
    apply(node, option, applyNode);
  }

  return node;
}
