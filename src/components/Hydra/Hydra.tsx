import React, { useEffect, useRef } from "react";
import HydraSynth from "hydra-synth";

type Props = {
  width: number;
  height: number;
  style?: {};
};

export default function Hydra(props: Props) {
  const { height, style = {}, width } = props;

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hydraRef = useRef(null);

  useEffect(() => {
    if (hydraRef.current) {
      return;
    }

    hydraRef.current = new HydraSynth({
      canvas: canvasRef.current,
      precision: "mediump",
    });
  }, []);

  return <canvas ref={canvasRef} width={width} height={height} style={style} />;
}
