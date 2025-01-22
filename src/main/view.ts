import { group, type Hook, jot, type Option, watch } from "./jot.ts";
import { removeEventListeners } from "./on.ts";

const end: unique symbol = Symbol();
const reuse: unique symbol = Symbol();

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
export function view<N extends Node>(
  view: (node: N) => Option<DocumentFragment>,
): Hook<N> {
  const start = Object.assign(new Text(), { [end]: new Text() });
  const reference = new WeakRef(start);

  return group(
    start,
    watch((node): void => {
      const start = reference.deref();

      if (!start) {
        return;
      }

      const slot = jot(new DocumentFragment(), view(node));

      if (!start[end].parentNode) {
        return void jot(node, slot);
      }

      const range = new Range();

      range.setStartAfter(start);
      range.setEndBefore(start[end]);

      const contents = range.extractContents();

      range.insertNode(slot);
      dispose(contents);
    }),
    start[end],
  );
}
