import { hook, jot, type Hook, type Option } from "./jot.ts";

let value = 0n;

export function fragment<N extends Node>(
  ...options: Option<DocumentFragment>[]
): Hook<N> {
  return hook((node) => {
    if (node.ownerDocument) {
      return jot(node.ownerDocument?.createDocumentFragment(), ...options);
    }
  });
}

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
