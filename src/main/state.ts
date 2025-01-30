interface AnyFunction {
  (...args: unknown[]): unknown;
}

/**
 *
 */
export interface Consumer<V> {
  (current: Value<V>): Value<V> | void;
}

/**
 *
 */
export interface Getter<V> {
  (): Value<V>;
}

interface Observable {
  (): AsyncGenerator<void, void, void>;
}

/**
 *
 */
export interface Setter<V> {
  (next: Value<V> | Consumer<V>): void;
}

/**
 *
 */
export type Value<V> = Exclude<V, AnyFunction>;

const registry = new FinalizationRegistry(
  (callbacks: (() => Promise<unknown>)[]) => {
    for (const callback of callbacks) {
      callback();
    }
  },
);

let dependencies: Set<Observable> | undefined;

function isExpression<V>(target: unknown): target is Consumer<V> {
  return typeof target === "function";
}

function prepare(
  observables: Set<Observable> | undefined,
): [Set<Observable>, () => void] {
  return [
    (dependencies = new Set()),
    () => {
      dependencies = observables;
    },
  ];
}

/**
 *
 * @param target
 * @returns
 */
export function spy<V>(target: Getter<V>): Getter<V> {
  const [observables, restore] = prepare(dependencies);
  const value = target();

  restore();

  const [get, set] = use(value);
  const generators = [...observables].map((observable) => observable());

  registry.register(
    get,
    generators.map((generator) => generator.return.bind(generator)),
  );

  generators.forEach(async (generator) => {
    for await (const _ of generator) {
      set(target());
    }
  });

  return get;
}

export function use<V>(value: Value<V>): [Getter<V>, Setter<V>] {
  let { promise, resolve } = Promise.withResolvers<void>();

  async function* observable(): AsyncGenerator<void, void, void> {
    while (true) {
      yield promise;
    }
  }

  return [
    () => {
      return dependencies?.add(observable), value;
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
