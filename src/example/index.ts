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
  const [getCompleted, setCompleted] = use(false);

  return div(
    id(),
    button(
      view(() => (getCompleted() ? "↺" : "✔️")),
      on("click", () => setCompleted((value) => !value)),
    ),
    button("⌦", on("click", onclick)),
    span(
      label,
      watch((span) => {
        span.style.textDecoration = getCompleted() ? "line-through" : "";
      }),
    ),
  );
}

function App(): Option<Element> {
  // MODEL

  const [getTodoItems, setTodoItems] = use<string[]>([]);

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

  return [
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
    view(() => [
      ...getTodoItems()
        .entries()
        .map(([id, element]) =>
          Item("view => " + element, () => removeTodoItem(id)),
        ),
    ]),
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
