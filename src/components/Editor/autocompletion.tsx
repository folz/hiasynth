import { autocompletion, completeFromList } from "@codemirror/autocomplete";
import { Extension } from "@codemirror/state";
import { VirtualTypeScriptEnvironment } from "@typescript/vfs";

export function createAutocompletion(
  env: VirtualTypeScriptEnvironment
): Extension {
  return autocompletion({
    override: [
      (ctx) => {
        const { pos } = ctx;

        const completions = env.languageService.getCompletionsAtPosition(
          "index.ts",
          pos,
          {}
        );

        if (!completions) {
          return null;
        }

        return completeFromList(
          completions.entries.map((c) => ({
            type: c.kind,
            label: c.name,
          }))
        )(ctx);
      },
    ],
  });
}
