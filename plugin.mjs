/** @type {import('lightningcss').Visitor<any>} */
export default {
  Rule: {
    style(rule) {
      const flatSelectors = rule.value.selectors.flat();
      if (
        flatSelectors.every(
          (selector) =>
            selector.type === "universal" || selector.type === "pseudo-element"
        )
      ) {
        return rule;
      }

      if (
        flatSelectors.some(
          (selector) =>
            selector.type === "pseudo-element" ||
            (selector.type === "pseudo-class" &&
              (selector.kind === "where" || selector.kind === "is"))
        )
      ) {
        /** @type {import('lightningcss').SelectorList} */
        let selectors = [];
        for (let selectorGroup of rule.value.selectors) {
          if (
            selectorGroup.every(
              (selector) =>
                selector.type === "pseudo-class" && selector.kind === "where"
            )
          ) {
            selectors.push(selectorGroup);
          } else if (
            selectorGroup.every(
              (selector) =>
                selector.type === "pseudo-class" && selector.kind === "is"
            )
          ) {
            selectors.push(
              selectorGroup.map(
                (selector) =>
                  /** @type {import('lightningcss').SelectorComponent} */
                  ({
                    ...selector,
                    kind: "where",
                  })
              )
            );
          } else if (
            selectorGroup.some((selector) => selector.type === "pseudo-element")
          ) {
            // Pseudo elements are not supported inside :where so we need to move them outside
            // @ts-expect-error waiting for TS 5.0
            let outsideWhereIndex = selectorGroup.findLastIndex(
              (
                /** @type {import('lightningcss').SelectorComponent} */
                part
              ) => part.type === "pseudo-element"
            );
            while (
              selectorGroup[outsideWhereIndex - 1]?.type === "combinator"
            ) {
              outsideWhereIndex--;
            }
            const insideWhere = selectorGroup.slice(0, outsideWhereIndex);
            const outsideWhere = selectorGroup.slice(outsideWhereIndex);

            // * selectors already have 0 specificity
            if (
              insideWhere.every(
                (selector) =>
                  selector.type === "universal" ||
                  (selector.type === "pseudo-class" &&
                    selector.kind === "where")
              )
            ) {
              selectors.push([...insideWhere, ...outsideWhere]);
            } else {
              selectors.push([
                {
                  type: "pseudo-class",
                  kind: "where",
                  selectors: [insideWhere],
                },
                ...outsideWhere,
              ]);
            }
          } else {
            selectors.push([
              {
                type: "pseudo-class",
                kind: "where",
                selectors: [selectorGroup],
              },
            ]);
          }
        }
        rule.value.selectors = selectors;
      } else {
        rule.value.selectors = [
          [
            {
              type: "pseudo-class",
              kind: "where",
              selectors: rule.value.selectors,
            },
          ],
        ];
      }
      return rule;
    },
  },
};
