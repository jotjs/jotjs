import { css, id, jot, on, tags, use, view, type Option } from "../main/mod.ts";

export const { button, div, span, input, form, link } = tags;

function Item(label: string, deleteOption: Option<HTMLButtonElement>) {
  const item = use({ completed: false });

  return div(
    id(),
    css({
      margin: ".5rem 0",
      display: "flex",
      gap: ".5rem",
      alignItems: "center",
    }),
    button(
      view(() =>
        span(
          { className: "material-symbols-outlined" },
          item.completed ? "remove_done" : "check",
        ),
      ),
      on("click", () => (item.completed = !item.completed)),
    ),
    button(
      span({ className: "material-symbols-outlined" }, "close"),
      deleteOption,
    ),
    span(label, (span) => {
      span.style.textDecoration = item.completed ? "line-through" : "";
    }),
  );
}

function App(): Option<Element> {
  // MODEL

  const items = use({ list: <string[]>[] });

  function clearItems() {
    items.$list.length = 0;
  }

  function addItem(item: string) {
    items.$list.push(item);
  }

  function removeItem(id: number) {
    items.$list.splice(id, 1);
  }

  // UI

  const label = input();

  return [
    form(
      css({ display: "flex", gap: ".5rem" }),
      label,
      button(span({ className: "material-symbols-outlined" }, "add")),
      button(
        span({ className: "material-symbols-outlined" }, "clear_all"),
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
    view(() => [
      [...items.list.entries()].map(([id, element]) =>
        Item(
          element,
          on("click", () => removeItem(id)),
        ),
      ),
    ]),
  ];
}

jot(
  document.head,
  link({
    href: "https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined",
    rel: "stylesheet",
  }),
);
jot(document.body, App());

css(
  {
    "*": {
      all: "unset",
      display: "revert",
      verticalAlign: "middle",
    },
    ":root": {
      fontFamily: "system-ui",
      color: "#282A36",
      backgroundColor: "#F8F8F2",
    },
    "@media (prefers-color-scheme: dark)": {
      ":root": {
        backgroundColor: "#282A36",
        color: "#F8F8F2",
      },
    },
    h1: {
      fontSize: "2rem",
    },
    body: {
      padding: ".5rem",
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
