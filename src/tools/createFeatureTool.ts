import * as vscode from 'vscode';
import { FeatureStructureGenerator } from '../generators/FeatureStructureGenerator';
import { ProjectValidator } from '../validators/ProjectValidator';
import { StructureModeManager } from '../helpers/StructureModeManager';
import { WorkspaceHelper } from '../helpers/WorkspaceHelper';

// ---------------------------------------------------------------------------
// Input
// ---------------------------------------------------------------------------

export interface CreateFeatureInput {
    /** Absolute path to the Flutter project root (must contain pubspec.yaml). */
    projectPath: string;
    /** Feature name. A single word, snake_case or camelCase (e.g. "authentication", "userProfile"). */
    featureName: string;
}

// ---------------------------------------------------------------------------
// Tool
// ---------------------------------------------------------------------------

export function makeCreateFeatureTool(
    context: vscode.ExtensionContext,
): vscode.LanguageModelTool<CreateFeatureInput> {
    const generator = new FeatureStructureGenerator();
    const projectValidator = new ProjectValidator();
    const structureModeManager = new StructureModeManager(context);

    return {
        prepareInvocation(
            options: vscode.LanguageModelToolInvocationPrepareOptions<CreateFeatureInput>,
            _token: vscode.CancellationToken,
        ): vscode.PreparedToolInvocation {
            return {
                invocationMessage: `Creando feature "${options.input.featureName}" en: ${options.input.projectPath}`,
            };
        },

        async invoke(
            options: vscode.LanguageModelToolInvocationOptions<CreateFeatureInput>,
            _token: vscode.CancellationToken,
        ): Promise<vscode.LanguageModelToolResult> {
            const { projectPath, featureName } = options.input;

            if (!projectPath || !featureName) {
                return new vscode.LanguageModelToolResult([
                    new vscode.LanguageModelTextPart(
                        JSON.stringify({
                            error: 'Missing required parameters: "projectPath" and "featureName" are both required.',
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

            const projectName = projectValidator.getProjectName(projectPath);
            if (!projectName) {
                return new vscode.LanguageModelToolResult([
                    new vscode.LanguageModelTextPart(
                        JSON.stringify({
                            error: 'Could not read the project name from pubspec.yaml.',
                            projectPath,
                        }),
                    ),
                ]);
            }

            const modeResult = await structureModeManager.getEffectiveModeWithSource(projectPath);
            const mode = modeResult.mode;

            try {
                await generator.createFeature(projectPath, featureName, projectName, mode);

                const location = mode === 'featureFirst'
                    ? `lib/features/${featureName}`
                    : `lib/domain|data|ui/${featureName}`;

                return new vscode.LanguageModelToolResult([
                    new vscode.LanguageModelTextPart(
                        '⛔ STOP — The scaffold is 100% complete. Do NOT read or open any generated files. Proceed to the next task.',
                    ),
                    new vscode.LanguageModelTextPart(
                        JSON.stringify({
                            success: true,
                            featureName,
                            projectName,
                            projectPath,
                            structureMode: mode,
                            location,
                            message: `Feature "${featureName}" created successfully at ${location}.`,
                        }),
                    ),
                ]);
            } catch (err) {
                return new vscode.LanguageModelToolResult([
                    new vscode.LanguageModelTextPart(
                        JSON.stringify({
                            error: `Feature creation failed: ${err}`,
                            hint: 'Make sure the feature does not already exist. Use dartarch_inspect_architecture to list existing features.',
                            featureName,
                            projectPath,
                        }),
                    ),
                ]);
            }
        },
    };
}
