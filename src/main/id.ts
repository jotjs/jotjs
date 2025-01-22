import type { Hook } from "./jot.ts";

let value = 0n;

/**
 *
 * @returns
 */
export function id<E extends Element>(): Hook<E> {
  const id = String(value++);

  return Object.assign(
    (element: E): void => {
      element.id = id;
    },
    {
      [Symbol.toPrimitive]() {
        return id;
      },
    },
  );
}
