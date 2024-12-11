import { hook } from "./hook.ts";
import type { Hook } from "./mod.ts";
import { removeEventListeners } from "./on.ts";
import type { Option } from "./option.ts";
import type { Properties, Property } from "./properties.ts";

/**
 *
 */
export interface View {
  (node: Node): Option<DocumentFragment>;
}

const end = Symbol();

function apply<N extends Node>(node: N, option: Option<N>): void {
  if (option == null) {
    return;
  }

  switch (typeof option) {
    case "function":
      return applyView(node, option);

    case "object":
      return applyObject(node, option);

    case "string":
      return void node.appendChild(new Text(option));
  }

  node.appendChild(new Text(String(option)));
}

function applyObject<N extends Node>(
  node: N,
  option: Hook<N> | Node | Option<N>[] | Properties<N>,
): void {
  if (isNode(option)) {
    return void node.appendChild(option);
  }

  if (isHook<N>(option)) {
    return option.hook(node);
  }

  if (Array.isArray(option)) {
    return void jot(node, ...option);
  }

  for (const key in option) {
    const property = option[key];

    if (isProperty<N, typeof key>(property)) {
      property.bindTo(key).hook(node);
    } else {
      Object.assign(node, { [key]: property });
    }
  }
}

function applyView<N extends Node>(node: N, view: View): void {
  const start = Object.assign(new Text(), { [end]: new Text() });

  node.appendChild(start);
  node.appendChild(start[end]);

  hook<typeof start>((start) => {
    if (!start.parentNode) {
      return;
    }

    const slot = fragment(view(start.parentNode));
    const range = new Range();

    range.setStartAfter(start);
    range.setEndBefore(start[end]);

    const contents = range.extractContents();

    range.insertNode(slot);
    dispose(contents);
  }, true).hook(start);
}

/**
 *
 * @param nodes
 */
export function dispose(...nodes: Node[]): void {
  for (const node of nodes) {
    dispose(...node.childNodes);
    removeEventListeners(node);
    node.parentNode?.removeChild(node);
  }
}

/**
 *
 * @param options
 * @returns
 */
export function fragment(
  ...options: Option<DocumentFragment>[]
): DocumentFragment {
  return jot(new DocumentFragment(), ...options);
}

function isHook<N extends Node>(target: object): target is Hook<N> {
  return "hook" in target;
}

function isNode(target: object): target is Node {
  return "nodeType" in target;
}

function isProperty<N extends Node, K extends keyof N>(
  target: unknown,
): target is Property<N, K> {
  return typeof target === "object" && !!target && "bindTo" in target;
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
