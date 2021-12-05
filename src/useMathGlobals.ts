import { useEffect } from "react";

export function useMathGlobals() {
  useEffect(() => {
    const mathKeys = new Set(Object.getOwnPropertyNames(Math));
    const windowKeys = new Set(Object.getOwnPropertyNames(window));

    mathKeys.forEach((key) => {
      if (windowKeys.has(key)) {
        return;
      }

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      window[key] = Math[key];
    }, []);
  }, []);
}
