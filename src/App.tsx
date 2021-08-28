import React from "react";
import { Editor } from "./components/Editor";
import { Hydra } from "./components/Hydra";
import { exampleDoc } from "./components/Editor/exampleDoc";

const style = {
  imageRendering: "pixelated",
  position: "absolute",
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
  zIndex: -1,
};

export function App() {
  return (
    <div className="App" style={{ height: "100%" }}>
      <Editor initialDoc={exampleDoc} />
      <Hydra
        width={window.innerWidth}
        height={window.innerHeight}
        style={style}
      />
    </div>
  );
}
