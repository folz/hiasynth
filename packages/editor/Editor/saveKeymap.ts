import { KeyBinding } from '@codemirror/view';

export const saveKeymap: KeyBinding = {
  key: 'Cmd-s',
  run(target) {
    const { state } = target;

    localStorage.setItem('ent-document', state.sliceDoc() || ' ');

    return true;
  },
  preventDefault: true,
};
