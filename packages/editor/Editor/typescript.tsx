import { StateField } from "@codemirror/state";
import {
  createDefaultMapFromCDN,
  createSystem,
  createVirtualTypeScriptEnvironment,
  VirtualTypeScriptEnvironment,
} from "@typescript/vfs";
import ts from "typescript";
import lzstring from "lz-string";
import { hydraDec } from "./hydraDec";

const compilerOptions: ts.CompilerOptions = {
  target: ts.ScriptTarget.ES2016,
  esModuleInterop: true,
};
const fsMapDefaultFull = await createDefaultMapFromCDN(
  compilerOptions,
  ts.version,
  true,
  ts,
  lzstring
);

const fsMapDefault = new Map();
fsMapDefault.set("/lib.d.ts", fsMapDefaultFull.get("/lib.d.ts"));
fsMapDefault.set("/lib.es5.d.ts", fsMapDefaultFull.get("/lib.es5.d.ts"));
fsMapDefault.set("/lib.es6.d.ts", fsMapDefaultFull.get("/lib.es6.d.ts"));

export const tsEnvStateField = StateField.define<VirtualTypeScriptEnvironment>({
  create(state) {
    const fsMap = new Map(fsMapDefault);
    fsMap.set("hydra.d.ts", hydraDec);
    fsMap.set("index.ts", state.sliceDoc() || " ");

    const system = createSystem(fsMap);

    return createVirtualTypeScriptEnvironment(
      system,
      [...fsMap.keys()],
      ts,
      compilerOptions
    );
  },
  update(env, tr) {
    if (tr.docChanged) {
      // Typescript removes files from fsMap when empty, but index.ts is
      // looked up without checking for existence in other places. Tell
      // typescript that an empty file has a space in it to prevent this
      // empty-remove behavior from happening.
      const contents = tr.newDoc.sliceString(0) || " ";

      env.updateFile("index.ts", contents);
    }
    return env;
  },
});
