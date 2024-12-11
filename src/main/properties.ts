import { hook } from "./hook.ts";
import { bindTo, type Property, type PropertyExpression } from "./types.ts";

/**
 *
 * @param expression
 * @returns
 */
export function watch<N extends Node, K extends keyof N>(
  expression: PropertyExpression<N[K]>,
): Property<N, K> {
  return {
    [bindTo](key: K) {
      return hook((node) => {
        const value = expression(node[key]);

        if (value !== undefined) {
          node[key] = value;
        }
      }, true);
    },
  };
}
