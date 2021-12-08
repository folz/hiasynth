import React, { forwardRef, useEffect, useRef, useState } from "react";
import REGL, { Regl } from "regl";
import HydraTSRenderer from "hydra-ts";
import * as t from "hydra-ts/src/glsl/t";

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

type HydraTSProps = {
  width: number;
  height: number;
};

// TODO
window.t = t;
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

export const HydraTS = forwardRef<HTMLCanvasElement, HydraTSProps>(
  function HydraTS(props, ref) {
    const { height, width } = props;

    const reglRef = useRef<Regl>();
    const hydratsRef = useRef<HydraTSRenderer>();
    const [isReglLoaded, setIsReglLoaded] = useState(false);

    useEffect(() => {
      requestAnimationFrame(() => {
        reglRef.current = REGL({
          canvas: "#hydrats-canvas",
          pixelRatio: 1,
        });
        setIsReglLoaded(true);
      });
    }, []);

    useEffect(() => {
      if (!isReglLoaded || !reglRef.current || hydratsRef.current) {
        return;
      }

      const renderer = new HydraTSRenderer({
        width,
        height,
        regl: reglRef.current,
        precision: "mediump",
      });

      renderer.loop.start();
      hydratsRef.current = renderer;
    }, [isReglLoaded]);

    useEffect(() => {
      hydratsRef.current?.setResolution(width, height);
    }, [width, height]);

    return (
      <canvas
        ref={ref}
        id="hydrats-canvas"
        width={width}
        height={height}
        style={style}
      />
    );
  }
);
