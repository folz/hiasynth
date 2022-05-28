import React, { forwardRef, useEffect, useRef, useState } from 'react';
import REGL from 'regl';
import { createActions, createEnvironment, generators, Loop } from 'hydra-ts';
import type { Environment } from 'hydra-ts';
import ArrayUtils from 'hydra-ts/src/lib/array-utils';

const style = {
  imageRendering: 'pixelated',
  position: 'absolute',
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
  inset: 0,
  zIndex: -1,
  backgroundColor: '#000000',
} as const;

type HydraCanvasProps = {
  width: number;
  height: number;
};

// TODO make removable like other hooks
// @ts-ignore
window.range = function range(
  value: number = 0,
  toStart: number = 0,
  toEnd: number = 1,
  fromStart: number = 0,
  fromEnd: number = 1,
) {
  return (
    toStart + ((value - fromStart) * (toEnd - toStart)) / (fromEnd - fromStart)
  );
};

export const HydraCanvas = forwardRef<HTMLCanvasElement, HydraCanvasProps>(
  function HydraCanvas(props, ref) {
    const { height, width } = props;

    const reglRef = useRef<REGL.Regl>();
    const environmentRef = useRef<Environment>();
    const [isReglLoaded, setIsReglLoaded] = useState(false);

    useGlobalHydraGenerators();

    useEffect(() => {
      requestAnimationFrame(() => {
        reglRef.current = REGL({
          canvas: '#hydra-canvas',
          pixelRatio: 1,
        });
        setIsReglLoaded(true);
      });
    }, []);

    useEffect(() => {
      if (!isReglLoaded || !reglRef.current || environmentRef.current) {
        return;
      }

      // TODO remove
      ArrayUtils.init();

      const environment = createEnvironment({
        width,
        height,
        regl: reglRef.current,
        precision: 'mediump',
      });
      const actions = createActions(environment);

      // TODO capture a ref to loop
      const loop = new Loop(actions.tick);
      loop.start();
      // @ts-ignore
      window.loop = loop;
      // @ts-ignore
      window.environment = environment;

      const { render, hush, setResolution } = actions;
      const { sources, outputs, synth } = environment;
      const [s0, s1, s2, s3] = sources;
      const [o0, o1, o2, o3] = outputs;

      // @ts-ignore
      window['render'] = render;
      // @ts-ignore
      window['hush'] = hush;
      // @ts-ignore
      window['synth'] = synth;
      // @ts-ignore
      window['setResolution'] = setResolution;

      // @ts-ignore
      window['s0'] = s0;
      // @ts-ignore
      window['s1'] = s1;
      // @ts-ignore
      window['s2'] = s2;
      // @ts-ignore
      window['s3'] = s3;

      // @ts-ignore
      window['o0'] = o0;
      // @ts-ignore
      window['o1'] = o1;
      // @ts-ignore
      window['o2'] = o2;
      // @ts-ignore
      window['o3'] = o3;

      environmentRef.current = environment;
    }, [isReglLoaded]);

    return (
      <canvas
        ref={ref}
        id="hydra-canvas"
        width={width}
        height={height}
        style={style}
      />
    );
  },
);

function useGlobalHydraGenerators() {
  // @ts-ignore
  Object.keys(generators).forEach((name) => (window[name] = generators[name]));
}
