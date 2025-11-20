import { assertEquals } from "@std/assert";
import { describe } from "@std/testing/bdd";
import { html } from "../main/html.ts";

describe("unsafe characters escape", () => {
  assertEquals(
    String(
      html`${Array(95)
        .keys()
        .toArray()
        .map((k) => String.fromCharCode(k + 32))
        .join("")}`,
    ),
    " &#33;&#34;&#35;&#36;&#37;&#38;&#39;&#40;&#41;&#42;&#43;&#44;&#45;&#46;&#47;0123456789&#58;&#59;&#60;&#61;&#62;&#63;&#64;ABCDEFGHIJKLMNOPQRSTUVWXYZ&#91;&#92;&#93;&#94;&#95;&#96;abcdefghijklmnopqrstuvwxyz&#123;&#124;&#125;&#126;",
  );
});
