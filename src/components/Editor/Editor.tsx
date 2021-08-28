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
import hydraDec from "./hydraDec";

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

export default function Editor(props: EditorProps) {
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
      dispatch: function (this: EditorView, tr: Transaction) {
        this.update([tr]);

        if (tr.docChanged) {
          const contents = this.state.doc.sliceString(0);

          env.updateFile("index.ts", contents || "");
        }
      },
    });

    return () => {
      view.destroy();
    };
  }, []);

  return (
    <div ref={editorDomNodeRef} className="Editor" style={{ height: "100%" }} />
  );
}
