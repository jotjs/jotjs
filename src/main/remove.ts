import { removeObservers } from "./observers.ts";
import { removeEventListeners } from "./on.ts";
import { isReusable } from "./reusable.ts";

/**
 *
 * @param node
 * @param force
 */
export function remove(node: Node, force?: boolean): void {
  if (!force && isReusable(node)) {
    return;
  }

  for (const child of [...node.childNodes]) {
    remove(child, force);
  }

  removeObservers(node);
  removeEventListeners(node);
  node.parentNode?.removeChild(node);
}
