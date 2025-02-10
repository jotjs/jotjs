import { spy, use } from "../main/state.ts";

const [getFoo] = use({ foo: 1 });
const [getBar] = use({ bar: 2 });

const [getFooSpy] = spy(() => {
  const foo = getFoo();

  console.log("spy foo", foo.foo);

  return foo;
});

const [getBarSpy] = spy(() => {
  const bar = getBar();

  console.log("spy bar", bar.bar);

  return bar;
});

spy(() => {
  const foo = getFooSpy();
  const bar = getBarSpy();

  console.log("spy foo & bar", foo.foo, bar.bar);
});

Deno.test("update foo", () => {
  getFoo(true).foo = 3;
});

Deno.test("update bar", () => {
  getBar(true).bar = 4;
});

Deno.test("update foo & bar", () => {
  getFoo(true).foo = 5;
  getBar(true).bar = 6;
});
