// src/main/state.ts
var context = [];
var updates = /* @__PURE__ */ new Set();
var observables = /* @__PURE__ */ new WeakMap();
var byDistance = (a, b) => toDistance(a) - toDistance(b);
var isNonNullable = (value) => value != null;
var commit = () => {
  [...updates].sort(byDistance).map(toUpdate).filter(isNonNullable).forEach(queueMicrotask);
  updates.clear();
};
var defer = (update) => {
  if (!updates.has(update)) {
    if (updates.size === 0) {
      queueMicrotask(commit);
    }
    updates.add(update);
    (getObservers(update) || []).forEach(defer);
  }
};
var getObservable = (id2) => observables.get(id2);
var getObservers = (observable) => getObservable(observable)?.[1];
var spy = (expression) => {
  const dependencies = /* @__PURE__ */ new Set();
  context.push(dependencies);
  let value;
  try {
    value = expression();
  } finally {
    context.pop();
  }
  const id2 = Symbol();
  for (const dependency of dependencies) {
    getObservers(dependency)?.add(id2);
  }
  observables.set(id2, [
    [...dependencies].map(toDistance).reduce(toMax, -1) + 1,
    /* @__PURE__ */ new Set(),
    () => value = expression()
  ]);
  return [
    () => (track(id2), value),
    () => {
      for (const dependency of dependencies) {
        getObservers(dependency)?.delete(id2);
      }
      dependencies.clear();
      observables.delete(id2);
    }
  ];
};
function toDistance(observable) {
  return getObservable(observable)?.[0] || 0;
}
function toMax(a, b) {
  return Math.max(a, b);
}
function toUpdate(observable) {
  return getObservable(observable)?.[2];
}
function track(observable) {
  context[context.length - 1]?.add(observable);
}
function use(value) {
  const id2 = Symbol();
  observables.set(id2, [0, /* @__PURE__ */ new Set()]);
  return [
    (update) => (update ? defer(id2) : track(id2), value),
    (next) => (value = next, defer(id2))
  ];
}

// src/main/observers.ts
var nodeDisposables = /* @__PURE__ */ new WeakMap();
function addObservers(node, ...observers) {
  let disposables = nodeDisposables.get(node);
  if (!disposables) {
    nodeDisposables.set(node, disposables = []);
  }
  disposables.push(...observers.map(spy).map(toDisposable));
}
function removeObservers(node) {
  for (const dispose of nodeDisposables.get(node) || []) {
    dispose();
  }
  nodeDisposables.delete(node);
}
function toDisposable(derived) {
  return derived[1];
}

// src/main/on.ts
var listeners = /* @__PURE__ */ new WeakMap();
function removeEventListeners(node) {
  for (const [type, listener, options] of listeners.get(node) || []) {
    node.removeEventListener(type, listener, options);
  }
}
function on(type, listener, options) {
  return hook((node) => {
    node.addEventListener(type, listener, options);
    if (listeners.get(node)?.push([type, listener, options]) === void 0) {
      listeners.set(node, [[type, listener, options]]);
    }
  });
}

// src/main/reusable.ts
var reusableNodes = /* @__PURE__ */ new WeakSet();
function isReusable(node) {
  return reusableNodes.has(node);
}
function reusable(node) {
  return reusableNodes.add(node), node;
}

// src/main/remove.ts
function remove(node, force) {
  if (!force && isReusable(node)) {
    return;
  }
  for (const child of [...node.childNodes]) {
    remove(child, force);
  }
  removeObservers(node);
  removeEventListeners(node);
  node.parentNode?.removeChild(node);
}

// src/main/jot.ts
var hookTo = Symbol();
function apply(node, append, option) {
  if (option == null) {
    return;
  }
  switch (typeof option) {
    case "function": {
      return applyCallback(node, append, option);
    }
    case "object": {
      if ("nodeType" in option) {
        return append(option);
      }
      const applyObject = apply.bind(void 0, node, append);
      if (hookTo in option) {
        return applyObject(option[hookTo](node));
      }
      return Array.isArray(option) ? option.forEach(applyObject) : void Object.assign(node, option);
    }
  }
  if (node.ownerDocument) {
    append(node.ownerDocument.createTextNode(String(option)));
  }
}
function applyCallback(node, append, callback) {
  const children = [];
  let start;
  let end;
  const push = children.push.bind(children);
  function update() {
    const document = node.ownerDocument;
    if (!document) {
      return;
    }
    if (!start) {
      if (children.length === 0) {
        return;
      }
      append(start = document.createTextNode(""));
      append(end = document.createTextNode(""));
    }
    const range = document.createRange();
    range.setStartAfter(start);
    range.setEndBefore(end);
    const contents = range.extractContents();
    setTimeout(remove, 100, contents);
    if (children.length === 0) {
      return;
    }
    const fragment = document.createDocumentFragment();
    fragment.append(...children);
    range.insertNode(fragment);
  }
  addObservers(node, () => {
    apply(node, push, callback(node));
    update();
    children.length = 0;
  });
}
function hook(callback) {
  return {
    [hookTo]: callback
  };
}
function jot(node, ...options) {
  const append = node.appendChild.bind(node);
  const applyOption = apply.bind(void 0, node, append);
  return options.forEach(applyOption), node;
}

// src/main/attributes.ts
function attributes(attributes2, namespace) {
  namespace ||= null;
  return hook((element) => {
    for (const [name, value] of Object.entries(attributes2)) {
      if (value == null) {
        return element.removeAttributeNS(namespace, name);
      }
      element.setAttributeNS(namespace, name, String(value));
    }
  });
}

// src/main/tags.ts
function tag(...options) {
  return jot(this(), ...options);
}
function tags(document, namespace) {
  const createElement = namespace === void 0 ? document.createElement.bind(document) : document.createElementNS.bind(document, namespace);
  return new Proxy(
    {},
    {
      get(_, property) {
        return typeof property === "string" ? tag.bind(createElement.bind(void 0, property)) : void 0;
      },
      set() {
        return false;
      }
    }
  );
}
export {
  attributes,
  hook,
  isReusable,
  jot,
  on,
  remove,
  removeEventListeners,
  reusable,
  spy,
  tags,
  use
};
//# sourceMappingURL=jot.core.js.map
