import { jot } from "./jot.ts";
import { spy } from "./mutable.ts";
import type { Option } from "./option.ts";

/**
 *
 */
export interface Hook<N extends Node> {
  hook(node: N): void;
}

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
  return reactive
    ? {
        hook(node: N) {
          const nodeRef = new WeakRef(node);

          Object.assign(node, {
            [Symbol()]: spy(() => {
              const node = nodeRef.deref();

              if (node) {
                jot(node, callback(node));
              }
            }),
          });
        },
      }
    : {
        hook(node: N) {
          jot(node, callback(node));
        },
      };
}
