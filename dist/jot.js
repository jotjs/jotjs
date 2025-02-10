// src/main/on.ts
var listeners = /* @__PURE__ */ new WeakMap();
function removeEventListeners(node) {
  for (const [type, listener, options] of listeners.get(node) || []) {
    node.removeEventListener(type, listener, options);
  }
}
function on(type, listener, options) {
  return {
    [hook](node) {
      node.addEventListener(type, listener, options);
      if (listeners.get(node)?.push([type, listener, options]) === void 0) {
        listeners.set(node, [[type, listener, options]]);
      }
    }
  };
}

// src/main/state.ts
var updates;
var dependencies;
function defer(update) {
  if (!updates) {
    const session = updates = /* @__PURE__ */ new Set();
    queueMicrotask(() => {
      try {
        for (const update2 of [...session]) {
          update2();
        }
      } finally {
        updates = void 0;
      }
    });
  }
  updates.add(update);
}
function prepare(observables) {
  return [dependencies = /* @__PURE__ */ new Set(), () => dependencies = observables];
}
function spy(spy2) {
  const [observables, restore] = prepare(dependencies);
  let getValue, setValue;
  try {
    [getValue, setValue] = use(spy2());
  } finally {
    restore();
  }
  let session;
  const observer = () => {
    if (session !== updates) {
      session = updates;
      setValue(spy2(), true);
    }
  };
  const disposables2 = [...observables].map((add) => add(observer));
  return [
    () => getValue(),
    () => {
      for (const dispose of disposables2) {
        dispose();
      }
    }
  ];
}
function use(value2) {
  const observers = /* @__PURE__ */ new Set();
  const observable = (observer) => {
    observers.add(observer);
    return () => observers.delete(observer);
  };
  const update = () => {
    for (const observe of observers) {
      observe();
    }
  };
  return [
    (notify) => {
      if (notify) {
        defer(update);
      }
      dependencies?.add(observable);
      return value2;
    },
    (next, now) => {
      value2 = next;
      if (now) {
        update();
      } else {
        defer(update);
      }
    }
  ];
}

// src/main/jot.ts
var global = { window };
var reserve = /* @__PURE__ */ new WeakSet();
var disposables = /* @__PURE__ */ new WeakMap();
var hook = Symbol();
function apply(node, option) {
  if (option == null) {
    return;
  }
  switch (typeof option) {
    case "function":
      return applyCallback(node, option);
    case "object":
      if (hook in option) {
        return apply(node, option[hook](node));
      }
      if ("nodeType" in option) {
        return void node.appendChild(option);
      }
      if (Array.isArray(option)) {
        return void jot(node, ...option);
      }
      return void Object.assign(node, option);
  }
  return void node.appendChild(
    global.window.document.createTextNode(String(option))
  );
}
function applyCallback(node, callback) {
  let spies = disposables.get(node);
  if (!spies) {
    disposables.set(node, spies = []);
  }
  const reference = new WeakRef(node);
  spies.push(
    spy(() => {
      const node2 = reference.deref();
      if (node2) {
        apply(node2, callback(node2));
      }
    })[1]
  );
}
function jot(node, ...options) {
  for (const option of options) {
    apply(node, option);
  }
  return node;
}
function remove(node, force) {
  if (!force && reserve.has(node)) {
    return;
  }
  for (const child of [...node.childNodes]) {
    remove(child, force);
  }
  removeSpies(node);
  removeEventListeners(node);
  node.parentNode?.removeChild(node);
}
function removeSpies(node) {
  for (const dispose of disposables.get(node) || []) {
    dispose();
  }
  disposables.delete(node);
}
function reusable(node) {
  reserve.add(node);
  return node;
}

// src/main/attributes.ts
function set(attributes, namespace) {
  namespace = namespace || null;
  return {
    [hook](element) {
      for (const [name, value2] of Object.entries(attributes)) {
        if (value2 == null) {
          return element.removeAttributeNS(namespace, name);
        }
        element.setAttributeNS(namespace, name, String(value2));
      }
    }
  };
}

// src/main/id.ts
var value = 0n;
function id() {
  const id2 = String(value++);
  return Object.assign(id2, {
    [hook](element) {
      element.id = id2;
    }
  });
}

// src/main/css.ts
var regex = /([A-Z])/g;
var stylePrefix;
var styleSheet;
function createStyleSheet() {
  const { document } = global.window;
  const style = document.createElement("style");
  document.head.appendChild(style);
  if (!style.sheet) {
    throw new Error("sheet cannot be null");
  }
  return style.sheet;
}
function css(style, global2) {
  if (!styleSheet) {
    styleSheet = createStyleSheet();
  }
  if (global2) {
    return newGlobalStyle(style, styleSheet);
  }
  return newStyle(style, styleSheet);
}
function insert(selector, style, styleSheet2) {
  styleSheet2.insertRule(
    `${selector}{${toString(style)}}`,
    styleSheet2.cssRules.length
  );
}
function newGlobalStyle(style, styleSheet2) {
  for (const [key, value2] of Object.entries(style)) {
    if (typeof value2 === "string") {
      throw Error(`"${value2}" cannot be used as global Style`);
    }
    for (const style2 of Array.isArray(value2) ? value2 : [value2]) {
      insert(key, style2, styleSheet2);
    }
  }
  return "";
}
function newStyle(style, styleSheet2) {
  const className = (stylePrefix || "s") + id();
  insert(`.${className}`, style, styleSheet2);
  return Object.assign(className, {
    [hook](element) {
      element.classList.add(className);
    }
  });
}
function setStylePrefix(prefix) {
  stylePrefix = prefix;
}
function setStyleSheet(sheet) {
  styleSheet = sheet;
}
function toggle(className, force) {
  return {
    [hook](element) {
      element.classList.toggle(String(className), force);
    }
  };
}
var toKeyValueString = ([key, value2]) => {
  if (typeof value2 === "string") {
    if (!key.startsWith("--")) {
      key = key.replace(regex, "-$1").toLowerCase();
    }
    return `${key}:${value2};`;
  }
  if (!Array.isArray(value2)) {
    value2 = [value2];
  }
  return value2.map((value3) => `${key}{${toString(value3)}}`).join("");
};
function toString(style) {
  return Object.entries(style).map(toKeyValueString).join("");
}

// src/main/tags.ts
var tags = createTagsFactory();
function createTagsFactory(namespace) {
  const createElement = namespace === void 0 ? (tag) => global.window.document.createElement(tag) : (tag) => global.window.document.createElementNS(namespace, tag);
  return new Proxy(
    createTagsFactory,
    {
      get(target, property, receiver) {
        if (typeof property !== "string") {
          return Reflect.get(target, property, receiver);
        }
        return (...options) => {
          return jot(createElement(property), ...options);
        };
      }
    }
  );
}

// src/main/view.ts
var ends = /* @__PURE__ */ new WeakMap();
function view(view2) {
  const { document } = global.window;
  const start = document.createTextNode("");
  const end = document.createTextNode("");
  const reference = new WeakRef(start);
  ends.set(start, end);
  return [
    start,
    (node) => {
      const start2 = reference.deref();
      if (!start2) {
        return;
      }
      const end2 = ends.get(start2);
      if (!end2) {
        return;
      }
      const slot = jot(document.createDocumentFragment(), view2(node));
      if (!end2.parentNode) {
        return slot;
      }
      const range = document.createRange();
      range.setStartAfter(start2);
      range.setEndBefore(end2);
      const contents = range.extractContents();
      range.insertNode(slot);
      setTimeout(remove, 100, contents);
    },
    end
  ];
}
export {
  css,
  global,
  hook,
  id,
  jot,
  on,
  remove,
  removeEventListeners,
  reusable,
  set,
  setStylePrefix,
  setStyleSheet,
  spy,
  tags,
  toggle,
  use,
  view
};
//# sourceMappingURL=jot.js.map
