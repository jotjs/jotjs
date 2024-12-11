import { type Hook, hook } from "./hook.ts";

/**
 *
 */
export type Properties<N extends Node> = {
  [K in keyof N]?: N[K] | Property<N, K>;
};

/**
 *
 */
export interface Property<N extends Node, K extends keyof N> {
  bindTo(key: K): Hook<N>;
}

/**
 *
 */
export interface PropertyExpression<V> {
  (value: V): V | undefined | void;
}

/**
 *
 * @param expression
 * @returns
 */
export function watch<N extends Node, K extends keyof N>(
  expression: PropertyExpression<N[K]>,
): Property<N, K> {
  return {
    bindTo(key: K) {
      return hook((node) => {
        const value = expression(node[key]);

        if (value !== undefined) {
          node[key] = value;
        }
      }, true);
    },
  };
}
