import React, { useEffect, useRef } from "react";
import { EditorView } from "@codemirror/view";
import { EditorState } from "@codemirror/state";

import exampleDoc from "./exampleDoc";
import { setup } from "./setup";

export default function Editor() {
  const editor = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const state = EditorState.create({
      doc: exampleDoc,
      extensions: [setup],
    });

    const view = new EditorView({
      state,
      parent: editor.current,
    });

    return () => {
      view.destroy();
    };
  }, []);

  return (
    <div className="Editor" style={{ height: "100%" }}>
      <div ref={editor} style={{ height: "100%" }} />
    </div>
  );
}
