import { derived, dispose, type Disposable } from "./state.ts";

const disposables = new WeakMap<Node, Disposable[]>();

/**
 *
 * @param node
 * @param observers
 */
export function addObservers(node: Node, ...observers: VoidFunction[]) {
  let list = disposables.get(node);

  if (!list) {
    disposables.set(node, (list = []));
  }

  list.push(...observers.map(derived));
}

/**
 *
 * @param node
 * @returns
 */
export function removeObservers(node: Node): void {
  const list = disposables.get(node);

  if (!list) {
    return;
  }

  for (const disposable of list) {
    dispose(disposable);
  }

  disposables.delete(node);
}
