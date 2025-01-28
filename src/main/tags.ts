import { global, jot, type Option } from "./jot.ts";

/**
 *
 */
export type Tags<E extends Record<keyof E, Node>> = {
  [T in keyof E]: (...options: Option<E[T]>[]) => E[T];
};

/**
 *
 */
export interface TagsFactory {
  (
    namespace?: "http://www.w3.org/1999/xhtml",
  ): Tags<HTMLElementTagNameMap> &
    Tags<HTMLElementDeprecatedTagNameMap> &
    TagsFactory;
  (
    namespace: "http://www.w3.org/1998/Math/MathML",
  ): Tags<MathMLElementTagNameMap> & TagsFactory;
  (
    namespace: "http://www.w3.org/2000/svg",
  ): Tags<SVGElementTagNameMap> & TagsFactory;
  (namespace: string | null): Tags<Record<string, Element>> & TagsFactory;
}

/**
 *
 */
export const tags: Tags<HTMLElementTagNameMap> &
  Tags<HTMLElementDeprecatedTagNameMap> &
  TagsFactory = createTagsFactory();

function createTagsFactory(
  namespace?: string | null,
): Tags<HTMLElementTagNameMap> &
  Tags<HTMLElementDeprecatedTagNameMap> &
  TagsFactory {
  const createElement =
    namespace === undefined
      ? (tag: string) => global.window.document.createElement(tag)
      : (tag: string) => global.window.document.createElementNS(namespace, tag);

  return new Proxy(
    <
      Tags<HTMLElementTagNameMap> &
        Tags<HTMLElementDeprecatedTagNameMap> &
        TagsFactory
    >createTagsFactory,
    {
      get(target, property, receiver) {
        if (typeof property !== "string") {
          return Reflect.get(target, property, receiver);
        }

        return (...options: Option<Node>[]) => {
          return jot(createElement(property), ...options);
        };
      },
    },
  );
}
