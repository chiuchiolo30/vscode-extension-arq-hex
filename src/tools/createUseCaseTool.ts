import * as vscode from 'vscode';
import { UseCaseGenerator } from '../generators/UseCaseGenerator';
import { ProjectValidator } from '../validators/ProjectValidator';
import { StructureModeManager } from '../helpers/StructureModeManager';

// ---------------------------------------------------------------------------
// Input
// ---------------------------------------------------------------------------

export interface CreateUseCaseInput {
    /** Absolute path to the Flutter project root (must contain pubspec.yaml). */
    projectPath: string;
    /** Name of the existing feature to add the use case to (e.g. "authentication"). */
    featureName: string;
    /** Use case name in kebab-case or snake_case (e.g. "get-user-profile", "create_order"). */
    useCaseName: string;
}

// ---------------------------------------------------------------------------
// Tool
// ---------------------------------------------------------------------------

export function makeCreateUseCaseTool(
    context: vscode.ExtensionContext,
): vscode.LanguageModelTool<CreateUseCaseInput> {
    const useCaseGenerator = new UseCaseGenerator();
    const projectValidator = new ProjectValidator();
    const structureModeManager = new StructureModeManager(context);

    return {
        prepareInvocation(
            options: vscode.LanguageModelToolInvocationPrepareOptions<CreateUseCaseInput>,
            _token: vscode.CancellationToken,
        ): vscode.PreparedToolInvocation {
            const { featureName, useCaseName } = options.input;
            return {
                invocationMessage: `Creando caso de uso "${useCaseName}" en feature "${featureName}"`,
            };
        },

        async invoke(
            options: vscode.LanguageModelToolInvocationOptions<CreateUseCaseInput>,
            _token: vscode.CancellationToken,
        ): Promise<vscode.LanguageModelToolResult> {
            const { projectPath, featureName, useCaseName } = options.input;

            if (!projectPath || !featureName || !useCaseName) {
                return new vscode.LanguageModelToolResult([
                    new vscode.LanguageModelTextPart(
                        JSON.stringify({
                            error: 'Missing required parameters.',
                            required: ['projectPath', 'featureName', 'useCaseName'],
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

            const modeResult = await structureModeManager.getEffectiveModeWithSource(projectPath);
            const mode = modeResult.mode;

            if (!projectValidator.validateProjectStructure(projectPath, mode)) {
                return new vscode.LanguageModelToolResult([
                    new vscode.LanguageModelTextPart(
                        JSON.stringify({
                            error: `Project structure for mode "${mode}" not found.`,
                            hint: 'Create a feature first using dartarch_create_feature before adding use cases.',
                            projectPath,
                            structureMode: mode,
                        }),
                    ),
                ]);
            }

            const availableFeatures = projectValidator.getAvailableFeatures(projectPath, mode);
            if (!availableFeatures.includes(featureName)) {
                return new vscode.LanguageModelToolResult([
                    new vscode.LanguageModelTextPart(
                        JSON.stringify({
                            error: `Feature "${featureName}" does not exist in this project.`,
                            hint: 'Use dartarch_inspect_architecture to list available features, then retry with a valid featureName.',
                            availableFeatures,
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

            try {
                await useCaseGenerator.createUseCase(projectPath, featureName, useCaseName, projectName, mode);

                const useCaseLocation = mode === 'featureFirst'
                    ? `lib/features/${featureName}/domain/usecases/${useCaseName}.usecase.dart`
                    : `lib/domain/${featureName}/usecases/${useCaseName}.usecase.dart`;

                return new vscode.LanguageModelToolResult([
                    new vscode.LanguageModelTextPart(
                        '⛔ STOP — The use case is 100% complete. Repository contract and implementation already updated. Do NOT read or edit any generated files. Proceed to the next task.',
                    ),
                    new vscode.LanguageModelTextPart(
                        JSON.stringify({
                            success: true,
                            featureName,
                            useCaseName,
                            projectName,
                            projectPath,
                            structureMode: mode,
                            location: useCaseLocation,
                            message: `Use case "${useCaseName}" created in feature "${featureName}". Repository contract and implementation updated.`,
                        }),
                    ),
                ]);
            } catch (err) {
                return new vscode.LanguageModelToolResult([
                    new vscode.LanguageModelTextPart(
                        JSON.stringify({
                            error: `Use case creation failed: ${err}`,
                            hint: 'Make sure the use case does not already exist in this feature.',
                            featureName,
                            useCaseName,
                            projectPath,
                        }),
                    ),
                ]);
            }
        },
    };
}
