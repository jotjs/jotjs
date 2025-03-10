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
  (next: V): void;
}

/**
 *
 */
export interface Supplier<V> {
  (update?: boolean): V;
}

type Observable = [number, Set<symbol>] | [number, Set<symbol>, VoidFunction];

const context = <Set<symbol>[]>[];
const updates = new Set<symbol>();
const observables = new WeakMap<symbol, Observable>();

const byDistance = (a: symbol, b: symbol) => toDistance(a) - toDistance(b);

const isNonNullable = <V>(value?: V): value is NonNullable<V> => value != null;

const commit = () => {
  [...updates]
    .sort(byDistance)
    .map(toUpdate)
    .filter(isNonNullable)
    .forEach(queueMicrotask);

  updates.clear();
};

const defer = (update: symbol) => {
  if (!updates.has(update)) {
    if (updates.size === 0) {
      queueMicrotask(commit);
    }

    updates.add(update);
    (getObservers(update) || []).forEach(defer);
  }
};

const getObservable = (id: symbol) => observables.get(id);

const getObservers = (observable: symbol) => getObservable(observable)?.[1];

/**
 *
 * @param expression
 * @returns
 */
export const spy = <V>(expression: () => V): [Accessor<V>, VoidFunction] => {
  const dependencies = new Set<symbol>();

  context.push(dependencies);

  let value: V;

  try {
    value = expression();
  } finally {
    context.pop();
  }

  const id = Symbol();

  for (const dependency of dependencies) {
    getObservers(dependency)?.add(id);
  }

  observables.set(id, [
    [...dependencies].map(toDistance).reduce(toMax, -1) + 1,
    new Set(),
    () => (value = expression()),
  ]);

  return [
    () => (track(id), value),
    () => {
      for (const dependency of dependencies) {
        getObservers(dependency)?.delete(id);
      }

      dependencies.clear();
      observables.delete(id);
    },
  ];
};

function toDistance(observable: symbol): number {
  return getObservable(observable)?.[0] || 0;
}

function toMax(a: number, b: number): number {
  return Math.max(a, b);
}

function toUpdate(observable: symbol): VoidFunction | undefined {
  return getObservable(observable)?.[2];
}

function track(observable: symbol): void {
  context[context.length - 1]?.add(observable);
}

/**
 *
 * @param value
 * @returns
 */
export function use<V>(value: V): [Supplier<V>, Mutator<V>] {
  const id = Symbol();

  observables.set(id, [0, new Set()]);

  return [
    (update) => (update ? defer(id) : track(id), value),
    (next) => ((value = next), defer(id)),
  ];
}
