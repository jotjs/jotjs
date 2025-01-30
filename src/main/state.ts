interface Consumer<V> {
  (current: V, set: (next: V) => void): void;
}

/**
 *
 */
export type Dependencies<T> = {
  [K in keyof T]: Mutable<T[K]>;
};

/**
 *
 */
export interface Mutable<V> {
  (): V;
  [generator](): AsyncGenerator<V, void, void>;
}

/**
 *
 */
export interface Mutator<V> {
  (next: V): void;
  with(consumer: Consumer<V>): void;
}

const generator: unique symbol = Symbol();

const registry = new FinalizationRegistry(
  (callbacks: (() => Promise<unknown>)[]) => {
    for (const callback of callbacks) {
      callback();
    }
  },
);

export async function* $<V>(
  mutable: Mutable<V>,
): AsyncGenerator<V, void, void> {
  yield* mutable[generator]();
}

/**
 *
 * @param agent
 * @param dependencies
 * @returns
 */
export function spy<V, T>(
  agent: (targets: T) => V,
  dependencies: Dependencies<T>,
): Mutable<V> {
  const targets = () => {
    const targets = <T>{};

    for (const name in dependencies) {
      targets[name] = dependencies[name]();
    }

    return targets;
  };

  const [mutable, update] = use(agent(targets()));
  const generators = Object.values<Mutable<unknown>>(dependencies).map($);

  registry.register(
    mutable,
    generators.map((generator) => generator.return.bind(generator)),
  );

  generators.forEach(async (generator) => {
    for await (const _ of generator) {
      update(agent(targets()));
    }
  });

  return mutable;
}

/**
 *
 * @param value
 * @returns
 */
export function use<V>(value: V): [Mutable<V>, Mutator<V>] {
  let { promise, resolve } = Promise.withResolvers<V>();

  const set = (next: V) => {
    value = next;
  };

  const update = (update?: typeof resolve) => {
    (update = resolve),
      ({ promise, resolve } = Promise.withResolvers<V>()),
      update(value);
  };

  return [
    Object.assign(
      (): V => {
        return value;
      },
      {
        async *[generator](): AsyncGenerator<V, void, void> {
          while (true) {
            yield promise;
          }
        },
      },
    ),
    Object.assign(
      (value: V) => {
        set(value);
        update();
      },
      {
        with(consumer: Consumer<V>) {
          consumer(value, set);
          update();
        },
      },
    ),
  ];
}
