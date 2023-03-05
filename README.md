# lightningcss-plugin-everywhere

[Lightning CSS](https://lightningcss.dev) plugin to wrap all selectors in [`:where()`](https://developer.mozilla.org/en-US/docs/Web/CSS/:where), giving them 0 specificity.

Useful for creating unobtrusive CSS resets.

```css
// source, 0,1,1 specificity - more than a simple class selector.
input[type="text"] {
  border: 1px solid black;
}

// output, 0,0,0 specificity - any selector will override it.
:where(input[type="text"]) {
  border: 1px solid black;
}
```

## Usage

```js
import { transform } from "lightningcss";
import EveryWherePlugin from "lightningcss-plugin-everywhere";

let { code } = transform({
  filename: "style.css",
  code: Buffer.from("input[type=text] { border: 1px solid black }"),
  minify: true,
  visitor: EveryWherePlugin,
});
// code === ":where(input[type=text]){border:1px solid #000}"
```
