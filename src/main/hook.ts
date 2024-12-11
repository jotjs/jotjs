import { jot } from "./jot.ts";
import { spy } from "./mutable.ts";
import { hookTo, type Hook, type Option } from "./types.ts";

const dependencies = new WeakMap();

/**
 *
 * @param callback
 * @param reactive
 * @returns
 */
export function hook<N extends Node>(
  callback: (node: N) => Option<N>,
  reactive?: boolean,
): Hook<N> {
  return {
    [hookTo](node: N) {
      if (reactive) {
        const bond = Symbol();
        const nodeRef = new WeakRef(node);

        Object.assign(node, { [bond]: undefined });

        dependencies.set(
          bond,
          spy(() => {
            const node = nodeRef.deref();

            if (node) {
              jot(node, callback(node));
            }
          }),
        );
      } else {
        jot(node, callback(node));
      }
    },
  };
}
