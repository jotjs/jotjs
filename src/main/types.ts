/**
 *
 */
export interface Attributes {
  [key: string]: unknown;
}

/**
 *
 */
export const hookTo: unique symbol = Symbol();

/**
 *
 */
export interface Hook<N extends Node> {
  [hookTo](node: N): void;
}

/**
 *
 */
export interface Mutable<V> {
  (value?: V | MutableExpression<V>): V;
}

/**
 *
 */
export interface MutableExpression<V> {
  (value: V): V;
}

/**
 *
 */
export type Option<N extends Node> =
  | bigint
  | boolean
  | Hook<N>
  | Node
  | null
  | number
  | Option<N>[]
  | Properties<N>
  | string
  | symbol
  | undefined
  | View
  | void;

/**
 *
 */
export type Properties<N extends Node> = {
  [K in keyof N]?: N[K] | Property<N, K>;
};

/**
 *
 */
export const bindTo: unique symbol = Symbol();

/**
 *
 */
export interface Property<N extends Node, K extends keyof N> {
  [bindTo](key: K): Hook<N>;
}

/**
 *
 */
export interface PropertyExpression<V> {
  (value: V): V | undefined | void;
}

/**
 *
 */
export interface Stringer {
  toString(): string;
}

/**
 *
 */
export type StyleDefinition =
  | Partial<CSSStyleDeclaration>
  | [string, ...StyleDefinition[]];

/**
 *
 */
export interface View {
  (node: Node): Option<DocumentFragment>;
}
