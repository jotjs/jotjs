import type { Hook } from "./hook.ts";
import type { View } from "./jot.ts";
import type { Properties } from "./properties.ts";

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
