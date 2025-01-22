import { getDocument } from "./document.ts";
import type { Hook } from "./jot.ts";

/**
 *
 */
export type Style = Partial<CSSStyleDeclaration> | [string, ...Style[]];

let styleId = 0n;
let stylePrefix: string | undefined;
let styleSheet: CSSStyleSheet | undefined;

function apply(rule: CSSStyleRule, style: Style): void {
  if (!Array.isArray(style)) {
    return void Object.assign(rule.style, style);
  }

  const [selector, ...definitions] = style;

  const nested = rule.cssRules[
    rule.insertRule(`${selector}{}`, rule.cssRules.length)
  ] as CSSStyleRule;

  for (const definition of definitions) {
    apply(nested, definition);
  }
}

function createStyleSheet(): CSSStyleSheet {
  const document = getDocument();
  const style = document.createElement("style");

  return document.head.appendChild(style), style.sheet!;
}

/**
 *
 * @param styles
 * @returns
 */
export function css<E extends Element>(...styles: Style[]): Hook<E> {
  if (!styleSheet) {
    styleSheet = createStyleSheet();
  }

  const className = (stylePrefix || "s") + styleId++;

  const rule = styleSheet.cssRules[
    styleSheet.insertRule(`.${className}{}`, styleSheet.cssRules.length)
  ] as CSSStyleRule;

  for (const definition of styles) {
    apply(rule, definition);
  }

  return Object.assign((element: E): void => element.classList.add(className), {
    [Symbol.toPrimitive]() {
      return className;
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
 * @param classNames
 * @returns
 */
export function toggle<E extends Element>(
  className: unknown,
  force?: boolean,
): Hook<E> {
  return (element): void => {
    element.classList.toggle(String(className), force);
  };
}
