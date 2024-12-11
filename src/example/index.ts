import {
  $,
  css,
  fragment,
  id,
  jot,
  on,
  tags,
  use,
  watch,
} from "../main/mod.ts";

const { button, div, span, input, form } = tags;

function Item(label: string, onclick: EventListener) {
  const completed = use(false);

  return div(
    id(),
    button(
      "✔️",
      on("click", () => completed.set((value) => !value)),
    ),
    button("⌦", on("click", onclick)),
    span(label, {
      style: watch((s) => {
        s.textDecoration = $(completed) ? "line-through" : "";
      }),
    }),
  );
}

function App() {
  const todos = use<string[]>([]);
  const label = input();

  return fragment(
    form(
      label,
      button("+"),
      button(
        "⊗",
        { type: "button" },
        on("click", () => todos.set([])),
      ),
      on("submit", (event) => {
        event.preventDefault();

        if (!label.value) {
          return;
        }

        todos.set((items) => [...items, label.value]);
        label.value = "";
      }),
    ),
    fragment(() =>
      fragment(
        ...$(todos)
          .entries()
          .map(([id, element]) =>
            Item(element, () =>
              todos.set((items) => (items.splice(id, 1), [...items])),
            ),
          ),
      ),
    ),
  );
}

jot(
  document.body,
  App(),
  css(
    {
      fontFamily: "system-ui",
    },
    [
      "@media (prefers-color-scheme: dark)",
      [
        "&",
        {
          backgroundColor: "#333",
          color: "#ddd",
        },
      ],
    ],
    [
      "*",
      {
        all: "unset",
        display: "revert",
        margin: ".25rem",
        padding: ".25rem",
      },
    ],
    [
      "h1",
      {
        fontSize: "2rem",
      },
    ],
    [
      "input,button",
      {
        minHeight: "2rem",
        minWidth: "2rem",
        padding: ".25rem .75rem",
        border: ".1rem solid #ccc",
        backgroundColor: "#eee",
        color: "#333",
      },
    ],
    [
      "button",
      {
        textAlign: "center",
      },
    ],
  ),
);
