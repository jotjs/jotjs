import { hook } from "./hook.ts";
import type { Hook } from "./mod.ts";
import { removeEventListeners } from "./on.ts";
import {
  bindTo,
  hookTo,
  type Option,
  type Properties,
  type Property,
  type Stringer,
  type View,
} from "./types.ts";

function apply<N extends Node>(node: N, option: Option<N>): unknown {
  if (option == null) {
    return;
  }

  switch (typeof option) {
    case "function":
      return applyView(node, option);

    case "object":
      return applyObject(node, option);

    case "string":
      return node.appendChild(new Text(option));
  }

  node.appendChild(new Text(String(option)));
}

function applyObject<N extends Node>(
  node: N,
  option: Hook<N> | Node | Option<N>[] | Properties<N>,
): unknown {
  if (isNode(option)) {
    return node.appendChild(option);
  }

  if (isHook<N>(option)) {
    return option[hookTo](node);
  }

  if (Array.isArray(option)) {
    return jot(node, ...option);
  }

  for (const key in option) {
    const property = option[key];

    if (isProperty<N, typeof key>(property)) {
      apply(node, property[bindTo](key));
    } else {
      Object.assign(node, { [key]: property });
    }
  }
}

const end = Symbol();

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
  }, true)[hookTo](start);
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

const counter = { value: 0n };

/**
 *
 * @returns
 */
export function id<E extends Element>(): Hook<E> & Stringer {
  const id = String(counter.value++);

  return Object.assign(
    hook<E>((element) => {
      element.id = id;
    }),
    {
      toString() {
        return id;
      },
    },
  );
}

function isHook<N extends Node>(target: object): target is Hook<N> {
  return hookTo in target;
}

function isNode(target: object): target is Node {
  return "nodeType" in target;
}

function isProperty<N extends Node, K extends keyof N>(
  target: unknown,
): target is Property<N, K> {
  return !!target && typeof target === "object" && bindTo in target;
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
