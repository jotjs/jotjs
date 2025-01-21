import { getDocument } from "./document.ts";
import { jot, type Option } from "./jot.ts";

/**
 *
 */
export type HTMLTagNameMap<T> = T extends keyof HTMLElementTagNameMap
  ? HTMLElementTagNameMap[T]
  : T extends keyof HTMLElementDeprecatedTagNameMap
    ? HTMLElementDeprecatedTagNameMap[T]
    : HTMLElement;

/**
 *
 */
export type HTMLTags = {
  [T in keyof HTMLElementTagNameMap | keyof HTMLElementDeprecatedTagNameMap]: (
    ...options: Option<HTMLTagNameMap<T>>[]
  ) => HTMLTagNameMap<T>;
};

/**
 *
 */
export type MathMLTags = {
  [T in keyof MathMLElementTagNameMap]: (
    ...options: Option<MathMLElementTagNameMap[T]>[]
  ) => MathMLElementTagNameMap[T];
};

/**
 *
 */
export type SVGTags = {
  [T in keyof SVGElementTagNameMap]: (
    ...options: Option<SVGElementTagNameMap[T]>[]
  ) => SVGElementTagNameMap[T];
};

/**
 *
 */
export type Tags = {
  [tag: string]: (...options: Option<Element>[]) => Element;
};

/**
 *
 */
export interface TagsFactory {
  (namespace?: "http://www.w3.org/1999/xhtml"): HTMLTags & TagsFactory;
  (namespace: "http://www.w3.org/1998/Math/MathML"): MathMLTags & TagsFactory;
  (namespace: "http://www.w3.org/2000/svg"): SVGTags & TagsFactory;
  (namespace: string | null): Tags & TagsFactory;
}

/**
 *
 */
export const tags: HTMLTags & TagsFactory = createTagsFactory();

function createTagsFactory(namespace?: string | null): HTMLTags & TagsFactory {
  const createElement =
    namespace === undefined
      ? (tag: string) => getDocument().createElement(tag)
      : (tag: string) => getDocument().createElementNS(namespace, tag);

  return new Proxy(<HTMLTags & TagsFactory>createTagsFactory, {
    get(target, property, receiver) {
      if (typeof property !== "string") {
        return Reflect.get(target, property, receiver);
      }

      return (...options: Option<Node>[]) => {
        return jot(createElement(property), ...options);
      };
    },
  });
}
