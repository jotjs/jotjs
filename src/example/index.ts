import { $, css, group, id, jot, on, use, view, watch } from "../main/mod.ts";
import { button, div, form, input, span } from "./tags.ts";

function Item(label: string, onclick: EventListener) {
  const [completed, setCompleted] = use(false);

  return div(
    id(),
    button(
      view(() => ($(completed) ? "↺" : "✔️")),
      on("click", () => setCompleted((value) => !value)),
    ),
    button("⌦", on("click", onclick)),
    span(
      label,
      watch((node) => {
        node.style.textDecoration = $(completed) ? "line-through" : "";
      }),
    ),
  );
}

function App() {
  // MODEL

  const [todoItems, setTodoItems] = use<string[]>([]);

  function clearTodoItems() {
    setTodoItems((items) => {
      items.length = 0;
    });
  }

  function addTodoItem(item: string) {
    setTodoItems((todoItems) => {
      todoItems.push(item);
    });
  }

  function removeTodoItem(id: number) {
    setTodoItems((items) => {
      items.splice(id, 1);
    });
  }

  // UI

  const label = input();

  return group(
    form(
      label,
      button("+"),
      button(
        "⊗",
        on("click", () => {
          clearTodoItems();
        }),
      ),
      on("submit", (event) => {
        event.preventDefault();

        if (!label.value) {
          return;
        }

        addTodoItem(label.value);
        label.value = "";
      }),
    ),
    view(() =>
      group(
        ...$(todoItems)
          .entries()
          .map(([id, element]) =>
            Item("view => " + element, () => removeTodoItem(id)),
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
