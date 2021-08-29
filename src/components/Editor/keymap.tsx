import { KeyBinding } from "@codemirror/view";
import { tsEnvStateField } from "./typescript";

export const keymap: KeyBinding = {
  key: "Alt-Enter",
  run(target) {
    // TODO: Handle not eval'ing when cursor is on a blank line
    // TODO: Handle eval'ing when cursor is after semicolon for last statement on a line (or not?).
    // TODO: ^ also when cursor is after semicolon before next statement on the same line (or not?).

    const { state } = target;
    const tsEnv = state.field(tsEnvStateField);

    const ast = tsEnv.getSourceFile("index.ts");

    if (!ast) return true;

    const statementsToEval = ast.statements.filter((statement) =>
      state.selection.ranges.some(
        (range) =>
          (statement.pos <= range.from && range.from < statement.end) ||
          (statement.pos < range.to && range.to < statement.end) ||
          // The statement is entirely selected by the range.
          (range.from <= statement.pos && statement.end <= range.to)
      )
    );

    const diagnostics =
      tsEnv.languageService.getSemanticDiagnostics("index.ts");

    if (diagnostics.length) {
      console.log("diagnostics", diagnostics);
    } else {
      const contents = statementsToEval
        .map((statement) => state.sliceDoc(statement.pos, statement.end))
        .join("");

      // This is the whole point.
      // eslint-disable-next-line no-eval
      eval(contents);
    }

    return true;
  },
  shift(target) {
    const { state } = target;
    const tsEnv = state.field(tsEnvStateField);

    const diagnostics =
      tsEnv.languageService.getSemanticDiagnostics("index.ts");

    if (diagnostics.length) {
      console.log("diagnostics", diagnostics);
    } else {
      const contents = state.sliceDoc();

      // This is the whole point.
      // eslint-disable-next-line no-eval
      eval(contents);
    }

    return true;
  },
};