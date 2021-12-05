import React, { useEffect, useRef, useState } from "react";
import { Editor } from "./components/Editor";
import { Hiasynth } from "./components/Hiasynth";
import { useWebMidi } from "./useWebMidi";
import { useMathGlobals } from "./useMathGlobals";
import { useUtilGlobals } from "./useUtilGlobals";

export function App(): JSX.Element {
  const [dimensions, setDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  const rootRef = useRef<HTMLDivElement>(null);

  useWebMidi();
  useMathGlobals();
  useUtilGlobals();

  useEffect(() => {
    const listener = () => {
      rootRef.current?.requestFullscreen();
    };

    window.addEventListener("dblclick", listener);

    return () => {
      window.removeEventListener("dblclick", listener);
    };
  });

  useEffect(() => {
    const listener = () => {
      setDimensions({ width: window.innerWidth, height: window.innerHeight });
    };

    window.addEventListener("resize", listener);

    return () => {
      window.removeEventListener("resize", listener);
    };
  });

  return (
    <div ref={rootRef} style={{ height: "100%" }}>
      <Editor
        initialDoc={localStorage.getItem("hiasynth-document") || undefined}
      />
      <Hiasynth {...dimensions} />
    </div>
  );
}
