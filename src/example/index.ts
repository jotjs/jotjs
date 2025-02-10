import { globalCss } from "../main/css.ts";
import {
  css,
  id,
  jot,
  mutable,
  on,
  tags,
  toggle,
  type Option,
} from "../main/mod.ts";

const { button, div, span, input, form, link } = tags(document);

const icon = toggle("material-symbols-outlined", true);

function Item(label: string, deleteOption: Option<HTMLButtonElement>) {
  const item = mutable({ completed: false });

  return div(
    id(),
    css({
      margin: ".5rem 0",
      display: "flex",
      gap: ".5rem",
      alignItems: "center",
    }),
    button(
      () => span(icon, item.completed ? "remove_done" : "check"),
      on("click", () => (item.completed = !item.completed)),
    ),
    button(span(icon, "close"), deleteOption),
    span(label, (span) => {
      span.style.textDecoration = item.completed ? "line-through" : "";
    }),
  );
}

function App(): Option<Element> {
  // MODEL

  const items = mutable({ list: <string[]>[] });

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

  const label = input({ autofocus: true });

  return [
    form(
      css({ display: "flex", gap: ".5rem" }),
      label,
      button(span(icon, "add")),
      button(
        { type: "button" },
        span(icon, "clear_all"),
        on("click", () => {
          clearItems();
        }),
      ),
      on("submit", (event) => {
        event.preventDefault();
        console.log("hi");
        if (!label.value) {
          return;
        }

        addItem(label.value);
        label.value = "";
      }),
    ),
    () =>
      [...items.list.entries()].map(([id, element]) =>
        Item(
          element,
          on("click", () => removeItem(id)),
        ),
      ),
  ];
}

jot(
  document.body,
  App(),
  link({
    href: "https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined",
    rel: "stylesheet",
  }),
  globalCss({
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
  }),
);
