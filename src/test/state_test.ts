import { derived, mutable } from "../main/state.ts";

const a = mutable({ value: 0 });
const b = mutable({ value: 0 });

const c = derived(() => {
  return console.log("spy a", a.value), a;
});

const d = derived(() => {
  return console.log("spy b", b.value), b;
});

derived(() => {
  return console.log("spy a & b", a.value, b.value);
});

derived(() => {
  return console.log("spy a & d", a.value, d.value);
});

derived(() => {
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
