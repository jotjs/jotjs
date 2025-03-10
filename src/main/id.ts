import { hook, type Hook } from "./jot.ts";

let value = 0n;

/**
 *
 * @returns
 */
export function id<E extends Element>(): string & Hook<E> {
  const id = String(value++);

  return Object.assign(
    id,
    hook<E>((element) => {
      element.id = id;
    }),
  );
}
