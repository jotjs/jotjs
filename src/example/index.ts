import { css, id, jot, on, tags, toggle, use } from "../main/mod.ts";

const { button, div, span, input, form, link, h1 } = tags(document);

const icon = toggle("material-symbols-outlined", true);

const itemStyle = css({
  margin: ".5rem 0",
  display: "flex",
  gap: ".5rem",
  alignItems: "center",
});

function Item(label: string, onDeleteClick: VoidFunction) {
  const [completed, setCompleted] = use(false);

  return div(
    id(),
    itemStyle,
    button(
      icon,
      () => (completed() ? "remove_done" : "check"),
      on("click", () => setCompleted(!completed())),
    ),
    button(icon, "close", on("click", onDeleteClick)),
    span(label, (span) => {
      span.style.textDecoration = completed() ? "line-through" : "";
    }),
  );
}

function App() {
  // MODEL

  const [list, setList] = use<string[]>([]);

  function clearItems() {
    setList([]);
  }

  function addItem(item: string) {
    list(true).push(item);
  }

  function removeItem(id: number) {
    list(true).splice(id, 1);
  }

  // UI

  const label = input({ autofocus: true });

  return [
    h1(css({ fontSize: "2rem", margin: ".5rem 0" }), "TODO List"),
    form(
      css({ display: "flex", gap: ".5rem" }),
      label,
      button(icon, "add"),
      button(
        icon,
        { type: "reset" },
        "clear_all",
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
    () =>
      [...list().entries()].map(([id, element]) =>
        Item(element, () => removeItem(id)),
      ),
  ];
}

jot(
  document.body,
  App(),
  link({
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined&family=Noto+Sans",
  }),
  css(
    {
      "*": {
        all: "unset",
        display: "revert",
        verticalAlign: "middle",
      },
      ":root": {
        fontFamily: "Noto Sans, sans-serif",
        color: "#282A36",
        backgroundColor: "#F8F8F2",
      },
      "@media(prefers-color-scheme:dark)": {
        ":root": {
          backgroundColor: "#282A36",
          color: "#F8F8F2",
        },
      },
      body: {
        padding: "2rem",
      },
      "input,button": {
        padding: ".25rem",
        backgroundColor: "#F8F8F2",
        color: "#282A36",
      },
      button: {
        textAlign: "center",
      },
    },
    true,
  ),
);
