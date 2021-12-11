import { useEffect } from "react";

export function range(
  s: number = 0,
  toStart: number = 0,
  toEnd: number = 1,
  fromStart: number = 0,
  fromEnd: number = 1
): number {
  return (
    toStart + ((s - fromStart) * (toEnd - toStart)) / (fromEnd - fromStart)
  );
}

export function useUtilGlobals(): void {
  useEffect(() => {
    // @ts-ignore
    window.range = range;
  }, []);
}