import { getDocument } from "./document.ts";
import { id } from "./id.ts";
import { hook, type Callback, type Hook } from "./jot.ts";

/**
 *
 */
export type Style = Partial<CSSStyleDeclaration> | [string, ...Style[]];

let stylePrefix: string | undefined;
let styleSheet: CSSStyleSheet | undefined;

function apply(rule: CSSStyleRule, style: Style): void {
  if (!Array.isArray(style)) {
    return void Object.assign(rule.style, style);
  }

  const [selector, ...styles] = style;

  const nested = rule.cssRules[
    rule.insertRule(`${selector}{}`, rule.cssRules.length)
  ] as CSSStyleRule;

  for (const style of styles) {
    apply(nested, style);
  }
}

function createStyleSheet(): CSSStyleSheet {
  const document = getDocument();
  const style = document.createElement("style");

  document.head.appendChild(style);

  if (!style.sheet) {
    throw new Error("The CSSStyleSheet cannot be null");
  }

  return style.sheet;
}

/**
 *
 * @param styles
 * @returns
 */
export function css<E extends Element>(...styles: Style[]): string & Hook<E> {
  if (!styleSheet) {
    styleSheet = createStyleSheet();
  }

  const className = (stylePrefix || "s") + id();

  const rule = styleSheet.cssRules[
    styleSheet.insertRule(`.${className}{}`, styleSheet.cssRules.length)
  ] as CSSStyleRule;

  for (const definition of styles) {
    apply(rule, definition);
  }

  return Object.assign(className, {
    [hook](element: E): void {
      element.classList.add(className);
    },
  });
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
export function setStyleSheet(sheet: CSSStyleSheet): void {
  styleSheet = sheet;
}

/**
 *
 * @param className
 * @param force
 * @returns
 */
export function toggle<E extends Element>(
  className: string,
  force?: boolean,
): Callback<E> {
  return (element): void => {
    element.classList.toggle(String(className), force);
  };
}
