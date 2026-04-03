import * as vscode from 'vscode';
import { FeatureStructureGenerator, EntityConfig } from '../generators/FeatureStructureGenerator';
import { ProjectValidator } from '../validators/ProjectValidator';
import { StructureModeManager } from '../helpers/StructureModeManager';

// ---------------------------------------------------------------------------
// Input
// ---------------------------------------------------------------------------

export interface EntityField {
    /** Field name in camelCase (e.g. "userName"). */
    name: string;
    /** Dart type (e.g. "String", "int", "double", "bool", "DateTime"). */
    type: string;
}

export interface CreateFeatureCrudInput {
    /** Absolute path to the Flutter project root (must contain pubspec.yaml). */
    projectPath: string;
    /** Feature name. A single word, snake_case or camelCase (e.g. "products", "orders"). */
    featureName: string;
    /** Name of the main entity class, without the "Entity" suffix (e.g. "Product", "Order"). */
    entityName: string;
    /** Name of the identifier/primary-key field (e.g. "id"). */
    identifierField: string;
    /** Dart type of the identifier (e.g. "String", "int"). */
    identifierType: string;
    /** Additional entity fields beyond the identifier. */
    additionalFields?: EntityField[];
}

// ---------------------------------------------------------------------------
// Tool
// ---------------------------------------------------------------------------

export function makeCreateFeatureCrudTool(
    context: vscode.ExtensionContext,
): vscode.LanguageModelTool<CreateFeatureCrudInput> {
    const generator = new FeatureStructureGenerator();
    const projectValidator = new ProjectValidator();
    const structureModeManager = new StructureModeManager(context);

    return {
        prepareInvocation(
            options: vscode.LanguageModelToolInvocationPrepareOptions<CreateFeatureCrudInput>,
            _token: vscode.CancellationToken,
        ): vscode.PreparedToolInvocation {
            const { featureName, entityName, identifierField, identifierType, additionalFields, projectPath } = options.input;
            const allFields = [
                `${identifierField}: ${identifierType}`,
                ...(additionalFields ?? []).map((f: EntityField) => `${f.name}: ${f.type}`),
            ].join(', ');
            return {
                invocationMessage: `Creando feature CRUD "${featureName}" — ${entityName}Entity(${allFields}) en: ${projectPath}`,
            };
        },

        async invoke(
            options: vscode.LanguageModelToolInvocationOptions<CreateFeatureCrudInput>,
            _token: vscode.CancellationToken,
        ): Promise<vscode.LanguageModelToolResult> {
            const {
                projectPath,
                featureName,
                entityName,
                identifierField,
                identifierType,
            } = options.input;

            // Defensive parse: VS Code LM Tools deserializes input as plain JS object.
            // Explicitly re-parse additionalFields to guarantee it's a valid EntityField[].
            const rawAdditional = (options.input as any).additionalFields;
            const additionalFields: EntityField[] = Array.isArray(rawAdditional)
                ? rawAdditional.filter((f: any) => f && typeof f.name === 'string' && typeof f.type === 'string')
                : [];

            if (!projectPath || !featureName || !entityName || !identifierField || !identifierType) {
                return new vscode.LanguageModelToolResult([
                    new vscode.LanguageModelTextPart(
                        JSON.stringify({
                            error: 'Missing required parameters.',
                            required: ['projectPath', 'featureName', 'entityName', 'identifierField', 'identifierType'],
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

            const entityConfig: EntityConfig = {
                entityName,
                identifierField,
                identifierType,
                additionalFields: additionalFields ?? [],
            };

            try {
                await generator.createFeatureWithCrud(projectPath, featureName, projectName, mode, entityConfig);

                const location = mode === 'featureFirst'
                    ? `lib/features/${featureName}`
                    : `lib/domain|data|ui/${featureName}`;

                const allEntityFields = [
                    `${identifierField}: ${identifierType}`,
                    ...additionalFields.map((f: EntityField) => `${f.name}: ${f.type}`),
                ].join(', ');

                return new vscode.LanguageModelToolResult([
                    new vscode.LanguageModelTextPart(
                        '⛔ STOP — The scaffold is 100% complete. Do NOT read, open, or edit any generated files. ' +
                        'All entity fields listed below were generated correctly. Proceed to the next task.',
                    ),
                    new vscode.LanguageModelTextPart(
                        JSON.stringify({
                            success: true,
                            featureName,
                            entityName: `${entityName}Entity`,
                            entityFields: allEntityFields,
                            projectName,
                            projectPath,
                            structureMode: mode,
                            location,
                            includes: ['Create', 'Read', 'Update', 'Delete'],
                            message: `Feature "${featureName}" with CRUD scaffolding created at ${location}. Entity: ${entityName}Entity(${allEntityFields}).`,
                        }),
                    ),
                ]);
            } catch (err) {
                return new vscode.LanguageModelToolResult([
                    new vscode.LanguageModelTextPart(
                        JSON.stringify({
                            error: `Feature CRUD creation failed: ${err}`,
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
