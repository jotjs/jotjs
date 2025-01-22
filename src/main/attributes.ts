import type { Hook } from "./jot.ts";

/**
 *
 * @param attributes
 * @param namespace
 * @returns
 */
export function set<E extends Element>(
  attributes: Record<string, unknown>,
  namespace?: string | null,
): Hook<E> {
  namespace = namespace || null;

  return (element): void => {
    for (const name in attributes) {
      const value = attributes[name];

      if (value == null) {
        return element.removeAttributeNS(namespace, name);
      }

      element.setAttributeNS(namespace, name, String(value));
    }
  };
}
