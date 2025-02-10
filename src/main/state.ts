/**
 *
 */
export interface Disposable {
  [disposal](): void;
}

/**
 *
 */
export type Mutable<S extends object> = S & {
  readonly [P in Extract<keyof S, string> as `${typeof prefix}${P}`]: S[P];
};

interface Observable {
  distance: number;
  observers: Set<symbol>;
  update?: VoidFunction;
}

const disposal: unique symbol = Symbol();

const prefix = "$";
const session = new Set<symbol>();
const observables = new WeakMap<symbol, Observable>();

let targets: Set<symbol> | undefined;

function byDistance(a: symbol, b: symbol): number {
  return toDistance(a) - toDistance(b);
}

function commit(): void {
  for (const update of [...session].sort(byDistance).map(toUpdate)) {
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

  for (const observer of observables.get(update)?.observers || []) {
    defer(observer);
  }
}

/**
 *
 * @param state
 * @returns
 */
export function derived<S extends object>(
  state: () => S | void,
): Readonly<S> & Disposable {
  const [dependencies, restore] = prepare(targets);
  const mutable = <S>{};

  try {
    Object.assign(mutable, state());
  } finally {
    restore();
  }

  const id = Symbol();

  for (const dependency of dependencies) {
    observables.get(dependency)?.observers.add(id);
  }

  observables.set(id, {
    distance: [...dependencies].map(toDistance).reduce(toMax, -1) + 1,
    observers: new Set(),
    update() {
      Object.assign(mutable, state());
    },
  });

  return new Proxy(<Readonly<S> & Disposable>mutable, {
    get(target, property, receiver) {
      if (property === disposal) {
        return () => {
          for (const dependency of dependencies) {
            observables.get(dependency)?.observers.delete(id);
          }

          dependencies.clear();
          dependencies.delete(id);
        };
      }

      targets?.add(id);

      return Reflect.get(target, property, receiver);
    },
    set() {
      return false;
    },
  });
}

/**
 *
 * @param disposables
 */
export function dispose(...disposables: Disposable[]) {
  for (const disposable of disposables) {
    disposable[disposal]();
  }
}

/**
 *
 * @param state
 * @returns
 */
export function mutable<S extends object>(state: S): Mutable<S> {
  const id = Symbol();

  observables.set(id, {
    distance: 0,
    observers: new Set(),
  });

  return new Proxy(<Mutable<S>>state, {
    get(target, property, receiver) {
      if (typeof property === "string" && property.startsWith(prefix)) {
        return (
          defer(id),
          Reflect.get(target, property.substring(prefix.length), receiver)
        );
      }

      targets?.add(id);

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

function prepare(
  dependencies: Set<symbol> | undefined,
): [Set<symbol>, VoidFunction] {
  return [(targets = new Set()), () => (targets = dependencies)];
}

function toDistance(observable: symbol): number {
  return observables.get(observable)?.distance || 0;
}

function toMax(a: number, b: number): number {
  return Math.max(a, b);
}

function toUpdate(observable: symbol): VoidFunction | undefined {
  return observables.get(observable)?.update;
}
