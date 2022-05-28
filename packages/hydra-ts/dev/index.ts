import REGL from 'regl';
import { createActions, createEnvironment, generators, Loop } from '../index';
import ArrayUtils from '../src/lib/array-utils';

import './style.css';

const WIDTH = 1080;
const HEIGHT = 1080;
const DENSITY = 2;

const canvas = document.createElement('canvas');
canvas.style.backgroundColor = '#000000';
canvas.width = WIDTH;
canvas.height = HEIGHT;
document.body.appendChild(canvas);

ArrayUtils.init();

const regl = REGL(canvas);

const environment = createEnvironment({
  width: WIDTH * DENSITY,
  height: HEIGHT * DENSITY,
  precision: 'mediump',
  regl,
});

const actions = createActions(environment);

// TODO capture a ref to loop
const loop = new Loop(actions.tick);
loop.start();

const { render } = actions;
const { sources, outputs } = environment;
const [s0, s1, s2, s3] = sources;
const [o0, o1, o2, o3] = outputs;
const { src, osc, gradient, shape, voronoi, noise } = generators;

osc(() => 4 * Math.PI)
  // @ts-ignore
  .add(o0, [0, 0.5].smooth())
  // @ts-ignore
  .mult(src(o0).rotate(Math.PI / 2), 0.6)
  .out(o0);

// @ts-ignore
src(o0).scrollX(0.1, -0.1).scrollY(0.1, -0.1).out(o1);

render(o1);
