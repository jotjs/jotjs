/**
 *
 */
export interface Mutator<V> {
  (next: V | ((value: V) => V | void)): void;
}

/**
 *
 */
export interface Observable<V> {
  [get](): V;
  [observer](): AsyncGenerator<void, void, void>;
}

const get: unique symbol = Symbol();
const observer: unique symbol = Symbol();

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
  return observable[get]();
}

function isExpression<V>(target: unknown): target is (value: V) => V | void {
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
export function spy<V>(spy: () => V): Observable<V> {
  const [observables, restore] = prepare(dependencies);
  const value = spy();

  restore();

  if (observables.size === 0) {
    return {
      [get]() {
        return value;
      },
      async *[observer](): AsyncGenerator<void, void, void> {},
    };
  }

  const [observable, update] = use<V>(value);
  const generators = [...observables].map((observable) =>
    observable[observer](),
  );

  registry.register(
    observable,
    generators.map((generator) => generator.return.bind(generator)),
  );

  generators.forEach(async (generator) => {
    for await (const _ of generator) {
      update(spy());
    }
  });

  return observable;
}

export function use<V>(value: V): [Observable<V>, Mutator<V>] {
  let { promise, resolve } = Promise.withResolvers<void>();

  return [
    {
      [get]() {
        return dependencies?.add(this), value;
      },
      async *[observer](): AsyncGenerator<void, void, void> {
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
