import { autocompletion, completeFromList } from '@codemirror/autocomplete';
import { Extension } from '@codemirror/state';
import { tsEnvStateField } from './typescript';

export function createAutocompletion(): Extension {
  return autocompletion({
    override: [
      (ctx) => {
        const { pos, state } = ctx;
        const tsEnv = state.field(tsEnvStateField);

        const completions = tsEnv.languageService.getCompletionsAtPosition(
          'index.ts',
          pos,
          {},
        );

        if (!completions) {
          return null;
        }

        return completeFromList(
          completions.entries.map((c) => ({
            type: c.kind,
            label: c.name,
          })),
        )(ctx);
      },
    ],
  });
}
