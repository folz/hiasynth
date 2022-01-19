import React, { forwardRef, useEffect, useRef, useState } from "react";
import REGL, { Regl } from "regl";
import { Hydra, generators } from "hydra-ts";
import ArrayUtils from "hydra-ts/src/lib/array-utils";

const style = {
  imageRendering: "pixelated",
  position: "absolute",
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
  inset: 0,
  zIndex: -1,
  backgroundColor: "#000000",
} as const;

type HydraCanvasProps = {
  width: number;
  height: number;
};

// TODO
window.range = function range(
  value: number = 0,
  toStart: number = 0,
  toEnd: number = 1,
  fromStart: number = 0,
  fromEnd: number = 1
) {
  return (
    toStart + ((value - fromStart) * (toEnd - toStart)) / (fromEnd - fromStart)
  );
};

export const HydraCanvas = forwardRef<HTMLCanvasElement, HydraCanvasProps>(
  function HydraCanvas(props, ref) {
    const { height, width } = props;

    const reglRef = useRef<Regl>();
    const hydraRef = useRef<Hydra>();
    const [isReglLoaded, setIsReglLoaded] = useState(false);

    useGlobalHydraGenerators();

    useEffect(() => {
      requestAnimationFrame(() => {
        reglRef.current = REGL({
          canvas: "#hydra-canvas",
          pixelRatio: 1,
        });
        setIsReglLoaded(true);
      });
    }, []);

    useEffect(() => {
      if (!isReglLoaded || !reglRef.current || hydraRef.current) {
        return;
      }

      ArrayUtils.init();

      const renderer = new Hydra({
        width,
        height,
        regl: reglRef.current,
        precision: "mediump",
      });

      renderer.loop.start();

      const { sources, outputs, render } = renderer;
      const [s0, s1, s2, s3] = sources;
      const [o0, o1, o2, o3] = outputs;

      window["render"] = render;

      window["s0"] = s0;
      window["s1"] = s1;
      window["s2"] = s2;
      window["s3"] = s3;

      window["o0"] = o0;
      window["o1"] = o1;
      window["o2"] = o2;
      window["o3"] = o3;

      hydraRef.current = renderer;
    }, [isReglLoaded]);

    useEffect(() => {
      hydraRef.current?.setResolution(width, height);
    }, [width, height]);

    return (
      <canvas
        ref={ref}
        id="hydra-canvas"
        width={width}
        height={height}
        style={style}
      />
    );
  }
);

function useGlobalHydraGenerators() {
  Object.keys(generators).forEach((name) => (window[name] = generators[name]));
}
