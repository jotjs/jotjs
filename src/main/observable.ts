/**
 *
 */
export interface Mutator<V> {
  (next: Value<V> | MutatorExpression<V>): void;
}

/**
 *
 */
export interface MutatorExpression<V> {
  (value: Value<V>): Value<V> | void;
}

/**
 *
 */
export interface Observable<V> {
  [getValue](): Value<V>;
  [newObserver](): AsyncGenerator<void, void, void>;
}

/**
 *
 */
export interface Spy<V> {
  (): Value<V>;
}

/**
 *
 */
export type Value<V> = Exclude<V, (...args: unknown[]) => unknown>;

const getValue: unique symbol = Symbol();
const newObserver: unique symbol = Symbol();

const registry = new FinalizationRegistry(
  (callbacks: (() => Promise<unknown>)[]) => {
    for (const callback of callbacks) {
      callback();
    }
  },
);

let dependencies: Set<Observable<unknown>> | undefined;

/**
 *
 * @param observable
 * @returns
 */
export function $<V>(observable: Observable<V>): V {
  return observable[getValue]();
}

function isExpression<V>(target: unknown): target is MutatorExpression<V> {
  return typeof target === "function";
}

function prepare(
  observables: Set<Observable<unknown>> | undefined,
): [Set<Observable<unknown>>, () => void] {
  return [(dependencies = new Set()), () => void (dependencies = observables)];
}

/**
 *
 * @param spy
 * @returns
 */
export function spy<V>(spy: Spy<V>): Observable<V> {
  const [observables, restore] = prepare(dependencies);
  const value = spy();

  restore();

  const [observable, update] = use<V>(value);
  const observers = [...observables].map((observable) =>
    observable[newObserver](),
  );

  registry.register(
    observable,
    observers.map((observer) => observer.return.bind(observer)),
  );

  observers.forEach(async (observer) => {
    for await (const _ of observer) {
      update(spy());
    }
  });

  return observable;
}

export function use<V>(value: Value<V>): [Observable<V>, Mutator<V>] {
  let { promise, resolve } = Promise.withResolvers<void>();

  return [
    {
      [getValue]() {
        return dependencies?.add(this), value;
      },
      async *[newObserver](): AsyncGenerator<void, void, void> {
        while (true) {
          yield promise;
        }
      },
    },
    (next) => {
      const computed = isExpression<V>(next) ? next(value) : next;

      if (computed !== undefined) {
        value = computed;
      }

      const update = resolve;

      ({ promise, resolve } = Promise.withResolvers<void>());

      update();
    },
  ];
}
