import React, { forwardRef, useEffect, useRef, useState } from "react";
import REGL, { Regl } from "regl";
import HiasynthRenderer from "hiasynth";
import * as t from "hiasynth/src/glsl/t";

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

type HiasynthProps = {
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

export const Hiasynth = forwardRef<HTMLCanvasElement, HiasynthProps>(
  function Hiasynth(props, ref) {
    const { height, width } = props;

    const reglRef = useRef<Regl>();
    const hiasynthRef = useRef<HiasynthRenderer>();
    const [isReglLoaded, setIsReglLoaded] = useState(false);

    useEffect(() => {
      requestAnimationFrame(() => {
        reglRef.current = REGL({
          canvas: "#hiasynth-canvas",
          pixelRatio: 1,
        });
        setIsReglLoaded(true);
      });
    }, []);

    useEffect(() => {
      if (!isReglLoaded || !reglRef.current || hiasynthRef.current) {
        return;
      }

      const renderer = new HiasynthRenderer({
        width,
        height,
        regl: reglRef.current,
        precision: "mediump",
      });

      renderer.loop.start();
      hiasynthRef.current = renderer;
    }, [isReglLoaded]);

    useEffect(() => {
      hiasynthRef.current?.setResolution(width, height);
    }, [width, height]);

    return (
      <canvas
        ref={ref}
        id="hiasynth-canvas"
        width={width}
        height={height}
        style={style}
      />
    );
  }
);
