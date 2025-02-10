import { jot, type Option } from "./jot.ts";

/**
 *
 */
export type Tags<E extends Record<keyof E, Node>> = {
  readonly [T in keyof E]: (...options: Option<E[T]>[]) => E[T];
};

/**
 *
 * @param document
 * @param namespace
 */
export function tags(
  document: Document,
  namespace?: "http://www.w3.org/1999/xhtml",
): Tags<HTMLElementTagNameMap> & Tags<HTMLElementDeprecatedTagNameMap>;

/**
 *
 * @param document
 * @param namespace
 */
export function tags(
  document: Document,
  namespace: "http://www.w3.org/1998/Math/MathML",
): Tags<MathMLElementTagNameMap>;

/**
 *
 * @param document
 * @param namespace
 */
export function tags(
  document: Document,
  namespace: "http://www.w3.org/2000/svg",
): Tags<SVGElementTagNameMap>;

/**
 *
 * @param document
 * @param namespace
 */
export function tags(
  document: Document,
  namespace: string | null,
): Tags<Record<string, Element>>;

export function tags(document: Document, namespace?: string | null) {
  const createElement: (tag: string) => Element =
    namespace === undefined
      ? (tag) => document.createElement(tag)
      : (tag) => document.createElementNS(namespace, tag);

  return new Proxy(
    {},
    {
      get(_, property) {
        if (typeof property !== "string") {
          return undefined;
        }

        return (...options: Option<Node>[]) => {
          return jot(createElement(property), ...options);
        };
      },
    },
  );
}
