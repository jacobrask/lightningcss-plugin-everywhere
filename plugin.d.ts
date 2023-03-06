import { Visitor } from "lightningcss";

declare const plugin: {
  Rule: Visitor<any>["Rule"];
};

export default plugin;
