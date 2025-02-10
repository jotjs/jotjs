import { hook, type Hook } from "./mod.ts";

/**
 *
 * @param attributes
 * @param namespace
 * @returns
 */
export function attributes<E extends Element>(
  attributes: Record<string, unknown>,
  namespace?: string | null,
): Hook<E> {
  namespace ||= null;

  return hook((element) => {
    for (const [name, value] of Object.entries(attributes)) {
      if (value == null) {
        return element.removeAttributeNS(namespace, name);
      }

      element.setAttributeNS(namespace, name, String(value));
    }
  });
}
