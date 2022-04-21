import { KeyBinding } from "@codemirror/view";
import prettier from "prettier";
import parserBabel from "prettier/parser-babel";

export const formatKeymap: KeyBinding = {
  key: "Alt-f",
  run(target) {
    const { state } = target;

    const doc = state.sliceDoc();
    const curPos = state.selection.main;

    try {
      const { cursorOffset, formatted } = prettier.formatWithCursor(doc, {
        parser: "babel",
        plugins: [parserBabel],
        tabWidth: 2,
        useTabs: false,
        cursorOffset: curPos.head,
        printWidth: 50,
      });

      target.dispatch({
        changes: {
          from: 0,
          to: state.doc.length,
          insert: formatted,
        },
      });
      target.dispatch({
        selection: {
          anchor: cursorOffset,
        },
      });
    } catch {}

    return true;
  },
};
