import type { Callback } from "./jot.ts";

/**
 *
 * @param attributes
 * @param namespace
 * @returns
 */
export function set<E extends Element>(
  attributes: Record<string, unknown>,
  namespace?: string | null,
): Callback<E> {
  namespace = namespace || null;

  return (element): void => {
    for (const [name, value] of Object.entries(attributes)) {
      if (value == null) {
        return element.removeAttributeNS(namespace, name);
      }

      element.setAttributeNS(namespace, name, String(value));
    }
  };
}
