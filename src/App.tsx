import React, { useEffect, useRef, useState } from "react";
import { Editor } from "editor";
import { HydraCanvas } from "./components/HydraCanvas";
import { useGlobalWebMidi } from "./useGlobalWebMidi";
import { useGlobalMath } from "./useGlobalMath";
import { useGlobalUtils } from "./useGlobalUtils";

export function App(): JSX.Element {
  const [dimensions, setDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  const rootRef = useRef<HTMLDivElement>(null);

  useGlobalWebMidi();
  useGlobalMath();
  useGlobalUtils();

  // useEffect(() => {
  //   const listener = () => {
  //     rootRef.current?.requestFullscreen();
  //   };
  //
  //   window.addEventListener("dblclick", listener);
  //
  //   return () => {
  //     window.removeEventListener("dblclick", listener);
  //   };
  // });

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
      <Editor initialDoc={localStorage.getItem("ent-document") || undefined} />
      <HydraCanvas {...dimensions} />
    </div>
  );
}
