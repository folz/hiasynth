import { Decoration, DecorationSet, EditorView } from "@codemirror/view";
import { StateEffect, StateField } from "@codemirror/state";

const addHighlight = StateEffect.define<{ from: number; to: number }>();

const highlightMark = Decoration.mark({ class: "ent-highlight" });

const highlightField = StateField.define<DecorationSet>({
  create() {
    return Decoration.none;
  },
  update(highlights, tr) {
    let changed = highlights.map(tr.changes);
    console.log(changed);
    tr.effects.forEach((e) => {
      if (e.is(addHighlight)) {
        changed = changed.update({
          add: [highlightMark.range(e.value.from, e.value.to)],
        });
      }
    });
    console.log(changed);
    return changed;
  },
  provide: (f) => EditorView.decorations.from(f),
});

const highlightTheme = EditorView.baseTheme({
  ".ent-highlight": {
    textDecoration: "underline 3px red",
  },
});

export function highlightSelection(view: EditorView): boolean {
  const effects: StateEffect<unknown>[] = view.state.selection.ranges
    .filter((r) => !r.empty)
    .map(({ from, to }) => addHighlight.of({ from, to }));
  if (!effects.length) return false;

  if (!view.state.field(highlightField, false))
    effects.push(StateEffect.appendConfig.of([highlightField, highlightTheme]));
  view.dispatch({ effects });
  return true;
}
