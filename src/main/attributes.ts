import type { Option } from "./jot.ts";

/**
 *
 * @param attributes
 * @param namespace
 * @returns
 */
export function set<E extends Element>(
  attributes: { [key: string]: unknown },
  namespace?: string | null,
): Option<E> {
  namespace = namespace || null;

  return Object.entries(attributes).map(([name, value]) => {
    if (value == null) {
      return (element: E) => element.removeAttributeNS(namespace, name);
    }

    return (element: E) =>
      element.setAttributeNS(namespace, name, String(value));
  });
}
