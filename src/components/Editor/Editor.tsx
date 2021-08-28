import React, { useEffect, useRef } from "react";

import lzstring from "lz-string";
import ts from "typescript";
import { EditorView } from "@codemirror/view";
import { EditorState, Transaction } from "@codemirror/state";
import {
  createDefaultMapFromCDN,
  createSystem,
  createVirtualTypeScriptEnvironment,
} from "@typescript/vfs";

import { setup } from "./setup";
import { createLinter } from "./linter";
import { createAutocompletion } from "./autocompletion";
import { hydraDec } from "./hydraDec";

const compilerOptions: ts.CompilerOptions = {
  target: ts.ScriptTarget.ES2016,
  esModuleInterop: true,
};
const fsMapDefault = await createDefaultMapFromCDN(
  compilerOptions,
  ts.version,
  true,
  ts,
  lzstring
);

type EditorProps = {
  initialDoc?: string;
};

export function Editor(props: EditorProps) {
  const { initialDoc = "" } = props;
  const editorDomNodeRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const fsMap = new Map(fsMapDefault);
    fsMap.set("hydra.d.ts", hydraDec);
    fsMap.set("index.ts", initialDoc);

    const system = createSystem(fsMap);
    const env = createVirtualTypeScriptEnvironment(
      system,
      [...fsMap.keys()],
      ts,
      compilerOptions
    );

    const initialState = EditorState.create({
      doc: initialDoc,
      extensions: [setup, createLinter(env), createAutocompletion(env)],
    });

    const view = new EditorView({
      state: initialState,
      parent: editorDomNodeRef.current || undefined,
      dispatch(this: EditorView, tr: Transaction) {
        // `dispatch()` is bound to the EditorView `this`.
        // eslint-disable-next-line react/no-this-in-sfc
        this.update([tr]);

        if (tr.docChanged) {
          // Typescript removes files from fsMap when empty, but index.ts is
          // looked up without checking for existence in other places. Tell
          // typescript that an empty file has a space in it to prevent this
          // empty-remove behavior from happening.
          const contents = tr.newDoc.sliceString(0) || " ";

          env.updateFile("index.ts", contents);
        }
      },
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
