import { spy, use } from "../main/state.ts";

const a = use({ value: 0 });
const b = use({ value: 0 });

const c = spy(() => {
  return console.log("spy a", a.value), a;
});

const d = spy(() => {
  return console.log("spy b", b.value), b;
});

spy(() => {
  return console.log("spy a & b", a.value, b.value);
});

spy(() => {
  return console.log("spy a & d", a.value, d.value);
});

spy(() => {
  console.log("spy them all", a.value, b.value, c.value, d.value);
});

Deno.test("update a", () => {
  a.value = 1;
});

Deno.test("update b", () => {
  b.value = 2;
});

Deno.test("update a & b", () => {
  a.value = 3;
  b.value = 4;
});
