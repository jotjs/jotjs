import {
  css,
  id,
  jot,
  on,
  tags,
  use,
  view,
  watch,
  type Option,
} from "../main/mod.ts";

export const { button, div, span, input, form } = tags;

function Item(label: string, onclick: EventListener) {
  const [completed, update] = use(false);

  return div(
    id(),
    button(
      view(({ completed }) => (completed ? "↺" : "✔️"), { completed }),
      on("click", () => update.with((completed, set) => set(!completed))),
    ),
    button("⌦", on("click", onclick)),
    span(
      label,
      watch(
        ({ completed }, span) => {
          span.style.textDecoration = completed ? "line-through" : "";
        },
        { completed },
      ),
    ),
  );
}

function App(): Option<Element> {
  // MODEL

  const [items, update] = use<string[]>([]);

  function clearItems() {
    update.with((items) => {
      items.length = 0;
    });
  }

  function addItem(item: string) {
    update.with((items) => {
      items.push(item);
    });
  }

  function removeItem(id: number) {
    update.with((items) => {
      items.splice(id, 1);
    });
  }

  // UI

  const label = input();

  return [
    form(
      label,
      button("+"),
      button(
        "⊗",
        on("click", () => {
          clearItems();
        }),
      ),
      on("submit", (event) => {
        event.preventDefault();

        if (!label.value) {
          return;
        }

        addItem(label.value);
        label.value = "";
      }),
    ),
    view(
      ({ items }) => [
        [...items.entries()].map(([id, element]) =>
          Item("view => " + element, () => removeItem(id)),
        ),
      ],
      { items },
    ),
  ];
}

jot(document.body, App());

css(
  {
    "*": [
      {
        all: "unset",
        display: "revert",
        margin: ".2rem",
        padding: ".2rem",
        "--fooBar": "foo",
      },
    ],
    ":root": {
      fontFamily: "system-ui",
    },
    "@media (prefers-color-scheme: dark)": {
      ":root": {
        backgroundColor: "#333",
        color: "#ddd",
      },
    },
    h1: {
      fontSize: "2rem",
    },
    "input,button": {
      minHeight: "2rem",
      minWidth: "2rem",
      padding: ".25rem .75rem",
      border: ".1rem solid #ccc",
      backgroundColor: "#eee",
      color: "#333",
    },
    button: {
      textAlign: "center",
    },
  },
  true,
);
