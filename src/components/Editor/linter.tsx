import {
  Diagnostic as TypeDiagnostic,
  DiagnosticCategory,
  flattenDiagnosticMessageText,
} from "typescript";
import { Diagnostic as LintDiagnostic, linter } from "@codemirror/lint";
import { EditorView } from "@codemirror/view";
import { Extension } from "@codemirror/state";
import { VirtualTypeScriptEnvironment } from "@typescript/vfs";

export function createLinter(env: VirtualTypeScriptEnvironment): Extension {
  return linter(
    (_view: EditorView) =>
      env.languageService.getSemanticDiagnostics("index.ts").map(convertToLint),
    {
      delay: 400,
    }
  );
}

function convertToLint(diagnostic: TypeDiagnostic): LintDiagnostic {
  return {
    from: diagnostic.start ?? 0,
    to: (diagnostic.start ?? 0) + (diagnostic.length ?? 0),
    severity: getSeverity(diagnostic.category),
    source: diagnostic.source,
    message: flattenDiagnosticMessageText(diagnostic.messageText, "\n"),
  };
}

export function getSeverity(
  category: DiagnosticCategory
): LintDiagnostic["severity"] {
  switch (category) {
    case DiagnosticCategory.Error: {
      return "error";
    }
    case DiagnosticCategory.Warning: {
      return "warning";
    }
    case DiagnosticCategory.Suggestion:
    case DiagnosticCategory.Message:
    default: {
      return "info";
    }
  }
}
