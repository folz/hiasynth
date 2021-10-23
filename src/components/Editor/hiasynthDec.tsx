// language=TypeScript
export const hiasynthDec = `

interface Array<T> {
  ease(easing?: string | (() => number)): Array<T>;
  fast(amount?: number): Array<T>;
  smooth(amount?: number): Array<T>;
  offset(amount?: number): Array<T>;
  fit(low?: number, high?: number): Array<T>;
}

interface Source {
  init(opts: {
    src: Source['src'];
    dynamic: boolean;
  }): void;
  initCam(index: number): void;
  initVideo(url?: string): void;
  initImage(url?: string): void;
  initScreen(): void;
  clear(): void;
}

interface Buffer {
  fbos: [];
}

type Arg<T> = T | T[] | (() => T);

type Drawable = Source | Buffer | Texture;

type TransformResult = {
  __transform_result__: true
};

interface Texture {
  rotate: (angle?: Arg<number>, speed?: Arg<number>) => Texture;
  scale: (
    amount?: Arg<number>,
    xMult?: Arg<number>,
    yMult?: Arg<number>,
    offsetX?: Arg<number>,
    offsetY?: Arg<number>
  ) => Texture;
  pixelate: (x?: Arg<number>, y?: Arg<number>) => Texture;
  repeat: (
    repeatX?: Arg<number>,
    repeatY?: Arg<number>,
    offsetX?: Arg<number>,
    offsetY?: Arg<number>
  ) => Texture;
  repeatX: (reps?: Arg<number>, offset?: Arg<number>) => Texture;
  repeatY: (reps?: Arg<number>, offset?: Arg<number>) => Texture;
  kaleid: (numSides?: Arg<number>) => Texture;
  scroll: (scrollX: Arg<number>, scrollY: Arg<number>, speedX: Arg<number>, speedY: Arg<number>) => Texture;
  scrollX: (amount?: Arg<number>, speed?: Arg<number>) => Texture;
  scrollY: (amount?: Arg<number>, speed?: Arg<number>) => Texture;
  posterize: (bins?: Arg<number>, gamma?: Arg<number>) => Texture;
  shift: (
    r?: Arg<number>,
    g?: Arg<number>,
    b?: Arg<number>,
    a?: Arg<number>
  ) => Texture;
  invert: (amount?: Arg<number>) => Texture;
  contrast: (amount?: Arg<number>) => Texture;
  brightness: (amount?: Arg<number>) => Texture;
  luma: (threshold?: Arg<number>, tolerance?: Arg<number>) => Texture;
  thresh: (threshold?: Arg<number>, tolerance?: Arg<number>) => Texture;
  koch: (scale?: Arg<number>, iters?: Arg<number>) => Texture;
  color: (
    r?: Arg<number>,
    g?: Arg<number>,
    b?: Arg<number>,
    a?: Arg<number>
  ) => Texture;
  saturate: (amount?: Arg<number>) => Texture;
  hue: (hue?: Arg<number>) => Texture;
  colorama: (amount?: Arg<number>) => Texture;
  sum: (scale?: Arg<number>) => Texture;
  r: (scale, offset) => Texture;
  g: (scale, offset) => Texture;
  b: (scale, offset) => Texture;
  a: (scale, offset) => Texture;
  add: (c: Drawable, amount?: Arg<number>) => Texture;
  sub: (c: Drawable, amount?: Arg<number>) => Texture;
  layer: (c: Drawable) => Texture;
  blend: (c: Drawable, amount?: Arg<number>) => Texture;
  mult: (c: Drawable, amount?: Arg<number>) => Texture;
  diff: (c: Drawable) => Texture;
  mask: (c: Drawable) => Texture;
  modulateRepeat: () => Texture;
  modulateRepeatX: () => Texture;
  modulateRepeatY: () => Texture;
  modulateKaleid: (texture: Texture, numSides?: Arg<number>) => Texture;
  modulateScrollX: () => Texture;
  modulateScrollY: () => Texture;
  modulate: (c: Drawable, amount?: Arg<number>) => Texture;
  modulateScale: (
    c: Drawable,
    multiple?: Arg<number>,
    offset?: Arg<number>
  ) => Texture;
  modulatePixelate: (
    c: Drawable,
    multiple?: Arg<number>,
    offset?: Arg<number>
  ) => Texture;
  modulateRotate: (
    c: Drawable,
    multiple?: Arg<number>,
    offset?: Arg<number>
  ) => Texture;
  modulateHue: (c: Drawable, amount?: Arg<number>) => Texture;
  then: (...args: TransformResult[]) => Texture;
  skip: (...args: TransformResult[]) => Texture;
  out: (buffer: Buffer) => void;
}

interface T {
  Invert: () => TransformResult;
}

declare var t: T;

declare var noise: (scale?: Arg<number>, offset?: Arg<number>) => Texture;
declare var voronoi: (
  scale?: Arg<number>,
  speed?: Arg<number>,
  blending?: Arg<number>
) => Texture;
declare var osc: (
  frequency?: Arg<number>,
  sync?: Arg<number>,
  offset?: Arg<number>
) => Texture;
declare var shape: (
  sides?: Arg<number>,
  radius?: Arg<number>,
  smoothing?: Arg<number>
) => Texture;
declare var gradient: (amount?: Arg<number>) => Texture;
declare var prev: () => Texture;
declare var src: (s: Source | Buffer) => Texture;
declare var solid: (
  r?: Arg<number>,
  g?: Arg<number>,
  b?: Arg<number>,
  a?: Arg<number>
) => Texture;

declare var hush: () => void;
declare var render: (buffer: Buffer) => void;

declare var s0: Source;
declare var s1: Source;
declare var s2: Source;
declare var s3: Source;

declare var o0: Buffer;
declare var o1: Buffer;
declare var o2: Buffer;
declare var o3: Buffer;

declare var bpm: number;
declare var height: number;
declare var time: number;
declare var width: number;

declare var cc: Record<number, number>;

declare var mapMidi: (from: number, to: number, midi: number) => number;
declare var pixels: () => number;

declare var abs: Math['abs'];
declare var acos: Math['acos'];
declare var acosh: Math['acosh'];
declare var asin: Math['asin'];
declare var asinh: Math['asinh'];
declare var atan: Math['atan'];
declare var atanh: Math['atanh'];
declare var atan2: Math['atan2'];
declare var ceil: Math['ceil'];
declare var cbrt: Math['cbrt'];
declare var expm1: Math['expm1'];
declare var clz32: Math['clz32'];
declare var cos: Math['cos'];
declare var cosh: Math['cosh'];
declare var exp: Math['exp'];
declare var floor: Math['floor'];
declare var fround: Math['fround'];
declare var hypot: Math['hypot'];
declare var imul: Math['imul'];
declare var log: Math['log'];
declare var log1p: Math['log1p'];
declare var log2: Math['log2'];
declare var log10: Math['log10'];
declare var max: Math['max'];
declare var min: Math['min'];
declare var pow: Math['pow'];
declare var random: Math['random'];
declare var round: Math['round'];
declare var sign: Math['sign'];
declare var sin: Math['sin'];
declare var sinh: Math['sinh'];
declare var sqrt: Math['sqrt'];
declare var tan: Math['tan'];
declare var tanh: Math['tanh'];
declare var trunc: Math['trunc'];
declare var E: Math['E'];
declare var LN10: Math['LN10'];
declare var LN2: Math['LN2'];
declare var LOG10E: Math['LOG10E'];
declare var LOG2E: Math['LOG2E'];
declare var PI: Math['PI'];
declare var SQRT1_2: Math['SQRT1_2'];
declare var SQRT2: Math['SQRT2'];

`;
