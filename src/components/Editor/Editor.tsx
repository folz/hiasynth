import React, { useEffect, useRef } from "react";

import { EditorView } from "@codemirror/view";
import { EditorState } from "@codemirror/state";

import { setup } from "./setup";

type EditorProps = {
  initialDoc?: string;
};

export function Editor(props: EditorProps) {
  const { initialDoc = "" } = props;
  const editorDomNodeRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const initialState = EditorState.create({
      doc: initialDoc,
      extensions: setup,
    });

    const view = new EditorView({
      state: initialState,
      parent: editorDomNodeRef.current || undefined,
    });

    return () => {
      view.destroy();
    };
    // It's okay that initialDoc is not update-able - don't want to trigger a
    // new editor creation.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div ref={editorDomNodeRef} className="Editor" style={{ height: "100%" }} />
  );
}
