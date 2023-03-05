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
        !flatSelectors.some((selector) => selector.type === "pseudo-element")
      ) {
        rule.value.selectors = [
          [
            {
              type: "pseudo-class",
              kind: "where",
              selectors: rule.value.selectors,
            },
          ],
        ];
      } else {
        let selectors = [];
        for (let selectorGroup of rule.value.selectors) {
          // Pseudo elements are not supported inside :where so we need to move them outside
          let outsideWhereIndex = selectorGroup.findLastIndex(
            (part) => part.type === "pseudo-element"
          );
          while (selectorGroup[outsideWhereIndex - 1]?.type === "combinator") {
            outsideWhereIndex--;
          }
          const insideWhere = selectorGroup.slice(0, outsideWhereIndex);
          const outsideWhere = selectorGroup.slice(outsideWhereIndex);

          // * selectors already have 0 specificity
          if (insideWhere.every((selector) => selector.type === "universal")) {
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
        }
        rule.value.selectors = selectors;
      }
      return rule;
    },
  },
};
