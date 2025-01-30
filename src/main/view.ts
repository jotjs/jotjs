import { global, jot, watch, type Option } from "./jot.ts";
import { removeEventListeners } from "./on.ts";
import type { Dependencies } from "./state.ts";

const end = Symbol();
const reuse = Symbol();

/**
 *
 * @param node
 * @param force
 */
export function dispose(node: Node, force?: boolean): void {
  if (!force && reuse in node) {
    return;
  }

  for (const child of [...node.childNodes]) {
    dispose(child, force);
  }

  removeEventListeners(node);
  node.parentNode?.removeChild(node);
}

/**
 *
 * @param node
 * @returns
 */
export function reusable<N extends Node>(node: N): N {
  return Object.assign(node, { [reuse]: null });
}

/**
 *
 * @param view
 * @returns
 */
export function view<N extends Node, T>(
  view: (targets: T, node: N) => Option<DocumentFragment>,
  dependencies: Dependencies<T>,
): Option<N> {
  const { document } = global.window;
  const start = Object.assign(document.createTextNode(""), {
    [end]: document.createTextNode(""),
  });
  const reference = new WeakRef(start);

  return [
    start,
    watch((targets, node) => {
      const start = reference.deref();

      if (!start) {
        return;
      }

      const slot = jot(document.createDocumentFragment(), view(targets, node));

      if (!start[end].parentNode) {
        return slot;
      }

      const range = document.createRange();

      range.setStartAfter(start);
      range.setEndBefore(start[end]);

      const contents = range.extractContents();

      range.insertNode(slot);
      dispose(contents);
    }, dependencies),
    start[end],
  ];
}
