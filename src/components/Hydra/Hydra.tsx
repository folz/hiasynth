import React, { useEffect, useRef } from "react";
import HydraSynth from "hydra-synth";

type Props = {
  width: number;
  height: number;
  style?: Record<string, unknown>;
};

export function Hydra(props: Props): JSX.Element {
  const { height, style = {}, width } = props;

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hydraRef = useRef<HydraSynth>();

  useEffect(() => {
    if (hydraRef.current || !canvasRef.current) {
      return;
    }

    hydraRef.current = new HydraSynth({
      canvas: canvasRef.current,
      precision: "mediump",
    });
  }, []);

  return <canvas ref={canvasRef} width={width} height={height} style={style} />;
}
