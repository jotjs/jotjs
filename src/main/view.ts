import { global, jot, remove, type Option } from "./jot.ts";

const ends = new WeakMap<Node, Node>();

/**
 *
 * @param view
 * @returns
 */
export function view<N extends Node>(
  view: (node: N) => Option<DocumentFragment>,
): Option<N> {
  const { document } = global.window;
  const start = document.createTextNode("");
  const end = document.createTextNode("");
  const reference = new WeakRef(start);

  ends.set(start, end);

  return [
    start,
    (node) => {
      const start = reference.deref();

      if (!start) {
        return;
      }

      const end = ends.get(start);

      if (!end) {
        return;
      }

      const slot = jot(document.createDocumentFragment(), view(node));

      if (!end.parentNode) {
        return slot;
      }

      const range = document.createRange();

      range.setStartAfter(start);
      range.setEndBefore(end);

      const contents = range.extractContents();

      range.insertNode(slot);
      setTimeout(remove, 100, contents);
    },
    end,
  ];
}
