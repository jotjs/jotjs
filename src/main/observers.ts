import { spy } from "./state.ts";

const nodeDisposables = new WeakMap<Node, VoidFunction[]>();

/**
 *
 * @param node
 * @param observers
 */
export function addObservers(node: Node, ...observers: VoidFunction[]) {
  let disposables = nodeDisposables.get(node);

  if (!disposables) {
    nodeDisposables.set(node, (disposables = []));
  }

  disposables.push(...observers.map(spy).map(toDisposable));
}

/**
 *
 * @param node
 * @returns
 */
export function removeObservers(node: Node): void {
  for (const dispose of nodeDisposables.get(node) || []) {
    dispose();
  }

  nodeDisposables.delete(node);
}

function toDisposable(derived: [unknown, VoidFunction]): VoidFunction {
  return derived[1];
}
