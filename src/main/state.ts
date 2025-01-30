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
  get(): V;
  spy(): AsyncGenerator<V, void, void>;
}

/**
 *
 */
export interface Mutator<V> {
  set(next: V): void;
  use(consumer: (current: V, set: (next: V) => void) => void): void;
}

const registry = new FinalizationRegistry(
  (callbacks: (() => Promise<unknown>)[]) => {
    for (const callback of callbacks) {
      callback();
    }
  },
);

/**
 *
 * @param report
 * @returns
 */
export function spy<V, T>(
  agent: (targets: T) => V,
  dependencies: Dependencies<T>,
): Mutable<V> {
  const targets = () => {
    const targets = <T>{};

    for (const name in dependencies) {
      targets[name] = dependencies[name].get();
    }

    return targets;
  };

  const { get, set, spy } = use(agent(targets()));
  const mutable = { get, spy };
  const generators = Object.values<Mutable<unknown>>(dependencies).map(
    (dependency) => dependency.spy(),
  );

  registry.register(
    mutable,
    generators.map((generator) => generator.return.bind(generator)),
  );

  generators.forEach(async (generator) => {
    for await (const _ of generator) {
      set(agent(targets()));
    }
  });

  return mutable;
}

export function use<V>(value: V): Mutable<V> & Mutator<V> {
  let { promise, resolve } = Promise.withResolvers<V>();

  function set(next: V) {
    value = next;
  }

  function update(update?: typeof resolve) {
    (update = resolve),
      ({ promise, resolve } = Promise.withResolvers<V>()),
      update(value);
  }

  return {
    get() {
      return value;
    },
    set(value) {
      set(value);
      update();
    },
    async *spy() {
      while (true) {
        yield promise;
      }
    },
    use(consumer) {
      consumer(value, set);
      update();
    },
  };
}
