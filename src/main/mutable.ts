interface Callback {
  (): void;
}

/**
 *
 */
export interface Mutable<V> {
  [get](): V;
  set(value: V | MutableExpression<V>): void;
}

/**
 *
 */
export interface MutableExpression<V> {
  (value: V): V;
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

const get: unique symbol = Symbol();

let activeObservables: Set<Observable> | undefined;

/**
 *
 * @param mutable
 * @returns
 */
export function $<V>(mutable: Mutable<V>): V {
  return mutable[get]();
}

function isExpression<V>(target: unknown): target is MutableExpression<V> {
  return typeof target === "function";
}

const registry = new FinalizationRegistry((callbacks: Callback[]) => {
  for (const callback of callbacks) {
    callback();
  }
});

/**
 *
 * @param spy
 * @returns
 */
export function spy<V>(spy: Spy<V>): Mutable<V> {
  const observables = activeObservables;
  const observer = () => mutableRef.deref()?.set(spy);

  activeObservables = new Set();

  let mutable: Mutable<V>;

  try {
    mutable = use(spy());

    registry.register(
      mutable,
      [...activeObservables].map((add) => add(observer)),
    );
  } finally {
    activeObservables = observables;
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

  return {
    [get]() {
      return activeObservables?.add(observable), value;
    },
    set(next: V | MutableExpression<V>) {
      if (value === next) {
        return;
      }

      if (isExpression<V>(next)) {
        value = next(value);
      } else {
        value = next;
      }

      for (const notify of observers) {
        try {
          notify();
        } catch (error) {
          console.error(error);
        }
      }
    },
  };
}
