import {
  drawSelection,
  EditorView,
  highlightSpecialChars,
  keymap,
} from '@codemirror/view';
import { EditorState } from '@codemirror/state';
import { history, historyKeymap } from '@codemirror/history';
import { foldKeymap } from '@codemirror/fold';
import { indentOnInput } from '@codemirror/language';
import { highlightActiveLineGutter } from '@codemirror/gutter';
import { defaultKeymap, indentWithTab } from '@codemirror/commands';
import { bracketMatching } from '@codemirror/matchbrackets';
import { closeBrackets, closeBracketsKeymap } from '@codemirror/closebrackets';
import { highlightSelectionMatches, searchKeymap } from '@codemirror/search';
import { completionKeymap } from '@codemirror/autocomplete';
import { commentKeymap } from '@codemirror/comment';
import { rectangularSelection } from '@codemirror/rectangular-selection';
import { defaultHighlightStyle } from '@codemirror/highlight';
import { lintKeymap } from '@codemirror/lint';
import { javascript } from '@codemirror/lang-javascript';
import { oneDark } from '@codemirror/theme-one-dark';

import { createAutocompletion } from './autocompletion';
import { evalKeymap } from './evalKeymap';
import { saveKeymap } from './saveKeymap';
import { createLinter } from './linter';
import { tsEnvStateField } from './typescript';
import { formatKeymap } from './formatKeymap';

export const setup = [
  highlightActiveLineGutter(),
  highlightSpecialChars(),
  history(),
  drawSelection(),
  EditorState.allowMultipleSelections.of(true),
  indentOnInput(),
  defaultHighlightStyle.fallback,
  bracketMatching(),
  closeBrackets(),
  rectangularSelection(),
  highlightSelectionMatches(),
  keymap.of([
    ...closeBracketsKeymap,
    ...defaultKeymap,
    ...searchKeymap,
    ...historyKeymap,
    ...foldKeymap,
    ...commentKeymap,
    ...completionKeymap,
    ...lintKeymap,
    indentWithTab,
    evalKeymap,
    saveKeymap,
    formatKeymap,
  ]),
  javascript(),
  EditorView.theme({
    '&': {
      backgroundColor: 'transparent',
      fontSize: '20px',
    },
    '& .cm-line': {
      maxWidth: 'fit-content',
      background: 'hsla(50,23%,5%,0.6)',
    },
    '&.cm-focused': {
      outline: 'none',
    },
  }),
  oneDark,
  tsEnvStateField,
  createLinter(),
  createAutocompletion(),
];
