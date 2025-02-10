import { id } from "./id.ts";
import { global, hook, type Hook, type Option } from "./jot.ts";

/**
 *
 */
export type Style = {
  [K in keyof StyleProperties]?: StyleProperties[K];
} & {
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

const regex = /([A-Z])/g;

let stylePrefix: string | undefined;
let styleSheet: CSSStyleSheet | undefined;

function createStyleSheet(): CSSStyleSheet {
  const { document } = global.window;
  const style = document.createElement("style");

  document.head.appendChild(style);

  if (!style.sheet) {
    throw new Error("sheet cannot be null");
  }

  return style.sheet;
}

/**
 *
 * @param styles
 * @returns
 */
export function css<E extends Element>(
  style: Style,
  global?: boolean,
): string & Option<E> {
  if (!styleSheet) {
    styleSheet = createStyleSheet();
  }

  if (global) {
    return newGlobalStyle(style, styleSheet);
  }

  return newStyle<E>(style, styleSheet);
}

function insert(selector: string, style: Style, styleSheet: CSSStyleSheet) {
  styleSheet.insertRule(
    `${selector}{${toString(style)}}`,
    styleSheet.cssRules.length,
  );
}

function newGlobalStyle(style: Style, styleSheet: CSSStyleSheet) {
  for (const [key, value] of Object.entries(style)) {
    if (typeof value === "string") {
      throw Error(`"${value}" cannot be used as global Style`);
    }

    for (const style of Array.isArray(value) ? value : [value]) {
      insert(key, style, styleSheet);
    }
  }

  return "";
}

function newStyle<E extends Element>(
  style: Style,
  styleSheet: CSSStyleSheet,
): string & Hook<E> {
  const className = (stylePrefix || "s") + id();

  insert(`.${className}`, style, styleSheet);

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
): Hook<E> {
  return {
    [hook](element) {
      element.classList.toggle(String(className), force);
    },
  };
}

const toKeyValueString = ([key, value]: [
  string,
  string | Style | Style[],
]): string => {
  if (typeof value === "string") {
    if (!key.startsWith("--")) {
      key = key.replace(regex, "-$1").toLowerCase();
    }

    return `${key}:${value};`;
  }

  if (!Array.isArray(value)) {
    value = [value];
  }

  return value.map((value) => `${key}{${toString(value)}}`).join("");
};

function toString(style: Style): string {
  return Object.entries(style).map(toKeyValueString).join("");
}
