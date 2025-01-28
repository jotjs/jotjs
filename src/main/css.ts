import { id } from "./id.ts";
import { global, hook, type Callback, type Option } from "./jot.ts";

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
    throw new Error("style.sheet cannot be null");
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
    for (const [key, value] of Object.entries(style)) {
      if (typeof value === "string") {
        continue;
      }

      const styles = Array.isArray(value) ? value : [value];

      for (const style of styles) {
        styleSheet.insertRule(
          `${key}{${toString(style)}}`,
          styleSheet.cssRules.length,
        );
      }
    }

    return "";
  }

  const className = (stylePrefix || "s") + id();

  styleSheet.insertRule(
    `.${className}{${toString(style)}}`,
    styleSheet.cssRules.length,
  );

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

function toString(style: Style): string {
  return Object.entries(style)
    .map(([key, value]) => {
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
    })
    .join("");
}
