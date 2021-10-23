import React from "react";
import { Editor } from "./components/Editor";
import { Hiasynth } from "./components/Hiasynth";
import { useWebMidi } from "./useWebMidi";
import { useMathGlobals } from "./useMathGlobals";

export function App(): JSX.Element {
  useWebMidi();
  useMathGlobals();

  return (
    <>
      <Editor />
      <Hiasynth width={window.innerWidth} height={window.innerHeight} />
    </>
  );
}
