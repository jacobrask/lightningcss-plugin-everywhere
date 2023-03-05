import test from "node:test";
import assert from "node:assert";
import { transform } from "lightningcss";
import EveryWhere from "../plugin.mjs";

test("wraps class selector", () => {
  let { code } = transform({
    filename: "style.css",
    code: Buffer.from(".foo { color: red }"),
    minify: true,
    visitor: EveryWhere,
  });
  assert.strictEqual(code.toString("utf-8"), ":where(.foo){color:red}");
});

test("does not wrap universal selector", () => {
  let { code } = transform({
    filename: "style.css",
    code: Buffer.from("* { color: red }"),
    minify: true,
    visitor: EveryWhere,
  });
  assert.strictEqual(code.toString("utf-8"), "*{color:red}");
});

test("does not wrap pseudo element selector", () => {
  let { code } = transform({
    filename: "style.css",
    code: Buffer.from("div::before { color: red }"),
    minify: true,
    visitor: EveryWhere,
  });
  assert.strictEqual(code.toString("utf-8"), ":where(div):before{color:red}");
});

test("does not wrap pseudo element selector", () => {
  let { code } = transform({
    filename: "style.css",
    code: Buffer.from("div::before:hover { color: red }"),
    minify: true,
    visitor: EveryWhere,
  });
  assert.strictEqual(
    code.toString("utf-8"),
    ":where(div):before:hover{color:red}"
  );

  {
    let { code } = transform({
      filename: "style.css",
      code: Buffer.from("div:hover::before{ color: red }"),
      minify: true,
      visitor: EveryWhere,
    });
    assert.strictEqual(
      code.toString("utf-8"),
      ":where(div:hover):before{color:red}"
    );
  }
});

test("does not wrap pseudo element selector combinators", () => {
  let { code } = transform({
    filename: "style.css",
    code: Buffer.from("div ::before { color: red }"),
    minify: true,
    visitor: EveryWhere,
  });
  assert.strictEqual(code.toString("utf-8"), ":where(div) :before{color:red}");
});

test("wraps class selector in @layer", () => {
  let { code } = transform({
    filename: "style.css",
    code: Buffer.from("@layer { .foo { color: red }}"),
    minify: true,
    visitor: EveryWhere,
  });
  assert.strictEqual(code.toString("utf-8"), "@layer{:where(.foo){color:red}}");
});
