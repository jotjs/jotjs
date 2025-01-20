import { getDocument } from "./document.ts";
import { jot, type Option } from "./jot.ts";

/**
 *
 */
export type Tags = {
  [T in keyof HTMLElementTagNameMap | keyof HTMLElementDeprecatedTagNameMap]: (
    ...options: Option<
      T extends keyof HTMLElementTagNameMap
        ? HTMLElementTagNameMap[T]
        : T extends keyof HTMLElementDeprecatedTagNameMap
          ? HTMLElementDeprecatedTagNameMap[T]
          : HTMLElement
    >[]
  ) => T extends keyof HTMLElementTagNameMap
    ? HTMLElementTagNameMap[T]
    : T extends keyof HTMLElementDeprecatedTagNameMap
      ? HTMLElementDeprecatedTagNameMap[T]
      : HTMLElement;
};

/**
 *
 */
export interface TagsFactory {
  (namespace?: "http://www.w3.org/1999/xhtml"): Tags & TagsFactory;

  (namespace: "http://www.w3.org/2000/svg"): {
    [T in keyof SVGElementTagNameMap]: (
      ...options: Option<SVGElementTagNameMap[T]>[]
    ) => SVGElementTagNameMap[T];
  } & TagsFactory;

  (namespace: "http://www.w3.org/1998/Math/MathML"): {
    [T in keyof MathMLElementTagNameMap]: (
      ...options: Option<MathMLElementTagNameMap[T]>[]
    ) => MathMLElementTagNameMap[T];
  } & TagsFactory;

  (namespace: string | null): {
    [tag: string]: (...options: Option<Element>[]) => Element;
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
