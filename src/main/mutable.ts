import type { Mutable, MutableExpression } from "./types.ts";

interface Callback {
  (): void;
}

interface Observable {
  (observer: Observer): Callback;
}

interface Observer {
  (): void;
}

/**
 *
 */
export interface Spy<V> {
  (value?: V): V;
}

function isExpression<V>(target: unknown): target is MutableExpression<V> {
  return typeof target === "function";
}

const current: {
  observables?: Set<Observable>;
} = {};

const registry = new FinalizationRegistry((callback: Callback) => callback());

/**
 *
 * @param spy
 * @returns
 */
export function spy<V>(spy: Spy<V>): Mutable<V> {
  const { observables } = current;

  current.observables = new Set();

  const observer = () => {
    const mutable = mutableRef.deref();

    if (!mutable) {
      return;
    }

    try {
      mutable(spy);
    } catch (error) {
      console.error(error);
    }
  };

  let mutable: Mutable<V>;

  try {
    mutable = use(spy());

    for (const add of current.observables) {
      registry.register(mutable, add(observer));
    }
  } finally {
    current.observables = observables;
  }

  const mutableRef = new WeakRef(mutable);

  return mutable;
}

/**
 *
 * @param value
 * @returns
 */
export function use<V>(value: V): Mutable<V> {
  const observers = new Set<Observer>();

  const observable: Observable = (observer) => (
    observers.add(observer), () => observers.delete(observer)
  );

  return (next?: V | MutableExpression<V>) => {
    if (next === undefined) {
      return current.observables?.add(observable), value;
    }

    if (value === next) {
      return value;
    }

    if (isExpression<V>(next)) {
      value = next(value);
    } else {
      value = next;
    }

    for (const observer of observers) {
      observer();
    }

    return value;
  };
}
