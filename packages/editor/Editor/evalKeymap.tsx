import { KeyBinding } from '@codemirror/view';
import { tsEnvStateField } from './typescript';

export const evalKeymap: KeyBinding = {
  key: 'Alt-Enter',
  run(target) {
    // TODO: Handle not eval'ing when cursor is on a blank line
    // TODO: Handle eval'ing when cursor is after semicolon for last statement on a line (or not?).
    // TODO: ^ also when cursor is after semicolon before next statement on the same line (or not?).

    const { state } = target;
    const tsEnv = state.field(tsEnvStateField);

    const ast = tsEnv.getSourceFile('index.ts');

    if (!ast) return true;

    const statementsToEval = ast.statements.filter((statement) =>
      state.selection.ranges.some(
        (range) =>
          (statement.pos <= range.from && range.from < statement.end) ||
          (statement.pos < range.to && range.to < statement.end) ||
          // The statement is entirely selected by the range.
          (range.from <= statement.pos && statement.end <= range.to),
      ),
    );

    const contents = statementsToEval
      .map((statement) => state.sliceDoc(statement.pos, statement.end))
      .join('');

    console.log('eval', contents);

    // This is the whole point.
    // eslint-disable-next-line no-eval
    const globalEval = eval;
    globalEval(contents);

    return true;
  },
  shift(target) {
    const { state } = target;
    const tsEnv = state.field(tsEnvStateField);

    const ast = tsEnv.getSourceFile('index.ts');

    if (!ast) return true;

    const statementsToEval = ast.statements;

    const contents = statementsToEval
      .map((statement) => state.sliceDoc(statement.pos, statement.end))
      .join('');

    console.log('eval', contents);

    // This is the whole point.
    // eslint-disable-next-line no-eval
    const globalEval = eval;
    globalEval(contents);

    return true;
  },
};
