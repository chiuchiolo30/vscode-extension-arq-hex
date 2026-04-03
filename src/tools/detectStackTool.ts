import * as vscode from 'vscode';
import { StackDetector, DetectedStack, STACK_CATEGORY_LABELS } from '../helpers/StackDetector';
import { WorkspaceHelper } from '../helpers/WorkspaceHelper';

// ---------------------------------------------------------------------------
// Input
// ---------------------------------------------------------------------------

export interface DetectStackInput {
    /** Absolute path to the Flutter/Dart project root (must contain pubspec.yaml).
     *  When omitted, the first workspace folder is used. */
    projectPath?: string;
}

// ---------------------------------------------------------------------------
// Tool
// ---------------------------------------------------------------------------

export const detectStackTool: vscode.LanguageModelTool<DetectStackInput> = {
    prepareInvocation(
        options: vscode.LanguageModelToolInvocationPrepareOptions<DetectStackInput>,
        _token: vscode.CancellationToken,
    ): vscode.PreparedToolInvocation {
        const target = options.input.projectPath ?? WorkspaceHelper.getCurrentDirectory() ?? 'workspace';
        return {
            invocationMessage: `Detectando stack tecnológico en: ${target}`,
        };
    },

    async invoke(
        options: vscode.LanguageModelToolInvocationOptions<DetectStackInput>,
        _token: vscode.CancellationToken,
    ): Promise<vscode.LanguageModelToolResult> {
        const projectPath = options.input.projectPath ?? WorkspaceHelper.getCurrentDirectory();

        if (!projectPath) {
            return new vscode.LanguageModelToolResult([
                new vscode.LanguageModelTextPart(
                    JSON.stringify({
                        error: 'No project path provided and no workspace folder is open.',
                        hint: 'Provide "projectPath" pointing to a Flutter project that contains pubspec.yaml.',
                    }),
                ),
            ]);
        }

        const detector = new StackDetector();
        const stack: DetectedStack | null = detector.detect(projectPath);

        if (!stack) {
            return new vscode.LanguageModelToolResult([
                new vscode.LanguageModelTextPart(
                    JSON.stringify({
                        error: 'pubspec.yaml not found or could not be read.',
                        hint: 'Verify that "projectPath" points to the root of a Flutter/Dart project.',
                        projectPath,
                    }),
                ),
            ]);
        }

        // Build a clean result object with only non-empty categories
        const detected: Record<string, string[]> = {};
        for (const [key, label] of Object.entries(STACK_CATEGORY_LABELS) as [keyof DetectedStack, string][]) {
            if (stack[key].length > 0) {
                detected[label] = stack[key];
            }
        }

        const isEmpty = detector.isEmpty(stack);
        const allDependencies = detector.detectAllPackages(projectPath);

        return new vscode.LanguageModelToolResult([
            new vscode.LanguageModelTextPart(
                '⛔ STOP — Do NOT read pubspec.yaml or any project file after this tool call. ' +
                'allDependencies contains every package in the project. This is the authoritative source.',
            ),
            new vscode.LanguageModelTextPart(
                JSON.stringify({
                    projectPath,
                    stackDetected: !isEmpty,
                    stack: detected,
                    formattedLines: detector.format(stack),
                    allDependencies,
                }),
            ),
        ]);
    },
};
