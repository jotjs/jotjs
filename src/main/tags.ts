import { getDocument } from "./document.ts";
import { jot } from "./jot.ts";
import type { Option } from "./option.ts";

/**
 *
 */
export type Tags = {
  [T in keyof HTMLElementTagNameMap | keyof HTMLElementDeprecatedTagNameMap]: <
    E extends T extends keyof HTMLElementTagNameMap
      ? HTMLElementTagNameMap[T]
      : T extends keyof HTMLElementDeprecatedTagNameMap
        ? HTMLElementDeprecatedTagNameMap[T]
        : HTMLElement,
  >(
    ...options: Option<E>[]
  ) => E;
};

/**
 *
 */
export interface TagsFactory {
  (namespace?: "http://www.w3.org/1999/xhtml"): Tags & TagsFactory;

  (namespace: "http://www.w3.org/2000/svg"): {
    [T in keyof SVGElementTagNameMap]: <E extends SVGElementTagNameMap[T]>(
      ...options: Option<E>[]
    ) => E;
  } & TagsFactory;

  (namespace: "http://www.w3.org/1998/Math/MathML"): {
    [T in keyof MathMLElementTagNameMap]: <
      E extends MathMLElementTagNameMap[T],
    >(
      ...options: Option<E>[]
    ) => E;
  } & TagsFactory;

  (namespace: string | null): {
    [tag: string]: <E extends Element>(...options: Option<E>[]) => E;
  } & TagsFactory;
}

/**
 *
 */
export const tags: Tags & TagsFactory = createTagsFactory();

function createTagsFactory(namespace?: string | null): Tags & TagsFactory {
  return new Proxy(<Tags & TagsFactory>createTagsFactory, {
    get(target, property, receiver) {
      if (typeof property !== "string") {
        return Reflect.get(target, property, receiver);
      }

      const document = getDocument();

      return (...options: Option<Node>[]) => {
        return jot(
          namespace === undefined
            ? document.createElement(property)
            : document.createElementNS(namespace, property),
          ...options,
        );
      };
    },
  });
}
