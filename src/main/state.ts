/**
 *
 */
export interface Accessor<V> {
  (): V;
}

/**
 *
 */
export interface Mutator<V> {
  (next: V, now?: boolean): void;
}

interface Observable {
  (observer: VoidFunction): VoidFunction;
}

/**
 *
 */
export interface Supplier<V> {
  (update?: boolean): V;
}

let updates: Set<VoidFunction> | undefined;
let dependencies: Set<Observable> | undefined;

function defer(update: VoidFunction): void {
  if (!updates) {
    const session = (updates = new Set());

    queueMicrotask(() => {
      try {
        for (const update of [...session]) {
          update();
        }
      } finally {
        updates = undefined;
      }
    });
  }

  updates.add(update);
}

function prepare(
  observables: Set<Observable> | undefined,
): [Set<Observable>, VoidFunction] {
  return [(dependencies = new Set()), () => (dependencies = observables)];
}

/**
 *
 * @param spy
 * @returns
 */
export function spy<V>(spy: () => V): [Accessor<V>, VoidFunction] {
  const [observables, restore] = prepare(dependencies);

  let getValue: Supplier<V>, setValue: Mutator<V>;

  try {
    [getValue, setValue] = use(spy());
  } finally {
    restore();
  }

  let session: Set<VoidFunction> | undefined;

  const observer = () => {
    if (session !== updates) {
      session = updates;
      setValue(spy(), true);
    }
  };

  const disposables = [...observables].map((add) => add(observer));

  return [
    () => getValue(),
    () => {
      for (const dispose of disposables) {
        dispose();
      }
    },
  ];
}

/**
 *
 * @param value
 * @returns
 */
export function use<V>(value: V): [Supplier<V>, Mutator<V>] {
  const observers = new Set<VoidFunction>();

  const observable = (observer: VoidFunction) => {
    observers.add(observer);
    return () => observers.delete(observer);
  };

  const update = () => {
    for (const observe of observers) {
      observe();
    }
  };

  return [
    (notify?: boolean) => {
      if (notify) {
        defer(update);
      }

      dependencies?.add(observable);

      return value;
    },
    (next, now) => {
      value = next;

      if (now) {
        update();
      } else {
        defer(update);
      }
    },
  ];
}
