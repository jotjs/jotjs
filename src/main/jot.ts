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
  append: (node: Node) => void,
  option: Option<N>,
): void {
  if (option == null) {
    return;
  }

  switch (typeof option) {
    case "function": {
      return applyCallback(node, append, option);
    }

    case "object": {
      if ("nodeType" in option) {
        return append(option);
      }

      const applyObject = apply.bind<
        undefined,
        [N, (node: Node) => void],
        [Option<N>],
        void
      >(undefined, node, append);

      if (hookTo in option) {
        return applyObject(option[hookTo](node));
      }

      return Array.isArray(option)
        ? option.forEach(applyObject)
        : void Object.assign(node, option);
    }
  }

  if (node.ownerDocument) {
    append(node.ownerDocument.createTextNode(String(option)));
  }
}

function applyCallback<N extends Node>(
  node: N,
  append: (node: Node) => void,
  callback: Callback<N>,
): void {
  const children: Node[] = [];

  let start: Text;
  let end: Text;

  const push = children.push.bind(children);

  function update() {
    const document = node.ownerDocument;

    if (!document) {
      return;
    }

    if (!start) {
      if (children.length === 0) {
        return;
      }

      append((start = document.createTextNode("")));
      append((end = document.createTextNode("")));
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
    apply(node, push, callback(node));
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
  const append = node.appendChild.bind(node);
  const applyOption = apply.bind<
    undefined,
    [N, (node: Node) => void],
    [Option<N>],
    void
  >(undefined, node, append);

  return options.forEach(applyOption), node;
}
