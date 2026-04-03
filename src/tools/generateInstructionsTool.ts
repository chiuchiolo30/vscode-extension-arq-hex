import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { StackDetector } from '../helpers/StackDetector';
import { ProjectValidator } from '../validators/ProjectValidator';
import { StructureModeManager } from '../helpers/StructureModeManager';
import { WorkspaceHelper } from '../helpers/WorkspaceHelper';
import { buildInstructionsContent } from '../generators/InstructionsBuilder';

// ---------------------------------------------------------------------------
// Input
// ---------------------------------------------------------------------------

export interface GenerateInstructionsInput {
    /** Absolute path to the Flutter project root (must contain pubspec.yaml). */
    projectPath: string;
    /** When true, overwrites an existing .github/copilot-instructions.md without prompting. Defaults to false. */
    overwrite?: boolean;
}

// ---------------------------------------------------------------------------
// Tool
// ---------------------------------------------------------------------------

export function makeGenerateInstructionsTool(
    context: vscode.ExtensionContext,
): vscode.LanguageModelTool<GenerateInstructionsInput> {
    const projectValidator = new ProjectValidator();
    const structureModeManager = new StructureModeManager(context);

    return {
        prepareInvocation(
            options: vscode.LanguageModelToolInvocationPrepareOptions<GenerateInstructionsInput>,
            _token: vscode.CancellationToken,
        ): vscode.PreparedToolInvocation {
            return {
                invocationMessage: `Generando archivo de instrucciones para IA en: ${options.input.projectPath}`,
            };
        },

        async invoke(
            options: vscode.LanguageModelToolInvocationOptions<GenerateInstructionsInput>,
            _token: vscode.CancellationToken,
        ): Promise<vscode.LanguageModelToolResult> {
            const { projectPath, overwrite = false } = options.input;

            if (!projectPath) {
                return new vscode.LanguageModelToolResult([
                    new vscode.LanguageModelTextPart(
                        JSON.stringify({
                            error: 'Missing required parameter: "projectPath".',
                            hint: 'Provide the absolute path to a Flutter project root.',
                        }),
                    ),
                ]);
            }

            if (!projectValidator.isFlutterProject(projectPath)) {
                return new vscode.LanguageModelToolResult([
                    new vscode.LanguageModelTextPart(
                        JSON.stringify({
                            error: 'No pubspec.yaml found at "projectPath".',
                            hint: 'Provide the absolute path to the root of a Flutter/Dart project.',
                            projectPath,
                        }),
                    ),
                ]);
            }

            const projectName = projectValidator.getProjectName(projectPath) ?? 'flutter_project';

            const modeResult = await structureModeManager.getEffectiveModeWithSource(projectPath);
            const mode = modeResult.mode;

            const detector = new StackDetector();
            const stack = detector.detect(projectPath);

            const features = projectValidator.getAvailableFeatures(projectPath, mode);

            const githubDir = path.join(projectPath, '.github');
            const targetPath = path.join(githubDir, 'copilot-instructions.md');

            const fileExists = fs.existsSync(targetPath);
            if (fileExists && !overwrite) {
                return new vscode.LanguageModelToolResult([
                    new vscode.LanguageModelTextPart(
                        JSON.stringify({
                            error: '.github/copilot-instructions.md already exists.',
                            hint: 'Set "overwrite": true to replace the existing file.',
                            targetPath,
                        }),
                    ),
                ]);
            }

            const content = buildInstructionsContent(projectName, mode, stack, features);

            try {
                if (!fs.existsSync(githubDir)) {
                    fs.mkdirSync(githubDir, { recursive: true });
                }
                fs.writeFileSync(targetPath, content, 'utf8');
            } catch (err) {
                return new vscode.LanguageModelToolResult([
                    new vscode.LanguageModelTextPart(
                        JSON.stringify({
                            error: `Could not write instructions file: ${err}`,
                            hint: 'Check that the process has write permissions to the project directory.',
                            targetPath,
                        }),
                    ),
                ]);
            }

            return new vscode.LanguageModelToolResult([
                new vscode.LanguageModelTextPart(
                    '⛔ STOP — The instructions file is 100% complete. Do NOT read or open the generated file. Proceed to the next task.',
                ),
                new vscode.LanguageModelTextPart(
                    JSON.stringify({
                        success: true,
                        targetPath,
                        projectName,
                        structureMode: mode,
                        stackDetected: stack ? !new StackDetector().isEmpty(stack) : false,
                        featureCount: features.length,
                        wasOverwritten: fileExists,
                        message: `Instructions file written to ${targetPath}.`,
                    }),
                ),
            ]);
        },
    };
}
