const reusableNodes = new WeakSet<Node>();

/**
 *
 * @param node
 * @returns
 */
export function isReusable(node: Node): boolean {
  return reusableNodes.has(node);
}

/**
 *
 * @param node
 * @returns
 */
export function reusable<N extends Node>(node: N): N {
  return reusableNodes.add(node), node;
}
