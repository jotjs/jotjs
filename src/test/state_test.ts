import { spy, use } from "../main/state.ts";

const [a, setA] = use(0);
const [b, setB] = use(0);

const [c] = spy(() => {
  return console.log("spy a", a()), a();
});

const [d] = spy(() => {
  return console.log("spy b", b()), b();
});

spy(() => {
  return console.log("spy a & b", a(), b());
});

spy(() => {
  return console.log("spy a & d", a(), d());
});

spy(() => {
  console.log("spy them all", a(), b(), c(), d());
});

Deno.test("update a", () => {
  setA(1);
});

Deno.test("update b", () => {
  setB(2);
});

Deno.test("update a & b", () => {
  setA(3);
  setB(4);
});
