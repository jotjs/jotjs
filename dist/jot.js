// src/main/attributes.ts
function attributes(attributes2, namespace) {
  namespace ||= null;
  return hook((element) => {
    for (const [name, value2] of Object.entries(attributes2)) {
      if (value2 == null) {
        return element.removeAttributeNS(namespace, name);
      }
      element.setAttributeNS(namespace, name, String(value2));
    }
  });
}

// src/main/state.ts
var disposal = Symbol();
var prefix = "$";
var session = /* @__PURE__ */ new Set();
var observables = /* @__PURE__ */ new WeakMap();
var targets;
function byDistance(a, b) {
  return toDistance(a) - toDistance(b);
}
function commit() {
  for (const update of [...session].sort(byDistance).map(toUpdate)) {
    if (update) {
      queueMicrotask(update);
    }
  }
  session.clear();
}
function defer(update) {
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
function derived(state) {
  const [dependencies, restore] = prepare(targets);
  const mutable2 = {};
  try {
    Object.assign(mutable2, state());
  } finally {
    restore();
  }
  const id2 = Symbol();
  for (const dependency of dependencies) {
    observables.get(dependency)?.observers.add(id2);
  }
  observables.set(id2, {
    distance: [...dependencies].map(toDistance).reduce(toMax, -1) + 1,
    observers: /* @__PURE__ */ new Set(),
    update() {
      Object.assign(mutable2, state());
    }
  });
  return new Proxy(mutable2, {
    get(target, property, receiver) {
      if (property === disposal) {
        return () => {
          for (const dependency of dependencies) {
            observables.get(dependency)?.observers.delete(id2);
          }
          dependencies.clear();
          dependencies.delete(id2);
        };
      }
      targets?.add(id2);
      return Reflect.get(target, property, receiver);
    },
    set() {
      return false;
    }
  });
}
function dispose(...disposables2) {
  for (const disposable of disposables2) {
    disposable[disposal]();
  }
}
function mutable(state) {
  const id2 = Symbol();
  observables.set(id2, {
    distance: 0,
    observers: /* @__PURE__ */ new Set()
  });
  return new Proxy(state, {
    get(target, property, receiver) {
      if (typeof property === "string" && property.startsWith(prefix)) {
        return defer(id2), Reflect.get(target, property.substring(prefix.length), receiver);
      }
      targets?.add(id2);
      return Reflect.get(target, property, receiver);
    },
    set(target, property, value2, receiver) {
      if (typeof property === "string" && property.startsWith(prefix)) {
        return false;
      }
      defer(id2);
      return Reflect.set(target, property, value2, receiver);
    }
  });
}
function prepare(dependencies) {
  return [targets = /* @__PURE__ */ new Set(), () => targets = dependencies];
}
function toDistance(observable) {
  return observables.get(observable)?.distance || 0;
}
function toMax(a, b) {
  return Math.max(a, b);
}
function toUpdate(observable) {
  return observables.get(observable)?.update;
}

// src/main/observers.ts
var disposables = /* @__PURE__ */ new WeakMap();
function addObservers(node, ...observers) {
  let list = disposables.get(node);
  if (!list) {
    disposables.set(node, list = []);
  }
  list.push(...observers.map(derived));
}
function removeObservers(node) {
  const list = disposables.get(node);
  if (!list) {
    return;
  }
  for (const disposable of list) {
    dispose(disposable);
  }
  disposables.delete(node);
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
function apply(node, option, applyNode) {
  if (option == null) {
    return;
  }
  switch (typeof option) {
    case "function":
      return applyCallback(node, option, applyNode);
    case "object":
      if (hookTo in option) {
        return apply(node, option[hookTo](node), applyNode);
      }
      if ("nodeType" in option) {
        return applyNode(option);
      }
      if (Array.isArray(option)) {
        for (const nested of option) {
          apply(node, nested, applyNode);
        }
      } else {
        Object.assign(node, option);
      }
      return;
  }
  if (node.ownerDocument) {
    applyNode(node.ownerDocument.createTextNode(String(option)));
  }
}
function applyCallback(node, callback, applyNode) {
  const children = [];
  let start;
  let end;
  function applyChildNode(child) {
    children.push(child);
  }
  function update() {
    const document = node.ownerDocument;
    if (!document) {
      return;
    }
    if (!start) {
      if (children.length === 0) {
        return;
      }
      applyNode(start = document.createTextNode(""));
      applyNode(end = document.createTextNode(""));
    }
    const range = document.createRange();
    range.setStartAfter(start);
    range.setEndBefore(end);
    const contents = range.extractContents();
    setTimeout(remove, 100, contents);
    if (children.length === 0) {
      return;
    }
    const fragment2 = document.createDocumentFragment();
    fragment2.append(...children);
    range.insertNode(fragment2);
  }
  addObservers(node, () => {
    apply(node, callback(node), applyChildNode);
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
  function applyNode(child) {
    node.appendChild(child);
  }
  for (const option of options) {
    apply(node, option, applyNode);
  }
  return node;
}

// src/main/tags.ts
function tags(document, namespace) {
  const createElement = namespace === void 0 ? (tag) => document.createElement(tag) : (tag) => document.createElementNS(namespace, tag);
  return new Proxy(
    {},
    {
      get(_, property) {
        if (typeof property !== "string") {
          return void 0;
        }
        return (...options) => {
          return jot(createElement(property), ...options);
        };
      }
    }
  );
}

// src/main/utils.ts
var value = 0n;
function fragment(...options) {
  return hook((node) => {
    if (node.ownerDocument) {
      return jot(node.ownerDocument?.createDocumentFragment(), ...options);
    }
  });
}
function id() {
  const id2 = String(value++);
  return Object.assign(
    id2,
    hook((element) => {
      element.id = id2;
    })
  );
}

// src/main/css.ts
var styles = /* @__PURE__ */ new WeakSet();
var upperCaseLetters = /([A-Z])/g;
var stylePrefix;
var styleSheet;
function css(style) {
  const styleId = Symbol();
  const className = (stylePrefix || "s") + id();
  return Object.assign(
    className,
    hook((element) => {
      if (!styles.has(styleId)) {
        insert(
          getStyleSheet(element.ownerDocument),
          `.${className}`,
          toString(style)
        );
      }
      element.classList.add(className);
    })
  );
}
function getStyleSheet(document) {
  if (styleSheet) {
    return styleSheet;
  }
  const style = document.createElement("style");
  document.head.appendChild(style);
  styleSheet = style.sheet;
  return getStyleSheet(document);
}
function globalCss(style) {
  const styleId = Symbol();
  return hook((element) => {
    if (styles.has(styleId)) {
      return;
    }
    const styleSheet2 = getStyleSheet(element.ownerDocument);
    for (const [selector, value2] of Object.entries(style)) {
      if (typeof value2 === "string") {
        insert(styleSheet2, selector, value2);
      } else {
        for (const style2 of Array.isArray(value2) ? value2 : [value2]) {
          insert(styleSheet2, selector, toString(style2));
        }
      }
    }
    styles.add(styleId);
  });
}
function insert(styleSheet2, selector, rule) {
  styleSheet2.insertRule(`${selector}{${rule}}`, styleSheet2.cssRules.length);
}
function setStylePrefix(prefix2) {
  stylePrefix = prefix2;
}
function setStyleSheet(sheet) {
  styleSheet = sheet;
}
function toggle(className, force) {
  return hook((element) => {
    element.classList.toggle(className, force);
  });
}
function toString(style) {
  return Object.entries(style).map(toStyleString).join("");
}
function toStyleString([key, style]) {
  if (typeof style === "string") {
    if (!key.startsWith("--")) {
      key = key.replaceAll(upperCaseLetters, "-$1").toLowerCase();
    }
    return `${key}:${style};`;
  }
  if (!Array.isArray(style)) {
    style = [style];
  }
  return style.map((style2) => `${key}{${toString(style2)}}`).join("");
}
export {
  attributes,
  css,
  derived,
  dispose,
  fragment,
  globalCss,
  hook,
  id,
  isReusable,
  jot,
  mutable,
  on,
  remove,
  removeEventListeners,
  reusable,
  setStylePrefix,
  setStyleSheet,
  tags,
  toggle
};
//# sourceMappingURL=jot.js.map
