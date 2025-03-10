import { jot, type Option } from "./jot.ts";

/**
 *
 */
export type Tags<E extends Record<keyof E, Node>> = {
  readonly [T in keyof E]: (...options: Option<E[T]>[]) => E[T];
};

function tag(this: () => Node, ...options: Option<Node>[]): Node {
  return jot(this(), ...options);
}

/**
 *
 * @param document
 * @param namespace
 * @returns
 */
export function tags(
  document: Document,
  namespace?: "http://www.w3.org/1999/xhtml",
): Tags<HTMLElementTagNameMap> & Tags<HTMLElementDeprecatedTagNameMap>;

/**
 *
 * @param document
 * @param namespace
 * @returns
 */
export function tags(
  document: Document,
  namespace: "http://www.w3.org/1998/Math/MathML",
): Tags<MathMLElementTagNameMap>;

/**
 *
 * @param document
 * @param namespace
 * @returns
 */
export function tags(
  document: Document,
  namespace: "http://www.w3.org/2000/svg",
): Tags<SVGElementTagNameMap>;

/**
 *
 * @param document
 * @param namespace
 * @returns
 */
export function tags(
  document: Document,
  namespace: string | null,
): Tags<Record<string, Element>>;

export function tags(document: Document, namespace?: string | null) {
  const createElement =
    namespace === undefined
      ? document.createElement.bind(document)
      : document.createElementNS.bind(document, namespace);

  return new Proxy(
    {},
    {
      get(_, property) {
        return typeof property === "string"
          ? tag.bind(createElement.bind(undefined, property))
          : undefined;
      },
      set() {
        return false;
      },
    },
  );
}
