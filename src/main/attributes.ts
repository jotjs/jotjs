import { type Hook, hook } from "./hook.ts";

/**
 *
 */
export interface Attributes {
  [key: string]: unknown;
}

/**
 *
 * @param attributes
 * @param namespace
 * @returns
 */
export function set<E extends Element>(
  attributes: Attributes,
  namespace?: string | null,
): Hook<E>[] {
  namespace = namespace || null;

  return Object.entries(attributes).map(([name, value]) => {
    if (value == null) {
      return hook((element) => element.removeAttributeNS(namespace, name));
    }

    if (typeof value === "function") {
      return hook((element) => {
        const computed = value(element.getAttributeNS(namespace, name));

        if (computed == null) {
          return element.removeAttributeNS(namespace, name);
        }

        element.setAttributeNS(namespace, name, String(computed));
      }, true);
    }

    return hook((element) =>
      element.setAttributeNS(namespace, name, String(value)),
    );
  });
}
