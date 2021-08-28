// language=TypeScript
export default `

interface Array<T> {
  ease(easing: "sin"): Array<T>;
  fast(amount: number): Array<T>;
}

interface HydraSource {
  initCam: (index: number) => void;
  initVideo: (url: string) => void;
}

interface Buffer {
  fbos: [];
}

type Arg<T> = T | T[] | (() => T);

type Drawable = HydraSource | Buffer | Texture;

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
  out: (buffer?: Buffer) => void;
}

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
declare var src: (s: HydraSource | Buffer) => Texture;
declare var solid: (
  r?: Arg<number>,
  g?: Arg<number>,
  b?: Arg<number>,
  a?: Arg<number>
) => Texture;

declare var hush: () => void;
declare var render: (buffer?: Buffer) => void;

declare var s0: HydraSource;
declare var s1: HydraSource;
declare var s2: HydraSource;
declare var s3: HydraSource;

declare var o0: Buffer;
declare var o1: Buffer;
declare var o2: Buffer;
declare var o3: Buffer;

declare var bpm: number;
declare var height: number;
declare var mouse: {
  x: number;
  y: number;
};
declare var time: number;
declare var width: number;

declare var m0: number;
declare var m1: number;
declare var m2: number;
declare var m3: number;
declare var m4: number;
declare var m5: number;
declare var m6: number;
declare var m7: number;
declare var m8: number;
declare var m9: number;
declare var m10: number;
declare var m11: number;
declare var m12: number;
declare var m13: number;
declare var m14: number;
declare var m15: number;
declare var m16: number;
declare var m17: number;
declare var m18: number;
declare var m19: number;
declare var m20: number;
declare var m21: number;
declare var m22: number;
declare var m23: number;
declare var m24: number;
declare var m25: number;
declare var m26: number;
declare var m27: number;
declare var m28: number;
declare var m29: number;
declare var m30: number;
declare var m31: number;
declare var m32: number;
declare var m33: number;
declare var m34: number;
declare var m35: number;
declare var m36: number;
declare var m37: number;
declare var m38: number;
declare var m39: number;
declare var m40: number;
declare var m41: number;
declare var m42: number;
declare var m43: number;
declare var m44: number;
declare var m45: number;
declare var m46: number;
declare var m47: number;
declare var m48: number;
declare var m49: number;
declare var m50: number;
declare var m51: number;
declare var m52: number;
declare var m53: number;
declare var m54: number;
declare var m55: number;
declare var m56: number;
declare var m57: number;
declare var m58: number;
declare var m59: number;
declare var m60: number;
declare var m61: number;
declare var m62: number;
declare var m63: number;
declare var m64: number;
declare var m65: number;
declare var m66: number;
declare var m67: number;
declare var m68: number;
declare var m69: number;
declare var m70: number;
declare var m71: number;
declare var m72: number;
declare var m73: number;
declare var m74: number;
declare var m75: number;
declare var m76: number;
declare var m77: number;
declare var m78: number;
declare var m79: number;
declare var m80: number;
declare var m81: number;
declare var m82: number;
declare var m83: number;
declare var m84: number;
declare var m85: number;
declare var m86: number;
declare var m87: number;
declare var m88: number;
declare var m89: number;
declare var m90: number;
declare var m91: number;
declare var m92: number;
declare var m93: number;
declare var m94: number;
declare var m95: number;
declare var m96: number;
declare var m97: number;
declare var m98: number;
declare var m99: number;
declare var m100: number;
declare var m101: number;
declare var m102: number;
declare var m103: number;
declare var m104: number;
declare var m105: number;
declare var m106: number;
declare var m107: number;
declare var m108: number;
declare var m109: number;
declare var m110: number;
declare var m111: number;
declare var m112: number;
declare var m113: number;
declare var m114: number;
declare var m115: number;
declare var m116: number;
declare var m117: number;
declare var m118: number;
declare var m119: number;
declare var m120: number;
declare var m121: number;
declare var m122: number;
declare var m123: number;
declare var m124: number;
declare var m125: number;
declare var m126: number;
declare var m127: number;

declare var mapMidi: (from: number, to: number, midi: number) => number;
declare var pixels: () => number;

`;
