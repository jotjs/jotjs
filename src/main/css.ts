import { getDocument } from "./document.ts";
import type { Hook } from "./jot.ts";

/**
 *
 */
export type StyleDefinition =
  | Partial<CSSStyleDeclaration>
  | [string, ...StyleDefinition[]];

let styleId = 0n;
let stylePrefix: string | undefined;
let styleSheet: CSSStyleSheet | undefined;

function apply(rule: CSSStyleRule, definition: StyleDefinition): void {
  if (!Array.isArray(definition)) {
    return void Object.assign(rule.style, definition);
  }

  const [selector, ...definitions] = definition;

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
 * @param definitions
 * @returns
 */
export function css<E extends Element>(
  ...definitions: StyleDefinition[]
): Hook<E> {
  if (!styleSheet) {
    styleSheet = createStyleSheet();
  }

  const className = (stylePrefix || "s") + styleId++;

  const rule = styleSheet.cssRules[
    styleSheet.insertRule(`.${className}{}`, styleSheet.cssRules.length)
  ] as CSSStyleRule;

  for (const definition of definitions) {
    apply(rule, definition);
  }

  return Object.assign((element: E) => element.classList.add(className), {
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
