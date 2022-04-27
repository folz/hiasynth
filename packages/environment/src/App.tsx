import React, { useRef } from 'react';
import { Editor } from 'editor';
import { HydraCanvas } from './components/HydraCanvas';
import { useGlobalWebMidi } from './useGlobalWebMidi';
import { useGlobalMath } from './useGlobalMath';
import { useGlobalUtils } from './useGlobalUtils';

export function App(): JSX.Element {
  const rootRef = useRef<HTMLDivElement>(null);

  useGlobalWebMidi();
  useGlobalMath();
  useGlobalUtils();

  // useEffect(() => {
  //   const listener = () => {
  //     rootRef.current?.requestFullscreen();
  //   };
  //
  //   window.addEventListener("dblclick", listener);
  //
  //   return () => {
  //     window.removeEventListener("dblclick", listener);
  //   };
  // });

  return (
    <div ref={rootRef} style={{ height: '100%' }}>
      <Editor initialDoc={localStorage.getItem('ent-document') || undefined} />
      <HydraCanvas width={window.innerWidth} height={window.innerHeight} />
    </div>
  );
}
