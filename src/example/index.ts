import { css, fragment, jot, on, tags, use, watch } from "../main/mod.ts";

const x = tags;

function Item(label: string, onclick: EventListener) {
  const completed = use(false);

  return x.div(
    x.button(
      "✔️",
      on("click", () => completed((value) => !value)),
    ),
    x.button("⌦", on("click", onclick)),
    x.span(label, {
      style: watch((s) => {
        s.textDecoration = completed() ? "line-through" : "";
      }),
    }),
  );
}

function App() {
  const todos = use<string[]>([]);
  const label = x.input();

  return fragment(
    x.form(
      label,
      x.button("+"),
      x.button(
        "⊗",
        { type: "button" },
        on("click", () => todos([])),
      ),
      on("submit", (event) => {
        event.preventDefault();

        if (!label.value) {
          return;
        }

        todos((items) => [...items, label.value]);
        label.value = "";
      }),
    ),
    fragment(() =>
      fragment(
        ...todos()
          .entries()
          .map(([id, element]) =>
            Item(element, () =>
              todos((items) => (items.splice(id, 1), [...items])),
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
      "*, ::before, ::after",
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
      "input, button",
      {
        minHeight: "2rem",
        minWidth: "2rem",
        padding: ".25rem .75rem",
        border: ".1rem solid #ccc",
        backgroundColor: "#eee",
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
