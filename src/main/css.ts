import { id } from "./id.ts";
import { hook, type Hook } from "./jot.ts";

/**
 *
 */
export type Style = Partial<StyleProperties> & {
  [key: string]: string | Style | Style[];
};

/**
 *
 */
export type StyleProperties = Omit<
  CSSStyleDeclaration,
  | "getPropertyPriority"
  | "getPropertyValue"
  | "item"
  | "length"
  | "parentRule"
  | "removeProperty"
  | "setProperty"
  | number
  | SymbolConstructor["iterator"]
>;

const bySpace = /\s+/;
const styles = new WeakSet<symbol>();
const upperCaseLetters = /([A-Z])/g;

let stylePrefix: string | undefined;
let styleSheet: CSSStyleSheet | null;

/**
 *
 * @param style
 * @param global
 * @returns
 */
export function css<E extends Element>(
  style: Style,
  global?: false,
): string & Hook<E>;

/**
 *
 * @param style
 * @param global
 * @returns
 */
export function css<E extends Element>(style: Style, global: true): Hook<E>;

export function css<E extends Element>(
  style: Style,
  global?: boolean,
): Hook<E> {
  const styleId = Symbol();

  if (global) {
    return hook((element) => {
      if (styles.has(styleId)) {
        return;
      }

      const styleSheet = getStyleSheet(element.ownerDocument);

      for (const [selector, value] of Object.entries(style)) {
        if (typeof value === "string") {
          insert(styleSheet, selector, value);
        } else {
          for (const style of Array.isArray(value) ? value : [value]) {
            insert(styleSheet, selector, toString(style));
          }
        }
      }

      styles.add(styleId);
    });
  }

  const className = (stylePrefix || "s") + id();

  return Object.assign(
    className,
    hook<E>((element) => {
      if (!styles.has(styleId)) {
        insert(
          getStyleSheet(element.ownerDocument),
          `.${className}`,
          toString(style),
        );
      }

      element.classList.add(className);
    }),
  );
}

function getStyleSheet(document: Document): CSSStyleSheet {
  if (styleSheet) {
    return styleSheet;
  }

  const style = document.createElement("style");

  document.head.appendChild(style);

  styleSheet = style.sheet;

  return getStyleSheet(document);
}

function insert(styleSheet: CSSStyleSheet, selector: string, rule: string) {
  styleSheet.insertRule(`${selector}{${rule}}`, styleSheet.cssRules.length);
}

/**
 *
 * @param prefix
 */
export function setStylePrefix(prefix: string): void {
  stylePrefix = prefix;
}

/**
 *
 * @param sheet
 */
export function setStyleSheet(sheet: CSSStyleSheet | null): void {
  styleSheet = sheet;
}

/**
 *
 * @param className
 * @param force
 * @returns
 */
export function toggle<E extends Element>(
  classNames: string,
  force?: boolean,
): Hook<E> {
  return hook((element) => {
    for (const className of classNames.split(bySpace)) {
      element.classList.toggle(className, force);
    }
  });
}

function toString(style: Style): string {
  return Object.entries(style).map(toStyleString).join("");
}

function toStyleString([key, style]: [
  string,
  string | Style | Style[],
]): string {
  if (typeof style === "string") {
    if (!key.startsWith("--")) {
      key = key.replaceAll(upperCaseLetters, "-$1").toLowerCase();
    }

    return `${key}:${style};`;
  }

  return (Array.isArray(style) ? style : [style])
    .map((style) => `${key}{${toString(style)}}`)
    .join("");
}
