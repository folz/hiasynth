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

import exampleDoc from "./exampleDoc";
import { setup } from "./setup";
import { createLinter } from "./linter";
import { createAutocompletion } from "./autocompletion";
import hydraDec from "./hydraDec";

const INDEX_FILENAME = "index.ts";

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

export default function Editor() {
  const editor = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const fsMap = new Map(fsMapDefault);

    fsMap.set(INDEX_FILENAME, exampleDoc);
    fsMap.set("hydra.d.ts", hydraDec);
    const system = createSystem(fsMap);

    const env = createVirtualTypeScriptEnvironment(
      system,
      [...fsMap.keys()],
      ts,
      compilerOptions
    );

    const initialState = EditorState.create({
      doc: exampleDoc,
      extensions: [setup, createLinter(env), createAutocompletion(env)],
    });

    const view = new EditorView({
      state: initialState,
      parent: editor.current || undefined,
      dispatch: (tr: Transaction) => {
        view.update([tr]);

        if (tr.docChanged) {
          const { state } = view;
          const contents = state.doc.sliceString(0);

          env.updateFile(INDEX_FILENAME, contents);
        }
      },
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
