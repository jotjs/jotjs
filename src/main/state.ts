/**
 *
 */
export interface Disposable {
  [disposed](): void;
}

/**
 *
 */
export type Mutable<V extends object> = V & {
  readonly [K in keyof V as `${typeof prefix}${K & string}`]: V[K];
};

interface Observable {
  distance: number;
  observers: Set<symbol>;
  update?: VoidFunction;
}

const disposed: unique symbol = Symbol();

const prefix = "$";
const session = new Set<symbol>();
const registry = new Map<symbol, Observable>();

let dependencies: Set<symbol> | undefined;

function byDistance(a: symbol, b: symbol): number {
  return (registry.get(a)?.distance || 0) - (registry.get(b)?.distance || 0);
}

function commit(): void {
  for (const observable of [...session].sort(byDistance)) {
    const update = registry.get(observable)?.update;

    if (update) {
      queueMicrotask(update);
    }
  }

  session.clear();
}

function defer(update: symbol): void {
  if (session.has(update)) {
    return;
  }

  if (session.size === 0) {
    queueMicrotask(commit);
  }

  session.add(update);

  for (const observer of registry.get(update)?.observers || []) {
    defer(observer);
  }
}

/**
 *
 * @param disposables
 */
export function dispose(...disposables: Disposable[]) {
  for (const disposable of disposables) {
    disposable[disposed]();
  }
}

function prepare(
  observables: Set<symbol> | undefined,
): [Set<symbol>, VoidFunction] {
  return [(dependencies = new Set()), () => (dependencies = observables)];
}

/**
 *
 * @param spy
 * @returns
 */
export function spy<V extends object>(
  spy: () => V | void,
): Readonly<V> & Disposable {
  const [observables, restore] = prepare(dependencies);
  const value = <V>{};

  try {
    Object.assign(value, spy());
  } finally {
    restore();
  }

  const id = Symbol();

  for (const observable of observables) {
    registry.get(observable)?.observers.add(id);
  }

  registry.set(id, {
    distance:
      Math.max(
        ...[...observables].map((id) => registry.get(id)?.distance || 0),
      ) + 1,
    observers: new Set(),
    update() {
      Object.assign(value, spy());
    },
  });

  return new Proxy(<Readonly<V> & Disposable>value, {
    get(target, property, receiver) {
      if (property === disposed) {
        return () => {
          for (const observable of observables) {
            registry.get(observable)?.observers.delete(id);
          }

          observables.clear();
          registry.delete(id);
        };
      }

      dependencies?.add(id);

      return Reflect.get(target, property, receiver);
    },
    set() {
      return false;
    },
  });
}

/**
 *
 * @param value
 * @returns
 */
export function use<V extends object>(value: V): Mutable<V> {
  const id = Symbol();

  registry.set(id, {
    distance: 0,
    observers: new Set(),
  });

  return new Proxy(<Mutable<V>>value, {
    get(target, property, receiver) {
      if (typeof property === "string") {
        if (property.startsWith(prefix)) {
          defer(id);
          property = property.substring(prefix.length);
        } else {
          dependencies?.add(id);
        }
      } else {
        dependencies?.add(id);
      }

      return Reflect.get(target, property, receiver);
    },
    set(target, property, value, receiver) {
      if (typeof property === "string" && property.startsWith(prefix)) {
        return false;
      }

      defer(id);

      return Reflect.set(target, property, value, receiver);
    },
  });
}
